// Script para criar organização usando SQL direto
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createOrganizationWithSQL() {
  try {
    console.log('Criando organização usando SQL...');
    
    const fixedOrgId = '00000000-0000-0000-0000-000000000000';
    
    // Usar SQL direto para criar organização
    const { data, error } = await supabase.rpc('create_test_organization', {
      org_id: fixedOrgId,
      org_name: 'Organização de Teste'
    });
    
    console.log('Criação via RPC:', { data, error });
    
    // Se não funcionar, vamos tentar uma abordagem mais simples
    if (error) {
      console.log('RPC não funcionou, tentando abordagem alternativa...');
      
      // Vamos tentar inserir diretamente usando SQL
      const { data: sqlData, error: sqlError } = await supabase
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
      
      console.log('Inserção direta:', { sqlData, sqlError });
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

createOrganizationWithSQL();
