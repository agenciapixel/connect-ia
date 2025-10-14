import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    // Always return success for now to test
    const response = {
      success: true,
      message: 'Canal conectado com sucesso (modo teste)',
      channel: {
        id: 'test_' + Date.now(),
        channel_type: 'instagram',
        name: 'Teste',
        status: 'active'
      },
      webhook_url: 'https://test.webhook.url',
      verify_token: 'test_token'
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
