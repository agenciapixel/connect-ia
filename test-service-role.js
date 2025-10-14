// Script para testar com service role key
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
// Usando service role key que tem mais permissões
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDIwNjI5NiwiZXhwIjoyMDc1NzgyMjk2fQ.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testWithServiceRole() {
  try {
    console.log('Testando com service role key...');
    
    const testUUID = '123e4567-e89b-12d3-a456-426614174000';
    
    const testData = {
      org_id: testUUID,
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
    
    console.log('Inserção com service role:', { data, error });
    
    // Buscar os dados inseridos
    const { data: insertedData, error: fetchError } = await supabase
      .from('channel_accounts')
      .select('*')
      .eq('org_id', testUUID);
    
    console.log('Dados encontrados:', { insertedData, fetchError });
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testWithServiceRole();
