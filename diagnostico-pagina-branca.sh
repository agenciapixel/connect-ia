#!/bin/bash

echo "🔧 CORRIGINDO PROBLEMA DE PÁGINA EM BRANCO"
echo "=========================================="
echo "Domínio: connectia.agenciapixel.digital"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📁 Verificando estrutura de arquivos...${NC}"

# Verificar se dist existe
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Pasta dist não encontrada!${NC}"
    echo -e "${YELLOW}💡 Execute: npm run build${NC}"
    exit 1
fi

# Verificar se assets existe
if [ ! -d "dist/assets" ]; then
    echo -e "${RED}❌ Pasta dist/assets não encontrada!${NC}"
    echo -e "${YELLOW}💡 Execute: npm run build${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Estrutura de arquivos OK${NC}"
echo ""

echo -e "${BLUE}📋 Arquivos que devem estar no servidor:${NC}"
echo "📄 index.html"
echo "📁 assets/"
echo "   ├── index-BI8eP73w.js"
echo "   ├── index-4UT7fDzW.css"
echo "   ├── ui-CDRV4mmj.js"
echo "   ├── vendor-BNoTEEtH.js"
echo "   └── supabase-wbh-WGy_.js"
echo ""

echo -e "${YELLOW}🚨 PROBLEMA DETECTADO:${NC}"
echo "Os arquivos JavaScript e CSS não estão sendo encontrados!"
echo ""

echo -e "${GREEN}🔧 SOLUÇÕES:${NC}"
echo ""
echo -e "${BLUE}OPÇÃO 1 - Upload Manual (Mais Rápido):${NC}"
echo "1. Acesse: https://hpanel.hostinger.com/"
echo "2. Vá em: Files → File Manager"
echo "3. Navegue até: public_html/"
echo "4. Verifique se existe a pasta 'assets/'"
echo "5. Se não existir, faça upload da pasta 'assets/' inteira"
echo "6. Certifique-se que os arquivos estão assim:"
echo "   public_html/"
echo "   ├── index.html"
echo "   ├── assets/"
echo "   │   ├── index-BI8eP73w.js"
echo "   │   ├── index-4UT7fDzW.css"
echo "   │   └── ..."
echo ""

echo -e "${BLUE}OPÇÃO 2 - Deploy Automático:${NC}"
echo "1. Configure suas credenciais FTP no arquivo deploy-hostinger.sh"
echo "2. Execute: ./deploy-hostinger.sh"
echo ""

echo -e "${BLUE}OPÇÃO 3 - Verificar Upload Atual:${NC}"
echo "1. Acesse: https://hpanel.hostinger.com/"
echo "2. Vá em: Files → File Manager"
echo "3. Navegue até: public_html/"
echo "4. Verifique se TODOS os arquivos estão lá"
echo ""

echo -e "${YELLOW}💡 DICA IMPORTANTE:${NC}"
echo "A pasta 'assets/' DEVE estar dentro de 'public_html/'"
echo "Não deve estar dentro de outra pasta!"
echo ""

echo -e "${GREEN}✅ Após corrigir, teste:${NC}"
echo "🌐 https://connectia.agenciapixel.digital"
echo "🔍 https://connectia.agenciapixel.digital/assets/index-BI8eP73w.js"
