// @deno-types="https://deno.land/x/types/index.d.ts"
import { serve } from "https://deno.land/std@0.225.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      
      const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
      
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully');
        return new Response(challenge, { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      } else {
        console.log('Webhook verification failed');
        return new Response('Forbidden', { 
          status: 403,
          headers: corsHeaders 
        });
      }
    }
    
    // Verificar se é uma requisição POST (mensagem recebida)
    if (method === 'POST') {
      const body = await req.json();
      console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));
      
      // Processar mensagens recebidas
      if (body.object === 'whatsapp_business_account') {
        body.entry?.forEach((entry: any) => {
          entry.changes?.forEach((change: any) => {
            if (change.field === 'messages') {
              const messages = change.value?.messages;
              if (messages) {
                messages.forEach((message: any) => {
                  processWhatsAppMessage(message, change.value);
                });
              }
            }
          });
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
    console.error('Error in whatsapp-webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processWhatsAppMessage(message: any, webhookData: any) {
  try {
    console.log('Processing WhatsApp message:', message);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const messageId = message.id;
    const from = message.from;
    const timestamp = message.timestamp;
    const type = message.type;
    
    console.log(`Processing WhatsApp message ${messageId} from ${from}, type: ${type}`);
    
    // Extrair conteúdo da mensagem baseado no tipo
    let messageText = '';
    let mediaUrl = '';
    let mediaType = '';
    
    switch (type) {
      case 'text':
        messageText = message.text?.body || '';
        break;
      case 'image':
        messageText = message.image?.caption || '[Imagem]';
        mediaUrl = message.image?.id;
        mediaType = 'image';
        break;
      case 'document':
        messageText = message.document?.caption || '[Documento]';
        mediaUrl = message.document?.id;
        mediaType = 'document';
        break;
      case 'audio':
        messageText = '[Áudio]';
        mediaUrl = message.audio?.id;
        mediaType = 'audio';
        break;
      case 'video':
        messageText = message.video?.caption || '[Vídeo]';
        mediaUrl = message.video?.id;
        mediaType = 'video';
        break;
      case 'sticker':
        messageText = '[Sticker]';
        mediaUrl = message.sticker?.id;
        mediaType = 'sticker';
        break;
      default:
        messageText = `[Mensagem ${type}]`;
    }
    
    // Buscar conta do canal WhatsApp (pegar o primeiro ativo)
    const { data: channelAccounts, error: channelError } = await supabase
      .from('channel_accounts')
      .select('*')
      .eq('channel_type', 'whatsapp')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (channelError || !channelAccounts || channelAccounts.length === 0) {
      console.error('Channel account not found:', channelError);
      return;
    }
    
    const channelAccount = channelAccounts[0];
    console.log('Found channel account:', channelAccount.id);
    
    // Encontrar ou criar contato
    const contact = await findOrCreateContact(supabase, from, channelAccount.org_id, 'whatsapp');
    
    // Encontrar ou criar conversa
    const conversation = await findOrCreateConversation(supabase, contact.id, channelAccount.id, channelAccount.org_id);
    
    // Preparar dados da mensagem de forma mais explícita
    const messageData = {
      conversation_id: conversation.id,
      sender_type: 'contact',
      direction: 'inbound',
      content: messageText || '',
      message_type: type || 'text',
      media_url: mediaUrl || null,
      channel_type: 'whatsapp',
      status: 'delivered',
      external_id: messageId || null,
      metadata: JSON.stringify({
        media_type: mediaType || '',
        timestamp: timestamp || '',
        webhook_data: webhookData || {}
      })
    };
    
    console.log('Message data to insert:', JSON.stringify(messageData, null, 2));
    console.log('Sender type value:', messageData.sender_type);
    console.log('Sender type type:', typeof messageData.sender_type);
    
    // Salvar mensagem no banco - tentar inserção direta com validação
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_type: 'contact',
        direction: 'inbound',
        content: messageText || '',
        message_type: type || 'text',
        media_url: mediaUrl || null,
        channel_type: 'whatsapp',
        status: 'delivered',
        external_id: messageId || null,
        metadata: {
          media_type: mediaType || '',
          timestamp: timestamp || '',
          webhook_data: webhookData || {}
        }
      });
    
    if (messageError) {
      console.error('Error saving message:', messageError);
    } else {
      console.log('Message saved successfully');
      
      // Atualizar timestamp da última mensagem na conversa
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          status: 'open'
        })
        .eq('id', conversation.id);
    }
    
  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
  }
}

async function findOrCreateContact(supabase: any, externalId: string, orgId: string, channelType: string) {
  // Buscar contato existente
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('*')
    .eq('org_id', orgId)
    .eq('external_id', externalId)
    .single();
  
  if (existingContact) {
    return existingContact;
  }
  
  // Criar novo contato
  const { data: newContact, error } = await supabase
    .from('contacts')
    .insert({
      org_id: orgId,
      external_id: externalId,
      full_name: `WhatsApp ${externalId.slice(-4)}`,
      metadata: {
        channel_type: channelType,
        tags: ['whatsapp', 'lead']
      }
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
  
  return newContact;
}

async function findOrCreateConversation(supabase: any, contactId: string, channelAccountId: string, orgId: string) {
  // Buscar conversa existente
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('contact_id', contactId)
    .eq('channel_account_id', channelAccountId)
    .eq('org_id', orgId)
    .single();
  
  if (existingConversation) {
    return existingConversation;
  }
  
  // Criar nova conversa
  const { data: newConversation, error } = await supabase
    .from('conversations')
    .insert({
      org_id: orgId,
      contact_id: contactId,
      channel_account_id: channelAccountId,
      status: 'open',
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
  
  return newConversation;
}
