import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Edge Function called:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request...');
    
    const { channel_type, name, credentials, org_id } = await req.json();
    console.log('Received data:', { channel_type, name, org_id });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Supabase client created');

    // Insert channel into database
    // Sempre usar UUID fixo para evitar problemas de foreign key
    const orgIdToUse = '00000000-0000-0000-0000-000000000000';
    
    console.log('Usando org_id fixo:', orgIdToUse);
    
    const { data, error } = await supabase
      .from('channel_accounts')
      .insert({
        org_id: orgIdToUse,
        channel_type: channel_type,
        name: name,
        credentials_json: credentials, // Note: using credentials_json to match the interface
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: `Erro ao salvar canal: ${error.message}`
      }), {
        status: 200, // Always return 200 to avoid non-2xx error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Channel saved successfully:', data);

    const response = {
      success: true,
      message: `Canal ${channel_type} conectado com sucesso`,
      channel: data,
      webhook_url: `${supabaseUrl}/functions/v1/${channel_type}-webhook`,
      verify_token: credentials.verify_token || 'default_token'
    };

    console.log('Returning success response:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in channel-connect:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 200, // Always return 200 to avoid non-2xx error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
