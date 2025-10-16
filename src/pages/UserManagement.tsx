import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Crown,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Settings,
  Activity,
  TrendingUp,
  BarChart3,
  Bell,
  BellOff,
  Lock,
  Unlock,
  History
} from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface OrganizationMember {
  id: string;
  user_id: string;
  org_id: string;
  role: "admin" | "manager" | "agent" | "viewer";
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Dados do usuário
  profiles?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    created_at: string;
    last_sign_in_at?: string;
  };
}

interface UserInvite {
  id: string;
  email: string;
  role: "admin" | "manager" | "agent" | "viewer";
  status: "pending" | "accepted" | "expired";
  invited_by: string;
  invited_at: string;
  expires_at: string;
}

export default function UserManagement() {
  const { currentOrg } = useOrganization();
  const { userRole, permissions } = usePermissions();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [newInvite, setNewInvite] = useState({
    email: "",
    role: "viewer" as "admin" | "manager" | "agent" | "viewer"
  });

  // Buscar membros da organização
  const { data: members, isLoading: isLoadingMembers, refetch: refetchMembers } = useQuery({
    queryKey: ["organization-members", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];

      const { data: membersData, error } = await supabase
        .from("members")
        .select(`
          *,
          profiles (
            id,
            email,
            full_name,
            avatar_url,
            phone,
            created_at,
            last_sign_in_at
          )
        `)
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return membersData || [];
    },
    enabled: !!currentOrg?.id,
  });

  // Buscar convites pendentes
  const { data: pendingInvites, isLoading: isLoadingInvites, refetch: refetchInvites } = useQuery({
    queryKey: ["organization-invites", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];

      // Simular convites pendentes (em produção, seria uma tabela real)
      return [
        {
          id: "1",
          email: "novo.gerente@empresa.com",
          role: "manager" as const,
          status: "pending" as const,
          invited_by: "admin@empresa.com",
          invited_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2", 
          email: "atendente@empresa.com",
          role: "agent" as const,
          status: "pending" as const,
          invited_by: "admin@empresa.com",
          invited_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
    },
    enabled: !!currentOrg?.id,
  });

  // Buscar logs de atividade (simulado)
  const { data: activityLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["user-activity-logs", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];

      // Simular logs de atividade
      return [
        {
          id: "1",
          user_email: "admin@empresa.com",
          action: "Alterou role de usuário",
          target_user: "gerente@empresa.com",
          details: "Role alterado de 'agent' para 'manager'",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          user_email: "manager@empresa.com",
          action: "Convidou novo usuário",
          target_user: "novo@empresa.com",
          details: "Convite enviado para role 'agent'",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          user_email: "agent@empresa.com",
          action: "Fez login no sistema",
          target_user: null,
          details: "Login realizado às 09:30",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        }
      ];
    },
    enabled: !!currentOrg?.id,
  });

  // Mutation para atualizar role de usuário
  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: string }) => {
      const { error } = await supabase
        .from("members")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role do usuário atualizado com sucesso!");
      refetchMembers();
      setShowEditDialog(false);
      setEditingMember(null);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar role: " + error.message);
    },
  });

  // Mutation para remover usuário
  const removeUserMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Usuário removido da organização!");
      refetchMembers();
    },
    onError: (error) => {
      toast.error("Erro ao remover usuário: " + error.message);
    },
  });

  // Mutation para enviar convite
  const sendInviteMutation = useMutation({
    mutationFn: async (inviteData: typeof newInvite) => {
      // Simular envio de convite (em produção, seria uma chamada real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Convite enviado:", inviteData);
    },
    onSuccess: () => {
      toast.success("Convite enviado com sucesso!");
      setNewInvite({ email: "", role: "viewer" });
      setShowInviteDialog(false);
      refetchInvites();
    },
    onError: (error) => {
      toast.error("Erro ao enviar convite: " + error.message);
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return Crown;
      case "manager": return Shield;
      case "agent": return UserCheck;
      case "viewer": return Eye;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500 text-white";
      case "manager": return "bg-blue-500 text-white";
      case "agent": return "bg-green-500 text-white";
      case "viewer": return "bg-gray-500 text-white";
      default: return "bg-gray-200 text-gray-700";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "manager": return "Gerente";
      case "agent": return "Atendente";
      case "viewer": return "Visualizador";
      default: return role;
    }
  };

  const filteredMembers = members?.filter(member => {
    const matchesSearch = member.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const handleEditMember = (member: OrganizationMember) => {
    setEditingMember(member);
    setShowEditDialog(true);
  };

  const handleUpdateRole = () => {
    if (!editingMember) return;
    
    const newRole = (document.getElementById('edit-role') as HTMLSelectElement)?.value;
    if (newRole && newRole !== editingMember.role) {
      updateRoleMutation.mutate({ memberId: editingMember.id, newRole });
    }
  };

  const handleRemoveUser = (memberId: string) => {
    if (confirm("Tem certeza que deseja remover este usuário da organização?")) {
      removeUserMutation.mutate(memberId);
    }
  };

  const handleSendInvite = () => {
    if (!newInvite.email || !newInvite.role) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    sendInviteMutation.mutate(newInvite);
  };

  if (!permissions.canManageUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para gerenciar usuários.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Apenas administradores podem gerenciar usuários da organização.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Gestão de Usuários</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members?.length || 0}</div>
              <p className="text-xs text-muted-foreground">membros ativos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Crown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {members?.filter(m => m.role === "admin").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">acesso total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gerentes</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {members?.filter(m => m.role === "manager").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">gestão operacional</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atendentes</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {members?.filter(m => m.role === "agent").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">atendimento</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="members">Membros</TabsTrigger>
              <TabsTrigger value="invites">Convites</TabsTrigger>
              <TabsTrigger value="logs">Logs de Atividade</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/settings?tab=permissions">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Permissões
                </a>
              </Button>
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar Usuário
              </Button>
            </div>
          </div>

          {/* Tab Membros */}
          <TabsContent value="members" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome ou email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Filtrar por Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os roles</SelectItem>
                        <SelectItem value="admin">Administradores</SelectItem>
                        <SelectItem value="manager">Gerentes</SelectItem>
                        <SelectItem value="agent">Atendentes</SelectItem>
                        <SelectItem value="viewer">Visualizadores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Membros */}
            <Card>
              <CardHeader>
                <CardTitle>Membros da Organização</CardTitle>
                <CardDescription>
                  Gerencie usuários e suas permissões
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span>Carregando membros...</span>
                  </div>
                ) : filteredMembers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredMembers.map((member) => {
                      const RoleIcon = getRoleIcon(member.role);
                      
                      return (
                        <div
                          key={member.id}
                          className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.profiles?.avatar_url} />
                            <AvatarFallback>
                              {member.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 
                               member.profiles?.email?.split('@')[0].substring(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {member.profiles?.full_name || 'Nome não informado'}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {member.profiles?.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getRoleColor(member.role)}>
                                <RoleIcon className="h-3 w-3 mr-1" />
                                {getRoleDisplayName(member.role)}
                              </Badge>
                              {member.profiles?.phone && (
                                <span className="text-xs text-muted-foreground">
                                  {member.profiles.phone}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right text-sm text-muted-foreground">
                            <div>Membro desde</div>
                            <div>{format(new Date(member.created_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
                            {member.profiles?.last_sign_in_at && (
                              <div className="text-xs mt-1">
                                Último login: {format(new Date(member.profiles.last_sign_in_at), 'dd/MM HH:mm')}
                              </div>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Role
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRemoveUser(member.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum membro encontrado</p>
                    <p className="text-sm mt-1">Tente ajustar os filtros de busca</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Convites */}
          <TabsContent value="invites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Convites Pendentes</CardTitle>
                <CardDescription>
                  Convites enviados aguardando aceitação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingInvites ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span>Carregando convites...</span>
                  </div>
                ) : pendingInvites && pendingInvites.length > 0 ? (
                  <div className="space-y-3">
                    {pendingInvites.map((invite) => {
                      const RoleIcon = getRoleIcon(invite.role);
                      const isExpired = new Date(invite.expires_at) < new Date();
                      
                      return (
                        <div
                          key={invite.id}
                          className="flex items-center space-x-4 p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{invite.email}</h4>
                              <Badge variant={isExpired ? "destructive" : "secondary"}>
                                {isExpired ? "Expirado" : "Pendente"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <RoleIcon className="h-3 w-3" />
                              <span>Role: {getRoleDisplayName(invite.role)}</span>
                              <span>•</span>
                              <span>Enviado em {format(new Date(invite.invited_at), 'dd/MM/yyyy HH:mm')}</span>
                              <span>•</span>
                              <span>Expira em {format(new Date(invite.expires_at), 'dd/MM/yyyy')}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Reenviar
                            </Button>
                            <Button size="sm" variant="destructive">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum convite pendente</p>
                    <p className="text-sm mt-1">Todos os convites foram aceitos ou expiraram</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Logs */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Atividade</CardTitle>
                <CardDescription>
                  Histórico de ações realizadas pelos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLogs ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span>Carregando logs...</span>
                  </div>
                ) : activityLogs && activityLogs.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {activityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start space-x-3 p-3 border rounded-lg"
                        >
                          <Activity className="h-4 w-4 text-blue-500 mt-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{log.user_email}</span>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm')}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{log.action}</p>
                            {log.target_user && (
                              <p className="text-sm text-muted-foreground">
                                Usuário: {log.target_user}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">{log.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum log de atividade encontrado</p>
                    <p className="text-sm mt-1">Os logs aparecerão conforme as ações forem realizadas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Convite */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Usuário</DialogTitle>
              <DialogDescription>
                Envie um convite para um novo usuário se juntar à organização
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email do Usuário</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({...newInvite, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select 
                  value={newInvite.role} 
                  onValueChange={(value: any) => setNewInvite({...newInvite, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Visualizador - Apenas visualização</SelectItem>
                    <SelectItem value="agent">Atendente - Atendimento ao cliente</SelectItem>
                    <SelectItem value="manager">Gerente - Gestão operacional</SelectItem>
                    <SelectItem value="admin">Administrador - Acesso total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSendInvite}
                disabled={sendInviteMutation.isPending}
              >
                {sendInviteMutation.isPending ? "Enviando..." : "Enviar Convite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Role do Usuário</DialogTitle>
              <DialogDescription>
                Alterar o nível de acesso do usuário
              </DialogDescription>
            </DialogHeader>
            
            {editingMember && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">{editingMember.profiles?.full_name || 'Nome não informado'}</h4>
                  <p className="text-sm text-muted-foreground">{editingMember.profiles?.email}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Novo Role</Label>
                  <Select defaultValue={editingMember.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Visualizador - Apenas visualização</SelectItem>
                      <SelectItem value="agent">Atendente - Atendimento ao cliente</SelectItem>
                      <SelectItem value="manager">Gerente - Gestão operacional</SelectItem>
                      <SelectItem value="admin">Administrador - Acesso total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateRole}
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
