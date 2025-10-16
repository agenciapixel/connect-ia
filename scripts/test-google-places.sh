#!/bin/bash

# Script para testar a integração com Google Places API
# Faz uma chamada de teste à Edge Function

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Teste da Integração Google Places API                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se o servidor está rodando
if ! lsof -ti:8080 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Servidor não está rodando na porta 8080${NC}"
    echo ""
    echo "Iniciando servidor de desenvolvimento..."
    npm run dev &
    sleep 5
fi

echo -e "${BLUE}📍 Testando busca: 'restaurantes em São Paulo, SP'${NC}"
echo ""

# Obter token de autenticação (você precisará estar logado no app)
echo -e "${YELLOW}Para testar via navegador:${NC}"
echo ""
echo "  1. Acesse: ${BLUE}http://localhost:8080/prospects${NC}"
echo "  2. Faça login se necessário"
echo "  3. Clique na aba 'Buscar'"
echo "  4. Preencha:"
echo "     - Busca: ${GREEN}restaurantes${NC}"
echo "     - Localização: ${GREEN}São Paulo, SP${NC}"
echo "     - Raio: ${GREEN}5 km${NC}"
echo "  5. Clique em 'Buscar Prospects'"
echo ""

echo -e "${BLUE}✅ O que esperar:${NC}"
echo ""
echo "  ${GREEN}✓${NC} Toast de sucesso: 'X lugares encontrados!'"
echo "  ${GREEN}✓${NC} Descrição: 'Fonte: ${GREEN}Google Places API${NC}' (se API Key configurada)"
echo "  ${YELLOW}⚠${NC} Descrição: 'Fonte: ${YELLOW}scraping${NC}' (se API Key não configurada ou falhou)"
echo ""

echo -e "${BLUE}📊 Para ver logs da Edge Function:${NC}"
echo ""
echo "  Acesse: ${BLUE}https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/functions/google-places-search/logs${NC}"
echo ""

echo -e "${BLUE}🔍 Para verificar se a API Key está configurada:${NC}"
echo ""
echo "  $ supabase secrets list | grep GOOGLE_PLACES_API_KEY"
echo ""

# Verificar secret
if supabase secrets list 2>/dev/null | grep -q "GOOGLE_PLACES_API_KEY"; then
    echo -e "${GREEN}✅ API Key está configurada!${NC}"
else
    echo -e "${RED}❌ API Key NÃO está configurada${NC}"
    echo ""
    echo "Configure com:"
    echo "  $ ./scripts/setup-google-places-env.sh YOUR_API_KEY"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Pronto para testar! Acesse o navegador agora.            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
