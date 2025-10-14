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

    console.log('Channel connect request:', { channel_type, name, org_id });

    // Validate required fields
    if (!channel_type || !name || !credentials || !org_id) {
      console.error('Missing required fields:', { channel_type, name, credentials, org_id });
      return new Response(JSON.stringify({
        error: 'Campos obrigatórios: channel_type, name, credentials, org_id'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({
        error: 'Configuração do Supabase não encontrada'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate basic credentials structure
    const validation = validateCredentials(channel_type, credentials);
    if (!validation.valid) {
      console.error('Credential validation failed:', validation.error);
      return new Response(JSON.stringify({
        error: validation.error
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Credentials validated successfully');

    // Insert channel into database (skip external API validation for now)
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

    console.log('Channel saved successfully:', data);

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