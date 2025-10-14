import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Get Channels Function called:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Getting channels...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fixedOrgId = '00000000-0000-0000-0000-000000000000';
    
    // Buscar canais usando service role key
    const { data: channels, error: channelsError } = await supabase
      .from('channel_accounts')
      .select('*')
      .eq('org_id', fixedOrgId)
      .eq('status', 'active');
    
    console.log('Channels found:', { channels, channelsError });
    
    if (channelsError) {
      return new Response(JSON.stringify({
        success: false,
        error: `Erro ao buscar canais: ${channelsError.message}`,
        details: channelsError
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Canais encontrados com sucesso',
      channels: channels,
      count: channels.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-channels:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
