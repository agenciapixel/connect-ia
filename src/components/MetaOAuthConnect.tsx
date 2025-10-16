import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Instagram as InstagramIcon, Facebook } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MetaOAuthConnectProps {
  channelType: "whatsapp" | "instagram" | "messenger";
  onSuccess?: () => void;
}

export function MetaOAuthConnect({ channelType, onSuccess }: MetaOAuthConnectProps) {
  const [loading, setLoading] = useState(false);

  const channelConfig = {
    whatsapp: {
      title: "Conectar WhatsApp Business",
      description: "Para conectar o WhatsApp Business, você precisa ter uma conta de WhatsApp Business API configurada no Facebook Business Manager",
      icon: "W",
      color: "from-green-500 to-green-600",
      permissions: ["pages_show_list", "pages_messaging", "whatsapp_business_management", "whatsapp_business_messaging"]
    },
    instagram: {
      title: "Conectar Instagram",
      description: "Conecte sua conta do Instagram via Facebook",
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

  const handleMetaLogin = async () => {
    setLoading(true);

    try {
      // Simular conexão direta para demonstração
      // Em produção, aqui seria a integração real com Meta/Facebook
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
      
      // Simular dados de conexão
      const mockConnection = {
        id: `mock_${Date.now()}`,
        name: `${channelType} - Conta Principal`,
        access_token: `mock_token_${Math.random().toString(36).substr(2, 9)}`,
        page_id: `mock_page_${Math.random().toString(36).substr(2, 9)}`,
        connected_at: new Date().toISOString()
      };

      // Salvar conexão via Edge Function
      const { data, error } = await supabase.functions.invoke("channel-connect", {
        body: {
          channel_type: channelType,
          name: mockConnection.name,
          credentials: {
            access_token: mockConnection.access_token,
            page_id: mockConnection.page_id,
            connected_at: mockConnection.connected_at,
            connection_type: 'mock_demo'
          },
          org_id: '00000000-0000-0000-0000-000000000000',
        },
      });

      if (error) throw error;

      toast({
        title: "Conectado com sucesso!",
        description: `${config.title} foi conectado e está pronto para uso.`
      });

      // Conexão concluída

      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error("Error connecting:", error);
      toast({
        title: "Erro ao conectar",
        description: error.message || "Não foi possível conectar. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Button
      onClick={handleMetaLogin}
      disabled={loading}
      size="sm"
      className={`bg-gradient-to-r ${config.color} text-white`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          {config.icon}
          <span className="ml-2">Conectar {channelType === 'instagram' ? 'Instagram' : channelType === 'whatsapp' ? 'WhatsApp' : 'Messenger'}</span>
        </>
      )}
    </Button>
  );
}
