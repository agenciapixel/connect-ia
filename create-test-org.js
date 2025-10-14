// Script para criar organização de teste
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestOrganization() {
  try {
    console.log('Tentando criar organização de teste...');
    
    const testOrgId = '123e4567-e89b-12d3-a456-426614174000';
    
    // Tentar inserir organização
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        id: testOrgId,
        name: 'Organização de Teste',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
    
    console.log('Criação de organização:', { orgData, orgError });
    
    // Se não conseguir criar organização, vamos tentar uma abordagem diferente
    if (orgError) {
      console.log('Não foi possível criar organização, tentando abordagem alternativa...');
      
      // Vamos tentar inserir diretamente na tabela channel_accounts sem org_id
      const { data: channelData, error: channelError } = await supabase
        .from('channel_accounts')
        .insert([{
          channel_type: 'instagram',
          name: 'Teste Instagram Sem Org',
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
      
      console.log('Inserção sem org_id:', { channelData, channelError });
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

createTestOrganization();
