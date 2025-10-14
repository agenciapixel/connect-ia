// Script para testar autenticação e inserir dados de teste
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAndInsertData() {
  try {
    console.log('Testando inserção de dados de teste...');
    
    // Inserir dados de teste diretamente
    const testData = {
      org_id: 'test-org-123',
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
    };
    
    const { data, error } = await supabase
      .from('channel_accounts')
      .insert([testData])
      .select();
    
    console.log('Inserção de teste:', { data, error });
    
    // Agora buscar os dados inseridos
    const { data: insertedData, error: fetchError } = await supabase
      .from('channel_accounts')
      .select('*')
      .eq('org_id', 'test-org-123');
    
    console.log('Dados inseridos encontrados:', { insertedData, fetchError });
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testAndInsertData();
