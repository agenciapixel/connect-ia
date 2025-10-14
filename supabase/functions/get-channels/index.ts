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
    const { org_id } = await req.json()

    if (!org_id) {
      throw new Error('org_id é obrigatório')
    }

    console.log('Buscando canais para orgId:', org_id)

    // Get channels for the organization
    const { data: channels, error } = await supabaseClient
      .from('channel_accounts')
      .select('*')
      .eq('org_id', org_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar canais:', error)
      throw error
    }

    console.log('Canais encontrados:', channels)

    return new Response(
      JSON.stringify({ 
        success: true, 
        channels: channels || [],
        count: channels?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro na função get-channels:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor',
        channels: [],
        count: 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
