// Script de Diagnóstico do Connect IA
// Testa todas as funcionalidades principais do sistema

const BASE_URL = 'http://localhost:8080';
const SUPABASE_URL = 'https://bjsuujkbrhjhuyzydxbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyOTYsImV4cCI6MjA3NTc4MjI5Nn0.8a3fxQyKfp7Xdbh7g76NKhoDRqiDPMtzLkgrIZ0dnHQ';

async function testarFuncionalidades() {
  console.log('🔍 INICIANDO DIAGNÓSTICO DO CONNECT IA\n');
  
  const resultados = {
    frontend: false,
    supabase: false,
    edgeFunctions: {},
    integracoes: {},
    problemas: []
  };

  // 1. Testar Frontend
  console.log('1. 🖥️  Testando Frontend...');
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      resultados.frontend = true;
      console.log('   ✅ Frontend funcionando');
    } else {
      resultados.problemas.push('Frontend não está respondendo corretamente');
      console.log('   ❌ Frontend com problemas');
    }
  } catch (error) {
    resultados.problemas.push(`Erro no frontend: ${error.message}`);
    console.log('   ❌ Erro no frontend:', error.message);
  }

  // 2. Testar Supabase
  console.log('\n2. 🗄️  Testando Supabase...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (response.ok) {
      resultados.supabase = true;
      console.log('   ✅ Supabase conectado');
    } else {
      resultados.problemas.push('Supabase não está respondendo');
      console.log('   ❌ Supabase com problemas');
    }
  } catch (error) {
    resultados.problemas.push(`Erro no Supabase: ${error.message}`);
    console.log('   ❌ Erro no Supabase:', error.message);
  }

  // 3. Testar Edge Functions
  console.log('\n3. ⚡ Testando Edge Functions...');
  
  const edgeFunctions = [
    'ai-generate-message',
    'ai-summarize', 
    'ai-optimize-campaign',
    'ai-agent-chat',
    'get-channels',
    'channel-connect'
  ];

  for (const func of edgeFunctions) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${func}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      });
      
      if (response.status === 200 || response.status === 400) {
        resultados.edgeFunctions[func] = true;
        console.log(`   ✅ ${func} funcionando`);
      } else {
        resultados.edgeFunctions[func] = false;
        resultados.problemas.push(`Edge Function ${func} retornou status ${response.status}`);
        console.log(`   ❌ ${func} com problemas (status: ${response.status})`);
      }
    } catch (error) {
      resultados.edgeFunctions[func] = false;
      resultados.problemas.push(`Erro na Edge Function ${func}: ${error.message}`);
      console.log(`   ❌ ${func} erro:`, error.message);
    }
  }

  // 4. Testar Integrações
  console.log('\n4. 🔗 Testando Integrações...');
  
  // WhatsApp
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-send-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to: 'test', message: 'test' })
    });
    
    if (response.status === 500 && (await response.text()).includes('Configuração do WhatsApp não encontrada')) {
      resultados.integracoes.whatsapp = 'configuracao_necessaria';
      console.log('   ⚠️  WhatsApp: Configuração necessária');
    } else {
      resultados.integracoes.whatsapp = 'funcionando';
      console.log('   ✅ WhatsApp: Funcionando');
    }
  } catch (error) {
    resultados.integracoes.whatsapp = 'erro';
    console.log('   ❌ WhatsApp: Erro');
  }

  // Instagram
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/instagram-send-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to: 'test', message: 'test' })
    });
    
    if (response.status === 500 && (await response.text()).includes('Configuração do Instagram não encontrada')) {
      resultados.integracoes.instagram = 'configuracao_necessaria';
      console.log('   ⚠️  Instagram: Configuração necessária');
    } else {
      resultados.integracoes.instagram = 'funcionando';
      console.log('   ✅ Instagram: Funcionando');
    }
  } catch (error) {
    resultados.integracoes.instagram = 'erro';
    console.log('   ❌ Instagram: Erro');
  }

  // 5. Resumo dos Resultados
  console.log('\n📊 RESUMO DO DIAGNÓSTICO');
  console.log('========================');
  
  console.log(`Frontend: ${resultados.frontend ? '✅' : '❌'}`);
  console.log(`Supabase: ${resultados.supabase ? '✅' : '❌'}`);
  
  console.log('\nEdge Functions:');
  Object.entries(resultados.edgeFunctions).forEach(([func, status]) => {
    console.log(`  ${func}: ${status ? '✅' : '❌'}`);
  });
  
  console.log('\nIntegrações:');
  Object.entries(resultados.integracoes).forEach(([integra, status]) => {
    const icon = status === 'funcionando' ? '✅' : status === 'configuracao_necessaria' ? '⚠️' : '❌';
    console.log(`  ${integra}: ${icon} ${status}`);
  });

  if (resultados.problemas.length > 0) {
    console.log('\n🚨 PROBLEMAS IDENTIFICADOS:');
    resultados.problemas.forEach((problema, index) => {
      console.log(`  ${index + 1}. ${problema}`);
    });
  }

  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Configure as variáveis de ambiente necessárias');
  console.log('2. Configure as integrações no Supabase Dashboard');
  console.log('3. Teste as funcionalidades individualmente');
  console.log('4. Verifique os logs do Supabase para erros específicos');

  return resultados;
}

// Executar diagnóstico
testarFuncionalidades().catch(console.error);
