#!/bin/bash

echo "🚀 INICIALIZAR GIT PARA HOSTINGER"
echo "================================="
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

echo -e "${BLUE}📦 Inicializando Git...${NC}"

# Inicializar Git se não existir
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅ Git inicializado${NC}"
else
    echo -e "${YELLOW}⚠️ Git já existe${NC}"
fi

# Adicionar todos os arquivos
echo -e "${BLUE}📁 Adicionando arquivos...${NC}"
git add .

# Fazer commit inicial
echo -e "${BLUE}💾 Fazendo commit inicial...${NC}"
git commit -m "Initial commit - Connect IA ready for Hostinger Git Deploy"

# Configurar branch main
echo -e "${BLUE}🌿 Configurando branch main...${NC}"
git branch -M main

echo ""
echo -e "${GREEN}✅ GIT CONFIGURADO!${NC}"
echo ""
echo -e "${YELLOW}🚀 PRÓXIMOS PASSOS:${NC}"
echo ""
echo -e "${BLUE}1. Crie repositório no GitHub:${NC}"
echo "   - Nome: connect-ia"
echo "   - Visibilidade: Private (recomendado)"
echo ""
echo -e "${BLUE}2. Adicione o remote e faça push:${NC}"
echo "   git remote add origin https://github.com/SEU_USUARIO/connect-ia.git"
echo "   git push -u origin main"
echo ""
echo -e "${BLUE}3. Configure no hPanel da Hostinger:${NC}"
echo "   - Vá em: Advanced → Git Version Control"
echo "   - Repository URL: https://github.com/SEU_USUARIO/connect-ia.git"
echo "   - Branch: main"
echo "   - Deploy Directory: public_html"
echo "   - Auto Deploy: ✅ Ativado"
echo "   - Build Command: npm install && npm run build"
echo "   - Deploy Command: cp -r dist/* public_html/"
echo ""
echo -e "${GREEN}🎉 APÓS CONFIGURAR:${NC}"
echo "✅ Deploy automático a cada push"
echo "✅ Build na nuvem da Hostinger"
echo "✅ Site sempre atualizado"
echo ""
echo -e "${YELLOW}💡 DICA:${NC}"
echo "Substitua 'SEU_USUARIO' pelo seu nome de usuário do GitHub!"
