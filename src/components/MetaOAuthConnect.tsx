import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Facebook, Instagram as InstagramIcon, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MetaOAuthConnectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelType: "whatsapp" | "instagram" | "messenger";
  onSuccess?: () => void;
}

export function MetaOAuthConnect({ open, onOpenChange, channelType, onSuccess }: MetaOAuthConnectProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'select' | 'success'>('auth');
  const [pages, setPages] = useState<any[]>([]);
  const [accessToken, setAccessToken] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'unknown' | 'connected' | 'not_authorized' | 'unknown'>('unknown');
  const [userInfo, setUserInfo] = useState<{
    userID: string;
    expiresIn: number;
    signedRequest: string;
    name?: string;
    email?: string;
  } | null>(null);
  const fbLoginButtonRef = useRef<HTMLDivElement>(null);

  const channelConfig = {
    whatsapp: {
      title: "Conectar WhatsApp Business",
      description: "Faça login com sua conta do Facebook para conectar o WhatsApp Business",
      icon: "W",
      color: "from-green-500 to-green-600",
      permissions: ["pages_show_list", "pages_messaging", "whatsapp_business_management", "whatsapp_business_messaging"]
    },
    instagram: {
      title: "Conectar Instagram",
      description: "Faça login com sua conta do Facebook para conectar o Instagram",
      icon: <InstagramIcon className="h-6 w-6" />,
      color: "from-pink-500 to-purple-600",
      permissions: ["pages_show_list", "pages_messaging", "instagram_basic", "instagram_manage_messages"]
    },
    messenger: {
      title: "Conectar Messenger",
      description: "Faça login com sua conta do Facebook para conectar o Messenger",
      icon: <Facebook className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      permissions: ["pages_show_list", "pages_messaging"]
    }
  };

  const config = channelConfig[channelType];

  // Função callback para processar resposta do Facebook
  const statusChangeCallback = (response: any) => {
    console.log('Facebook status change callback:', response);
    
    if (response.status === 'connected' && response.authResponse) {
      const { accessToken, expiresIn, signedRequest, userID } = response.authResponse;
      
      setIsLoggedIn(true);
      setLoginStatus('connected');
      setAccessToken(accessToken);
      setUserInfo({
        userID,
        expiresIn,
        signedRequest
      });
      
      // Verificar se o token ainda é válido
      const expirationDate = new Date(Date.now() + (expiresIn * 1000));
      const now = new Date();
      
      if (expirationDate > now) {
        console.log(`Token válido até: ${expirationDate.toLocaleString()}`);
        // Se já está logado e token válido, buscar páginas automaticamente
        handleAccessToken(accessToken);
      } else {
        console.log('Token expirado, necessário novo login');
        setIsLoggedIn(false);
        setLoginStatus('unknown');
        toast.warning("Sessão expirada. Faça login novamente.");
      }
    } else if (response.status === 'not_authorized') {
      setIsLoggedIn(false);
      setLoginStatus('not_authorized');
      setUserInfo(null);
      console.log('App não autorizado pelo usuário');
    } else {
      setIsLoggedIn(false);
      setLoginStatus('unknown');
      setUserInfo(null);
      console.log('Usuário não logado');
    }
  };

  // Função para verificar estado de login (chamada pelo fb:login-button)
  const checkLoginState = () => {
    if (window.FB) {
      window.FB.getLoginStatus(function(response: any) {
        statusChangeCallback(response);
      });
    }
  };

  // Tornar a função globalmente acessível para o fb:login-button
  useEffect(() => {
    (window as any).checkLoginState = checkLoginState;
    
    return () => {
      delete (window as any).checkLoginState;
    };
  }, []);

  // Verificar status de login do Facebook
  const checkLoginStatus = () => {
    if (window.FB) {
      window.FB.getLoginStatus(function(response: any) {
        statusChangeCallback(response);
      });
    }
  };

  // Verificar status quando o componente abrir
  useEffect(() => {
    if (open && window.FB) {
      checkLoginStatus();
      
      // Processar XFBML para o Facebook Login Button
      setTimeout(() => {
        if (window.FB && fbLoginButtonRef.current) {
          window.FB.XFBML.parse(fbLoginButtonRef.current);
        }
      }, 100);
    }
  }, [open]);

  const handleMetaLogin = () => {
    setLoading(true);

    // Meta App ID - você precisa configurar isso no seu projeto
    const appId = import.meta.env.VITE_META_APP_ID || "YOUR_META_APP_ID";
    
    if (appId === "YOUR_META_APP_ID") {
      toast.error("Configure o VITE_META_APP_ID no arquivo .env");
      setLoading(false);
      return;
    }

    // Usar Facebook SDK se disponível
    if (window.FB) {
      window.FB.login((response: any) => {
        console.log('Facebook login response:', response);
        
        if (response.authResponse) {
          const { accessToken, expiresIn, signedRequest, userID } = response.authResponse;
          
          setUserInfo({
            userID,
            expiresIn,
            signedRequest
          });
          
          console.log(`Login bem-sucedido! Token válido por ${expiresIn} segundos`);
          handleAccessToken(accessToken);
        } else {
          console.log('Login cancelado ou falhou:', response);
          toast.error("Login cancelado ou falhou");
          setLoading(false);
        }
      }, {
        scope: config.permissions.join(",")
      });
    } else {
      // Fallback para popup manual
      const redirectUri = `${window.location.origin}/integrations`;
      const scope = config.permissions.join(",");

      // URL do OAuth do Facebook
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${scope}` +
        `&response_type=token` +
        `&state=${channelType}`;

      // Abrir popup de autenticação
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'MetaLogin',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listener para capturar o token do popup
      const checkPopup = setInterval(() => {
        try {
          if (popup?.closed) {
            clearInterval(checkPopup);
            setLoading(false);
          }

          // Tentar capturar o hash da URL do popup
          if (popup?.location.hash) {
            const hash = popup.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const token = params.get('access_token');

            if (token) {
              clearInterval(checkPopup);
              popup.close();
              handleAccessToken(token);
            }
          }
        } catch (error) {
          // Erro de CORS esperado enquanto está no domínio do Facebook
        }
      }, 500);
    }
  };

  const handleAccessToken = async (token: string) => {
    setAccessToken(token);
    setLoading(true);

    try {
      // Buscar informações do usuário primeiro
      const userData = await fetchUserInfo(token);
      if (userData) {
        setUserInfo(prev => prev ? { ...prev, name: userData.name, email: userData.email } : null);
      }

      // Buscar páginas do usuário
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar páginas");
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        toast.error("Você não tem páginas do Facebook. Crie uma página primeiro.");
        setLoading(false);
        return;
      }

      setPages(data.data);
      setStep('select');
    } catch (error: any) {
      console.error("Error fetching pages:", error);
      toast.error(error.message || "Erro ao buscar páginas");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPage = async (page: any) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Preparar credenciais baseadas no tipo de canal
      let credentials: any = {
        access_token: page.access_token,
        page_id: page.id,
        verify_token: generateVerifyToken()
      };

      // Para WhatsApp, precisamos buscar o phone_number_id
      if (channelType === 'whatsapp') {
        const whatsappInfo = await fetchWhatsAppInfo(page.id, page.access_token);
        if (!whatsappInfo) {
          throw new Error("Esta página não tem WhatsApp Business conectado");
        }
        credentials.phone_number_id = whatsappInfo.phone_number_id;
        credentials.business_account_id = whatsappInfo.business_account_id;
      }

      // Para Instagram, precisamos buscar o instagram_business_account
      if (channelType === 'instagram') {
        const instagramInfo = await fetchInstagramInfo(page.id, page.access_token);
        if (!instagramInfo) {
          throw new Error("Esta página não tem Instagram Business conectado");
        }
        credentials.instagram_business_account_id = instagramInfo.id;
      }

      // Conectar canal via Edge Function
      const { data, error } = await supabase.functions.invoke("channel-connect", {
        body: {
          channel_type: channelType,
          name: `${page.name} - ${channelType}`,
          credentials: credentials,
          org_id: user.id,
        },
      });

      if (error) throw error;

      setStep('success');
      toast.success(`${config.title} conectado com sucesso!`);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error connecting channel:", error);
      toast.error(error.message || "Erro ao conectar canal");
    } finally {
      setLoading(false);
    }
  };

  const fetchWhatsAppInfo = async (pageId: string, pageAccessToken: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=whatsapp_business_account&access_token=${pageAccessToken}`
      );
      const data = await response.json();

      if (!data.whatsapp_business_account) {
        return null;
      }

      // Buscar phone numbers
      const phoneResponse = await fetch(
        `https://graph.facebook.com/v18.0/${data.whatsapp_business_account.id}/phone_numbers?access_token=${pageAccessToken}`
      );
      const phoneData = await phoneResponse.json();

      if (phoneData.data && phoneData.data.length > 0) {
        return {
          phone_number_id: phoneData.data[0].id,
          business_account_id: data.whatsapp_business_account.id
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching WhatsApp info:", error);
      return null;
    }
  };

  const fetchInstagramInfo = async (pageId: string, pageAccessToken: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
      );
      const data = await response.json();
      return data.instagram_business_account || null;
    } catch (error) {
      console.error("Error fetching Instagram info:", error);
      return null;
    }
  };

  const generateVerifyToken = () => {
    return `verify_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Função para buscar informações do usuário
  const fetchUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`
      );
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User info:', userData);
        return userData;
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
    return null;
  };

  const handleLogout = () => {
    if (window.FB) {
      window.FB.logout((response: any) => {
        console.log('Facebook logout:', response);
        setIsLoggedIn(false);
        setLoginStatus('unknown');
        setAccessToken("");
        setUserInfo(null);
        setPages([]);
        setStep('auth');
        toast.success("Logout realizado com sucesso");
      });
    }
  };

  const handleClose = () => {
    setStep('auth');
    setPages([]);
    setAccessToken("");
    setIsLoggedIn(false);
    setLoginStatus('unknown');
    setUserInfo(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-bold`}>
              {config.icon}
            </div>
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'auth' && (
            <>
              {/* Status de Login */}
              {loginStatus === 'connected' && userInfo && (
                <Alert className="bg-green-500/10 border-green-500/20">
                  <User className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div><strong>Conectado ao Facebook!</strong></div>
                      {userInfo.name && (
                        <div className="text-sm text-muted-foreground">
                          Olá, {userInfo.name}!
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        User ID: {userInfo.userID}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Token válido por: {Math.floor(userInfo.expiresIn / 3600)}h {Math.floor((userInfo.expiresIn % 3600) / 60)}m
                      </div>
                      <div className="text-sm">Buscando suas páginas...</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {loginStatus === 'not_authorized' && (
                <Alert className="bg-yellow-500/10 border-yellow-500/20">
                  <AlertDescription>
                    <strong>Atenção:</strong> Você não autorizou este app. Faça login novamente.
                  </AlertDescription>
                </Alert>
              )}

              {loginStatus === 'unknown' && (
                <Alert>
                  <AlertDescription>
                    <strong>Processo simplificado!</strong> Você só precisa fazer login com sua conta do Facebook.
                    Vamos buscar automaticamente todas as informações necessárias.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-4 py-4">
                {!isLoggedIn ? (
                  <div className="space-y-3">
                    {/* Facebook Login Button Nativo */}
                    <div 
                      ref={fbLoginButtonRef}
                      className="fb-login-button"
                      data-scope={config.permissions.join(",")}
                      data-onlogin="checkLoginState"
                      data-size="large"
                      data-button-type="continue_with"
                      data-layout="default"
                      data-auto-logout-link="false"
                      data-use-continue-as="false"
                    />
                    
                    {/* Botão alternativo */}
                    <div className="text-center text-sm text-muted-foreground">
                      ou
                    </div>
                    
                    <Button
                      onClick={handleMetaLogin}
                      disabled={loading}
                      size="lg"
                      className={`bg-gradient-to-r ${config.color} text-white`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        <>
                          <Facebook className="h-5 w-5 mr-2" />
                          Conectar com Facebook (SDK)
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Trocar Conta
                    </Button>
                    <Button
                      onClick={() => checkLoginStatus()}
                      disabled={loading}
                      size="lg"
                      className={`bg-gradient-to-r ${config.color} text-white flex-1`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Continuar
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertDescription className="text-sm">
                  <strong>Nota:</strong> Você precisa ter uma página do Facebook com {channelType === 'whatsapp' ? 'WhatsApp Business' : channelType === 'instagram' ? 'Instagram Business' : 'Messenger'} configurado.
                </AlertDescription>
              </Alert>
            </>
          )}

          {step === 'select' && (
            <>
              <Alert>
                <AlertDescription>
                  <strong>Selecione uma página</strong> para conectar ao {channelType}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {pages.map((page) => (
                  <Card key={page.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleSelectPage(page)}>
                    <CardHeader>
                      <CardTitle className="text-base">{page.name}</CardTitle>
                      <CardDescription>ID: {page.id}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </>
          )}

          {step === 'success' && (
            <>
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <strong>Sucesso!</strong> Canal conectado com sucesso.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleClose} className={`bg-gradient-to-r ${config.color}`}>
                  Concluir
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
