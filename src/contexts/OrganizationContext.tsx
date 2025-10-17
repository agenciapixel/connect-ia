import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string | null;
  role: "admin" | "member" | "viewer";
}

interface OrganizationContextType {
  currentOrg: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  switchOrganization: (orgId: string) => void;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganizations = async () => {
    try {
      // Verificação tripla para garantir que há usuário
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setOrganizations([]);
        setCurrentOrg(null);
        setIsLoading(false);
        return;
      }

      // Verificação adicional da sessão
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setOrganizations([]);
        setCurrentOrg(null);
        setIsLoading(false);
        return;
      }

      // Verificação final - garantir que o usuário da sessão é o mesmo
      if (session.user.id !== user.id) {
        setOrganizations([]);
        setCurrentOrg(null);
        setIsLoading(false);
        return;
      }

      console.log('✅ fetchOrganizations: Usuário encontrado:', user.email);

      // Buscar todas as organizações do usuário através da tabela members
      const { data: memberships, error } = await supabase
        .from("members")
        .select(`
          role,
          orgs (
            id,
            name,
            slug,
            plan
          )
        `)
        .eq("user_id", user.id);

      console.log('📊 fetchOrganizations: Memberships retornadas:', memberships);
      console.log('❌ fetchOrganizations: Erro?', error);

      if (error) throw error;

      const orgs: Organization[] = (memberships || [])
        .filter(m => m.orgs)
        .map(m => ({
          id: m.orgs.id,
          name: m.orgs.name,
          slug: m.orgs.slug,
          plan: m.orgs.plan,
          role: m.role as "admin" | "member" | "viewer",
        }));

      console.log('🏢 fetchOrganizations: Organizações processadas:', orgs);
      setOrganizations(orgs);

      // Se não há org atual selecionada, selecionar a primeira
      if (!currentOrg && orgs.length > 0) {
        const savedOrgId = localStorage.getItem("currentOrgId");
        const orgToSet = orgs.find(o => o.id === savedOrgId) || orgs[0];
        setCurrentOrg(orgToSet);
        localStorage.setItem("currentOrgId", orgToSet.id);
      }

      // Se a org atual não está mais na lista, mudar para a primeira
      if (currentOrg && !orgs.find(o => o.id === currentOrg.id)) {
        const orgToSet = orgs[0] || null;
        setCurrentOrg(orgToSet);
        if (orgToSet) {
          localStorage.setItem("currentOrgId", orgToSet.id);
        } else {
          localStorage.removeItem("currentOrgId");
        }
      }

    } catch (error) {
      console.error("Erro ao buscar organizações:", error);
      toast.error("Erro ao carregar organizações");
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem("currentOrgId", orgId);
      toast.success(`Organização alterada para: ${org.name}`);

      // Recarregar a página para atualizar todos os dados
      window.location.reload();
    }
  };

  const refreshOrganizations = async () => {
    setIsLoading(true);
    await fetchOrganizations();
  };

  useEffect(() => {
    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchOrganizations();
      } else if (event === "SIGNED_OUT") {
        setOrganizations([]);
        setCurrentOrg(null);
        localStorage.removeItem("currentOrgId");
        setIsLoading(false);
      } else if (event === "INITIAL_SESSION") {
        if (session?.user) {
          await fetchOrganizations();
        } else {
          setOrganizations([]);
          setCurrentOrg(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <OrganizationContext.Provider
      value={{
        currentOrg,
        organizations,
        isLoading,
        switchOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
