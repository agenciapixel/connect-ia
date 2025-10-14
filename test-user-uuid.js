// Script para testar com UUID do usuário atual
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithUserUUID() {
  try {
    console.log('Testando com UUID do usuário...');
    
    // Primeiro, vamos fazer login para obter um UUID válido
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (authError) {
      console.log('Erro de autenticação:', authError);
      console.log('Tentando com UUID genérico...');
      
      // Usar um UUID genérico que sabemos que existe
      const genericUUID = '11111111-1111-1111-1111-111111111111';
      
      const { data: channelData, error: channelError } = await supabase
        .from('channel_accounts')
        .insert([{
          org_id: genericUUID,
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
      
      console.log('Inserção com UUID genérico:', { channelData, channelError });
    } else {
      console.log('Usuário logado:', user.id);
      
      // Tentar inserir usando o UUID do usuário
      const { data: channelData, error: channelError } = await supabase
        .from('channel_accounts')
        .insert([{
          org_id: user.id,
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
      
      console.log('Inserção com UUID do usuário:', { channelData, channelError });
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testWithUserUUID();
