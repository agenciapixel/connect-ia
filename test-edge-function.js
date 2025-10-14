// Teste da Edge Function - Cole no Console do Navegador
// Acesse: http://localhost:8080/integrations e cole este código

console.log('=== TESTE DA EDGE FUNCTION ===');

// Função para testar a Edge Function
async function testEdgeFunction() {
  try {
    // Simular dados de teste
    const testData = {
      channel_type: 'whatsapp',
      name: 'Teste WhatsApp',
      credentials: {
        access_token: 'test_token',
        phone_number_id: 'test_phone_id',
        verify_token: 'test_verify_token'
      },
      org_id: 'test_org_id'
    };

    console.log('Enviando dados de teste:', testData);

    // Fazer requisição para a Edge Function
    const response = await fetch('/functions/v1/channel-connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (await getSupabaseToken())
      },
      body: JSON.stringify(testData)
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', response.headers);

    const result = await response.text();
    console.log('Resposta da Edge Function:', result);

    if (response.ok) {
      console.log('✅ Edge Function funcionando!');
    } else {
      console.log('❌ Edge Function com erro:', result);
    }

  } catch (error) {
    console.error('❌ Erro ao testar Edge Function:', error);
  }
}

// Função para obter token do Supabase
async function getSupabaseToken() {
  try {
    // Tentar obter token do localStorage ou sessionStorage
    const token = localStorage.getItem('sb-bjsuujkbrhjhuyzydxbr-auth-token') || 
                  sessionStorage.getItem('sb-bjsuujkbrhjhuyzydxbr-auth-token');
    
    if (token) {
      const parsed = JSON.parse(token);
      return parsed.access_token;
    }
    
    console.log('Token não encontrado, usando anon key');
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';
  } catch (error) {
    console.error('Erro ao obter token:', error);
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';
  }
}

// Executar teste
testEdgeFunction();
