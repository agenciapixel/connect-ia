import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Save, 
  Loader2, 
  Shield, 
  Building2, 
  Users, 
  Settings as SettingsIcon,
  Plus,
  Edit,
  Trash2,
  Crown,
  UserCheck,
  Eye,
  Mail,
  Phone,
  UserCog,
  Key
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { usePersistentAuth } from "@/hooks/usePersistentAuth";
import { useOrganization } from "@/contexts/OrganizationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/PermissionGuard";
import UserManagement from "./UserManagement";
import PermissionSettings from "./PermissionSettings";

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  
  const { clearRememberMe, isRemembered } = usePersistentAuth();
  const { currentOrg, organizations } = useOrganization();
  const { permissions } = usePermissions();
  
  const [localProfileData, setLocalProfileData] = useState({
    full_name: "",
    avatar_url: "",
  });

  // Buscar dados do perfil
  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Tentar buscar da tabela profiles primeiro
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error && profile) {
          return { type: 'profile', data: profile, user };
        }
      } catch (error) {
        console.log('Tabela profiles não disponível, usando user metadata');
      }

      // Fallback para user metadata
      return { 
        type: 'user', 
        data: {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "",
          avatar_url: user.user_metadata?.avatar_url || "",
        },
        user 
      };
    },
  });

  useEffect(() => {
    if (profileData) {
      setLocalProfileData({
        full_name: profileData.data.full_name || "",
        avatar_url: profileData.data.avatar_url || "",
      });
    }
  }, [profileData]);

  // Detectar parâmetro tab da URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'organization', 'notifications', 'users', 'permissions'].includes(tabParam)) {
      // Verificar se o usuário tem permissão para acessar a aba
      if ((tabParam === 'users' || tabParam === 'permissions') && !permissions.canManageUsers) {
        // Se não tem permissão, voltar para profile
        setActiveTab('profile');
      } else {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams, permissions.canManageUsers]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Erro", description: "Usuário não autenticado" });
        return;
      }

      // Tentar salvar na tabela profiles primeiro
      if (profileData?.type === 'profile') {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({
              full_name: localProfileData.full_name,
              avatar_url: localProfileData.avatar_url,
            })
            .eq("id", user.id);

          if (!error) {
            toast({ title: "Sucesso", description: "Configurações salvas com sucesso!" });
            refetch();
            return;
          }
        } catch (error) {
          console.log('Erro ao salvar na tabela profiles, tentando user metadata');
        }
      }

      // Fallback para user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: localProfileData.full_name,
          avatar_url: localProfileData.avatar_url,
        }
      });

      if (error) throw error;

      toast({ title: "Sucesso", description: "Configurações salvas com sucesso!" });
      refetch();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({ 
        title: "Erro", 
        description: "Erro ao salvar configurações. Tente novamente." 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClearRememberMe = () => {
    clearRememberMe();
    toast({ title: "Sucesso", description: "Configuração 'Permanecer logado' removida. Você precisará fazer login novamente na próxima vez." });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="h-4 w-4 text-yellow-500" />;
      case "member": return <UserCheck className="h-4 w-4 text-blue-500" />;
      case "viewer": return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "default";
      case "member": return "secondary";
      case "viewer": return "outline";
      default: return "secondary";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "member": return "Membro";
      case "viewer": return "Visualizador";
      default: return role;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header com Breadcrumbs */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sistema</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium">Configurações</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header da Página */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie suas preferências e configurações da conta
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className={`grid w-full ${permissions.canManageUsers ? 'grid-cols-5' : 'grid-cols-3'}`}>
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="organization" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Organização</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notificações</span>
              </TabsTrigger>
              {permissions.canManageUsers && (
                <>
                  <TabsTrigger value="users" className="flex items-center space-x-2">
                    <UserCog className="h-4 w-4" />
                    <span>Usuários</span>
                  </TabsTrigger>
                  <TabsTrigger value="permissions" className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>Permissões</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Tab Perfil */}
            <TabsContent value="profile" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informações do Perfil
                      </CardTitle>
                      <CardDescription>
                        Atualize suas informações pessoais e foto de perfil
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={localProfileData.avatar_url} />
                          <AvatarFallback className="text-lg">
                            {localProfileData.full_name
                              ? localProfileData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                              : 'U'
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="text-lg font-medium">{localProfileData.full_name || 'Usuário'}</h3>
                          <p className="text-sm text-muted-foreground">{profileData?.user?.email}</p>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Alterar Foto
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Nome Completo</Label>
                          <Input
                            id="full_name"
                            value={localProfileData.full_name}
                            onChange={(e) => setLocalProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Seu nome completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={profileData?.user?.email || ''}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            O email não pode ser alterado
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avatar_url">URL da Foto</Label>
                        <Input
                          id="avatar_url"
                          value={localProfileData.avatar_url}
                          onChange={(e) => setLocalProfileData(prev => ({ ...prev, avatar_url: e.target.value }))}
                          placeholder="https://exemplo.com/foto.jpg"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Session Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Configurações de Sessão
                      </CardTitle>
                      <CardDescription>Gerencie suas preferências de login e segurança</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="remember-me-status">Permanecer Logado</Label>
                          <p className="text-sm text-muted-foreground">
                            {isRemembered 
                              ? "Você está configurado para permanecer logado neste dispositivo" 
                              : "Você precisará fazer login a cada sessão"
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isRemembered 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {isRemembered ? 'Ativo' : 'Inativo'}
                          </span>
                          {isRemembered && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleClearRememberMe}
                            >
                              Desativar
                            </Button>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label>Informações de Segurança</Label>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>• Sua sessão é protegida por autenticação segura</p>
                          <p>• Os dados são criptografados durante a transmissão</p>
                          <p>• Você pode desativar "Permanecer logado" a qualquer momento</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab Minha Organização */}
            <TabsContent value="organization" className="space-y-4">
              <div className="space-y-6">
                {/* Current Organization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Organização Atual
                    </CardTitle>
                    <CardDescription>
                      Informações sobre a organização selecionada
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentOrg ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{currentOrg.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Slug: {currentOrg.slug}
                            </p>
                            {currentOrg.plan && (
                              <Badge variant="outline" className="mt-1">
                                Plano: {currentOrg.plan}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(currentOrg.role)}
                            <Badge variant={getRoleBadgeVariant(currentOrg.role)}>
                              {getRoleLabel(currentOrg.role)}
                            </Badge>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 rounded-lg bg-muted/50">
                            <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                            <p className="text-sm font-medium">Membros</p>
                            <p className="text-2xl font-bold">{organizations.length}</p>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-muted/50">
                            <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                            <p className="text-sm font-medium">Status</p>
                            <p className="text-sm font-medium text-green-600">Ativa</p>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-muted/50">
                            <Crown className="h-6 w-6 mx-auto mb-2 text-primary" />
                            <p className="text-sm font-medium">Seu Cargo</p>
                            <p className="text-sm font-medium">{getRoleLabel(currentOrg.role)}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Organização
                          </Button>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Gerenciar Membros
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhuma organização selecionada</h3>
                        <p className="text-muted-foreground mb-4">
                          Selecione uma organização para ver as informações
                        </p>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Organização
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* All Organizations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Todas as Organizações
                    </CardTitle>
                    <CardDescription>
                      Organizações das quais você faz parte
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {organizations.length > 0 ? (
                      <div className="space-y-3">
                        {organizations.map((org) => (
                          <div 
                            key={org.id} 
                            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                              org.id === currentOrg?.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                org.id === currentOrg?.id 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium">{org.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Slug: {org.slug}
                                </p>
                                {org.plan && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {org.plan}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {getRoleIcon(org.role)}
                                <Badge variant={getRoleBadgeVariant(org.role)} className="text-xs">
                                  {getRoleLabel(org.role)}
                                </Badge>
                              </div>
                              {org.id === currentOrg?.id && (
                                <Badge variant="default" className="text-xs">
                                  Ativa
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhuma organização encontrada</h3>
                        <p className="text-muted-foreground mb-4">
                          Você não faz parte de nenhuma organização ainda
                        </p>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeira Organização
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Notificações */}
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-6">
                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Preferências de Notificação
                    </CardTitle>
                    <CardDescription>Configure como deseja receber notificações</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Notificações por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba atualizações sobre novas mensagens e atividades
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">Notificações Push</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações em tempo real no navegador
                        </p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-emails">Emails de Marketing</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba novidades, dicas e atualizações do produto
                        </p>
                      </div>
                      <Switch
                        id="marketing-emails"
                        checked={marketingEmails}
                        onCheckedChange={setMarketingEmails}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Configurações de Canal</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 text-sm">💬</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">WhatsApp</p>
                              <p className="text-xs text-muted-foreground">Mensagens e status</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded bg-pink-100 flex items-center justify-center">
                              <span className="text-pink-600 text-sm">📸</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Instagram</p>
                              <p className="text-xs text-muted-foreground">Comentários e DMs</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={() => toast({ title: "Sucesso", description: "Configurações de notificação salvas!" })}
                    className="bg-gradient-to-r from-primary to-primary/80"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tab Usuários - Apenas para Administradores */}
            {permissions.canManageUsers && (
              <TabsContent value="users" className="space-y-4">
                <UserManagement />
              </TabsContent>
            )}

            {/* Tab Permissões - Apenas para Administradores */}
            {permissions.canManageUsers && (
              <TabsContent value="permissions" className="space-y-4">
                <PermissionSettings />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}