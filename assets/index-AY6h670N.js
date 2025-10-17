// Connect IA - Sistema de CRM com IA para WhatsApp Business
console.log('Connect IA carregado!');

// Aplicação simples sem dependências externas
function initConnectIA() {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Elemento root não encontrado');
    return;
  }

  try {
    // Verificar se React está disponível
    if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
      // Usar React se disponível
      initReactApp(root);
    } else {
      // Fallback sem React
      initSimpleApp(root);
    }
  } catch (error) {
    console.error('Erro ao inicializar aplicação:', error);
    initErrorApp(root, error);
  }
}

// Inicializar com React (se disponível)
function initReactApp(root) {
  console.log('Inicializando com React...');
  
  const { createElement: h } = React;
  const { createRoot } = ReactDOM;
  
  const App = () => h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '2rem'
    }
  }, [
    h('h1', { 
      key: 'title',
      style: { fontSize: '3rem', marginBottom: '1rem' }
    }, 'Connect IA'),
    h('p', { 
      key: 'subtitle',
      style: { fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }
    }, 'Sistema de CRM com IA para WhatsApp Business'),
    
    h('div', {
      key: 'status',
      style: {
        background: 'rgba(255,255,255,0.1)',
        padding: '2rem',
        borderRadius: '10px',
        marginBottom: '2rem',
        maxWidth: '600px'
      }
    }, [
      h('h2', { 
        key: 'status-title',
        style: { marginBottom: '1rem', color: '#4ade80' }
      }, '✅ Sistema Funcionando'),
      h('p', { key: 'status-desc' }, 'JavaScript carregado com sucesso'),
      h('p', { key: 'status-deploy' }, '🚀 Deploy Ativo - Hostinger + GitHub Actions'),
      h('p', { key: 'status-next' }, '🎯 Próximos Passos - Integrar com WhatsApp API')
    ]),

    h('div', {
      key: 'features',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
        maxWidth: '800px'
      }
    }, [
      h('div', {
        key: 'feature-1',
        style: {
          background: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }
      }, [
        h('h3', { key: 'f1-title' }, '🤖 IA Avançada'),
        h('p', { key: 'f1-desc' }, 'Respostas automáticas inteligentes')
      ]),
      h('div', {
        key: 'feature-2',
        style: {
          background: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }
      }, [
        h('h3', { key: 'f2-title' }, '📱 Multi-Canal'),
        h('p', { key: 'f2-desc' }, 'WhatsApp + Instagram integrados')
      ]),
      h('div', {
        key: 'feature-3',
        style: {
          background: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }
      }, [
        h('h3', { key: 'f3-title' }, '📊 CRM Completo'),
        h('p', { key: 'f3-desc' }, 'Gestão de leads e conversas')
      ])
    ]),

    h('div', {
      key: 'footer',
      style: {
        borderTop: '1px solid rgba(255,255,255,0.2)',
        paddingTop: '2rem',
        marginTop: '2rem',
        opacity: 0.8
      }
    }, [
      h('p', { key: 'footer-text' }, 'Desenvolvido por Agência Pixel'),
      h('p', { key: 'footer-contact' }, 'contato@agenciapixel.digital')
    ])
  ]);

  const rootElement = createRoot(root);
  rootElement.render(h(App));
}

// Inicializar sem React (fallback)
function initSimpleApp(root) {
  console.log('Inicializando versão simples...');
  
  root.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 2rem;
    ">
      <h1 style="font-size: 3rem; margin-bottom: 1rem;">Connect IA</h1>
      <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">
        Sistema de CRM com IA para WhatsApp Business
      </p>
      
      <div style="
        background: rgba(255,255,255,0.1);
        padding: 2rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        max-width: 600px;
      ">
        <h2 style="margin-bottom: 1rem; color: #4ade80;">✅ Sistema Funcionando</h2>
        <p>JavaScript carregado com sucesso</p>
        <p>🚀 Deploy Ativo - Hostinger + GitHub Actions</p>
        <p>🎯 Próximos Passos - Integrar com WhatsApp API</p>
      </div>

      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
        max-width: 800px;
      ">
        <div style="
          background: rgba(255,255,255,0.1);
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        ">
          <h3>🤖 IA Avançada</h3>
          <p>Respostas automáticas inteligentes</p>
        </div>
        <div style="
          background: rgba(255,255,255,0.1);
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        ">
          <h3>📱 Multi-Canal</h3>
          <p>WhatsApp + Instagram integrados</p>
        </div>
        <div style="
          background: rgba(255,255,255,0.1);
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        ">
          <h3>📊 CRM Completo</h3>
          <p>Gestão de leads e conversas</p>
        </div>
      </div>

      <div style="
        border-top: 1px solid rgba(255,255,255,0.2);
        padding-top: 2rem;
        margin-top: 2rem;
        opacity: 0.8;
      ">
        <p>Desenvolvido por Agência Pixel</p>
        <p>contato@agenciapixel.digital</p>
      </div>
    </div>
  `;
}

// Inicializar página de erro
function initErrorApp(root, error) {
  console.error('Erro ao inicializar:', error);
  
  root.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: white;
      text-align: center;
      padding: 2rem;
    ">
      <h1>❌ Erro no Sistema</h1>
      <p>Erro: ${error.message}</p>
      <p>Contate o suporte: contato@agenciapixel.digital</p>
    </div>
  `;
}

// CSS para animações
function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in {
      animation: fadeIn 0.5s ease-out;
    }
  `;
  document.head.appendChild(style);
}

// Inicializar quando DOM estiver pronto
function initializeApp() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      addStyles();
      initConnectIA();
    });
  } else {
    addStyles();
    initConnectIA();
  }
}

// Service Worker (desabilitado por enquanto)
function registerServiceWorker() {
  // Service Worker desabilitado - não necessário para funcionamento básico
  console.log('Service Worker desabilitado');
}

// Analytics (se configurado)
function initAnalytics() {
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID');
  }
}

// Inicializar tudo
initializeApp();
registerServiceWorker();
initAnalytics();

console.log('Connect IA inicializado com sucesso!');