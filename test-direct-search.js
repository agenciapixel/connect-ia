// Script para testar busca direta via API REST
const testDirectSearch = async () => {
  const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
  
  try {
    console.log('Testando busca direta via API REST...');
    
    // Testar busca direta
    const response = await fetch(`${supabaseUrl}/rest/v1/channel_accounts?org_id=eq.00000000-0000-0000-0000-000000000000`, {
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status da busca:', response.status);
    const result = await response.text();
    console.log('Resultado da busca:', result);
    
    if (response.ok) {
      const data = JSON.parse(result);
      console.log('✅ Dados encontrados:', data.length, 'canais');
      console.log('Tipos de canal:', data.map(c => c.channel_type));
    } else {
      console.log('❌ Erro na busca:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar:', error);
  }
};

// Executar teste
testDirectSearch();
