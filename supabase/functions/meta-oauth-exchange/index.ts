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
    const { code, channel_type, redirect_uri } = await req.json();

    if (!code || !channel_type || !redirect_uri) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Código, tipo de canal e redirect_uri são obrigatórios'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Configurações do Meta App
    const appId = Deno.env.get('META_APP_ID');
    const appSecret = Deno.env.get('META_APP_SECRET');

    console.log('Meta App ID:', appId ? 'Configurado' : 'NÃO CONFIGURADO');
    console.log('Meta App Secret:', appSecret ? 'Configurado' : 'NÃO CONFIGURADO');

    if (!appId || !appSecret) {
      console.error('Variáveis de ambiente não configuradas:', {
        META_APP_ID: !!appId,
        META_APP_SECRET: !!appSecret
      });
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Meta App ID e Secret não configurados nas variáveis de ambiente do Supabase',
        details: {
          META_APP_ID: !!appId,
          META_APP_SECRET: !!appSecret
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Trocar código por token de acesso
    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
      `&code=${code}`, {
      method: 'POST'
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return new Response(JSON.stringify({
        success: false,
        error: 'Não foi possível obter token de acesso do Meta'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar páginas do usuário
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`
    );

    const pagesData = await pagesResponse.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Nenhuma página do Facebook encontrada'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Retornar token e páginas
    return new Response(JSON.stringify({
      success: true,
      access_token: tokenData.access_token,
      pages: pagesData.data
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in meta-oauth-exchange:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
