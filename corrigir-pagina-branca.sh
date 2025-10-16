#!/bin/bash

echo "🚀 CORREÇÃO AUTOMÁTICA - PÁGINA EM BRANCO"
echo "========================================="
echo "Domínio: connectia.agenciapixel.digital"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute este script na raiz do projeto Connect IA${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Fazendo build do projeto...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Erro no build!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído!${NC}"
echo ""

echo -e "${BLUE}📁 Criando pacote para upload...${NC}"

# Criar diretório temporário
mkdir -p upload_package

# Copiar todos os arquivos necessários
cp -r dist/* upload_package/

echo -e "${GREEN}✅ Pacote criado em: upload_package/${NC}"
echo ""

echo -e "${BLUE}📋 Conteúdo do pacote:${NC}"
ls -la upload_package/

echo ""
echo -e "${YELLOW}🚀 PRÓXIMOS PASSOS:${NC}"
echo ""
echo -e "${BLUE}1. Acesse o hPanel da Hostinger:${NC}"
echo "   https://hpanel.hostinger.com/"
echo ""
echo -e "${BLUE}2. Vá em Files → File Manager${NC}"
echo ""
echo -e "${BLUE}3. Navegue até public_html/${NC}"
echo ""
echo -e "${BLUE}4. DELETE todos os arquivos atuais em public_html/${NC}"
echo "   (ou mova para uma pasta de backup)"
echo ""
echo -e "${BLUE}5. Faça upload de TODOS os arquivos da pasta upload_package/${NC}"
echo "   - Selecione TODOS os arquivos"
echo "   - Faça upload para public_html/"
echo ""
echo -e "${BLUE}6. Verifique se a estrutura ficou assim:${NC}"
echo "   public_html/"
echo "   ├── index.html"
echo "   ├── assets/"
echo "   │   ├── index-BI8eP73w.js"
echo "   │   ├── index-4UT7fDzW.css"
echo "   │   └── ..."
echo "   ├── favicon.ico"
echo "   └── ..."
echo ""
echo -e "${GREEN}✅ Após o upload, teste:${NC}"
echo "🌐 https://connectia.agenciapixel.digital"
echo ""
echo -e "${YELLOW}💡 DICA:${NC}"
echo "Se ainda não funcionar, verifique se os arquivos estão na raiz de public_html/"
echo "e não dentro de uma subpasta!"
