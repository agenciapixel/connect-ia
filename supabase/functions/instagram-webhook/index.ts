import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

      const VERIFY_TOKEN = Deno.env.get('META_VERIFY_TOKEN');

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

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Processar eventos do Instagram
      if (body.object === 'instagram') {
        for (const entry of (body.entry || [])) {
          // Processar mensagens diretas
          if (entry.messaging) {
            for (const messaging of entry.messaging) {
              await processInstagramMessage(supabase, messaging, entry);
            }
          }
        }
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

async function processInstagramMessage(supabase: any, messaging: any, entry: any) {
  try {
    console.log('Processing Instagram message:', JSON.stringify(messaging, null, 2));

    // Extrair informações da mensagem
    const senderId = messaging.sender.id;
    const recipientId = messaging.recipient.id;
    const timestamp = messaging.timestamp;
    const message = messaging.message;

    if (!message) {
      console.log('No message content, skipping');
      return;
    }

    const messageText = message.text || '';
    const messageId = message.mid;

    // Buscar channel_account_id do Instagram
    const { data: channelAccount, error: channelError } = await supabase
      .from('channel_accounts')
      .select('id, org_id')
      .eq('channel_type', 'instagram')
      .eq('status', 'active')
      .single();

    if (channelError || !channelAccount) {
      console.error('Channel account not found:', channelError);
      return;
    }

    // Buscar ou criar contato baseado no sender_id do Instagram
    let contact = await findOrCreateContact(supabase, senderId, channelAccount.org_id, 'instagram');

    if (!contact) {
      console.error('Failed to create/find contact');
      return;
    }

    // Buscar ou criar conversa
    let conversation = await findOrCreateConversation(
      supabase,
      contact.id,
      channelAccount.id,
      channelAccount.org_id
    );

    if (!conversation) {
      console.error('Failed to create/find conversation');
      return;
    }

    // Salvar mensagem no banco
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        org_id: channelAccount.org_id,
        direction: 'inbound',
        content: messageText,
        channel_message_id: messageId,
        channel_type: 'instagram',
        status: 'delivered',
        metadata: {
          sender_id: senderId,
          recipient_id: recipientId,
          timestamp: timestamp,
        },
      });

    if (messageError) {
      console.error('Error saving message:', messageError);
      return;
    }

    // Atualizar last_message_at da conversa
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation.id);

    console.log('Message saved successfully:', messageId);

  } catch (error) {
    console.error('Error processing Instagram message:', error);
  }
}

async function findOrCreateContact(supabase: any, externalId: string, orgId: string, channelType: string) {
  try {
    // Buscar contato existente por metadata
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('org_id', orgId)
      .contains('metadata', { [`${channelType}_id`]: externalId });

    if (existingContacts && existingContacts.length > 0) {
      return existingContacts[0];
    }

    // Criar novo contato
    const { data: newContact, error } = await supabase
      .from('contacts')
      .insert({
        org_id: orgId,
        full_name: `Instagram User ${externalId.substring(0, 8)}`,
        metadata: {
          [`${channelType}_id`]: externalId,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      return null;
    }

    return newContact;
  } catch (error) {
    console.error('Error in findOrCreateContact:', error);
    return null;
  }
}

async function findOrCreateConversation(supabase: any, contactId: string, channelAccountId: string, orgId: string) {
  try {
    // Buscar conversa existente
    const { data: existingConversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('contact_id', contactId)
      .eq('channel_account_id', channelAccountId)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingConversations && existingConversations.length > 0) {
      return existingConversations[0];
    }

    // Criar nova conversa
    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert({
        contact_id: contactId,
        channel_account_id: channelAccountId,
        org_id: orgId,
        status: 'open',
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return newConversation;
  } catch (error) {
    console.error('Error in findOrCreateConversation:', error);
    return null;
  }
}
