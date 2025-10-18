import { Home, MessageSquare, Users, Megaphone, MapPin, Settings, Bot, LogOut, Plug, UserCheck, TrendingUp, CreditCard, Shield, Activity } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { usePersistentAuth } from "@/hooks/usePersistentAuth";
import { useSecurity } from "@/hooks/useSecurity";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { HiddenUnless } from "./PermissionGuard";
import { UserRoleBadge } from "./UserRoleBadge";

    const menuItems = [
      { title: "Dashboard", url: "/", icon: Home, permission: "canViewReports" as const },
      { title: "Painel", url: "/painel", icon: Home, permission: "canViewReports" as const },
      { title: "Caixa de Entrada", url: "/caixa-entrada", icon: MessageSquare, permission: "canAccessInbox" as const },
      { title: "Contatos", url: "/contatos", icon: Users, permission: "canManageContacts" as const },
      { title: "Campanhas", url: "/campanhas", icon: Megaphone, permission: "canManageCampaigns" as const },
      { title: "Prospecção", url: "/prospeccao", icon: MapPin, permission: "canCreateProspects" as const },
      { title: "CRM", url: "/crm", icon: TrendingUp, permission: "canManageCRM" as const },
      { title: "Atendentes", url: "/atendentes", icon: UserCheck, permission: "canManageAttendants" as const },
      { title: "Agentes IA", url: "/agentes-ia", icon: Bot, permission: "canManageAIAgents" as const },
      { title: "Integrações", url: "/integracoes", icon: Plug, permission: "canManageIntegrations" as const },
      { title: "Planos", url: "/planos", icon: CreditCard, permission: "canViewReports" as const },
      { title: "Usuários Autorizados", url: "/usuarios-autorizados", icon: Shield, permission: "canManageSettings" as const },
      { title: "Monitoramento", url: "/monitoramento", icon: Activity, permission: "canManageSettings" as const },
      { title: "Configurações", url: "/configuracoes", icon: Settings, permission: "canManageSettings" as const },
    ];

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { logout, isRemembered } = usePersistentAuth();
  const { clearSecurity } = useSecurity();

  const handleLogout = async () => {
    try {
      console.log('🔓 Iniciando logout...');

      // Limpar cache de segurança primeiro
      clearSecurity();

      // Fazer logout do Supabase
      await logout();

      console.log('✅ Logout concluído');
      toast.success(isRemembered ? "Logout realizado. Você permanecerá logado neste dispositivo." : "Logout realizado com sucesso.");

      // Redirecionar para autenticação
      navigate("/autenticacao");
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      toast.error("Erro ao sair: " + (error as Error).message);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="p-4 space-y-4">
          {state !== "collapsed" ? (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Omnichat IA
                </h1>
                <SidebarTrigger className="text-sidebar-foreground" />
              </div>
              <div className="w-full space-y-3">
                <OrganizationSwitcher />
                <div className="flex justify-center">
                  <UserRoleBadge />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <HiddenUnless key={item.title} permission={item.permission}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} end={item.url === "/"}>
                        <item.icon />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </HiddenUnless>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {state === "collapsed" && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Expandir menu">
                <SidebarTrigger className="text-sidebar-foreground" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Sair">
              <LogOut />
              {state !== "collapsed" && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}