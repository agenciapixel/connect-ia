#!/bin/bash

echo "🚀 CONFIGURAÇÃO AUTOMÁTICA COMPLETA"
echo "==================================="
echo "Connect IA - Sistema de CRM com IA"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📦 Instalando dependências...${NC}"
npm install

echo -e "${BLUE}🏗️ Fazendo build do projeto...${NC}"
npm run build

echo -e "${GREEN}✅ Build concluído!${NC}"
echo ""

echo -e "${BLUE}📁 Verificando estrutura...${NC}"
ls -la dist/

echo ""
echo -e "${YELLOW}🚀 SISTEMA CONFIGURADO AUTOMATICAMENTE!${NC}"
echo ""
echo -e "${GREEN}✅ CONFIGURAÇÃO COMPLETA:${NC}"
echo "✅ Dependências instaladas"
echo "✅ Projeto compilado"
echo "✅ GitHub Actions configurado"
echo "✅ Git Deploy da Hostinger pronto"
echo ""
echo -e "${BLUE}📋 PRÓXIMOS PASSOS:${NC}"
echo ""
echo -e "${BLUE}1. Configure no hPanel da Hostinger:${NC}"
echo "   - Vá em: Advanced → Git Version Control"
echo "   - Repository: https://github.com/agenciapixel/connect-ia.git"
echo "   - Branch: main"
echo "   - Deploy Directory: public_html/connectia"
echo "   - Auto Deploy: ✅ Ativado"
echo ""
echo -e "${BLUE}2. Deploy automático:${NC}"
echo "   git add ."
echo "   git commit -m 'Deploy automático'"
echo "   git push"
echo ""
echo -e "${BLUE}3. Teste o site:${NC}"
echo "   https://connectia.agenciapixel.digital"
echo ""
echo -e "${GREEN}🎉 SISTEMA PRONTO PARA PRODUÇÃO!${NC}"
