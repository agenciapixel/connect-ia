// Script para verificar UUIDs válidos
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkValidUUIDs() {
  try {
    console.log('Verificando UUIDs válidos...');
    
    // Verificar se há algum UUID válido na tabela profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    console.log('Profiles encontrados:', { profiles, profilesError });
    
    if (profiles && profiles.length > 0) {
      const validUUID = profiles[0].id;
      console.log('UUID válido encontrado:', validUUID);
      
      // Tentar inserir usando este UUID
      const { data: channelData, error: channelError } = await supabase
        .from('channel_accounts')
        .insert([{
          org_id: validUUID,
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
      
      console.log('Inserção com UUID válido:', { channelData, channelError });
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

checkValidUUIDs();
