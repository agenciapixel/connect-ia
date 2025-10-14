// Facebook Login Functions - Estrutura Exata
// Este arquivo demonstra a estrutura exata das funções do Facebook SDK

// Função principal para verificar estado de login
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

// Função callback para processar a resposta
function statusChangeCallback(response) {
  console.log('Facebook status change callback:', response);
  
  if (response.status === 'connected') {
    console.log('Usuário conectado!');
    console.log('Access Token:', response.authResponse.accessToken);
    console.log('User ID:', response.authResponse.userID);
    console.log('Expires In:', response.authResponse.expiresIn);
    console.log('Signed Request:', response.authResponse.signedRequest);
    
    // Processar login bem-sucedido
    handleSuccessfulLogin(response.authResponse);
    
  } else if (response.status === 'not_authorized') {
    console.log('App não autorizado pelo usuário');
    handleNotAuthorized();
    
  } else {
    console.log('Usuário não logado');
    handleNotLoggedIn();
  }
}

// Função para processar login bem-sucedido
function handleSuccessfulLogin(authResponse) {
  const { accessToken, expiresIn, signedRequest, userID } = authResponse;
  
  // Verificar se o token ainda é válido
  const expirationDate = new Date(Date.now() + (expiresIn * 1000));
  const now = new Date();
  
  if (expirationDate > now) {
    console.log(`Token válido até: ${expirationDate.toLocaleString()}`);
    
    // Token válido - continuar com o processo
    fetchUserPages(accessToken);
    
  } else {
    console.log('Token expirado, necessário novo login');
    handleTokenExpired();
  }
}

// Função para buscar páginas do usuário
function fetchUserPages(accessToken) {
  fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`)
    .then(response => response.json())
    .then(data => {
      console.log('Páginas do usuário:', data);
      
      if (data.data && data.data.length > 0) {
        // Usuário tem páginas - mostrar seleção
        showPageSelection(data.data);
      } else {
        // Usuário não tem páginas
        showNoPagesMessage();
      }
    })
    .catch(error => {
      console.error('Erro ao buscar páginas:', error);
      handleApiError(error);
    });
}

// Função para mostrar seleção de páginas
function showPageSelection(pages) {
  console.log('Mostrando seleção de páginas:', pages);
  // Implementar lógica de seleção de páginas
}

// Função para mostrar mensagem de nenhuma página
function showNoPagesMessage() {
  console.log('Usuário não tem páginas do Facebook');
  // Implementar mensagem de erro
}

// Função para processar app não autorizado
function handleNotAuthorized() {
  console.log('App não autorizado - solicitar permissões novamente');
  // Implementar lógica para solicitar permissões
}

// Função para processar usuário não logado
function handleNotLoggedIn() {
  console.log('Usuário não logado - mostrar botão de login');
  // Implementar lógica para mostrar login
}

// Função para processar token expirado
function handleTokenExpired() {
  console.log('Token expirado - solicitar novo login');
  // Implementar lógica para renovar token
}

// Função para processar erro da API
function handleApiError(error) {
  console.error('Erro na API do Facebook:', error);
  // Implementar tratamento de erro
}

// Exportar funções para uso global
window.checkLoginState = checkLoginState;
window.statusChangeCallback = statusChangeCallback;
