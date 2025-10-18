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
  canCloseConversations: boolean;

  // Agentes de IA
  canManageAIAgents: boolean;
  canCreateAIAgents: boolean;
  canEditAIAgents: boolean;
  canDeleteAIAgents: boolean;
  canTrainAIAgents: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  admin: {
    canManageAttendants: true,
    canCreateAttendants: true,
    canEditAttendants: true,
    canDeleteAttendants: true,
    canViewAttendantMetrics: true,
    canManageCampaigns: true,
    canCreateCampaigns: true,
    canEditCampaigns: true,
    canDeleteCampaigns: true,
    canViewCampaignAnalytics: true,
    canManageCRM: true,
    canCreateProspects: true,
    canEditProspects: true,
    canDeleteProspects: true,
    canViewCRMAnalytics: true,
    canManageContacts: true,
    canCreateContacts: true,
    canEditContacts: true,
    canDeleteContacts: true,
    canManageIntegrations: true,
    canConnectChannels: true,
    canConfigureWebhooks: true,
    canManageSettings: true,
    canManageUsers: true,
    canManageBilling: true,
    canViewReports: true,
    canExportData: true,
    canViewAdvancedAnalytics: true,
    canAccessInbox: true,
    canManageConversations: true,
    canAssignConversations: true,
    canCloseConversations: true,
    canManageAIAgents: true,
    canCreateAIAgents: true,
    canEditAIAgents: true,
    canDeleteAIAgents: true,
    canTrainAIAgents: true,
  },
  manager: {
    canManageAttendants: true,
    canCreateAttendants: true,
    canEditAttendants: true,
    canDeleteAttendants: false,
    canViewAttendantMetrics: true,
    canManageCampaigns: true,
    canCreateCampaigns: true,
    canEditCampaigns: true,
    canDeleteCampaigns: true,
    canViewCampaignAnalytics: true,
    canManageCRM: true,
    canCreateProspects: true,
    canEditProspects: true,
    canDeleteProspects: true,
    canViewCRMAnalytics: true,
    canManageContacts: true,
    canCreateContacts: true,
    canEditContacts: true,
    canDeleteContacts: true,
    canManageIntegrations: false,
    canConnectChannels: false,
    canConfigureWebhooks: false,
    canManageSettings: false,
    canManageUsers: false,
    canManageBilling: false,
    canViewReports: true,
    canExportData: true,
    canViewAdvancedAnalytics: true,
    canAccessInbox: true,
    canManageConversations: true,
    canAssignConversations: true,
    canCloseConversations: true,
    canManageAIAgents: true,
    canCreateAIAgents: true,
    canEditAIAgents: true,
    canDeleteAIAgents: false,
    canTrainAIAgents: true,
  },
  agent: {
    canManageAttendants: false,
    canCreateAttendants: false,
    canEditAttendants: false,
    canDeleteAttendants: false,
    canViewAttendantMetrics: false,
    canManageCampaigns: false,
    canCreateCampaigns: false,
    canEditCampaigns: false,
    canDeleteCampaigns: false,
    canViewCampaignAnalytics: false,
    canManageCRM: false,
    canCreateProspects: true,
    canEditProspects: true,
    canDeleteProspects: false,
    canViewCRMAnalytics: false,
    canManageContacts: false,
    canCreateContacts: true,
    canEditContacts: true,
    canDeleteContacts: false,
    canManageIntegrations: false,
    canConnectChannels: false,
    canConfigureWebhooks: false,
    canManageSettings: false,
    canManageUsers: false,
    canManageBilling: false,
    canViewReports: false,
    canExportData: false,
    canViewAdvancedAnalytics: false,
    canAccessInbox: true,
    canManageConversations: true,
    canAssignConversations: false,
    canCloseConversations: true,
    canManageAIAgents: false,
    canCreateAIAgents: false,
    canEditAIAgents: false,
    canDeleteAIAgents: false,
    canTrainAIAgents: false,
  },
  viewer: {
    canManageAttendants: false,
    canCreateAttendants: false,
    canEditAttendants: false,
    canDeleteAttendants: false,
    canViewAttendantMetrics: true,
    canManageCampaigns: false,
    canCreateCampaigns: false,
    canEditCampaigns: false,
    canDeleteCampaigns: false,
    canViewCampaignAnalytics: true,
    canManageCRM: false,
    canCreateProspects: false,
    canEditProspects: false,
    canDeleteProspects: false,
    canViewCRMAnalytics: true,
    canManageContacts: false,
    canCreateContacts: false,
    canEditContacts: false,
    canDeleteContacts: false,
    canManageIntegrations: false,
    canConnectChannels: false,
    canConfigureWebhooks: false,
    canManageSettings: false,
    canManageUsers: false,
    canManageBilling: false,
    canViewReports: true,
    canExportData: false,
    canViewAdvancedAnalytics: false,
    canAccessInbox: true,
    canManageConversations: false,
    canAssignConversations: false,
    canCloseConversations: false,
    canManageAIAgents: false,
    canCreateAIAgents: false,
    canEditAIAgents: false,
    canDeleteAIAgents: false,
    canTrainAIAgents: false,
  },
};

/**
 * Hook simplificado de permissões - SEM LOGS, SEM COMPLEXIDADE.
 */
export function usePermissions() {
  const { currentOrg, isLoading } = useOrganization();

  // Se está carregando, retornar viewer temporariamente
  const userRole: UserRole = currentOrg?.role || "viewer";
  const permissions = ROLE_PERMISSIONS[userRole];

  return {
    userRole,
    permissions,
    isLoading,
    canAccess: (permission: keyof Permissions) => permissions[permission],
    canAccessAny: (...permissionsToCheck: (keyof Permissions)[]) =>
      permissionsToCheck.some(p => permissions[p]),
    canAccessAll: (...permissionsToCheck: (keyof Permissions)[]) =>
      permissionsToCheck.every(p => permissions[p]),
  };
}
