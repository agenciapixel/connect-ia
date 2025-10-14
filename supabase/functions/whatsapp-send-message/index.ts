import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message, type = 'text' } = await req.json();

    if (!to || !message) {
      return new Response(JSON.stringify({ 
        error: 'Campos obrigatórios: to (destinatário) e message (mensagem)' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!accessToken || !phoneNumberId) {
      return new Response(JSON.stringify({ 
        error: 'Configuração do WhatsApp não encontrada. Verifique as variáveis de ambiente.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Preparar dados da mensagem baseado no tipo
    let messageData: any = {
      messaging_product: 'whatsapp',
      to: to,
    };

    switch (type) {
      case 'text':
        messageData.text = { body: message };
        break;
      
      case 'template':
        // Para mensagens template (precisam ser aprovadas pelo Meta)
        messageData.template = {
          name: message.template_name || 'default_template',
          language: { code: message.language || 'pt_BR' },
          components: message.components || []
        };
        break;
      
      case 'image':
        messageData.image = {
          link: message.image_url,
          caption: message.caption || ''
        };
        break;
      
      case 'document':
        messageData.document = {
          link: message.document_url,
          filename: message.filename || 'document.pdf'
        };
        break;
      
      default:
        messageData.text = { body: message };
        break;
    }

    console.log('Enviando mensagem WhatsApp:', JSON.stringify(messageData, null, 2));

    // Enviar mensagem via WhatsApp Business API
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro ao enviar mensagem WhatsApp:', errorData);
      
      return new Response(JSON.stringify({ 
        error: 'Erro ao enviar mensagem WhatsApp',
        details: errorData
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    console.log('Mensagem WhatsApp enviada com sucesso:', result);

    return new Response(JSON.stringify({ 
      success: true,
      message_id: result.messages?.[0]?.id,
      whatsapp_message_id: result.messages?.[0]?.id,
      result: result
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in whatsapp-send-message:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Função auxiliar para enviar mensagem em lote
async function sendBulkMessages(messages: any[]) {
  const results = [];
  
  for (const messageData of messages) {
    try {
      // Implementar lógica de envio em lote
      // Considerar rate limits do WhatsApp
      results.push(await sendSingleMessage(messageData));
    } catch (error) {
      results.push({ error: error.message, message: messageData });
    }
  }
  
  return results;
}

async function sendSingleMessage(messageData: any) {
  // Implementar envio individual
  return messageData;
}
