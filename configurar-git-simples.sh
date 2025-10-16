#!/bin/bash

echo "🚀 CONFIGURAÇÃO GIT DEPLOY SIMPLES HOSTINGER"
echo "============================================="
echo "Domínio: connectia.agenciapixel.digital"
echo "Pasta: public_html/connectia/"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}✅ CONFIGURAÇÃO PARA GIT DEPLOY SIMPLES${NC}"
echo ""
echo -e "${BLUE}📋 Como funciona:${NC}"
echo "✅ Hostinger faz apenas 'git pull'"
echo "✅ Não há build automático"
echo "✅ Precisamos enviar os arquivos já compilados"
echo ""

echo -e "${YELLOW}🚀 SOLUÇÃO:${NC}"
echo ""
echo -e "${BLUE}1. Fazer build local:${NC}"
echo "   npm run build"
echo ""
echo -e "${BLUE}2. Copiar arquivos compilados para o repositório:${NC}"
echo "   cp -r dist/* ."
echo ""
echo -e "${BLUE}3. Fazer commit e push:${NC}"
echo "   git add ."
echo "   git commit -m 'Deploy'"
echo "   git push"
echo ""
echo -e "${BLUE}4. Hostinger fará git pull automaticamente${NC}"
echo ""

echo -e "${GREEN}🎉 VANTAGENS:${NC}"
echo "✅ Deploy automático a cada push"
echo "✅ Sem problemas de conexão FTP"
echo "✅ Controle total do build"
echo "✅ Rollback fácil"
echo ""

echo -e "${BLUE}📁 ESTRUTURA DO REPOSITÓRIO:${NC}"
echo "✅ Arquivos compilados na raiz"
echo "✅ index.html (já compilado)"
echo "✅ assets/ (JS/CSS compilados)"
echo "✅ .htaccess (configuração servidor)"
echo ""

echo -e "${YELLOW}💡 DICA IMPORTANTE:${NC}"
echo "O repositório deve conter os arquivos COMPILADOS, não o código fonte!"
echo "Isso significa que após cada mudança:"
echo "1. npm run build"
echo "2. cp -r dist/* ."
echo "3. git add . && git commit && git push"
echo ""

echo -e "${GREEN}🚀 PRÓXIMO PASSO:${NC}"
echo "Vou criar um script para automatizar esse processo!"
