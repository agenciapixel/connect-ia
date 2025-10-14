import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Create Organization Function called:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating test organization...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fixedOrgId = '00000000-0000-0000-0000-000000000000';
    
    // Tentar criar organização usando SQL direto
    const { data, error } = await supabase.rpc('create_test_organization', {
      org_id: fixedOrgId,
      org_name: 'Organização de Teste'
    });
    
    console.log('RPC result:', { data, error });
    
    if (error) {
      // Se RPC não funcionar, tentar inserção direta
      console.log('RPC failed, trying direct insert...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('organizations')
        .insert([{
          id: fixedOrgId,
          name: 'Organização de Teste',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      console.log('Direct insert result:', { insertData, insertError });
      
      return new Response(JSON.stringify({
        success: insertError ? false : true,
        message: insertError ? `Erro: ${insertError.message}` : 'Organização criada com sucesso',
        data: insertData,
        error: insertError
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Organização criada com sucesso via RPC',
      data: data
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-organization:', error);
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
