import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Instagram,
  MessageSquare,
  Mail,
  CheckCircle2,
  Settings,
  Plug2
} from "lucide-react";
import { WhatsAppQRConnect } from "@/components/WhatsAppQRConnect";
import { WhatsAppBusinessConnect } from "@/components/WhatsAppBusinessConnect";
import { ChannelSettingsModal } from "@/components/ChannelSettingsModal";
import { useOrganization } from "@/contexts/OrganizationContext";

interface ChannelAccount {
  id: string;
  name: string;
  channel_type: string;
  status: string;
  credentials_json: any;
  created_at: string;
}

export default function Integrations() {
  const { currentOrg } = useOrganization();
  const [channels, setChannels] = useState<ChannelAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [localChannels, setLocalChannels] = useState<ChannelAccount[]>([]);
  const [whatsappQROpen, setWhatsappQROpen] = useState(false);
  const [whatsappBusinessOpen, setWhatsappBusinessOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelAccount | null>(null);
  const [emailCredentials, setEmailCredentials] = useState({
    email: "",
    password: "",
    smtp_server: "",
    smtp_port: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    if (currentOrg) {
      fetchOrgAndChannels();
      // Carregar canais locais do localStorage
      loadLocalChannels();
    }
  }, [currentOrg]);

  const loadLocalChannels = () => {
    try {
      const saved = localStorage.getItem('localChannels');
      if (saved) {
        const channels = JSON.parse(saved);
        setLocalChannels(channels);
        console.log('📱 Canais locais carregados do localStorage:', channels);
      }
    } catch (error) {
      console.error('Erro ao carregar canais locais:', error);
    }
  };

  const saveLocalChannels = (channels: ChannelAccount[]) => {
    try {
      localStorage.setItem('localChannels', JSON.stringify(channels));
      console.log('💾 Canais locais salvos no localStorage:', channels);
    } catch (error) {
      console.error('Erro ao salvar canais locais:', error);
    }
  };

  const clearLocalChannels = () => {
    try {
      localStorage.removeItem('localChannels');
      setLocalChannels([]);
      console.log('🗑️ Canais locais limpos do localStorage');
    } catch (error) {
      console.error('Erro ao limpar canais locais:', error);
    }
  };

  const fetchOrgAndChannels = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (!user) {
        // Usuário não autenticado - mostrar apenas integrações disponíveis
        setOrgId(null);
        setChannels([]);
        setLoading(false);
        return;
      }
      
      // Usar org atual do contexto
      if (currentOrg) {
        setOrgId(currentOrg.id);
        fetchChannels(currentOrg.id);
      } else {
        setOrgId(null);
        setChannels([]);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setOrgId(null);
      setChannels([]);
      setLoading(false);
    }
  };

  const fetchChannels = async (orgId: string) => {
    try {
      setLoading(true);
      console.log('🔄 Buscando canais para orgId:', orgId);
      
      // Buscar TODOS os canais primeiro (sem filtro de status)
      const { data: allData, error: allError } = await supabase
        .from('channel_accounts')
        .select('*')
        .eq('org_id', orgId);
      
      console.log('📊 Todos os canais (sem filtro status):', { allData, allError });
      
      // Buscar canais ativos
      const { data: directData, error: directError } = await supabase
        .from('channel_accounts')
        .select('*')
        .eq('org_id', orgId)
        .eq('status', 'active');
      
      console.log('📊 Busca direta da tabela:', { directData, directError });
      
      // Se a busca direta funcionou e retornou dados, usar esses dados
      if (!directError && directData && directData.length > 0) {
        console.log('✅ Usando dados diretos da tabela (ativos):', directData);
        setChannels(directData);
        setLoading(false);
        return;
      }
      
      // Se não há canais ativos, verificar se há canais no total
      if (!allError && allData && allData.length > 0) {
        console.log('⚠️ Nenhum canal ativo, mas há canais no total:', allData);

        // Filtrar apenas canais que não estão com status 'inactive' ou 'disconnected'
        const activeChannels = allData.filter(ch => ch.status !== 'inactive' && ch.status !== 'disconnected');

        if (activeChannels.length > 0) {
          console.log('📋 Usando canais não-desconectados:', activeChannels);
          setChannels(activeChannels);
        } else {
          console.log('📋 Nenhum canal válido encontrado, limpando lista');
          setChannels([]);
        }

        setLoading(false);
        return;
      }
      
      // Se não há dados diretos, tentar Edge Function
      try {
        console.log('🔄 Tentando Edge Function...');
      const { data, error } = await supabase.functions.invoke("get-channels", {
        body: { org_id: orgId }
      });

        console.log('📡 Resposta Edge Function:', { data, error });

      if (error) {
          // Se a Edge Function falhar, usar dados diretos mesmo com erro
          console.log('⚠️ Edge Function falhou, usando dados diretos');
        setChannels(directData || []);
        return;
      }
      
        console.log('✅ Usando dados da Edge Function:', data?.channels);
      setChannels(data?.channels || []);
      } catch (edgeError) {
        console.log('⚠️ Edge Function não disponível:', edgeError);
        // Se a Edge Function não estiver disponível, usar dados diretos
        setChannels(directData || []);
      }
      
    } catch (error) {
      console.error("❌ Error fetching channels:", error);
      toast({ title: "Erro", description: "Erro ao carregar integrações" });
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const isChannelConnected = (channelType: string) => {
    const allChannels = [...channels, ...localChannels];
    return allChannels.some(ch => ch.channel_type === channelType);
  };

  const handleChannelSettings = (channel: ChannelAccount) => {
    setSelectedChannel(channel);
    setSettingsModalOpen(true);
  };

  const handleMetaConnect = async (channelType: string) => {
    try {
      // Meta App ID - você precisa configurar isso no seu projeto
      const appId = import.meta.env.VITE_META_APP_ID || "YOUR_META_APP_ID";
      
      if (appId === "YOUR_META_APP_ID") {
        toast({
          title: "Configuração necessária",
          description: "Configure o VITE_META_APP_ID no arquivo .env para conectar com o Meta"
        });
        return;
      }

      // Configurar permissões baseadas no tipo de canal
      const permissions = {
        instagram: ["pages_show_list", "pages_messaging", "instagram_basic", "instagram_manage_messages"],
        facebook: ["pages_show_list", "pages_messaging"],
        messenger: ["pages_show_list", "pages_messaging"]
      };

      const scope = permissions[channelType as keyof typeof permissions]?.join(",") || "pages_show_list,pages_messaging";
      const redirectUri = `${window.location.origin}/auth/callback`;

      // URL do OAuth do Facebook
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${scope}` +
        `&response_type=code` +
        `&state=${channelType}`;

      // Abrir popup de autenticação
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'MetaLogin',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        toast({
          title: "Popup bloqueado",
          description: "Por favor, permita popups para este site e tente novamente."
        });
        return;
      }

      // Listener para capturar o código de autorização do popup
      const checkPopup = setInterval(() => {
        try {
          if (popup?.closed) {
            clearInterval(checkPopup);
            toast({
              title: "Conexão cancelada",
              description: "A janela de autenticação foi fechada."
            });
          }

          // Tentar capturar o código da URL do popup
          if (popup?.location.search) {
            const urlParams = new URLSearchParams(popup.location.search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');

            if (error) {
              clearInterval(checkPopup);
              popup.close();
              toast({
                title: "Erro na autenticação",
                description: "Não foi possível conectar com o Meta. Tente novamente."
              });
            } else if (code) {
              clearInterval(checkPopup);
              popup.close();
              
              // Processar o código de autorização
              processAuthCode(code, channelType);
            }
          }
        } catch (error) {
          // Erro de CORS esperado enquanto está no domínio do Facebook
        }
      }, 1000);

      // Timeout após 5 minutos
      setTimeout(() => {
        if (!popup.closed) {
          clearInterval(checkPopup);
          popup.close();
          toast({
            title: "Timeout",
            description: "Tempo limite excedido. Tente novamente."
          });
        }
      }, 300000);

    } catch (error: any) {
      console.error("Error connecting:", error);
      toast({
        title: "Erro ao conectar",
        description: error.message || "Não foi possível conectar. Tente novamente."
      });
    }
  };

  const processAuthCode = async (code: string, channelType: string) => {
    try {
      // Usar Edge Function para trocar código por token (mais seguro)
      const { data, error } = await supabase.functions.invoke("meta-oauth-exchange", {
        body: {
          code: code,
          channel_type: channelType,
          redirect_uri: `${window.location.origin}/auth/callback`
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Não foi possível obter token de acesso");
      }

      const { access_token, pages } = data;

      if (!pages || pages.length === 0) {
        toast({
          title: "Nenhuma página encontrada",
          description: "Você não tem páginas do Facebook. Crie uma página primeiro."
        });
        return;
      }

      // Para Instagram, filtrar páginas que têm Instagram Business conectado
      let availablePages = pages;
      if (channelType === 'instagram') {
        const instagramPages = [];
        for (const page of pages) {
          try {
            const pageResponse = await fetch(
              `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
            );
            const pageData = await pageResponse.json();
            if (pageData.instagram_business_account) {
              instagramPages.push(page);
            }
          } catch (error) {
            // Ignorar páginas sem Instagram Business
          }
        }
        availablePages = instagramPages;
      }

      if (availablePages.length === 0) {
        toast({
          title: "Nenhuma página compatível",
          description: `Nenhuma página com ${channelType === 'instagram' ? 'Instagram Business' : 'Messenger'} foi encontrada.`
        });
        return;
      }

      // Se há apenas uma página, conectar automaticamente
      if (availablePages.length === 1) {
        await connectToPage(availablePages[0], channelType);
      } else {
        // Mostrar seleção de páginas
        showPageSelection(availablePages, channelType);
      }

    } catch (error: any) {
      console.error("Error processing auth code:", error);
      toast({
        title: "Erro ao processar autenticação",
        description: error.message || "Não foi possível processar a autenticação."
      });
    }
  };

  const connectToPage = async (page: any, channelType: string) => {
    try {
      // Preparar credenciais baseadas no tipo de canal
      let credentials: any = {
        access_token: page.access_token,
        page_id: page.id,
        verify_token: generateVerifyToken()
      };

      // Para Instagram, buscar informações do Instagram Business
      if (channelType === 'instagram') {
        const instagramResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        const instagramData = await instagramResponse.json();
        if (instagramData.instagram_business_account) {
          credentials.instagram_business_account_id = instagramData.instagram_business_account.id;
        }
      }

      // Salvar conexão via Edge Function
      const { data, error } = await supabase.functions.invoke("channel-connect", {
        body: {
          channel_type: channelType,
          name: `${page.name} - ${channelType}`,
          credentials: credentials,
          org_id: '00000000-0000-0000-0000-000000000000',
        },
      });

      if (error) throw error;

      // Adicionar canal localmente
      const localChannel: ChannelAccount = {
        id: `local-${channelType}-${Date.now()}`,
        name: `${page.name} - ${channelType}`,
        channel_type: channelType,
        status: 'active',
        credentials_json: credentials,
        created_at: new Date().toISOString()
      };

      // Salvar no localStorage
      const updatedLocalChannels = [...localChannels, localChannel];
      setLocalChannels(updatedLocalChannels);
      localStorage.setItem('localChannels', JSON.stringify(updatedLocalChannels));

      toast({
        title: "Conectado com sucesso!",
        description: `${page.name} foi conectado ao ${channelType}.`
      });

    } catch (error: any) {
      console.error("Error connecting to page:", error);
      toast({
        title: "Erro ao conectar página",
        description: error.message || "Não foi possível conectar à página selecionada."
      });
    }
  };

  const showPageSelection = (pages: any[], channelType: string) => {
    // Por enquanto, conectar à primeira página disponível
    // Em uma implementação completa, você criaria um modal para seleção
    connectToPage(pages[0], channelType);
  };

  const generateVerifyToken = () => {
    return `verify_${Math.random().toString(36).substring(2, 15)}`;
  };

  const handleConnectClick = async (type: string, name: string, icon: string) => {

    // WhatsApp - mostrar opções de conexão
    if (type === "whatsapp") {
      // Por padrão, abrir WhatsApp Business API (já configurado)
      setWhatsappBusinessOpen(true);
      return;
    }

    // WhatsApp QR Code (alternativa)
    if (type === "whatsapp-qr") {
      setWhatsappQROpen(true);
      return;
    }

    // Instagram e Facebook usam conexão direta
    if (type === "instagram" || type === "facebook") {
      await handleMetaConnect(type);
      return;
    }

    // Email usa formulário simples
    if (type === "email") {
      // Para email, vamos usar um prompt simples por enquanto
      const email = prompt("Digite seu email:");
      const password = prompt("Digite sua senha do email:");
      const smtpServer = prompt("Servidor SMTP (ex: smtp.gmail.com):") || "smtp.gmail.com";
      const smtpPort = prompt("Porta SMTP (ex: 587):") || "587";

      if (!email || !password) {
        toast({ title: "Erro", description: "Email e senha são obrigatórios" });
      return;
    }

      try {
        const credentials = {
          email,
          password,
          smtp_server: smtpServer,
          smtp_port: smtpPort,
        };

        // Tentar salvar no Supabase primeiro
        if (orgId) {
          const { data, error } = await supabase
            .from('channel_accounts')
            .insert({
          org_id: orgId,
              name: `Email - ${email}`,
              channel_type: 'messenger' as any, // Usar messenger temporariamente para email
              status: 'active',
              credentials_json: credentials
            });

          if (error) {
            console.log('Erro ao salvar no Supabase, salvando localmente:', error);
            // Salvar localmente se Supabase falhar
            const localChannel = {
              id: `local-email-${Date.now()}`,
              name: `Email - ${email}`,
              channel_type: 'messenger' as any, // Usar messenger temporariamente para email
              status: 'active',
              credentials_json: credentials,
              created_at: new Date().toISOString(),
            };
            setChannels(prev => [...prev, localChannel]);
          } else {
            console.log('Email salvo no Supabase com sucesso:', data);
            // Recarregar lista
            fetchChannels(orgId);
          }
        } else {
          // Salvar localmente se não há orgId
          const localChannel = {
            id: `local-email-${Date.now()}`,
            name: `Email - ${email}`,
            channel_type: 'email',
            status: 'active',
            credentials_json: credentials,
            created_at: new Date().toISOString(),
          };
          setChannels(prev => [...prev, localChannel]);
        }

        toast({ title: "Sucesso", description: `${name} conectado com sucesso!` });
    } catch (error) {
      console.error("Error connecting:", error);
        toast({ title: "Erro", description: "Erro ao conectar integração" });
      }
      return;
    }

    // Para outras integrações, mostrar mensagem
    toast({ title: "Em breve", description: `${name} será implementado em breve!` });
  };

  const handleDisconnectChannel = async (channelId: string) => {
    try {
      console.log('🗑️ [handleDisconnectChannel] Iniciando desconexão do canal:', channelId);

      // Se é um canal local (começa com 'local-'), apenas remover da lista
      if (channelId.startsWith('local-')) {
        console.log('📱 Canal local detectado, removendo do localStorage');
        setLocalChannels(prev => {
          const newChannels = prev.filter(ch => ch.id !== channelId);
          saveLocalChannels(newChannels);
          console.log('✅ Canal local removido. Canais restantes:', newChannels);
          return newChannels;
        });
        toast({ title: "Sucesso", description: "Canal desconectado com sucesso!" });
        return;
      }

      console.log('🌐 Canal do banco de dados detectado, tentando deletar...');

      // Tentar deletar diretamente do Supabase (método mais simples)
      const { data: deleteData, error: dbError } = await supabase
        .from("channel_accounts")
        .delete()
        .eq("id", channelId)
        .select();

      console.log('📊 Resultado da deleção:', { deleteData, dbError });

      if (dbError) {
        console.error('❌ Erro ao deletar do banco:', dbError);

        // Tentar mudar status para 'inactive' ao invés de deletar
        console.log('🔄 Tentando desativar ao invés de deletar...');
        const { data: updateData, error: updateError } = await supabase
          .from("channel_accounts")
          .update({ status: 'inactive' })
          .eq("id", channelId)
          .select();

        console.log('📊 Resultado da desativação:', { updateData, updateError });

        if (updateError) {
          console.error('❌ Erro ao desativar:', updateError);
          throw new Error(`Não foi possível desconectar: ${updateError.message}`);
        }

        toast({ title: "Sucesso", description: "Canal desativado com sucesso!" });
      } else {
        console.log('✅ Canal deletado com sucesso!');
        toast({ title: "Sucesso", description: "Canal desconectado com sucesso!" });
      }

      // Recarregar lista de canais
      console.log('🔄 Recarregando lista de canais...');
      if (orgId) {
        await fetchChannels(orgId);
      } else {
        await fetchOrgAndChannels();
      }

      console.log('✅ [handleDisconnectChannel] Processo concluído!');

    } catch (error: any) {
      console.error("❌ [handleDisconnectChannel] Erro:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao desconectar canal"
      });
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

      <div className="space-y-6">

        {/* Integrações Principais */}
          <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            
              {/* Instagram */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-600 via-purple-600 to-orange-500 flex items-center justify-center">
                        <Instagram className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Instagram
                        {isChannelConnected("instagram") ? (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                        ) : (
                          <Badge variant="outline">Disponível</Badge>
                          )}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                  Conecte sua conta do Instagram
                  </p>
                  <Separator />
                  {isChannelConnected("instagram") ? (
                  <div className="space-y-3">
                    {/* Informações da conta conectada */}
                    {(() => {
                      const allChannels = [...channels, ...localChannels];
                      const channel = allChannels.find(ch => ch.channel_type === "instagram");
                      return channel ? (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Conectado
                            </span>
                      </div>
                          {channel.credentials_json?.username && (
                            <p className="text-xs text-green-700 dark:text-green-300">
                              @{channel.credentials_json.username}
                            </p>
                          )}
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Conectado em {new Date(channel.created_at).toLocaleDateString('pt-BR')}
                          </p>
                    </div>
                      ) : null;
                    })()}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const allChannels = [...channels, ...localChannels];
                          const channel = allChannels.find(ch => ch.channel_type === "instagram");
                          if (channel) {
                            handleChannelSettings(channel);
                          }
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={async () => {
                          const allChannels = [...channels, ...localChannels];
                          const channel = allChannels.find(ch => ch.channel_type === "instagram");
                          if (channel) await handleDisconnectChannel(channel.id);
                        }}
                      >
                        Desconectar
                      </Button>
                    </div>
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

              {/* WhatsApp */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-bold">
                        W
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                        WhatsApp
                        {isChannelConnected("whatsapp") ? (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                        ) : (
                          <Badge variant="outline">Disponível</Badge>
                          )}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                  Conecte sua conta do WhatsApp
                  </p>
                  <Separator />
                  {isChannelConnected("whatsapp") ? (
                  <div className="space-y-3">
                    {/* Informações da conta conectada */}
                    {(() => {
                      const allChannels = [...channels, ...localChannels];
                      const channel = allChannels.find(ch => ch.channel_type === "whatsapp");
                      return channel ? (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Conectado
                            </span>
                          </div>
                          {channel.credentials_json?.phone_number && (
                            <p className="text-xs text-green-700 dark:text-green-300">
                              📞 {channel.credentials_json.phone_number}
                            </p>
                          )}
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Conectado em {new Date(channel.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      ) : null;
                    })()}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const allChannels = [...channels, ...localChannels];
                          const channel = allChannels.find(ch => ch.channel_type === "whatsapp");
                          if (channel) {
                            handleChannelSettings(channel);
                          }
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          console.log('🔴 Botão Desconectar clicado!');
                          const allChannels = [...channels, ...localChannels];
                          console.log('📋 Todos os canais:', allChannels);
                          const channel = allChannels.find(ch => ch.channel_type === "whatsapp");
                          console.log('📱 Canal WhatsApp encontrado:', channel);
                          if (channel) {
                            console.log('🗑️ Chamando handleDisconnectChannel com ID:', channel.id);
                            await handleDisconnectChannel(channel.id);
                          } else {
                            console.error('❌ Nenhum canal WhatsApp encontrado para desconectar!');
                          }
                        }}
                      >
                        Desconectar
                      </Button>
                    </div>
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

              {/* Email */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                        Email
                        {isChannelConnected("email") ? (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                        ) : (
                          <Badge variant="outline">Disponível</Badge>
                          )}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                  Conecte sua conta de email
                  </p>
                  <Separator />
                  {isChannelConnected("email") ? (
                  <div className="space-y-3">
                    {/* Informações da conta conectada */}
                    {(() => {
                      const allChannels = [...channels, ...localChannels];
                      const channel = allChannels.find(ch => ch.channel_type === "email");
                      return channel ? (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Conectado
                            </span>
                    </div>
                          {channel.credentials_json?.email && (
                            <p className="text-xs text-green-700 dark:text-green-300">
                              📧 {channel.credentials_json.email}
                            </p>
                          )}
                          {channel.credentials_json?.smtp_server && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              SMTP: {channel.credentials_json.smtp_server}
                            </p>
                          )}
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Conectado em {new Date(channel.created_at).toLocaleDateString('pt-BR')}
                          </p>
                  </div>
                      ) : null;
                    })()}
                    
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                        className="flex-1"
                        onClick={() => {
                          const allChannels = [...channels, ...localChannels];
                          const channel = allChannels.find(ch => ch.channel_type === "email");
                          if (channel) {
                            handleChannelSettings(channel);
                          }
                        }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                        Configurar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                        onClick={async () => {
                          const allChannels = [...channels, ...localChannels];
                          const channel = allChannels.find(ch => ch.channel_type === "email");
                          if (channel) await handleDisconnectChannel(channel.id);
                        }}
                        >
                          Desconectar
                        </Button>
                      </div>
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

          </div>
        </div>
      </div>

      {/* WhatsApp QR Code Connect (Alternative method) */}
      <WhatsAppQRConnect
        open={whatsappQROpen}
        onOpenChange={setWhatsappQROpen}
        onSuccess={() => {
          console.log('WhatsApp QR connect success');

          // Adicionar canal localmente (fallback para quando RLS bloqueia busca)
          const localChannel = {
            id: `local-whatsapp-${Date.now()}`,
            org_id: '00000000-0000-0000-0000-000000000000',
            name: 'WhatsApp Business',
            channel_type: 'whatsapp',
            status: 'active',
            credentials_json: {
              phone_number: 'WhatsApp conectado',
              connected_at: new Date().toISOString()
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          setLocalChannels(prev => {
            const newChannels = [...prev, localChannel];
            saveLocalChannels(newChannels);
            return newChannels;
          });

          // Forçar atualização da lista com múltiplas tentativas
          setTimeout(() => {
          if (orgId) {
              console.log('🔄 Recarregando canais após WhatsApp...');
            fetchChannels(orgId);
          } else {
              console.log('🔄 Buscando orgId e canais após WhatsApp...');
            fetchOrgAndChannels();
          }
          }, 500);

          setTimeout(() => {
          if (orgId) {
              console.log('🔄 Segunda tentativa WhatsApp...');
            fetchChannels(orgId);
            }
          }, 2000);

          setTimeout(() => {
            if (orgId) {
              console.log('🔄 Terceira tentativa WhatsApp...');
              fetchChannels(orgId);
            }
          }, 5000);
        }}
      />

      {/* WhatsApp Business API Connect (Official method) */}
      <WhatsAppBusinessConnect
        open={whatsappBusinessOpen}
        onOpenChange={setWhatsappBusinessOpen}
        onSuccess={() => {
          console.log('WhatsApp Business API connect success');

          // Recarregar lista de canais
          if (orgId) {
            fetchChannels(orgId);
          } else {
            fetchOrgAndChannels();
          }
        }}
      />


      <ChannelSettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        channel={selectedChannel}
        onDisconnect={async () => {
          if (selectedChannel) {
            await handleDisconnectChannel(selectedChannel.id);
          }
        }}
      />
    </div>
  );
}