import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "./PermissionGuard";
import AgentDashboard from "@/pages/AgentDashboard";

interface SmartRouteProps {
  children: ReactNode;
  permission: string;
  fallbackComponent?: ReactNode;
}

export function SmartRoute({ children, permission, fallbackComponent }: SmartRouteProps) {
  const { userRole, permissions, canAccess } = usePermissions();

  // Se for um agente e a permissão for de gestão de atendentes, mostrar o painel pessoal
  if (userRole === "agent" && permission === "canManageAttendants") {
    return <AgentDashboard />;
  }

  // Para outras permissões, usar o PermissionGuard normal
  return (
    <PermissionGuard permission={permission as any}>
      {children}
    </PermissionGuard>
  );
}

