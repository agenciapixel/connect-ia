// Script para testar Edge Function get-channels
const testGetChannels = async () => {
  const supabaseUrl = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
  const functionUrl = `${supabaseUrl}/functions/v1/get-channels`;

  try {
    console.log('Testando Edge Function get-channels...');
    console.log('URL:', functionUrl);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ`
      },
      body: JSON.stringify({
        org_id: '00000000-0000-0000-0000-000000000000'
      })
    });

    console.log('Status:', response.status);
    const result = await response.text();
    console.log('Resposta:', result);

    if (response.ok) {
      const data = JSON.parse(result);
      console.log('✅ Canais encontrados:', data.channels.length);
      console.log('Tipos de canal:', data.channels.map(c => c.channel_type));
      console.log('Nomes:', data.channels.map(c => c.name));
    } else {
      console.log('❌ Erro na Edge Function:', response.status);
    }

  } catch (error) {
    console.error('❌ Erro ao testar:', error);
  }
};

// Executar teste
testGetChannels();
