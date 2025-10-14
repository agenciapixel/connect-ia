// Teste de Conexão Facebook - Cole no Console do Navegador
// Acesse: http://localhost:5173/integrations e cole este código no console

console.log('=== TESTE DE CONEXÃO FACEBOOK ===');

// 1. Verificar se Facebook SDK está carregado
if (window.FB) {
  console.log('✅ Facebook SDK carregado');
  
  // 2. Verificar status de login
  FB.getLoginStatus(function(response) {
    console.log('Status de login:', response);
    
    if (response.status === 'connected') {
      console.log('✅ Usuário conectado');
      console.log('Access Token:', response.authResponse.accessToken);
      console.log('User ID:', response.authResponse.userID);
      
      // 3. Testar API de páginas
      FB.api('/me/accounts', function(pagesResponse) {
        console.log('Páginas do usuário:', pagesResponse);
        
        if (pagesResponse.data && pagesResponse.data.length > 0) {
          console.log('✅ Usuário tem páginas do Facebook');
          
          // 4. Testar cada página para WhatsApp/Instagram
          pagesResponse.data.forEach((page, index) => {
            console.log(`\n--- Página ${index + 1}: ${page.name} ---`);
            console.log('Page ID:', page.id);
            console.log('Page Access Token:', page.access_token);
            
            // Testar WhatsApp
            FB.api(`/${page.id}?fields=whatsapp_business_account`, function(whatsappResponse) {
              if (whatsappResponse.whatsapp_business_account) {
                console.log('✅ WhatsApp Business conectado');
                console.log('WhatsApp Business Account ID:', whatsappResponse.whatsapp_business_account.id);
              } else {
                console.log('❌ WhatsApp Business NÃO conectado');
              }
            });
            
            // Testar Instagram
            FB.api(`/${page.id}?fields=instagram_business_account`, function(instagramResponse) {
              if (instagramResponse.instagram_business_account) {
                console.log('✅ Instagram Business conectado');
                console.log('Instagram Business Account ID:', instagramResponse.instagram_business_account.id);
              } else {
                console.log('❌ Instagram Business NÃO conectado');
              }
            });
          });
          
        } else {
          console.log('❌ Usuário não tem páginas do Facebook');
          console.log('Solução: Crie uma página no Facebook primeiro');
        }
      });
      
    } else if (response.status === 'not_authorized') {
      console.log('❌ App não autorizado pelo usuário');
      console.log('Solução: Autorize o app novamente');
    } else {
      console.log('❌ Usuário não logado');
      console.log('Solução: Faça login com Facebook');
    }
  });
  
} else {
  console.log('❌ Facebook SDK não carregado');
  console.log('Solução: Verifique se o App ID está correto');
}
