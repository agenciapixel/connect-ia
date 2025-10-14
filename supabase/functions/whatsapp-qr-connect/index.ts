import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Armazenamento temporário de sessões (em produção, use Redis ou similar)
const sessions = new Map<string, any>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionId, orgId, name } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'generate_qr':
        return await generateQRCode(sessionId, orgId, name);

      case 'check_status':
        return await checkConnectionStatus(sessionId);

      case 'disconnect':
        return await disconnectSession(sessionId, supabase);

      default:
        return new Response(JSON.stringify({
          error: 'Ação inválida'
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

async function generateQRCode(sessionId: string, orgId: string, name: string) {
  try {
    // Importar Baileys dinamicamente
    const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } =
      await import('https://esm.sh/@whiskeysockets/baileys@6.6.0');

    const { Boom } = await import('https://esm.sh/@hapi/boom@10.0.1');

    // Criar diretório de autenticação temporário
    const authDir = `/tmp/baileys_auth_${sessionId}`;
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    let qrCode = '';
    let isConnected = false;
    let connectionInfo: any = null;

    // Criar socket do WhatsApp
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    // Listener para QR Code
    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCode = qr;
        console.log('QR Code gerado para sessão:', sessionId);
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('Conexão fechada. Reconectar?', shouldReconnect);

        if (!shouldReconnect) {
          sessions.delete(sessionId);
        }
      } else if (connection === 'open') {
        isConnected = true;
        connectionInfo = {
          user: sock.user,
          sessionId: sessionId
        };
        console.log('WhatsApp conectado:', sock.user);

        // Salvar credenciais
        await saveCreds();

        // Armazenar sessão
        sessions.set(sessionId, {
          sock,
          info: connectionInfo,
          authDir,
          createdAt: new Date().toISOString()
        });
      }
    });

    // Aguardar QR Code ser gerado (timeout de 30 segundos)
    const timeout = 30000;
    const startTime = Date.now();

    while (!qrCode && !isConnected && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!qrCode && !isConnected) {
      throw new Error('Timeout ao gerar QR Code');
    }

    // Se já conectou enquanto gerava QR
    if (isConnected) {
      return new Response(JSON.stringify({
        success: true,
        status: 'connected',
        connectionInfo
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Retornar QR Code
    return new Response(JSON.stringify({
      success: true,
      status: 'waiting_scan',
      qrCode,
      sessionId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating QR:', error);
    return new Response(JSON.stringify({
      error: 'Erro ao gerar QR Code',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function checkConnectionStatus(sessionId: string) {
  try {
    const session = sessions.get(sessionId);

    if (!session) {
      return new Response(JSON.stringify({
        success: true,
        status: 'not_found',
        message: 'Sessão não encontrada'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar se o socket ainda está conectado
    const isConnected = session.sock?.user != null;

    return new Response(JSON.stringify({
      success: true,
      status: isConnected ? 'connected' : 'disconnected',
      connectionInfo: session.info
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error checking status:', error);
    return new Response(JSON.stringify({
      error: 'Erro ao verificar status',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function disconnectSession(sessionId: string, supabase: any) {
  try {
    const session = sessions.get(sessionId);

    if (session?.sock) {
      await session.sock.logout();
      sessions.delete(sessionId);
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
