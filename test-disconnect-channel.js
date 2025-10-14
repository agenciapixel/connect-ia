// Script para testar Edge Function disconnect-channel
const testDisconnectChannel = async () => {
  const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
  const functionUrl = `${supabaseUrl}/functions/v1/disconnect-channel`;

  try {
    console.log('Testando Edge Function disconnect-channel...');
    console.log('URL:', functionUrl);

    // Primeiro, buscar um canal para desconectar
    const getChannelsResponse = await fetch(`${supabaseUrl}/functions/v1/get-channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ`
      },
      body: JSON.stringify({
        org_id: '00000000-0000-0000-0000-000000000000'
      })
    });

    const channelsData = await getChannelsResponse.json();
    console.log('Canais disponíveis:', channelsData.channels.length);

    if (channelsData.channels.length === 0) {
      console.log('❌ Nenhum canal para desconectar');
      return;
    }

    // Usar o primeiro canal para teste
    const channelToDisconnect = channelsData.channels[0];
    console.log('Desconectando canal:', channelToDisconnect.name, 'ID:', channelToDisconnect.id);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ`
      },
      body: JSON.stringify({
        channel_id: channelToDisconnect.id
      })
    });

    console.log('Status:', response.status);
    const result = await response.text();
    console.log('Resposta:', result);

    if (response.ok) {
      const data = JSON.parse(result);
      console.log('✅ Canal desconectado:', data.message);
      
      // Verificar se o canal foi realmente desconectado
      const verifyResponse = await fetch(`${supabaseUrl}/functions/v1/get-channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ`
        },
        body: JSON.stringify({
          org_id: '00000000-0000-0000-0000-000000000000'
        })
      });

      const verifyData = await verifyResponse.json();
      console.log('Canais restantes:', verifyData.channels.length);
      
    } else {
      console.log('❌ Erro na Edge Function:', response.status);
    }

  } catch (error) {
    console.error('❌ Erro ao testar:', error);
  }
};

// Executar teste
testDisconnectChannel();
