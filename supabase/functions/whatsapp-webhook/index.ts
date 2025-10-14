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
                  processMessage(message, change.value);
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

async function processMessage(message: any, value: any) {
  try {
    const messageId = message.id;
    const from = message.from;
    const timestamp = message.timestamp;
    const type = message.type;
    
    console.log(`Processing message ${messageId} from ${from}, type: ${type}`);
    
    // Aqui você pode adicionar lógica para:
    // 1. Salvar a mensagem no banco de dados
    // 2. Processar com IA se necessário
    // 3. Enviar resposta automática
    // 4. Integrar com seu sistema de CRM
    
    // Exemplo de processamento básico
    if (type === 'text') {
      const textBody = message.text?.body;
      console.log(`Text message received: ${textBody}`);
      
      // Aqui você pode integrar com as funções de IA existentes
      // ou processar a mensagem conforme necessário
    }
    
  } catch (error) {
    console.error('Error processing message:', error);
  }
}
