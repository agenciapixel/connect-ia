#!/bin/bash

echo "🚀 UPLOAD COMPLETO PARA HOSTINGER"
echo "================================="
echo "Domínio: connectia.agenciapixel.digital"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}🚨 PROBLEMA IDENTIFICADO:${NC}"
echo "A pasta 'assets/' não existe no servidor!"
echo "O index.html está correto, mas os arquivos JS/CSS não estão sendo encontrados."
echo ""

echo -e "${BLUE}📋 Verificando arquivos locais...${NC}"

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

echo -e "${GREEN}✅ Arquivos locais OK${NC}"
echo ""

echo -e "${BLUE}📁 Arquivos que devem ser enviados:${NC}"
echo "📄 index.html"
echo "📁 assets/"
echo "   ├── index-BI8eP73w.js"
echo "   ├── index-4UT7fDzW.css"
echo "   ├── ui-CDRV4mmj.js"
echo "   ├── vendor-BNoTEEtH.js"
echo "   └── supabase-wbh-WGy_.js"
echo "📄 favicon.ico"
echo "📄 robots.txt"
echo "📄 terms.html"
echo ""

echo -e "${YELLOW}🚀 SOLUÇÃO PASSO A PASSO:${NC}"
echo ""
echo -e "${BLUE}1. Acesse o hPanel da Hostinger:${NC}"
echo "   https://hpanel.hostinger.com/"
echo ""
echo -e "${BLUE}2. Vá em Files → File Manager${NC}"
echo ""
echo -e "${BLUE}3. Navegue até public_html/${NC}"
echo ""
echo -e "${BLUE}4. DELETE todos os arquivos atuais${NC}"
echo "   (ou mova para uma pasta de backup)"
echo ""
echo -e "${BLUE}5. Faça upload de TODOS os arquivos da pasta dist/${NC}"
echo "   - Selecione TODOS os arquivos da pasta dist/"
echo "   - Faça upload para public_html/"
echo "   - Certifique-se que a pasta assets/ seja enviada"
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

echo -e "${YELLOW}💡 DICA IMPORTANTE:${NC}"
echo "NÃO envie a pasta dist/ inteira!"
echo "Envie o CONTEÚDO da pasta dist/ para public_html/"
echo ""
echo -e "${GREEN}✅ Após o upload, teste:${NC}"
echo "🌐 https://connectia.agenciapixel.digital"
echo "🔍 https://connectia.agenciapixel.digital/assets/index-BI8eP73w.js"
echo ""

echo -e "${BLUE}📦 Criando pacote para upload...${NC}"

# Criar diretório de upload
rm -rf upload_completo
mkdir -p upload_completo

# Copiar todos os arquivos
cp -r dist/* upload_completo/

echo -e "${GREEN}✅ Pacote criado em: upload_completo/${NC}"
echo ""
echo -e "${BLUE}📋 Conteúdo do pacote:${NC}"
ls -la upload_completo/

echo ""
echo -e "${YELLOW}🚀 UPLOAD ESTE PACOTE COMPLETO!${NC}"
