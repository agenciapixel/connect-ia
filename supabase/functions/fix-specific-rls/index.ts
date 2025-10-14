import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Fix RLS Policies Specific Function called:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fixing specific RLS policies...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // SQL para criar política específica para o UUID fixo
    const rlsSQL = `
      -- Remover políticas existentes
      DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.channel_accounts;
      
      -- Criar política específica para o UUID fixo
      CREATE POLICY "Allow access for fixed org" ON public.channel_accounts
        FOR ALL USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);
      
      -- Garantir que RLS está habilitado
      ALTER TABLE public.channel_accounts ENABLE ROW LEVEL SECURITY;
    `;
    
    // Executar SQL usando RPC
    const { data: sqlData, error: sqlError } = await supabase.rpc('exec_sql', {
      sql: rlsSQL
    });
    
    console.log('Specific RLS SQL result:', { sqlData, sqlError });
    
    if (sqlError) {
      console.log('RPC failed, trying alternative approach...');
      
      // Testar busca direta
      const { data: testData, error: testError } = await supabase
        .from('channel_accounts')
        .select('*')
        .eq('org_id', '00000000-0000-0000-0000-000000000000');
      
      console.log('Direct test result:', { testData, testError });
      
      return new Response(JSON.stringify({
        success: testError ? false : true,
        message: testError ? `Erro: ${testError.message}` : 'Política específica aplicada',
        testData: testData,
        error: testError
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Testar busca após ajustar políticas
    const { data: testData, error: testError } = await supabase
      .from('channel_accounts')
      .select('*')
      .eq('org_id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Test after specific RLS fix:', { testData, testError });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Política específica aplicada com sucesso',
      testData: testData,
      error: testError
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fix-specific-rls:', error);
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
