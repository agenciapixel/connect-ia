// Script para testar Edge Function com UUID fixo
const testEdgeFunctionFixed = async () => {
  const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
  const functionUrl = `${supabaseUrl}/functions/v1/channel-connect`;
  
  const testData = {
    channel_type: 'instagram',
    name: 'Teste Instagram Fixo',
    credentials: {
      access_token: 'test_token_123',
      page_id: 'test_page_123',
      verify_token: 'test_verify_123'
    },
    org_id: '00000000-0000-0000-0000-000000000000' // UUID fixo
  };

  try {
    console.log('Testando Edge Function com UUID fixo...');
    console.log('URL:', functionUrl);
    console.log('Dados:', testData);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ`
      },
      body: JSON.stringify(testData)
    });

    console.log('Status:', response.status);
    const result = await response.text();
    console.log('Resposta:', result);

    if (response.ok) {
      console.log('✅ Edge Function funcionando!');
      
      // Agora testar se conseguimos buscar os dados
      console.log('Testando busca de dados...');
      
      const searchResponse = await fetch(`${supabaseUrl}/rest/v1/channel_accounts?org_id=eq.00000000-0000-0000-0000-000000000000`, {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ'
        }
      });
      
      const searchResult = await searchResponse.text();
      console.log('Resultado da busca:', searchResult);
      
    } else {
      console.log('❌ Edge Function com erro:', response.status);
    }

  } catch (error) {
    console.error('❌ Erro ao testar:', error);
  }
};

// Executar teste
testEdgeFunctionFixed();
