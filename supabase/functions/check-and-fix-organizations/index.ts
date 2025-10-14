import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Check and Fix Organizations Function called:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking and fixing organizations...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fixedOrgId = '00000000-0000-0000-0000-000000000000';
    
    // Verificar se a organização existe
    const { data: existingOrgs, error: checkError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', fixedOrgId);
    
    console.log('Check organizations result:', { existingOrgs, checkError });
    
    if (existingOrgs && existingOrgs.length > 0) {
      console.log('✅ Organização já existe:', existingOrgs[0]);
      
      // Testar inserção de canal
      const { data: channelData, error: channelError } = await supabase
        .from('channel_accounts')
        .insert([{
          org_id: fixedOrgId,
          channel_type: 'instagram',
          name: 'Teste Instagram',
          credentials_json: {
            access_token: 'test_token_123',
            page_id: 'test_page_123',
            verify_token: 'test_verify_123'
          },
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      console.log('Channel insert result:', { channelData, channelError });
      
      return new Response(JSON.stringify({
        success: channelError ? false : true,
        message: channelError ? `Erro ao inserir canal: ${channelError.message}` : 'Canal inserido com sucesso',
        organization: existingOrgs[0],
        channel: channelData,
        error: channelError
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Inserir organização se não existir
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          id: fixedOrgId,
          name: 'Organização de Teste',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      console.log('Insert organization result:', { orgData, orgError });
      
      return new Response(JSON.stringify({
        success: orgError ? false : true,
        message: orgError ? `Erro ao inserir organização: ${orgError.message}` : 'Organização inserida com sucesso',
        data: orgData,
        error: orgError
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in check-and-fix-organizations:', error);
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
