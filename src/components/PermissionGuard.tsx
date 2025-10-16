import { ReactNode } from "react";
import { usePermissions, Permissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionGuardProps {
  children: ReactNode;
  permission: keyof Permissions;
  fallback?: ReactNode;
  showFallback?: boolean;
  requireAny?: (keyof Permissions)[];
  requireAll?: (keyof Permissions)[];
}

export function PermissionGuard({
  children,
  permission,
  fallback,
  showFallback = true,
  requireAny,
  requireAll,
}: PermissionGuardProps) {
  const { userRole, permissions, canAccess, canAccessAny, canAccessAll } = usePermissions();

  // Check single permission
  if (permission && !canAccess(permission)) {
    return showFallback ? (
      fallback || <DefaultAccessDenied userRole={userRole} permission={permission} />
    ) : null;
  }

  // Check multiple permissions (ANY)
  if (requireAny && requireAny.length > 0 && !canAccessAny(...requireAny)) {
    return showFallback ? (
      fallback || <DefaultAccessDenied userRole={userRole} permission={requireAny[0]} multiple={true} />
    ) : null;
  }

  // Check multiple permissions (ALL)
  if (requireAll && requireAll.length > 0 && !canAccessAll(...requireAll)) {
    return showFallback ? (
      fallback || <DefaultAccessDenied userRole={userRole} permission={requireAll[0]} multiple={true} />
    ) : null;
  }

  return <>{children}</>;
}

interface DefaultAccessDeniedProps {
  userRole: string;
  permission: keyof Permissions;
  multiple?: boolean;
}

function DefaultAccessDenied({ userRole, permission, multiple = false }: DefaultAccessDeniedProps) {
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "manager": return "Gerente";
      case "agent": return "Atendente";
      case "viewer": return "Visualizador";
      default: return role;
    }
  };

  const getPermissionDisplayName = (permission: keyof Permissions) => {
    const permissionNames: Record<string, string> = {
      canManageAttendants: "Gestão de Atendentes",
      canCreateAttendants: "Criar Atendentes",
      canEditAttendants: "Editar Atendentes",
      canDeleteAttendants: "Excluir Atendentes",
      canViewAttendantMetrics: "Visualizar Métricas de Atendentes",
      canManageCampaigns: "Gestão de Campanhas",
      canCreateCampaigns: "Criar Campanhas",
      canEditCampaigns: "Editar Campanhas",
      canDeleteCampaigns: "Excluir Campanhas",
      canViewCampaignAnalytics: "Analytics de Campanhas",
      canManageCRM: "Gestão de CRM",
      canCreateProspects: "Criar Prospects",
      canEditProspects: "Editar Prospects",
      canDeleteProspects: "Excluir Prospects",
      canViewCRMAnalytics: "Analytics de CRM",
      canManageContacts: "Gestão de Contatos",
      canCreateContacts: "Criar Contatos",
      canEditContacts: "Editar Contatos",
      canDeleteContacts: "Excluir Contatos",
      canManageIntegrations: "Gestão de Integrações",
      canConnectChannels: "Conectar Canais",
      canConfigureWebhooks: "Configurar Webhooks",
      canManageSettings: "Gestão de Configurações",
      canManageUsers: "Gestão de Usuários",
      canManageBilling: "Gestão de Faturamento",
      canViewReports: "Visualizar Relatórios",
      canExportData: "Exportar Dados",
      canViewAdvancedAnalytics: "Analytics Avançados",
      canAccessInbox: "Acesso ao Inbox",
      canManageConversations: "Gestão de Conversas",
      canAssignConversations: "Atribuir Conversas",
      canManageAIAgents: "Gestão de Agentes IA",
      canCreateAIAgents: "Criar Agentes IA",
      canConfigureAIAgents: "Configurar Agentes IA",
    };
    
    return permissionNames[permission] || permission;
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <CardTitle className="text-orange-800">Acesso Restrito</CardTitle>
        <CardDescription className="text-orange-700">
          Você não tem permissão para acessar esta funcionalidade
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-white p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-2">
            <Lock className="h-4 w-4" />
            <span>Funcionalidade:</span>
          </div>
          <p className="font-medium text-gray-800">
            {getPermissionDisplayName(permission)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Seu nível de acesso:</span>
          </div>
          <p className="font-medium text-gray-800">
            {getRoleDisplayName(userRole)}
          </p>
        </div>

        <div className="text-sm text-gray-600">
          <p>Para acessar esta funcionalidade, entre em contato com um administrador para:</p>
          <ul className="mt-2 space-y-1 text-left">
            <li>• Elevar seu nível de acesso</li>
            <li>• Conceder permissões específicas</li>
            <li>• Obter orientações sobre o uso</li>
          </ul>
        </div>

        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          Voltar
        </Button>
      </CardContent>
    </Card>
  );
}

// Componente para ocultar elementos baseado em permissões
interface HiddenUnlessProps {
  children: ReactNode;
  permission: keyof Permissions;
  requireAny?: (keyof Permissions)[];
  requireAll?: (keyof Permissions)[];
}

export function HiddenUnless({
  children,
  permission,
  requireAny,
  requireAll,
}: HiddenUnlessProps) {
  const { canAccess, canAccessAny, canAccessAll } = usePermissions();

  // Check single permission
  if (permission && !canAccess(permission)) {
    return null;
  }

  // Check multiple permissions (ANY)
  if (requireAny && requireAny.length > 0 && !canAccessAny(...requireAny)) {
    return null;
  }

  // Check multiple permissions (ALL)
  if (requireAll && requireAll.length > 0 && !canAccessAll(...requireAll)) {
    return null;
  }

  return <>{children}</>;
}

// Componente para mostrar diferentes conteúdos baseado em permissões
interface ConditionalRenderProps {
  children: ReactNode;
  permission: keyof Permissions;
  fallback?: ReactNode;
  requireAny?: (keyof Permissions)[];
  requireAll?: (keyof Permissions)[];
}

export function ConditionalRender({
  children,
  permission,
  fallback = null,
  requireAny,
  requireAll,
}: ConditionalRenderProps) {
  const { canAccess, canAccessAny, canAccessAll } = usePermissions();

  // Check single permission
  if (permission && !canAccess(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions (ANY)
  if (requireAny && requireAny.length > 0 && !canAccessAny(...requireAny)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions (ALL)
  if (requireAll && requireAll.length > 0 && !canAccessAll(...requireAll)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

