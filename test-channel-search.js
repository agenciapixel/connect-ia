// Script para testar busca de canais
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChannelSearch() {
  try {
    console.log('Testando busca de canais...');
    
    const fixedOrgId = '00000000-0000-0000-0000-000000000000';
    
    // Buscar canais para o org_id fixo
    const { data: channels, error: channelsError } = await supabase
      .from('channel_accounts')
      .select('*')
      .eq('org_id', fixedOrgId)
      .eq('status', 'active');
    
    console.log('Canais encontrados:', { channels, channelsError });
    
    if (channels && channels.length > 0) {
      console.log('✅ Canais encontrados com sucesso!');
      console.log('Número de canais:', channels.length);
      console.log('Tipos de canal:', channels.map(c => c.channel_type));
    } else {
      console.log('❌ Nenhum canal encontrado');
    }
    
  } catch (error) {
    console.error('Erro ao buscar canais:', error);
  }
}

testChannelSearch();
