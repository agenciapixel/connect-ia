#!/bin/bash

echo "📋 CONFIGURAÇÃO POLÍTICA DE PRIVACIDADE - META"
echo "=============================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}✅ POLÍTICA DE PRIVACIDADE CRIADA!${NC}"
echo ""

echo -e "${BLUE}📄 ARQUIVOS CRIADOS:${NC}"
echo "• public/privacy-policy.html - Política de Privacidade completa"
echo "• public/terms.html - Termos de Uso atualizados"
echo "• dist/privacy-policy.html - Copiado para deploy"
echo ""

echo -e "${YELLOW}🔗 URLs PARA CONFIGURAR NO META FOR DEVELOPERS:${NC}"
echo ""
echo -e "${GREEN}1. Política de Privacidade:${NC}"
echo "   https://connectia.agenciapixel.digital/privacy-policy.html"
echo ""
echo -e "${GREEN}2. Termos de Uso:${NC}"
echo "   https://connectia.agenciapixel.digital/terms.html"
echo ""

echo -e "${BLUE}📋 PASSO A PASSO PARA CONFIGURAR NO META:${NC}"
echo ""

echo -e "${YELLOW}1. ACESSAR META FOR DEVELOPERS:${NC}"
echo "   • Vá para: https://developers.facebook.com/"
echo "   • Faça login com sua conta"
echo "   • Selecione o app: Connect IA (ID: 670209849105494)"
echo ""

echo -e "${YELLOW}2. CONFIGURAR POLÍTICA DE PRIVACIDADE:${NC}"
echo "   • App Dashboard → Configurações → Básico"
echo "   • Procure por: 'Política de Privacidade'"
echo "   • Cole a URL: https://connectia.agenciapixel.digital/privacy-policy.html"
echo ""

echo -e "${YELLOW}3. CONFIGURAR TERMOS DE USO:${NC}"
echo "   • Na mesma seção 'Básico'"
echo "   • Procure por: 'Termos de Uso' ou 'Terms of Service'"
echo "   • Cole a URL: https://connectia.agenciapixel.digital/terms.html"
echo ""

echo -e "${YELLOW}4. SALVAR CONFIGURAÇÕES:${NC}"
echo "   • Clique em 'Salvar Alterações'"
echo "   • Aguarde a confirmação"
echo ""

echo -e "${BLUE}🎯 CONTEÚDO DA POLÍTICA DE PRIVACIDADE:${NC}"
echo ""
echo "A política criada inclui:"
echo "• ✅ Informações sobre coleta de dados"
echo "• ✅ Uso de dados do WhatsApp Business API"
echo "• ✅ Uso de dados do Instagram Basic Display"
echo "• ✅ Integração com Meta (Facebook)"
echo "• ✅ Direitos do usuário (LGPD)"
echo "• ✅ Segurança e proteção de dados"
echo "• ✅ Cookies e tecnologias similares"
echo "• ✅ Compartilhamento com terceiros"
echo "• ✅ Retenção de dados"
echo "• ✅ Contato para exercer direitos"
echo ""

echo -e "${BLUE}📱 ESPECÍFICO PARA META INTEGRATION:${NC}"
echo ""
echo "A política cobre especificamente:"
echo "• ✅ Dados do Facebook quando autorizado"
echo "• ✅ Mensagens do WhatsApp Business"
echo "• ✅ Dados do Instagram Basic Display"
echo "• ✅ Tokens de acesso para APIs"
echo "• ✅ Webhooks do WhatsApp e Instagram"
echo "• ✅ Conformidade com políticas do Meta"
echo ""

echo -e "${GREEN}✅ VALIDAÇÃO DAS URLs:${NC}"
echo ""
echo "Teste se as URLs estão funcionando:"
echo ""

echo -e "${YELLOW}# Teste Política de Privacidade:${NC}"
echo "curl -I https://connectia.agenciapixel.digital/privacy-policy.html"
echo ""

echo -e "${YELLOW}# Teste Termos de Uso:${NC}"
echo "curl -I https://connectia.agenciapixel.digital/terms.html"
echo ""

echo -e "${BLUE}🔍 VERIFICAÇÃO NO META:${NC}"
echo ""
echo "Após configurar, verifique:"
echo "• ✅ URLs retornam status 200"
echo "• ✅ Conteúdo carrega corretamente"
echo "• ✅ Política está em português"
echo "• ✅ Cobre integração com Meta"
echo "• ✅ Inclui dados do WhatsApp/Instagram"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo ""
echo "• As URLs devem estar acessíveis publicamente"
echo "• O conteúdo deve estar em português (idioma do app)"
echo "• Deve cobrir especificamente dados do Meta"
echo "• Deve incluir informações sobre WhatsApp e Instagram"
echo "• Deve estar em conformidade com LGPD"
echo ""

echo -e "${GREEN}🎉 CONFIGURAÇÃO COMPLETA!${NC}"
echo ""
echo -e "${BLUE}📋 PRÓXIMOS PASSOS:${NC}"
echo "1. Fazer commit e push dos arquivos"
echo "2. Aguardar deploy automático"
echo "3. Configurar URLs no Meta for Developers"
echo "4. Verificar se URLs estão acessíveis"
echo "5. Testar configuração no Meta"
echo ""

echo -e "${YELLOW}🌐 LINKS ÚTEIS:${NC}"
echo "• Meta for Developers: https://developers.facebook.com/"
echo "• App Connect IA: https://developers.facebook.com/apps/670209849105494"
echo "• Política de Privacidade: https://connectia.agenciapixel.digital/privacy-policy.html"
echo "• Termos de Uso: https://connectia.agenciapixel.digital/terms.html"
echo ""

echo -e "${GREEN}✅ A política de privacidade está pronta e em conformidade com os requisitos do Meta!${NC}"
