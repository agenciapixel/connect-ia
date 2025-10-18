import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string | null;
  role: "admin" | "manager" | "agent" | "viewer";
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
    console.log('🔄 [SIMPLE] fetchOrganizations: INICIANDO...');
    setIsLoading(true);

    try {
      // Pegar user_id do Supabase Auth (já logado)
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('❌ [SIMPLE] Sem usuário logado');
        setOrganizations([]);
        setCurrentOrg(null);
        setIsLoading(false);
        return;
      }

      console.log('✅ [SIMPLE] Usuário:', user.email);

      // Buscar organizações do usuário
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

      if (error) {
        console.error('❌ [SIMPLE] Erro ao buscar members:', error);
        throw error;
      }

      console.log('📊 [SIMPLE] Memberships:', memberships);

      const orgs: Organization[] = (memberships || [])
        .filter(m => m.orgs)
        .map(m => ({
          id: m.orgs.id,
          name: m.orgs.name,
          slug: m.orgs.slug,
          plan: m.orgs.plan,
          role: m.role as "admin" | "manager" | "agent" | "viewer",
        }));

      console.log('🏢 [SIMPLE] Organizações:', orgs);
      setOrganizations(orgs);

      // Selecionar primeira organização
      if (orgs.length > 0) {
        const savedOrgId = localStorage.getItem("currentOrgId");
        const orgToSet = orgs.find(o => o.id === savedOrgId) || orgs[0];
        setCurrentOrg(orgToSet);
        localStorage.setItem("currentOrgId", orgToSet.id);
        console.log('✅ [SIMPLE] Organização selecionada:', orgToSet.name, 'Role:', orgToSet.role);
      } else {
        console.log('⚠️ [SIMPLE] Nenhuma organização encontrada');
        setCurrentOrg(null);
      }

    } catch (error) {
      console.error("❌ [SIMPLE] Erro:", error);
      toast.error("Erro ao carregar organizações");
      setOrganizations([]);
      setCurrentOrg(null);
    } finally {
      setIsLoading(false);
      console.log('✅ [SIMPLE] fetchOrganizations: CONCLUÍDO');
    }
  };

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem("currentOrgId", orgId);
      toast.success(`Organização alterada para: ${org.name}`);
      window.location.reload();
    }
  };

  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  useEffect(() => {
    console.log('🔄 [SIMPLE] OrganizationContext: Montando...');

    // Buscar organizações imediatamente
    fetchOrganizations();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [SIMPLE] Auth changed:', event);

      if (event === "SIGNED_IN" && session?.user) {
        await fetchOrganizations();
      } else if (event === "SIGNED_OUT") {
        setOrganizations([]);
        setCurrentOrg(null);
        localStorage.removeItem("currentOrgId");
        setIsLoading(false);
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
