#!/bin/bash

echo "🔄 VOLTAR AO MODO DESENVOLVIMENTO"
echo "================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se backup existe
if [ ! -d "backup_dev" ]; then
    echo -e "${RED}❌ Backup de desenvolvimento não encontrado!${NC}"
    echo -e "${YELLOW}💡 Execute o deploy primeiro: ./deploy-git-simples.sh${NC}"
    exit 1
fi

echo -e "${BLUE}🔄 Restaurando arquivos de desenvolvimento...${NC}"

# Restaurar arquivos de desenvolvimento
cp -r backup_dev/* .

echo -e "${GREEN}✅ Arquivos de desenvolvimento restaurados!${NC}"
echo ""

echo -e "${BLUE}📦 Instalando dependências...${NC}"
npm install

echo -e "${GREEN}✅ Modo desenvolvimento ativado!${NC}"
echo ""
echo -e "${BLUE}🚀 Comandos disponíveis:${NC}"
echo "   npm run dev     - Servidor de desenvolvimento"
echo "   npm run build  - Build para produção"
echo "   npm run deploy - Deploy para Hostinger"
echo ""
echo -e "${YELLOW}💡 DICA:${NC}"
echo "Para fazer deploy: ./deploy-git-simples.sh"
