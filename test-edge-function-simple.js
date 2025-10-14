// Teste da Edge Function channel-connect
const testEdgeFunction = async () => {
  const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
  const functionUrl = `${supabaseUrl}/functions/v1/channel-connect`;
  
  const testData = {
    channel_type: 'instagram',
    name: 'Teste Instagram',
    credentials: {
      access_token: 'test_token_123',
      page_id: 'test_page_123',
      verify_token: 'test_verify_123'
    },
    org_id: 'test_org_123'
  };

  try {
    console.log('Testando Edge Function...');
    console.log('URL:', functionUrl);
    console.log('Dados:', testData);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
      },
      body: JSON.stringify(testData)
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.text();
    console.log('Resposta:', result);

    if (response.ok) {
      console.log('✅ Edge Function funcionando!');
    } else {
      console.log('❌ Edge Function com erro:', response.status);
    }

  } catch (error) {
    console.error('❌ Erro ao testar:', error);
  }
};

// Executar teste
testEdgeFunction();
