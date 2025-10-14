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
    const { method, url } = req;
    
    // Verificar se é uma requisição GET (webhook verification)
    if (method === 'GET') {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const mode = urlParams.get('hub.mode');
      const token = urlParams.get('hub.verify_token');
      const challenge = urlParams.get('hub.challenge');
      
      const VERIFY_TOKEN = Deno.env.get('INSTAGRAM_VERIFY_TOKEN');
      
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Instagram webhook verified successfully');
        return new Response(challenge, { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      } else {
        console.log('Instagram webhook verification failed');
        return new Response('Forbidden', { 
          status: 403,
          headers: corsHeaders 
        });
      }
    }
    
    // Verificar se é uma requisição POST (eventos recebidos)
    if (method === 'POST') {
      const body = await req.json();
      console.log('Instagram webhook received:', JSON.stringify(body, null, 2));
      
      // Processar eventos do Instagram
      if (body.object === 'instagram') {
        body.entry?.forEach((entry: any) => {
          // Processar mudanças de mídia
          entry.changes?.forEach((change: any) => {
            if (change.field === 'media') {
              const mediaData = change.value;
              processMediaEvent(mediaData, entry);
            }
            
            // Processar comentários
            if (change.field === 'comments') {
              const commentData = change.value;
              processCommentEvent(commentData, entry);
            }
            
            // Processar mensagens diretas
            if (change.field === 'messages') {
              const messageData = change.value;
              processMessageEvent(messageData, entry);
            }
          });
          
          // Processar webhooks de teste
          if (entry.messaging) {
            entry.messaging.forEach((messaging: any) => {
              processMessagingEvent(messaging, entry);
            });
          }
        });
      }
      
      return new Response('OK', { 
        status: 200,
        headers: corsHeaders 
      });
    }
    
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
    
  } catch (error) {
    console.error('Error in instagram-webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processMediaEvent(mediaData: any, entry: any) {
  try {
    console.log('Processing Instagram media event:', mediaData);
    
    // Processar diferentes tipos de mídia
    if (mediaData.item) {
      const mediaType = mediaData.item.media_type;
      const mediaUrl = mediaData.item.media_url;
      const caption = mediaData.item.caption;
      const timestamp = mediaData.item.timestamp;
      
      console.log(`Media ${mediaType} received: ${mediaUrl}`);
      
      // Aqui você pode:
      // 1. Salvar mídia no banco de dados
      // 2. Processar com IA para análise de sentimento
      // 3. Gerar respostas automáticas
      // 4. Integrar com sistema de CRM
      
      switch (mediaType) {
        case 'IMAGE':
          await processImagePost(mediaData.item);
          break;
        case 'VIDEO':
          await processVideoPost(mediaData.item);
          break;
        case 'CAROUSEL_ALBUM':
          await processCarouselPost(mediaData.item);
          break;
      }
    }
    
  } catch (error) {
    console.error('Error processing media event:', error);
  }
}

async function processCommentEvent(commentData: any, entry: any) {
  try {
    console.log('Processing Instagram comment event:', commentData);
    
    if (commentData.item) {
      const commentId = commentData.item.id;
      const text = commentData.item.text;
      const from = commentData.item.from;
      const timestamp = commentData.item.timestamp;
      
      console.log(`Comment from ${from.username}: ${text}`);
      
      // Processar comentários com IA
      // 1. Analisar sentimento
      // 2. Gerar resposta automática
      // 3. Escalar para atendimento humano se necessário
      // 4. Salvar no banco de dados
      
      await processCommentWithAI(commentData.item);
    }
    
  } catch (error) {
    console.error('Error processing comment event:', error);
  }
}

async function processMessageEvent(messageData: any, entry: any) {
  try {
    console.log('Processing Instagram message event:', messageData);
    
    if (messageData.item) {
      const messageId = messageData.item.id;
      const text = messageData.item.text;
      const from = messageData.item.from;
      const timestamp = messageData.item.timestamp;
      
      console.log(`Message from ${from.username}: ${text}`);
      
      // Processar mensagens diretas
      // 1. Integrar com chat IA
      // 2. Salvar conversa
      // 3. Gerar resposta automática
      
      await processDirectMessage(messageData.item);
    }
    
  } catch (error) {
    console.error('Error processing message event:', error);
  }
}

async function processMessagingEvent(messaging: any, entry: any) {
  try {
    console.log('Processing Instagram messaging event:', messaging);
    
    // Processar diferentes tipos de eventos de mensagem
    if (messaging.message) {
      await processMessageEvent(messaging.message, entry);
    }
    
    if (messaging.postback) {
      await processPostbackEvent(messaging.postback, entry);
    }
    
  } catch (error) {
    console.error('Error processing messaging event:', error);
  }
}

async function processImagePost(mediaItem: any) {
  console.log('Processing Instagram image post:', mediaItem.id);
  // Implementar lógica específica para imagens
}

async function processVideoPost(mediaItem: any) {
  console.log('Processing Instagram video post:', mediaItem.id);
  // Implementar lógica específica para vídeos
}

async function processCarouselPost(mediaItem: any) {
  console.log('Processing Instagram carousel post:', mediaItem.id);
  // Implementar lógica específica para carrosséis
}

async function processCommentWithAI(comment: any) {
  console.log('Processing comment with AI:', comment.id);
  // Integrar com funções de IA existentes
  // Ex: ai-generate-message, ai-summarize
}

async function processDirectMessage(message: any) {
  console.log('Processing direct message:', message.id);
  // Integrar com sistema de chat
  // Ex: ai-agent-chat
}

async function processPostbackEvent(postback: any, entry: any) {
  console.log('Processing postback event:', postback);
  // Processar interações com botões e quick replies
}
