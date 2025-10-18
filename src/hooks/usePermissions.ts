import { useOrganization } from "@/contexts/OrganizationContext";

export type UserRole = "admin" | "manager" | "agent" | "viewer";

export interface Permissions {
  // Gestão de Atendentes
  canManageAttendants: boolean;
  canCreateAttendants: boolean;
  canEditAttendants: boolean;
  canDeleteAttendants: boolean;
  canViewAttendantMetrics: boolean;
  
  // Gestão de Campanhas
  canManageCampaigns: boolean;
  canCreateCampaigns: boolean;
  canEditCampaigns: boolean;
  canDeleteCampaigns: boolean;
  canViewCampaignAnalytics: boolean;
  
  // CRM e Prospects
  canManageCRM: boolean;
  canCreateProspects: boolean;
  canEditProspects: boolean;
  canDeleteProspects: boolean;
  canViewCRMAnalytics: boolean;
  
  // Contatos
  canManageContacts: boolean;
  canCreateContacts: boolean;
  canEditContacts: boolean;
  canDeleteContacts: boolean;
  
  // Integrações
  canManageIntegrations: boolean;
  canConnectChannels: boolean;
  canConfigureWebhooks: boolean;
  
  // Configurações
  canManageSettings: boolean;
  canManageUsers: boolean;
  canManageBilling: boolean;
  
  // Relatórios e Analytics
  canViewReports: boolean;
  canExportData: boolean;
  canViewAdvancedAnalytics: boolean;
  
  // Inbox e Conversas
  canAccessInbox: boolean;
  canManageConversations: boolean;
  canAssignConversations: boolean;
  
  // AI Agents
  canManageAIAgents: boolean;
  canCreateAIAgents: boolean;
  canConfigureAIAgents: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  admin: {
    // Gestão de Atendentes - Total
    canManageAttendants: true,
    canCreateAttendants: true,
    canEditAttendants: true,
    canDeleteAttendants: true,
    canViewAttendantMetrics: true,
    
    // Gestão de Campanhas - Total
    canManageCampaigns: true,
    canCreateCampaigns: true,
    canEditCampaigns: true,
    canDeleteCampaigns: true,
    canViewCampaignAnalytics: true,
    
    // CRM e Prospects - Total
    canManageCRM: true,
    canCreateProspects: true,
    canEditProspects: true,
    canDeleteProspects: true,
    canViewCRMAnalytics: true,
    
    // Contatos - Total
    canManageContacts: true,
    canCreateContacts: true,
    canEditContacts: true,
    canDeleteContacts: true,
    
    // Integrações - Total
    canManageIntegrations: true,
    canConnectChannels: true,
    canConfigureWebhooks: true,
    
    // Configurações - Total
    canManageSettings: true,
    canManageUsers: true,
    canManageBilling: true,
    
    // Relatórios - Total
    canViewReports: true,
    canExportData: true,
    canViewAdvancedAnalytics: true,
    
    // Inbox - Total
    canAccessInbox: true,
    canManageConversations: true,
    canAssignConversations: true,
    
    // AI Agents - Total
    canManageAIAgents: true,
    canCreateAIAgents: true,
    canConfigureAIAgents: true,
  },
  
  manager: {
    // Gestão de Atendentes - Parcial
    canManageAttendants: true,
    canCreateAttendants: true,
    canEditAttendants: true,
    canDeleteAttendants: false,
    canViewAttendantMetrics: true,
    
    // Gestão de Campanhas - Total
    canManageCampaigns: true,
    canCreateCampaigns: true,
    canEditCampaigns: true,
    canDeleteCampaigns: true,
    canViewCampaignAnalytics: true,
    
    // CRM e Prospects - Total
    canManageCRM: true,
    canCreateProspects: true,
    canEditProspects: true,
    canDeleteProspects: true,
    canViewCRMAnalytics: true,
    
    // Contatos - Total
    canManageContacts: true,
    canCreateContacts: true,
    canEditContacts: true,
    canDeleteContacts: true,
    
    // Integrações - Parcial
    canManageIntegrations: true,
    canConnectChannels: true,
    canConfigureWebhooks: false,
    
    // Configurações - Parcial
    canManageSettings: false,
    canManageUsers: false,
    canManageBilling: false,
    
    // Relatórios - Total
    canViewReports: true,
    canExportData: true,
    canViewAdvancedAnalytics: true,
    
    // Inbox - Total
    canAccessInbox: true,
    canManageConversations: true,
    canAssignConversations: true,
    
    // AI Agents - Total
    canManageAIAgents: true,
    canCreateAIAgents: true,
    canConfigureAIAgents: true,
  },
  
  agent: {
    // Gestão de Atendentes - Apenas visualização própria
    canManageAttendants: false,
    canCreateAttendants: false,
    canEditAttendants: false,
    canDeleteAttendants: false,
    canViewAttendantMetrics: false,
    
    // Gestão de Campanhas - Nenhuma
    canManageCampaigns: false,
    canCreateCampaigns: false,
    canEditCampaigns: false,
    canDeleteCampaigns: false,
    canViewCampaignAnalytics: false,
    
    // CRM e Prospects - Parcial
    canManageCRM: false,
    canCreateProspects: true,
    canEditProspects: true,
    canDeleteProspects: false,
    canViewCRMAnalytics: false,
    
    // Contatos - Parcial
    canManageContacts: false,
    canCreateContacts: true,
    canEditContacts: true,
    canDeleteContacts: false,
    
    // Integrações - Nenhuma
    canManageIntegrations: false,
    canConnectChannels: false,
    canConfigureWebhooks: false,
    
    // Configurações - Nenhuma
    canManageSettings: false,
    canManageUsers: false,
    canManageBilling: false,
    
    // Relatórios - Parcial
    canViewReports: true,
    canExportData: false,
    canViewAdvancedAnalytics: false,
    
    // Inbox - Total
    canAccessInbox: true,
    canManageConversations: true,
    canAssignConversations: false,
    
    // AI Agents - Nenhuma
    canManageAIAgents: false,
    canCreateAIAgents: false,
    canConfigureAIAgents: false,
  },
  
  viewer: {
    // Gestão de Atendentes - Apenas visualização
    canManageAttendants: false,
    canCreateAttendants: false,
    canEditAttendants: false,
    canDeleteAttendants: false,
    canViewAttendantMetrics: true,
    
    // Gestão de Campanhas - Apenas visualização
    canManageCampaigns: false,
    canCreateCampaigns: false,
    canEditCampaigns: false,
    canDeleteCampaigns: false,
    canViewCampaignAnalytics: true,
    
    // CRM e Prospects - Apenas visualização
    canManageCRM: false,
    canCreateProspects: false,
    canEditProspects: false,
    canDeleteProspects: false,
    canViewCRMAnalytics: true,
    
    // Contatos - Apenas visualização
    canManageContacts: false,
    canCreateContacts: false,
    canEditContacts: false,
    canDeleteContacts: false,
    
    // Integrações - Nenhuma
    canManageIntegrations: false,
    canConnectChannels: false,
    canConfigureWebhooks: false,
    
    // Configurações - Nenhuma
    canManageSettings: false,
    canManageUsers: false,
    canManageBilling: false,
    
    // Relatórios - Apenas visualização
    canViewReports: true,
    canExportData: false,
    canViewAdvancedAnalytics: true,
    
    // Inbox - Apenas visualização
    canAccessInbox: true,
    canManageConversations: false,
    canAssignConversations: false,
    
    // AI Agents - Apenas visualização
    canManageAIAgents: false,
    canCreateAIAgents: false,
    canConfigureAIAgents: false,
  },
};

export function usePermissions() {
  const { currentOrg, isLoading } = useOrganization();

  // 🔄 CORREÇÃO: Esperar carregar antes de determinar role
  // Se ainda está carregando, não definir role (evita mostrar "viewer" incorretamente)
  const userRole: UserRole = isLoading ? "viewer" : (currentOrg?.role || "viewer");
  const permissions = ROLE_PERMISSIONS[userRole];

  // Debug: Log para identificar problema de role
  console.log('🔐 usePermissions:', {
    isLoading,
    currentOrg: currentOrg ? {
      id: currentOrg.id,
      name: currentOrg.name,
      role: currentOrg.role
    } : null,
    userRole,
    fallbackUsed: !currentOrg?.role
  });

  return {
    userRole,
    permissions,
    isAdmin: userRole === "admin",
    isManager: userRole === "manager",
    isAgent: userRole === "agent",
    isViewer: userRole === "viewer",
    isLoading, // Exportar isLoading para componentes poderem mostrar loading

    // Helper functions for common permission checks
    canAccess: (permission: keyof Permissions) => permissions[permission],
    canAccessAny: (...permissionKeys: (keyof Permissions)[]) =>
      permissionKeys.some(permission => permissions[permission]),
    canAccessAll: (...permissionKeys: (keyof Permissions)[]) =>
      permissionKeys.every(permission => permissions[permission]),
  };
}

// Helper hook for specific permission checks
export function usePermissionCheck(permission: keyof Permissions) {
  const { permissions } = usePermissions();
  return permissions[permission];
}





