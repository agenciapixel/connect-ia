import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Parse request body
    const { channel_id } = await req.json()

    if (!channel_id) {
      throw new Error('channel_id é obrigatório')
    }

    console.log('Desconectando canal:', channel_id)

    // Update channel status to inactive
    const { data, error } = await supabaseClient
      .from('channel_accounts')
      .update({ status: 'inactive' })
      .eq('id', channel_id)
      .select()

    if (error) {
      console.error('Erro ao desconectar canal:', error)
      throw error
    }

    console.log('Canal desconectado com sucesso:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Canal desconectado com sucesso',
        channel: data?.[0] || null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro na função disconnect-channel:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
