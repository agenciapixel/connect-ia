// Connect IA - Sistema de CRM com IA para WhatsApp Business
console.log('Connect IA carregado!');

// Verificar se React está disponível
if (typeof React === 'undefined') {
  console.warn('React não está disponível, carregando versão básica...');
}

// Aplicação React básica
function ConnectIAApp() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // Simular carregamento
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return React.createElement('div', {
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
      React.createElement('div', {
        key: 'spinner',
        style: {
          width: '50px',
          height: '50px',
          border: '5px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          borderTopColor: 'white',
          animation: 'spin 1s ease-in-out infinite',
          marginBottom: '2rem'
        }
      }),
      React.createElement('h1', { key: 'title' }, 'Connect IA'),
      React.createElement('p', { key: 'loading' }, 'Carregando sistema...')
    ]);
  }

  return React.createElement('div', {
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
    React.createElement('h1', { 
      key: 'title',
      style: { fontSize: '3rem', marginBottom: '1rem' }
    }, 'Connect IA'),
    React.createElement('p', { 
      key: 'subtitle',
      style: { fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }
    }, 'Sistema de CRM com IA para WhatsApp Business'),
    
    React.createElement('div', {
      key: 'status',
      style: {
        background: 'rgba(255,255,255,0.1)',
        padding: '2rem',
        borderRadius: '10px',
        marginBottom: '2rem',
        maxWidth: '600px'
      }
    }, [
      React.createElement('h2', { 
        key: 'status-title',
        style: { marginBottom: '1rem', color: '#4ade80' }
      }, '✅ Sistema Funcionando'),
      React.createElement('p', { key: 'status-desc' }, 'JavaScript carregado com sucesso'),
      React.createElement('p', { key: 'status-deploy' }, '🚀 Deploy Ativo - Hostinger + GitHub Actions'),
      React.createElement('p', { key: 'status-next' }, '🎯 Próximos Passos - Integrar com WhatsApp API')
    ]),

    React.createElement('div', {
      key: 'features',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
        maxWidth: '800px'
      }
    }, [
      React.createElement('div', {
        key: 'feature-1',
        style: {
          background: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }
      }, [
        React.createElement('h3', { key: 'f1-title' }, '🤖 IA Avançada'),
        React.createElement('p', { key: 'f1-desc' }, 'Respostas automáticas inteligentes')
      ]),
      React.createElement('div', {
        key: 'feature-2',
        style: {
          background: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }
      }, [
        React.createElement('h3', { key: 'f2-title' }, '📱 Multi-Canal'),
        React.createElement('p', { key: 'f2-desc' }, 'WhatsApp + Instagram integrados')
      ]),
      React.createElement('div', {
        key: 'feature-3',
        style: {
          background: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }
      }, [
        React.createElement('h3', { key: 'f3-title' }, '📊 CRM Completo'),
        React.createElement('p', { key: 'f3-desc' }, 'Gestão de leads e conversas')
      ])
    ]),

    React.createElement('div', {
      key: 'footer',
      style: {
        borderTop: '1px solid rgba(255,255,255,0.2)',
        paddingTop: '2rem',
        marginTop: '2rem',
        opacity: 0.8
      }
    }, [
      React.createElement('p', { key: 'footer-text' }, 'Desenvolvido por Agência Pixel'),
      React.createElement('p', { key: 'footer-contact' }, 'contato@agenciapixel.digital')
    ])
  ]);
}

// Inicializar aplicação
function initApp() {
  const root = document.getElementById('root');
  if (root) {
    try {
      // Tentar usar React se disponível
      if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
        const rootElement = ReactDOM.createRoot(root);
        rootElement.render(React.createElement(ConnectIAApp));
      } else {
        // Fallback sem React
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
    } catch (error) {
      console.error('Erro ao inicializar aplicação:', error);
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
  }
}

// CSS para animação
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Service Worker (se disponível)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Analytics (se configurado)
if (typeof gtag !== 'undefined') {
  gtag('config', 'GA_MEASUREMENT_ID');
}

console.log('Connect IA inicializado com sucesso!');