#!/bin/bash

# Script para configurar Google Places API Key no Supabase
# Uso: ./scripts/setup-google-places-env.sh YOUR_API_KEY

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Google Places API - Configuração de Ambiente Supabase    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se a API key foi fornecida
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: API Key não fornecida${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC}"
    echo "  ./scripts/setup-google-places-env.sh YOUR_GOOGLE_PLACES_API_KEY"
    echo ""
    echo -e "${YELLOW}Para obter sua API Key:${NC}"
    echo "  1. Acesse: https://console.cloud.google.com/"
    echo "  2. Ative a Places API"
    echo "  3. Crie uma API Key em Credenciais"
    echo ""
    exit 1
fi

API_KEY="$1"

echo -e "${YELLOW}🔑 API Key detectada:${NC} ${API_KEY:0:10}...${API_KEY: -5}"
echo ""

# Configurar secret no Supabase
echo -e "${BLUE}📝 Configurando secret no Supabase...${NC}"
echo ""

# Tentar configurar usando Supabase CLI
if command -v supabase &> /dev/null; then
    echo "Executando: supabase secrets set GOOGLE_PLACES_API_KEY=..."

    if supabase secrets set GOOGLE_PLACES_API_KEY="$API_KEY"; then
        echo ""
        echo -e "${GREEN}✅ Secret configurado com sucesso!${NC}"
        echo ""

        # Verificar se precisa fazer redeploy
        echo -e "${YELLOW}⚠️  Atenção:${NC} A Edge Function precisa ser re-deployada para usar o novo secret."
        echo ""
        echo -e "${BLUE}Executando redeploy da função google-places-search...${NC}"

        if supabase functions deploy google-places-search; then
            echo ""
            echo -e "${GREEN}✅ Edge Function re-deployada com sucesso!${NC}"
            echo ""
            echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
            echo -e "${GREEN}║  ✅ Configuração Completa!                                 ║${NC}"
            echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${BLUE}Próximos passos:${NC}"
            echo "  1. Acesse: http://localhost:8080/prospects"
            echo "  2. Teste uma busca no Google Maps"
            echo "  3. Verifique os logs se necessário:"
            echo "     supabase functions logs google-places-search"
            echo ""
        else
            echo ""
            echo -e "${RED}❌ Erro ao fazer redeploy da função${NC}"
            exit 1
        fi
    else
        echo ""
        echo -e "${RED}❌ Erro ao configurar secret${NC}"
        echo ""
        echo -e "${YELLOW}Tente configurar manualmente:${NC}"
        echo "  1. Acesse: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/settings/functions"
        echo "  2. Adicione a variável:"
        echo "     Nome: GOOGLE_PLACES_API_KEY"
        echo "     Valor: $API_KEY"
        echo ""
        exit 1
    fi
else
    echo -e "${RED}❌ Supabase CLI não encontrado${NC}"
    echo ""
    echo -e "${YELLOW}Configure manualmente:${NC}"
    echo "  1. Acesse: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/settings/functions"
    echo "  2. Na seção 'Secrets', clique em 'Add new secret'"
    echo "  3. Nome: GOOGLE_PLACES_API_KEY"
    echo "  4. Valor: $API_KEY"
    echo "  5. Clique em 'Save'"
    echo "  6. Faça redeploy da função: supabase functions deploy google-places-search"
    echo ""
    exit 1
fi
