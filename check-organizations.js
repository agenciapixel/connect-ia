// Script para verificar se a organização foi criada
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrganizations() {
  try {
    console.log('Verificando tabela organizations...');
    
    // Verificar se a tabela organizations existe e tem dados
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*');
    
    console.log('Organizações encontradas:', { orgs, orgsError });
    
    if (orgs && orgs.length > 0) {
      console.log('✅ Tabela organizations existe e tem dados!');
      
      // Verificar se o UUID fixo existe
      const fixedOrg = orgs.find(org => org.id === '00000000-0000-0000-0000-000000000000');
      if (fixedOrg) {
        console.log('✅ UUID fixo encontrado:', fixedOrg);
      } else {
        console.log('❌ UUID fixo não encontrado');
      }
    } else {
      console.log('❌ Tabela organizations vazia ou não existe');
    }
    
  } catch (error) {
    console.error('Erro ao verificar:', error);
  }
}

checkOrganizations();
