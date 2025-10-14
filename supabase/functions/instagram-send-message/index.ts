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
    const { to, message, type = 'text', media_url, caption } = await req.json();

    if (!to || !message) {
      return new Response(JSON.stringify({ 
        error: 'Campos obrigatórios: to (destinatário) e message (mensagem)' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
    const pageId = Deno.env.get('INSTAGRAM_PAGE_ID');

    if (!accessToken || !pageId) {
      return new Response(JSON.stringify({ 
        error: 'Configuração do Instagram não encontrada. Verifique as variáveis de ambiente.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let messageData: any = {};

    switch (type) {
      case 'text':
        messageData = {
          recipient: { id: to },
          message: { text: message }
        };
        break;
      
      case 'image':
        if (!media_url) {
          return new Response(JSON.stringify({ 
            error: 'URL da mídia é obrigatória para tipo "image"' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        messageData = {
          recipient: { id: to },
          message: {
            attachment: {
              type: 'image',
              payload: {
                url: media_url
              }
            }
          }
        };
        
        if (caption) {
          messageData.message.text = caption;
        }
        break;
      
      case 'video':
        if (!media_url) {
          return new Response(JSON.stringify({ 
            error: 'URL da mídia é obrigatória para tipo "video"' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        messageData = {
          recipient: { id: to },
          message: {
            attachment: {
              type: 'video',
              payload: {
                url: media_url
              }
            }
          }
        };
        
        if (caption) {
          messageData.message.text = caption;
        }
        break;
      
      case 'audio':
        if (!media_url) {
          return new Response(JSON.stringify({ 
            error: 'URL da mídia é obrigatória para tipo "audio"' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        messageData = {
          recipient: { id: to },
          message: {
            attachment: {
              type: 'audio',
              payload: {
                url: media_url
              }
            }
          }
        };
        break;
      
      case 'file':
        if (!media_url) {
          return new Response(JSON.stringify({ 
            error: 'URL da mídia é obrigatória para tipo "file"' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        messageData = {
          recipient: { id: to },
          message: {
            attachment: {
              type: 'file',
              payload: {
                url: media_url
              }
            }
          }
        };
        break;
      
      case 'template':
        messageData = {
          recipient: { id: to },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: message.template_type || 'generic',
                elements: message.elements || []
              }
            }
          }
        };
        break;
      
      case 'quick_reply':
        messageData = {
          recipient: { id: to },
          message: {
            text: message.text,
            quick_replies: message.quick_replies || []
          }
        };
        break;
      
      default:
        messageData = {
          recipient: { id: to },
          message: { text: message }
        };
        break;
    }

    console.log('Enviando mensagem Instagram:', JSON.stringify(messageData, null, 2));

    // Enviar mensagem via Instagram Graph API
    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro ao enviar mensagem Instagram:', errorData);
      
      return new Response(JSON.stringify({ 
        error: 'Erro ao enviar mensagem Instagram',
        details: errorData
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    console.log('Mensagem Instagram enviada com sucesso:', result);

    return new Response(JSON.stringify({ 
      success: true,
      message_id: result.message_id,
      result: result
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in instagram-send-message:', error);
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
      // Considerar rate limits do Instagram
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

// Função para criar quick replies
function createQuickReplies(options: string[]) {
  return options.map((option, index) => ({
    content_type: 'text',
    title: option,
    payload: `QR_${index}_${option}`
  }));
}

// Função para criar template genérico
function createGenericTemplate(title: string, subtitle: string, imageUrl: string, buttons: any[]) {
  return {
    template_type: 'generic',
    elements: [{
      title: title,
      subtitle: subtitle,
      image_url: imageUrl,
      buttons: buttons
    }]
  };
}
