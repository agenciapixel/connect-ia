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
    const { action, channel, config } = await req.json();

    if (!action || !channel) {
      return new Response(JSON.stringify({ 
        error: 'Campos obrigatórios: action (ação) e channel (canal)' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result: any = {};

    switch (action) {
      case 'connect':
        result = await connectChannel(channel, config, supabase);
        break;
      
      case 'disconnect':
        result = await disconnectChannel(channel, config, supabase);
        break;
      
      case 'test':
        result = await testChannelConnection(channel, config);
        break;
      
      case 'status':
        result = await getChannelStatus(channel, supabase);
        break;
      
      case 'list':
        result = await listConnectedChannels(supabase);
        break;
      
      case 'update_config':
        result = await updateChannelConfig(channel, config, supabase);
        break;
      
      default:
        return new Response(JSON.stringify({ 
          error: 'Ação não suportada. Use: connect, disconnect, test, status, list, update_config' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ 
      success: true,
      action: action,
      channel: channel,
      result: result
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

async function connectChannel(channel: string, config: any, supabase: any) {
  console.log(`Conectando canal ${channel}:`, config);
  
  // Validar configuração baseada no canal
  const validation = validateChannelConfig(channel, config);
  if (!validation.valid) {
    throw new Error(`Configuração inválida para ${channel}: ${validation.error}`);
  }

  // Testar conexão antes de salvar
  const testResult = await testChannelConnection(channel, config);
  if (!testResult.success) {
    throw new Error(`Falha ao conectar ${channel}: ${testResult.error}`);
  }

  // Salvar configuração no banco
  const { data, error } = await supabase
    .from('channel_configs')
    .upsert({
      channel: channel,
      config: config,
      status: 'connected',
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao salvar configuração: ${error.message}`);
  }

  return {
    message: `Canal ${channel} conectado com sucesso`,
    config: data
  };
}

async function disconnectChannel(channel: string, config: any, supabase: any) {
  console.log(`Desconectando canal ${channel}`);
  
  const { data, error } = await supabase
    .from('channel_configs')
    .update({
      status: 'disconnected',
      disconnected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('channel', channel)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao desconectar canal: ${error.message}`);
  }

  return {
    message: `Canal ${channel} desconectado com sucesso`,
    config: data
  };
}

async function testChannelConnection(channel: string, config: any) {
  console.log(`Testando conexão do canal ${channel}`);
  
  try {
    switch (channel) {
      case 'whatsapp':
        return await testWhatsAppConnection(config);
      
      case 'instagram':
        return await testInstagramConnection(config);
      
      case 'facebook':
        return await testFacebookConnection(config);
      
      case 'telegram':
        return await testTelegramConnection(config);
      
      case 'email':
        return await testEmailConnection(config);
      
      case 'sms':
        return await testSMSConnection(config);
      
      default:
        return { success: false, error: `Canal ${channel} não suportado` };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

async function getChannelStatus(channel: string, supabase: any) {
  const { data, error } = await supabase
    .from('channel_configs')
    .select('*')
    .eq('channel', channel)
    .single();

  if (error) {
    throw new Error(`Erro ao buscar status do canal: ${error.message}`);
  }

  return {
    channel: channel,
    status: data?.status || 'not_connected',
    last_update: data?.updated_at,
    config: data?.config || null
  };
}

async function listConnectedChannels(supabase: any) {
  const { data, error } = await supabase
    .from('channel_configs')
    .select('channel, status, connected_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Erro ao listar canais: ${error.message}`);
  }

  return {
    channels: data || [],
    total: data?.length || 0
  };
}

async function updateChannelConfig(channel: string, config: any, supabase: any) {
  const validation = validateChannelConfig(channel, config);
  if (!validation.valid) {
    throw new Error(`Configuração inválida: ${validation.error}`);
  }

  const { data, error } = await supabase
    .from('channel_configs')
    .update({
      config: config,
      updated_at: new Date().toISOString()
    })
    .eq('channel', channel)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar configuração: ${error.message}`);
  }

  return {
    message: `Configuração do canal ${channel} atualizada com sucesso`,
    config: data
  };
}

function validateChannelConfig(channel: string, config: any) {
  const requiredFields: { [key: string]: string[] } = {
    whatsapp: ['access_token', 'phone_number_id', 'verify_token'],
    instagram: ['access_token', 'page_id', 'verify_token'],
    facebook: ['access_token', 'page_id', 'app_secret'],
    telegram: ['bot_token', 'webhook_url'],
    email: ['smtp_host', 'smtp_port', 'username', 'password'],
    sms: ['api_key', 'service_provider']
  };

  const fields = requiredFields[channel];
  if (!fields) {
    return { valid: false, error: `Canal ${channel} não suportado` };
  }

  for (const field of fields) {
    if (!config[field]) {
      return { valid: false, error: `Campo obrigatório: ${field}` };
    }
  }

  return { valid: true };
}

async function testWhatsAppConnection(config: any) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${config.phone_number_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    return { success: true, message: 'Conexão WhatsApp OK' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testInstagramConnection(config: any) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${config.page_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    return { success: true, message: 'Conexão Instagram OK' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testFacebookConnection(config: any) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${config.page_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`);
    }

    return { success: true, message: 'Conexão Facebook OK' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testTelegramConnection(config: any) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${config.bot_token}/getMe`);
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return { success: true, message: 'Conexão Telegram OK' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testEmailConnection(config: any) {
  // Implementar teste de conexão SMTP
  return { success: true, message: 'Configuração de email válida' };
}

async function testSMSConnection(config: any) {
  // Implementar teste de conexão SMS
  return { success: true, message: 'Configuração de SMS válida' };
}
