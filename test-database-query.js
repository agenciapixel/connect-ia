// Script para testar consulta direta no Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseQuery() {
  try {
    console.log('Testando consulta no banco de dados...');
    
    // Primeiro, vamos ver se há dados na tabela
    const { data: allData, error: allError } = await supabase
      .from('channel_accounts')
      .select('*');
    
    console.log('Todos os dados na tabela channel_accounts:', { allData, allError });
    
    // Agora vamos testar com um org_id específico
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Usuário atual:', user);
    
    if (user) {
      // Buscar org_id do usuário
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('org_id')
        .eq('user_id', user.id)
        .single();
      
      console.log('Membro encontrado:', { members, membersError });
      
      if (members?.org_id) {
        // Buscar canais para este org_id
        const { data: channels, error: channelsError } = await supabase
          .from('channel_accounts')
          .select('*')
          .eq('org_id', members.org_id)
          .eq('status', 'active');
        
        console.log('Canais encontrados:', { channels, channelsError });
      }
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testDatabaseQuery();
