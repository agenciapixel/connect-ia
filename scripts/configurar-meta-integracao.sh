#!/bin/bash

echo "🔗 CONFIGURADOR META INTEGRAÇÃO 2024"
echo "===================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 CONFIGURAÇÃO AUTOMÁTICA META INTEGRATION${NC}"
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute este script no diretório raiz do projeto${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Diretório do projeto confirmado${NC}"
echo ""

# 1. Configurar variáveis de ambiente
echo -e "${YELLOW}🔐 CONFIGURANDO VARIÁVEIS DE AMBIENTE${NC}"
echo ""

# Criar arquivo .env.local se não existir
if [ ! -f ".env.local" ]; then
    echo "Criando arquivo .env.local..."
    cat > .env.local << EOF
# Meta App Configuration
NEXT_PUBLIC_META_APP_ID=670209849105494
META_APP_SECRET=

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_VERIFY_TOKEN=

# Instagram Basic Display
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=

# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EOF
    echo -e "${GREEN}✅ Arquivo .env.local criado${NC}"
else
    echo -e "${YELLOW}⚠️  Arquivo .env.local já existe${NC}"
fi

echo ""

# 2. Verificar dependências
echo -e "${YELLOW}📦 VERIFICANDO DEPENDÊNCIAS${NC}"
echo ""

# Verificar se as dependências necessárias estão instaladas
if npm list @supabase/supabase-js > /dev/null 2>&1; then
    echo -e "${GREEN}✅ @supabase/supabase-js instalado${NC}"
else
    echo -e "${RED}❌ @supabase/supabase-js não encontrado${NC}"
    echo "Instalando..."
    npm install @supabase/supabase-js
fi

echo ""

# 3. Configurar Edge Functions
echo -e "${YELLOW}⚡ CONFIGURANDO EDGE FUNCTIONS${NC}"
echo ""

# Verificar se as Edge Functions existem
functions=(
    "whatsapp-webhook"
    "instagram-webhook" 
    "whatsapp-send-message"
    "instagram-send-message"
    "meta-oauth-exchange"
)

for func in "${functions[@]}"; do
    if [ -d "supabase/functions/$func" ]; then
        echo -e "${GREEN}✅ $func existe${NC}"
    else
        echo -e "${RED}❌ $func não encontrado${NC}"
        echo "Criando estrutura básica..."
        mkdir -p "supabase/functions/$func"
        cat > "supabase/functions/$func/index.ts" << EOF
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Implementar lógica específica da função
    return new Response('OK', { 
      status: 200,
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
EOF
        echo -e "${GREEN}✅ $func criado${NC}"
    fi
done

echo ""

# 4. Configurar componentes React
echo -e "${YELLOW}⚛️  VERIFICANDO COMPONENTES REACT${NC}"
echo ""

components=(
    "src/components/WhatsAppSetup.tsx"
    "src/components/InstagramSetup.tsx"
    "src/components/MetaOAuthConnect.tsx"
    "src/components/WhatsAppQRConnect.tsx"
)

for comp in "${components[@]}"; do
    if [ -f "$comp" ]; then
        echo -e "${GREEN}✅ $comp existe${NC}"
    else
        echo -e "${RED}❌ $comp não encontrado${NC}"
    fi
done

echo ""

# 5. Configurar bibliotecas
echo -e "${YELLOW}📚 VERIFICANDO BIBLIOTECAS${NC}"
echo ""

if [ -f "src/lib/whatsapp.ts" ]; then
    echo -e "${GREEN}✅ src/lib/whatsapp.ts existe${NC}"
else
    echo -e "${RED}❌ src/lib/whatsapp.ts não encontrado${NC}"
fi

if [ -f "src/lib/instagram.ts" ]; then
    echo -e "${GREEN}✅ src/lib/instagram.ts existe${NC}"
else
    echo -e "${RED}❌ src/lib/instagram.ts não encontrado${NC}"
fi

echo ""

# 6. Configurar Supabase secrets
echo -e "${YELLOW}🔐 CONFIGURANDO SUPABASE SECRETS${NC}"
echo ""

echo "Para configurar os secrets do Supabase, execute os seguintes comandos:"
echo ""
echo -e "${BLUE}# WhatsApp Business API${NC}"
echo "supabase secrets set WHATSAPP_ACCESS_TOKEN=seu_token_aqui"
echo "supabase secrets set WHATSAPP_PHONE_NUMBER_ID=seu_phone_id_aqui"
echo "supabase secrets set WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_id_aqui"
echo "supabase secrets set WHATSAPP_VERIFY_TOKEN=seu_verify_token_aqui"
echo ""
echo -e "${BLUE}# Instagram Basic Display${NC}"
echo "supabase secrets set INSTAGRAM_CLIENT_SECRET=seu_client_secret_aqui"
echo ""
echo -e "${BLUE}# Meta App${NC}"
echo "supabase secrets set META_APP_SECRET=seu_app_secret_aqui"
echo ""

# 7. Configurar webhooks
echo -e "${YELLOW}🔗 CONFIGURAÇÃO DE WEBHOOKS${NC}"
echo ""

echo "Configure os webhooks no Meta for Developers:"
echo ""
echo -e "${BLUE}WhatsApp Webhook:${NC}"
echo "URL: https://seu-projeto.supabase.co/functions/v1/whatsapp-webhook"
echo "Verify Token: [definir em WHATSAPP_VERIFY_TOKEN]"
echo "Fields: messages, message_deliveries, message_reads"
echo ""
echo -e "${BLUE}Instagram Webhook:${NC}"
echo "URL: https://seu-projeto.supabase.co/functions/v1/instagram-webhook"
echo "Fields: instagram_messages, messaging_postbacks"
echo ""

# 8. Testes
echo -e "${YELLOW}🧪 COMANDOS DE TESTE${NC}"
echo ""

echo "Para testar a integração:"
echo ""
echo -e "${BLUE}# Deploy das funções${NC}"
echo "supabase functions deploy"
echo ""
echo -e "${BLUE}# Teste local${NC}"
echo "supabase functions serve whatsapp-webhook --no-verify-jwt"
echo ""
echo -e "${BLUE}# Ver logs${NC}"
echo "supabase functions logs whatsapp-webhook"
echo ""

# 9. Próximos passos
echo -e "${GREEN}🎯 PRÓXIMOS PASSOS${NC}"
echo ""

echo "1. ${YELLOW}Configurar variáveis no .env.local${NC}"
echo "2. ${YELLOW}Configurar secrets do Supabase${NC}"
echo "3. ${YELLOW}Configurar webhooks no Meta for Developers${NC}"
echo "4. ${YELLOW}Fazer deploy das Edge Functions${NC}"
echo "5. ${YELLOW}Testar integração${NC}"
echo "6. ${YELLOW}Submeter app para revisão do Meta${NC}"
echo ""

echo -e "${BLUE}📚 DOCUMENTAÇÃO COMPLETA:${NC}"
echo "docs/INTEGRACAO_META_COMPLETA_2024.md"
echo ""

echo -e "${GREEN}✅ CONFIGURAÇÃO INICIAL CONCLUÍDA!${NC}"
echo ""
echo -e "${YELLOW}⚠️  Lembre-se de:${NC}"
echo "• Configurar todas as variáveis de ambiente"
echo "• Fazer deploy das Edge Functions"
echo "• Configurar webhooks no Meta"
echo "• Testar antes de ir para produção"
echo ""

echo -e "${BLUE}🌐 LINKS ÚTEIS:${NC}"
echo "• Meta for Developers: https://developers.facebook.com/"
echo "• WhatsApp Business API: https://developers.facebook.com/docs/whatsapp/"
echo "• Instagram Basic Display: https://developers.facebook.com/docs/instagram-basic-display-api/"
echo "• Supabase Functions: https://supabase.com/docs/guides/functions"
echo ""
