import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Zap, 
  Users, 
  CheckCircle2,
  Settings,
  ExternalLink,
  Plug2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Video,
  Share2
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InstagramSetup } from "@/components/InstagramSetup";
import { WhatsAppSetup } from "@/components/WhatsAppSetup";
import { MetaOAuthConnect } from "@/components/MetaOAuthConnect";
import { WhatsAppQRConnect } from "@/components/WhatsAppQRConnect";
import { ChannelSettingsModal } from "@/components/ChannelSettingsModal";

interface ChannelAccount {
  id: string;
  name: string;
  channel_type: string;
  status: string;
  credentials_json: any;
  created_at: string;
}

export default function Integrations() {
  const [channels, setChannels] = useState<ChannelAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [instagramSetupOpen, setInstagramSetupOpen] = useState(false);
  const [whatsappSetupOpen, setWhatsappSetupOpen] = useState(false);
  const [metaOAuthOpen, setMetaOAuthOpen] = useState(false);
  const [metaOAuthType, setMetaOAuthType] = useState<"whatsapp" | "instagram" | "messenger">("whatsapp");
  const [whatsappQROpen, setWhatsappQROpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelAccount | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<{
    type: string;
    name: string;
    icon: string;
  } | null>(null);
  const [credentials, setCredentials] = useState({
    api_key: "",
    api_secret: "",
    access_token: "",
    phone_number: "",
  });

  useEffect(() => {
    fetchOrgAndChannels();
  }, []);

  const fetchOrgAndChannels = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Usuário encontrado:', user.id);
      
      // Usar UUID fixo para evitar problemas de foreign key
      const fixedOrgId = '00000000-0000-0000-0000-000000000000';
      setOrgId(fixedOrgId);
      fetchChannels(fixedOrgId);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchChannels = async (orgId: string) => {
    try {
      setLoading(true);
      console.log('Buscando canais para orgId:', orgId);
      
      // Primeiro, tentar buscar diretamente da tabela para debug
      const { data: directData, error: directError } = await supabase
        .from('channel_accounts')
        .select('*')
        .eq('org_id', orgId)
        .eq('status', 'active');
      
      console.log('Busca direta da tabela:', { directData, directError });
      
      // Usar Edge Function para buscar canais
      const { data, error } = await supabase.functions.invoke("get-channels", {
        body: { org_id: orgId }
      });

      console.log('Resposta da Edge Function get-channels:', { data, error });

      if (error) {
        console.error('Erro da Edge Function:', error);
        // Se a Edge Function falhar, usar dados diretos
        setChannels(directData || []);
        return;
      }
      
      console.log('Canais encontrados:', data?.channels);
      setChannels(data?.channels || []);
    } catch (error) {
      console.error("Error fetching channels:", error);
      toast.error("Erro ao carregar integrações");
    } finally {
      setLoading(false);
    }
  };

  const isChannelConnected = (channelType: string) => {
    const isConnected = channels.some(ch => ch.channel_type === channelType);
    console.log(`Verificando conexão para ${channelType}:`, { 
      channels, 
      isConnected, 
      channelTypes: channels.map(ch => ch.channel_type),
      exactMatch: channels.find(ch => ch.channel_type === channelType)
    });
    return isConnected;
  };

  const handleChannelSettings = (channel: ChannelAccount) => {
    setSelectedChannel(channel);
    setSettingsModalOpen(true);
  };

  const handleDisconnectChannel = async (channelId: string) => {
    try {
      console.log('Desconectando canal:', channelId);
      
      const { data, error } = await supabase.functions.invoke("disconnect-channel", {
        body: { channel_id: channelId }
      });

      console.log('Resposta da Edge Function disconnect-channel:', { data, error });

      if (error) {
        console.error('Erro da Edge Function:', error);
        throw new Error(`Erro ao desconectar canal: ${error.message || 'Erro desconhecido'}`);
      }

      toast.success("Canal desconectado com sucesso!");
      
      // Recarregar lista de canais
      if (orgId) {
        fetchChannels(orgId);
      }
      
    } catch (error) {
      console.error("Error disconnecting channel:", error);
      toast.error("Erro ao desconectar canal");
    }
  };

  const handleConnectClick = (type: string, name: string, icon: string) => {
    // WhatsApp usa QR Code (mais simples)
    if (type === "whatsapp") {
      setWhatsappQROpen(true);
      return;
    }

    // Use new OAuth flow for Meta platforms (Instagram, Messenger)
    if (type === "instagram" || type === "messenger") {
      setMetaOAuthType(type as "whatsapp" | "instagram" | "messenger");
      setMetaOAuthOpen(true);
      return;
    }

    // For Facebook, treat as Instagram (same OAuth flow)
    if (type === "facebook") {
      setMetaOAuthType("instagram");
      setMetaOAuthOpen(true);
      return;
    }

    // For other integrations, show a message that they're not implemented yet
    toast.info(`${name} ainda não está disponível. Em breve!`);
  };

  const handleConnect = async () => {
    if (!orgId || !selectedIntegration) return;

    try {
      const { error } = await supabase
        .from("channel_accounts")
        .insert([{
          org_id: orgId,
          channel_type: selectedIntegration.type as any,
          name: selectedIntegration.name,
          credentials_json: credentials as any,
          status: "active",
        }]);

      if (error) throw error;

      toast.success(`${selectedIntegration.name} conectado com sucesso!`);
      setConnectDialogOpen(false);
      if (orgId) fetchChannels(orgId);
    } catch (error) {
      console.error("Error connecting:", error);
      toast.error("Erro ao conectar integração");
    }
  };

  const handleDisconnect = async (channelId: string, name: string) => {
    try {
      const { error } = await supabase
        .from("channel_accounts")
        .update({ status: "inactive" })
        .eq("id", channelId);

      if (error) throw error;

      toast.success(`${name} desconectado`);
      if (orgId) fetchChannels(orgId);
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Erro ao desconectar");
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Integrações
        </h1>
        <p className="text-muted-foreground mt-2">
          Conecte suas ferramentas favoritas e automatize seus processos
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="connected">Conectadas</TabsTrigger>
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Social Media Integrations */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Share2 className="h-6 w-6 text-primary" />
              Redes Sociais
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Instagram */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                        <Instagram className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Instagram
                          {isChannelConnected("instagram") && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                          {!isChannelConnected("instagram") && <Badge variant="outline">Disponível</Badge>}
                        </CardTitle>
                        <CardDescription>Instagram Business API</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Gerencie mensagens diretas e comentários
                  </p>
                  <Separator />
                  {isChannelConnected("instagram") ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={async () => {
                          const channel = channels.find(ch => ch.channel_type === "instagram");
                          if (channel) await handleDisconnect(channel.id, "Instagram");
                        }}
                      >
                        Desconectar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleConnectClick("instagram", "Instagram", "instagram")}
                    >
                      Conectar
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Facebook */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                        <Facebook className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Facebook
                          {isChannelConnected("facebook") && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                          {!isChannelConnected("facebook") && <Badge variant="outline">Disponível</Badge>}
                        </CardTitle>
                        <CardDescription>Facebook Messenger & Pages</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Integre Messenger e páginas do Facebook
                  </p>
                  <Separator />
                  {isChannelConnected("facebook") ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={async () => {
                          const channel = channels.find(ch => ch.channel_type === "facebook");
                          if (channel) await handleDisconnect(channel.id, "Facebook");
                        }}
                      >
                        Desconectar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleConnectClick("facebook", "Facebook", "facebook")}
                    >
                      Conectar
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Twitter/X */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                        <Twitter className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          X (Twitter)
                          {isChannelConnected("twitter") && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                          {!isChannelConnected("twitter") && <Badge variant="outline">Disponível</Badge>}
                        </CardTitle>
                        <CardDescription>X (Twitter) API v2</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Gerencie tweets e mensagens diretas
                  </p>
                  <Separator />
                  {isChannelConnected("twitter") ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={async () => {
                          const channel = channels.find(ch => ch.channel_type === "twitter");
                          if (channel) await handleDisconnect(channel.id, "X (Twitter)");
                        }}
                      >
                        Desconectar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleConnectClick("twitter", "X (Twitter)", "twitter")}
                    >
                      Conectar
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* LinkedIn */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center">
                        <Linkedin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          LinkedIn
                          {isChannelConnected("linkedin") && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                          {!isChannelConnected("linkedin") && <Badge variant="outline">Disponível</Badge>}
                        </CardTitle>
                        <CardDescription>LinkedIn API</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Publique e gerencie mensagens profissionais
                  </p>
                  <Separator />
                  {isChannelConnected("linkedin") ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={async () => {
                          const channel = channels.find(ch => ch.channel_type === "linkedin");
                          if (channel) await handleDisconnect(channel.id, "LinkedIn");
                        }}
                      >
                        Desconectar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleConnectClick("linkedin", "LinkedIn", "linkedin")}
                    >
                      Conectar
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* TikTok */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-slate-900 via-pink-600 to-teal-400 flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          TikTok
                          {isChannelConnected("tiktok") && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                          {!isChannelConnected("tiktok") && <Badge variant="outline">Disponível</Badge>}
                        </CardTitle>
                        <CardDescription>TikTok for Business</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Gerencie conteúdo e mensagens
                  </p>
                  <Separator />
                  {isChannelConnected("tiktok") ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={async () => {
                          const channel = channels.find(ch => ch.channel_type === "tiktok");
                          if (channel) await handleDisconnect(channel.id, "TikTok");
                        }}
                      >
                        Desconectar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleConnectClick("tiktok", "TikTok", "tiktok")}
                    >
                      Conectar
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Messaging Integrations */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Mensagens
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {/* WhatsApp */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl font-bold">
                        W
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          WhatsApp Business
                          {isChannelConnected("whatsapp") && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                          {!isChannelConnected("whatsapp") && <Badge variant="outline">Disponível</Badge>}
                        </CardTitle>
                        <CardDescription>API oficial do WhatsApp Business</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Envie e receba mensagens do WhatsApp diretamente na plataforma
                  </p>
                  <Separator />
                  {isChannelConnected("whatsapp") ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={async () => {
                          const channel = channels.find(ch => ch.channel_type === "whatsapp");
                          if (channel) await handleDisconnect(channel.id, "WhatsApp");
                        }}
                      >
                        Desconectar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleConnectClick("whatsapp", "WhatsApp Business", "whatsapp")}
                    >
                      Conectar
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* SMS */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          SMS
                          {isChannelConnected("sms") && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                          {!isChannelConnected("sms") && <Badge variant="outline">Disponível</Badge>}
                        </CardTitle>
                        <CardDescription>Twilio, MessageBird e outros</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Integre com provedores de SMS para campanhas globais
                  </p>
                  <Separator />
                  {isChannelConnected("sms") ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={async () => {
                          const channel = channels.find(ch => ch.channel_type === "sms");
                          if (channel) await handleDisconnect(channel.id, "SMS");
                        }}
                      >
                        Desconectar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleConnectClick("sms", "SMS", "sms")}
                    >
                      Conectar
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Email & CRM */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Email & CRM
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Email */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl">
                        @
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Email (SMTP)
                          {isChannelConnected("email") && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                          {!isChannelConnected("email") && <Badge variant="outline">Disponível</Badge>}
                        </CardTitle>
                        <CardDescription>Gmail, Outlook, SMTP customizado</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure seu servidor SMTP para envio de emails
                  </p>
                  <Separator />
                  {isChannelConnected("email") ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={async () => {
                          const channel = channels.find(ch => ch.channel_type === "email");
                          if (channel) await handleDisconnect(channel.id, "Email");
                        }}
                      >
                        Desconectar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleConnectClick("email", "Email (SMTP)", "email")}
                    >
                      Conectar
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* CRM */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          CRM
                          <Badge variant="outline">Disponível</Badge>
                        </CardTitle>
                        <CardDescription>HubSpot, Salesforce, Pipedrive</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sincronize contatos e leads com seu CRM
                  </p>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Plataformas suportadas</Label>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• HubSpot</li>
                      <li>• Salesforce</li>
                      <li>• Pipedrive</li>
                      <li>• RD Station</li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handleConnectClick("crm", "CRM", "crm")}
                  >
                    Conectar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Automation */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Automação
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Zapier */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                        Z
                      </div>
                      <div>
                        <CardTitle>Zapier</CardTitle>
                        <CardDescription>Conecte com 5.000+ aplicativos</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Automatize workflows conectando com milhares de apps
                  </p>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Recursos</Label>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Triggers automáticos</li>
                      <li>• Multi-step workflows</li>
                      <li>• Webhooks personalizados</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleConnectClick("zapier", "Zapier", "zapier")}
                    >
                      Conectar
                    </Button>
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Make (Integromat) */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                        <Plug2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>Make (Integromat)</CardTitle>
                        <CardDescription>Automação visual avançada</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Crie automações complexas com interface visual
                  </p>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Recursos</Label>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Editor visual drag & drop</li>
                      <li>• Cenários complexos</li>
                      <li>• Webhooks e APIs</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleConnectClick("make", "Make", "make")}
                    >
                      Conectar
                    </Button>
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrações Conectadas</CardTitle>
              <CardDescription>Gerenciar suas integrações ativas</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : channels.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma integração conectada ainda</p>
              ) : (
                <div className="space-y-4">
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold">
                          {channel.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium">{channel.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Conectado em {new Date(channel.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleChannelSettings(channel)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Gerenciar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDisconnectChannel(channel.id)}
                        >
                          Desconectar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {["SMS", "CRM", "Zapier", "Make", "Slack", "Discord"].map((integration) => (
              <Card key={integration} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{integration}</CardTitle>
                  <CardDescription>Disponível para conectar</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => handleConnectClick(integration.toLowerCase(), integration, integration.toLowerCase())}
                  >
                    Conectar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* WhatsApp QR Code Connect (Simple QR Code Flow) */}
      <WhatsAppQRConnect
        open={whatsappQROpen}
        onOpenChange={setWhatsappQROpen}
        onSuccess={() => {
          console.log('WhatsApp QR connect success');
          if (orgId) {
            fetchChannels(orgId);
          } else {
            fetchOrgAndChannels();
          }
        }}
      />

      {/* Meta OAuth Connect (For Instagram & Messenger) */}
      <MetaOAuthConnect
        open={metaOAuthOpen}
        onOpenChange={setMetaOAuthOpen}
        channelType={metaOAuthType}
        onSuccess={() => {
          console.log('Meta OAuth success callback triggered');
          if (orgId) {
            console.log('Recarregando canais após sucesso OAuth, orgId:', orgId);
            fetchChannels(orgId);
          } else {
            console.log('OrgId não encontrado, buscando novamente');
            fetchOrgAndChannels();
          }
        }}
      />

      <ChannelSettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        channel={selectedChannel}
        onDisconnect={handleDisconnectChannel}
      />

      {/* Legacy Setup Dialogs (kept for fallback) */}
      <InstagramSetup
        open={instagramSetupOpen}
        onOpenChange={setInstagramSetupOpen}
        onSuccess={() => {
          if (orgId) fetchChannels(orgId);
        }}
      />

      <WhatsAppSetup
        open={whatsappSetupOpen}
        onOpenChange={setWhatsappSetupOpen}
        onSuccess={() => {
          if (orgId) fetchChannels(orgId);
        }}
      />

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Insira as credenciais para conectar sua conta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                placeholder="Sua API Key"
                value={credentials.api_key}
                onChange={(e) => setCredentials({ ...credentials, api_key: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api_secret">API Secret (opcional)</Label>
              <Input
                id="api_secret"
                type="password"
                placeholder="Seu API Secret"
                value={credentials.api_secret}
                onChange={(e) => setCredentials({ ...credentials, api_secret: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access_token">Access Token (opcional)</Label>
              <Input
                id="access_token"
                placeholder="Seu Access Token"
                value={credentials.access_token}
                onChange={(e) => setCredentials({ ...credentials, access_token: e.target.value })}
              />
            </div>
            {(selectedIntegration?.type === "whatsapp" || selectedIntegration?.type === "sms") && (
              <div className="space-y-2">
                <Label htmlFor="phone_number">Número de Telefone</Label>
                <Input
                  id="phone_number"
                  placeholder="+55 11 99999-9999"
                  value={credentials.phone_number}
                  onChange={(e) => setCredentials({ ...credentials, phone_number: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConnect}>
              Conectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
