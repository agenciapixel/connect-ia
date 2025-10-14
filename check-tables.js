// Script para verificar estrutura das tabelas
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('Verificando tabelas...');
    
    // Verificar tabela members
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*');
    
    console.log('Tabela members:', { members, membersError });
    
    // Verificar tabela organizations
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*');
    
    console.log('Tabela organizations:', { orgs, orgsError });
    
    // Verificar tabela profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    console.log('Tabela profiles:', { profiles, profilesError });
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

checkTables();
