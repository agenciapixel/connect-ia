#!/bin/bash

echo "🔧 CORRIGINDO INDEX.HTML INCORRETO"
echo "=================================="
echo "Domínio: connectia.agenciapixel.digital"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}🚨 PROBLEMA DETECTADO:${NC}"
echo "O arquivo index.html no servidor está incorreto!"
echo "Está usando: /src/main.tsx (desenvolvimento)"
echo "Deveria usar: /assets/index-BI8eP73w.js (produção)"
echo ""

echo -e "${BLUE}📋 Comparação:${NC}"
echo ""
echo -e "${RED}❌ ERRADO (no servidor):${NC}"
echo "   <script type=\"module\" src=\"/src/main.tsx\"></script>"
echo ""
echo -e "${GREEN}✅ CORRETO (deveria ser):${NC}"
echo "   <script type=\"module\" crossorigin src=\"/assets/index-BI8eP73w.js\"></script>"
echo "   <link rel=\"modulepreload\" crossorigin href=\"/assets/vendor-BNoTEEtH.js\">"
echo "   <link rel=\"modulepreload\" crossorigin href=\"/assets/ui-CDRV4mmj.js\">"
echo "   <link rel=\"modulepreload\" crossorigin href=\"/assets/supabase-wbh-WGy_.js\">"
echo "   <link rel=\"stylesheet\" crossorigin href=\"/assets/index-4UT7fDzW.css\">"
echo ""

echo -e "${BLUE}📁 Criando arquivo correto...${NC}"

# Criar o index.html correto
cat > index-html-correto.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>connect-ia</title>
    <meta name="description" content="Lovable Generated Project" />
    <meta name="author" content="Lovable" />

    <meta property="og:title" content="connect-ia" />
    <meta property="og:description" content="Lovable Generated Project" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@lovable_dev" />
    <meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
    <script type="module" crossorigin src="/assets/index-BI8eP73w.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/vendor-BNoTEEtH.js">
    <link rel="modulepreload" crossorigin href="/assets/ui-CDRV4mmj.js">
    <link rel="modulepreload" crossorigin href="/assets/supabase-wbh-WGy_.js">
    <link rel="stylesheet" crossorigin href="/assets/index-4UT7fDzW.css">
  </head>

  <body>
    <div id="root"></div>
    
    <!-- Facebook SDK -->
    <script>
      window.fbAsyncInit = function() {
        FB.init({
          appId      : '670209849105494',
          cookie     : true,
          xfbml      : true,
          version    : 'v18.0'
        });
          
        FB.AppEvents.logPageView();   
          
      };

      (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "https://connect.facebook.net/en_US/sdk.js";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
    </script>
    
    <!-- Facebook Login Button Config -->
    <div id="fb-root"></div>
  </body>
</html>
EOF

echo -e "${GREEN}✅ Arquivo correto criado: index-html-correto.html${NC}"
echo ""

echo -e "${YELLOW}🚀 SOLUÇÃO:${NC}"
echo ""
echo -e "${BLUE}1. Acesse o hPanel da Hostinger:${NC}"
echo "   https://hpanel.hostinger.com/"
echo ""
echo -e "${BLUE}2. Vá em Files → File Manager${NC}"
echo ""
echo -e "${BLUE}3. Navegue até public_html/${NC}"
echo ""
echo -e "${BLUE}4. DELETE o arquivo index.html atual${NC}"
echo ""
echo -e "${BLUE}5. Faça upload do arquivo: index-html-correto.html${NC}"
echo "   (renomeie para index.html após o upload)"
echo ""
echo -e "${BLUE}6. Certifique-se que a pasta assets/ está em public_html/${NC}"
echo ""
echo -e "${GREEN}✅ Após corrigir, teste:${NC}"
echo "🌐 https://connectia.agenciapixel.digital"
echo ""

echo -e "${YELLOW}💡 ALTERNATIVA RÁPIDA:${NC}"
echo "Use o arquivo da pasta dist/ que já está correto!"
echo "Copie o index.html da pasta dist/ para o servidor."
