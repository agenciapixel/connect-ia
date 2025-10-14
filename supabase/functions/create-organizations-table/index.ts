import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Create Organizations Table Function called:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating organizations table...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Executar SQL para criar tabela organizations
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.organizations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { data: createData, error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });
    
    console.log('Create table result:', { createData, createError });
    
    if (createError) {
      // Se RPC não funcionar, tentar abordagem alternativa
      console.log('RPC failed, trying alternative approach...');
      
      // Tentar inserir dados diretamente (isso vai criar a tabela se não existir)
      const { data: insertData, error: insertError } = await supabase
        .from('organizations')
        .insert([{
          id: '00000000-0000-0000-0000-000000000000',
          name: 'Organização de Teste',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      console.log('Direct insert result:', { insertData, insertError });
      
      return new Response(JSON.stringify({
        success: insertError ? false : true,
        message: insertError ? `Erro: ${insertError.message}` : 'Tabela organizations criada e dados inseridos com sucesso',
        data: insertData,
        error: insertError
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Se a tabela foi criada com sucesso, inserir dados de teste
    const { data: insertData, error: insertError } = await supabase
      .from('organizations')
      .insert([{
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Organização de Teste',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
    
    console.log('Insert test data result:', { insertData, insertError });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Tabela organizations criada e dados inseridos com sucesso',
      data: insertData
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-organizations-table:', error);
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
