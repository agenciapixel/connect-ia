import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channel_type, name, credentials, org_id } = await req.json();

    // Validate required fields
    if (!channel_type || !name || !credentials || !org_id) {
      return new Response(JSON.stringify({
        error: 'Campos obrigatórios: channel_type, name, credentials, org_id'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate channel-specific credentials
    const validation = validateCredentials(channel_type, credentials);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        error: validation.error
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test connection with the API
    const testResult = await testChannelConnection(channel_type, credentials);
    if (!testResult.success) {
      return new Response(JSON.stringify({
        error: `Falha ao validar conexão: ${testResult.error}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert channel into database
    const { data, error } = await supabase
      .from('channel_accounts')
      .insert({
        org_id: org_id,
        channel_type: channel_type,
        name: name,
        credentials: credentials,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({
        error: `Erro ao salvar canal: ${error.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate webhook URL
    const webhookUrl = `${supabaseUrl}/functions/v1/${channel_type}-webhook`;

    return new Response(JSON.stringify({
      success: true,
      message: `Canal ${channel_type} conectado com sucesso`,
      channel: data,
      webhook_url: webhookUrl,
      verify_token: credentials.verify_token
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in channel-connect:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function validateCredentials(channelType: string, credentials: any) {
  const requiredFields: { [key: string]: string[] } = {
    whatsapp: ['access_token', 'phone_number_id', 'verify_token'],
    instagram: ['access_token', 'page_id', 'verify_token'],
    telegram: ['bot_token'],
    messenger: ['access_token', 'page_id', 'verify_token']
  };

  const fields = requiredFields[channelType];
  if (!fields) {
    return { valid: false, error: `Tipo de canal não suportado: ${channelType}` };
  }

  for (const field of fields) {
    if (!credentials[field]) {
      return { valid: false, error: `Campo obrigatório: ${field}` };
    }
  }

  return { valid: true };
}

async function testChannelConnection(channelType: string, credentials: any) {
  try {
    switch (channelType) {
      case 'whatsapp':
        return await testWhatsAppConnection(credentials);

      case 'instagram':
        return await testInstagramConnection(credentials);

      case 'telegram':
        return await testTelegramConnection(credentials);

      case 'messenger':
        return await testMessengerConnection(credentials);

      default:
        return { success: false, error: `Canal ${channelType} não suportado para teste` };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao testar conexão'
    };
  }
}

async function testWhatsAppConnection(credentials: any) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.phone_number_id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WhatsApp API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Conexão WhatsApp validada com sucesso',
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao validar WhatsApp'
    };
  }
}

async function testInstagramConnection(credentials: any) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.page_id}?fields=id,name,instagram_business_account`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Instagram API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.instagram_business_account) {
      throw new Error('Esta página não está conectada a uma conta comercial do Instagram');
    }

    return {
      success: true,
      message: 'Conexão Instagram validada com sucesso',
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao validar Instagram'
    };
  }
}

async function testTelegramConnection(credentials: any) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${credentials.bot_token}/getMe`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${errorData.description || response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Conexão Telegram validada com sucesso',
      data: data.result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao validar Telegram'
    };
  }
}

async function testMessengerConnection(credentials: any) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.page_id}?fields=id,name`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Messenger API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Conexão Messenger validada com sucesso',
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao validar Messenger'
    };
  }
}
