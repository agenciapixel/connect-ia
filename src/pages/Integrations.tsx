import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  CheckCircle2,
  Settings,
  Instagram,
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
      
      // Usar Edge Function para buscar canais
      const { data, error } = await supabase.functions.invoke("get-channels", {
        body: { org_id: orgId }
      });

      console.log('Resposta da Edge Function get-channels:', { data, error });

      if (error) {
        console.error('Erro da Edge Function:', error);
        throw new Error(`Erro ao buscar canais: ${error.message || 'Erro desconhecido'}`);
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
      channelTypes: channels.map(ch => ch.channel_type)
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
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Mensageria
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* WhatsApp */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          WhatsApp
                          {isChannelConnected("whatsapp") && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                          {!isChannelConnected("whatsapp") && <Badge variant="outline">Disponível</Badge>}
                        </CardTitle>
                        <CardDescription>WhatsApp Business API</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Gerencie conversas do WhatsApp Business
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
                      onClick={() => handleConnectClick("whatsapp", "WhatsApp", "whatsapp")}
                    >
                      Conectar
                    </Button>
                  )}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {!isChannelConnected("instagram") && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                      <Instagram className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Instagram</CardTitle>
                      <CardDescription>Instagram Business API</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => handleConnectClick("instagram", "Instagram", "instagram")}
                  >
                    Conectar
                  </Button>
                </CardContent>
              </Card>
            )}
            {!isChannelConnected("whatsapp") && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>WhatsApp</CardTitle>
                      <CardDescription>WhatsApp Business API</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => handleConnectClick("whatsapp", "WhatsApp", "whatsapp")}
                  >
                    Conectar
                  </Button>
                </CardContent>
              </Card>
            )}
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
