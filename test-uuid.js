// Script para testar com UUID válido
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithValidUUID() {
  try {
    console.log('Testando com UUID válido...');
    
    // Gerar um UUID válido para teste
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
    
    console.log('Inserção com UUID válido:', { data, error });
    
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

testWithValidUUID();
