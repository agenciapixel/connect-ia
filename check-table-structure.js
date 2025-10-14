// Script para verificar estrutura da tabela channel_accounts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('Verificando estrutura das tabelas...');
    
    // Verificar se existe tabela 'orgs'
    const { data: orgs, error: orgsError } = await supabase
      .from('orgs')
      .select('*')
      .limit(1);
    
    console.log('Tabela orgs:', { orgs, orgsError });
    
    // Verificar se existe tabela 'organizations'
    const { data: organizations, error: organizationsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);
    
    console.log('Tabela organizations:', { organizations, organizationsError });
    
    // Verificar estrutura da tabela channel_accounts
    const { data: channels, error: channelsError } = await supabase
      .from('channel_accounts')
      .select('*')
      .limit(1);
    
    console.log('Tabela channel_accounts:', { channels, channelsError });
    
  } catch (error) {
    console.error('Erro ao verificar:', error);
  }
}

checkTableStructure();
