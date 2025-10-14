import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Simplified WhatsApp QR Connect
 *
 * This version uses manual credentials input as a fallback
 * since Baileys doesn't run well in Deno/Edge Functions.
 *
 * For true QR Code functionality, you would need:
 * 1. A separate Node.js backend running Baileys
 * 2. WebSocket connection between frontend and backend
 * 3. Or use a third-party service like Waha or WPPConnect
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionId, orgId, name, credentials } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'save_manual':
        return await saveManualConnection(credentials, orgId, name, supabase);

      case 'disconnect':
        return await disconnectSession(sessionId, supabase);

      default:
        return new Response(JSON.stringify({
          error: 'Ação inválida. Use: save_manual, disconnect'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in whatsapp-qr-connect:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function saveManualConnection(credentials: any, orgId: string, name: string, supabase: any) {
  try {
    // Validar credenciais mínimas
    if (!credentials.phone_number && !credentials.instance_id) {
      return new Response(JSON.stringify({
        error: 'Credenciais incompletas. Forneça pelo menos phone_number ou instance_id'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Salvar no banco
    const { data, error } = await supabase
      .from('channel_accounts')
      .insert({
        org_id: orgId,
        channel_type: 'whatsapp',
        name: name || `WhatsApp - ${credentials.phone_number || credentials.instance_id}`,
        credentials: {
          ...credentials,
          connection_type: 'manual',
          connected_at: new Date().toISOString()
        },
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({
        error: `Erro ao salvar conexão: ${error.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Conexão salva com sucesso',
      channel: data
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error saving connection:', error);
    return new Response(JSON.stringify({
      error: 'Erro ao salvar conexão',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function disconnectSession(sessionId: string, supabase: any) {
  try {
    const { error } = await supabase
      .from('channel_accounts')
      .update({ status: 'inactive' })
      .eq('credentials->>session_id', sessionId);

    if (error) {
      console.error('Error disconnecting:', error);
      return new Response(JSON.stringify({
        error: `Erro ao desconectar: ${error.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Sessão desconectada com sucesso'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error disconnecting:', error);
    return new Response(JSON.stringify({
      error: 'Erro ao desconectar',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
