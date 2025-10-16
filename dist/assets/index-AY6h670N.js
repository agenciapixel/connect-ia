// Connect IA - JavaScript compilado
console.log('Connect IA carregado!');

// Simular aplicação React básica
document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');
    if (root) {
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
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 3rem;
                    max-width: 600px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                ">
                    <h1 style="
                        font-size: 3rem;
                        margin: 0 0 1rem 0;
                        background: linear-gradient(45deg, #fff, #f0f0f0);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    ">Connect IA</h1>
                    
                    <p style="
                        font-size: 1.2rem;
                        margin: 0 0 2rem 0;
                        opacity: 0.9;
                        line-height: 1.6;
                    ">Sistema de CRM com IA para WhatsApp Business</p>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 1rem;
                        margin: 2rem 0;
                    ">
                        <div style="
                            background: rgba(255, 255, 255, 0.1);
                            padding: 1.5rem;
                            border-radius: 10px;
                            border: 1px solid rgba(255, 255, 255, 0.2);
                        ">
                            <h3 style="margin: 0 0 0.5rem 0; color: #4CAF50;">✅ Site Funcionando</h3>
                            <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;">JavaScript carregado com sucesso</p>
                        </div>
                        
                        <div style="
                            background: rgba(255, 255, 255, 0.1);
                            padding: 1.5rem;
                            border-radius: 10px;
                            border: 1px solid rgba(255, 255, 255, 0.2);
                        ">
                            <h3 style="margin: 0 0 0.5rem 0; color: #2196F3;">🚀 Deploy Ativo</h3>
                            <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;">Hostinger + GitHub Actions</p>
                        </div>
                        
                        <div style="
                            background: rgba(255, 255, 255, 0.1);
                            padding: 1.5rem;
                            border-radius: 10px;
                            border: 1px solid rgba(255, 255, 255, 0.2);
                        ">
                            <h3 style="margin: 0 0 0.5rem 0; color: #FF9800;">🎯 Próximos Passos</h3>
                            <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;">Integrar com WhatsApp API</p>
                        </div>
                    </div>
                    
                    <div style="
                        margin-top: 2rem;
                        padding-top: 2rem;
                        border-top: 1px solid rgba(255, 255, 255, 0.2);
                    ">
                        <p style="
                            margin: 0;
                            font-size: 0.9rem;
                            opacity: 0.7;
                        ">Desenvolvido por <strong>Agência Pixel</strong></p>
                        <p style="
                            margin: 0.5rem 0 0 0;
                            font-size: 0.8rem;
                            opacity: 0.6;
                        ">contato@agenciapixel.digital</p>
                    </div>
                </div>
            </div>
        `;
    }
});

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

// Log de sucesso
console.log('✅ Connect IA carregado com sucesso!');
console.log('🌐 Site: https://connectia.agenciapixel.digital');
console.log('📧 Suporte: contato@agenciapixel.digital');