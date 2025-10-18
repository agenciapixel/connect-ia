import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
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

/**
 * OrganizationContext simplificado.
 *
 * Sistema de validação complexo foi DESABILITADO temporariamente.
 * Backup em: .backup/auth-system-v1.1/
 */
export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Guard para evitar múltiplas chamadas simultâneas
  const isFetchingRef = useRef(false);

  const fetchOrganizations = useCallback(async () => {
    // Se já está buscando, não buscar de novo
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      // Pegar usuário logado
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setOrganizations([]);
        setCurrentOrg(null);
        setIsLoading(false);
        return;
      }

      // Buscar organizações do usuário
      const { data: memberships, error } = await supabase
        .from("members")
        .select(`
          role,
          orgs (
            id,
            name,
            slug
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error('Erro ao buscar organizações:', error);
        throw error;
      }

      const orgs: Organization[] = (memberships || [])
        .filter(m => m.orgs)
        .map(m => ({
          id: m.orgs.id,
          name: m.orgs.name,
          slug: m.orgs.slug,
          plan: null, // Removido - sistema de planos desabilitado
          role: m.role as "admin" | "manager" | "agent" | "viewer",
        }));

      setOrganizations(orgs);

      // Selecionar primeira organização ou a salva no localStorage
      if (orgs.length > 0) {
        const savedOrgId = localStorage.getItem("currentOrgId");
        const orgToSet = orgs.find(o => o.id === savedOrgId) || orgs[0];

        // Salvar no localStorage
        localStorage.setItem("currentOrgId", orgToSet.id);
        localStorage.setItem("currentOrgRole", orgToSet.role);
        localStorage.setItem("currentOrgName", orgToSet.name);

        setCurrentOrg(orgToSet);
      } else {
        setCurrentOrg(null);
        localStorage.removeItem("currentOrgId");
        localStorage.removeItem("currentOrgRole");
        localStorage.removeItem("currentOrgName");
      }

    } catch (error) {
      console.error("Erro ao carregar organizações:", error);
      toast.error("Erro ao carregar organizações");
      setOrganizations([]);
      setCurrentOrg(null);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem("currentOrgId", orgId);
      localStorage.setItem("currentOrgRole", org.role);
      localStorage.setItem("currentOrgName", org.name);
      toast.success(`Organização alterada para: ${org.name}`);
      window.location.reload();
    }
  };

  const refreshOrganizations = useCallback(async () => {
    await fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    // Buscar organizações imediatamente
    fetchOrganizations();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchOrganizations();
      } else if (event === "SIGNED_OUT") {
        setOrganizations([]);
        setCurrentOrg(null);
        localStorage.removeItem("currentOrgId");
        localStorage.removeItem("currentOrgRole");
        localStorage.removeItem("currentOrgName");
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchOrganizations]);

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
