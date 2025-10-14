import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Create Org in Orgs Table Function called:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating organization in orgs table...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fixedOrgId = '00000000-0000-0000-0000-000000000000';
    
    // Tentar inserir na tabela 'orgs'
    const { data: orgsData, error: orgsError } = await supabase
      .from('orgs')
      .insert([{
        id: fixedOrgId,
        name: 'Organização de Teste',
        slug: 'org-teste',
        plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
    
    console.log('Insert in orgs result:', { orgsData, orgsError });
    
    if (orgsError) {
      return new Response(JSON.stringify({
        success: false,
        error: `Erro ao inserir em orgs: ${orgsError.message}`,
        details: orgsError
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Agora testar inserção de canal
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
      message: channelError ? `Erro ao inserir canal: ${channelError.message}` : 'Organização e canal inseridos com sucesso',
      org: orgsData,
      channel: channelData,
      error: channelError
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-org-in-orgs:', error);
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
