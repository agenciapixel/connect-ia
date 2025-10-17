#!/bin/bash

echo "🔧 CONFIGURAÇÃO WHATSAPP BUSINESS API"
echo "====================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}📍 ONDE CONFIGURAR AS CREDENCIAIS:${NC}"
echo ""
echo -e "${BLUE}1. 🖥️  INTERFACE DO SISTEMA (PRINCIPAL):${NC}"
echo "   • Abra o Connect IA"
echo "   • Vá em Integrações → WhatsApp"
echo "   • Clique 'Conectar Canal WhatsApp'"
echo "   • Preencha o formulário com suas credenciais"
echo ""

echo -e "${BLUE}2. 🔧 VARIÁVEIS DE AMBIENTE (BACKEND):${NC}"
echo "   • Supabase Dashboard → Project Settings → Edge Functions"
echo "   • Adicione as variáveis necessárias"
echo ""

echo -e "${BLUE}3. 📋 ARQUIVO LOCAL (.env):${NC}"
echo "   • Copie: cp env.example .env"
echo "   • Edite com suas credenciais"
echo ""

echo -e "${GREEN}🎯 CREDENCIAIS NECESSÁRIAS:${NC}"
echo ""
echo -e "${YELLOW}Do Meta for Developers:${NC}"
echo "• Phone Number ID: 123456789012345"
echo "• Business Account ID: 987654321098765"
echo "• Access Token: EAAG..."
echo "• Verify Token: (você cria um token personalizado)"
echo ""

echo -e "${GREEN}📋 FORMULÁRIO DE CONFIGURAÇÃO:${NC}"
echo ""
echo "┌─────────────────────────────────────────┐"
echo "│ Nome do Canal: WhatsApp Vendas          │"
echo "│ Phone Number ID: 123456789012345        │"
echo "│ Business Account ID: 987654321098765    │"
echo "│ Access Token: EAAG...                   │"
echo "│ Verify Token: meu_token_seguro_123      │"
echo "└─────────────────────────────────────────┘"
echo ""

echo -e "${GREEN}🔗 WEBHOOK URL:${NC}"
echo ""
echo "https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook"
echo ""

echo -e "${GREEN}📱 CONFIGURAÇÃO NO META:${NC}"
echo ""
echo "1. Meta for Developers → WhatsApp → Configuration"
echo "2. Webhook URL: (cole a URL acima)"
echo "3. Verify Token: (use o mesmo do formulário)"
echo "4. Subscribe to: messages"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo ""
echo "• O Verify Token deve ser o MESMO em ambos os lugares"
echo "• O Access Token deve ter permissões para WhatsApp"
echo "• O Phone Number ID deve estar correto"
echo "• Teste a conexão após configurar"
echo ""

echo -e "${GREEN}🧪 TESTE DE CONFIGURAÇÃO:${NC}"
echo ""
echo "1. Conecte o canal via interface"
echo "2. Vá em Integrações → WhatsApp → Ver canais"
echo "3. Teste envio de mensagem"
echo "4. Verifique logs no Supabase"
echo ""

echo -e "${BLUE}🔍 VERIFICAÇÃO DE PROBLEMAS:${NC}"
echo ""
echo -e "${RED}Token Inválido:${NC}"
echo "• Verificar se o token está correto"
echo "• Verificar se não expirou"
echo ""
echo -e "${RED}Phone Number ID Incorreto:${NC}"
echo "• Verificar no Meta for Developers"
echo "• Copiar o ID correto"
echo ""
echo -e "${RED}Webhook não Funciona:${NC}"
echo "• Verificar se o Verify Token é o mesmo"
echo "• Verificar URL do webhook"
echo ""

echo -e "${GREEN}✅ CHECKLIST:${NC}"
echo ""
echo "[ ] Credenciais obtidas no Meta for Developers"
echo "[ ] Canal conectado via interface do sistema"
echo "[ ] Webhook configurado no Meta for Developers"
echo "[ ] Teste de envio realizado com sucesso"
echo "[ ] Logs verificados para erros"
echo ""

echo -e "${GREEN}🎯 RESUMO:${NC}"
echo ""
echo -e "${BLUE}PRINCIPAL:${NC} Interface do Sistema (Integrações → WhatsApp)"
echo -e "${BLUE}SECUNDÁRIO:${NC} Variáveis de Ambiente (Supabase Dashboard)"
echo -e "${BLUE}LOCAL:${NC} Arquivo .env (desenvolvimento)"
echo ""

echo -e "${YELLOW}🌐 ACESSE AGORA:${NC}"
echo "Abra o Connect IA e vá em: Integrações → WhatsApp → Conectar Canal"
