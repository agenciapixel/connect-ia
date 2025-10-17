#!/bin/bash

# Script para verificar o estado do banco de dados e testar integrações
# Este script verifica se o sistema está funcionando corretamente

echo "🔍 Verificando estado do sistema Connect IA..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para criar query de verificação
create_check_query() {
    local table="$1"
    local description="$2"
    
    echo -e "${BLUE}📊 Verificando: $description${NC}"
    
    echo "-- Verificar $description" >> check_database.sql
    echo "SELECT COUNT(*) as total_$table FROM public.$table;" >> check_database.sql
    echo "SELECT * FROM public.$table LIMIT 5;" >> check_database.sql
    echo "" >> check_database.sql
}

# Limpar arquivo SQL anterior
rm -f check_database.sql

echo -e "${YELLOW}📋 Criando script de verificação...${NC}"
echo ""

# Verificar tabelas principais
create_check_query "organizations" "Organizações"
create_check_query "members" "Membros"
create_check_query "channel_accounts" "Contas de Canal"
create_check_query "conversations" "Conversas"
create_check_query "messages" "Mensagens"
create_check_query "prospects" "Prospects"
create_check_query "attendants" "Atendentes"

# Verificar integrações
echo "-- Verificar integrações ativas" >> check_database.sql
echo "SELECT channel_type, COUNT(*) as total FROM public.channel_accounts WHERE status = 'active' GROUP BY channel_type;" >> check_database.sql
echo "" >> check_database.sql

# Verificar usuários ativos
echo "-- Verificar usuários ativos" >> check_database.sql
echo "SELECT u.email, m.role, o.name as org_name FROM auth.users u JOIN public.members m ON u.id = m.user_id JOIN public.organizations o ON m.org_id = o.id;" >> check_database.sql
echo "" >> check_database.sql

# Verificar estatísticas gerais
echo "-- Estatísticas gerais do sistema" >> check_database.sql
echo "SELECT " >> check_database.sql
echo "  (SELECT COUNT(*) FROM public.organizations) as total_organizations," >> check_database.sql
echo "  (SELECT COUNT(*) FROM public.members) as total_members," >> check_database.sql
echo "  (SELECT COUNT(*) FROM public.channel_accounts WHERE status = 'active') as active_channels," >> check_database.sql
echo "  (SELECT COUNT(*) FROM public.conversations) as total_conversations," >> check_database.sql
echo "  (SELECT COUNT(*) FROM public.messages) as total_messages," >> check_database.sql
echo "  (SELECT COUNT(*) FROM public.prospects) as total_prospects," >> check_database.sql
echo "  (SELECT COUNT(*) FROM public.attendants) as total_attendants;" >> check_database.sql
echo "" >> check_database.sql

echo -e "${GREEN}✅ Script de verificação criado: check_database.sql${NC}"
echo ""

# Criar script de teste das integrações
echo -e "${BLUE}🧪 Criando script de teste das integrações...${NC}"

cat > test_integrations.sql << 'EOF'
-- Teste das integrações do sistema Connect IA

-- 1. Testar criação de organização
INSERT INTO public.organizations (id, name, description) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Connect IA', 'Organização principal')
ON CONFLICT (id) DO NOTHING;

-- 2. Testar criação de canal WhatsApp
INSERT INTO public.channel_accounts (org_id, channel_type, name, credentials_json, status)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'whatsapp',
    'WhatsApp Principal',
    '{"phone_number": "+5511999999999", "webhook_url": "https://connectia.agenciapixel.digital/api/webhook"}',
    'active'
) ON CONFLICT DO NOTHING;

-- 3. Testar criação de canal Instagram
INSERT INTO public.channel_accounts (org_id, channel_type, name, credentials_json, status)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'instagram',
    'Instagram Principal',
    '{"instagram_account_id": "123456789", "access_token": "EAAG..."}',
    'active'
) ON CONFLICT DO NOTHING;

-- 4. Testar criação de atendente
INSERT INTO public.attendants (org_id, full_name, email, department, position, status, max_concurrent_chats)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Atendente Principal',
    'atendente@connectia.com',
    'atendimento',
    'Atendente Sênior',
    'offline',
    5
) ON CONFLICT DO NOTHING;

-- 5. Verificar se tudo foi criado
SELECT 'Organizações' as tabela, COUNT(*) as total FROM public.organizations
UNION ALL
SELECT 'Canais Ativos', COUNT(*) FROM public.channel_accounts WHERE status = 'active'
UNION ALL
SELECT 'Atendentes', COUNT(*) FROM public.attendants
UNION ALL
SELECT 'Membros', COUNT(*) FROM public.members;
EOF

echo -e "${GREEN}✅ Script de teste criado: test_integrations.sql${NC}"
echo ""

# Criar script de configuração inicial
echo -e "${BLUE}⚙️ Criando script de configuração inicial...${NC}"

cat > setup_initial_data.sql << 'EOF'
-- Configuração inicial do sistema Connect IA

-- 1. Garantir que a organização principal existe
INSERT INTO public.organizations (
    id,
    name,
    description,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Connect IA',
    'Sistema de CRM com IA para WhatsApp Business',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 2. Configurar usuário atual como admin (se autenticado)
INSERT INTO public.members (
    user_id,
    org_id,
    role,
    created_at,
    updated_at
) 
SELECT 
    auth.uid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin'::member_role,
    NOW(),
    NOW()
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, org_id) DO UPDATE SET
    role = 'admin'::member_role,
    updated_at = NOW();

-- 3. Criar atendente padrão
INSERT INTO public.attendants (
    org_id,
    full_name,
    email,
    department,
    position,
    status,
    max_concurrent_chats,
    auto_accept,
    skills,
    specializations
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Atendente Automático',
    'bot@connectia.com',
    'atendimento',
    'Atendente IA',
    'online',
    10,
    true,
    ARRAY['WhatsApp', 'Instagram', 'IA', 'Atendimento'],
    ARRAY['Suporte', 'Vendas', 'Qualificação']
) ON CONFLICT (email) DO NOTHING;

-- 4. Verificar configuração
SELECT 
    'Configuração Inicial' as status,
    (SELECT COUNT(*) FROM public.organizations) as organizacoes,
    (SELECT COUNT(*) FROM public.members) as membros,
    (SELECT COUNT(*) FROM public.attendants) as atendentes;
EOF

echo -e "${GREEN}✅ Script de configuração criado: setup_initial_data.sql${NC}"
echo ""

echo -e "${YELLOW}📋 Arquivos criados:${NC}"
echo "1. check_database.sql - Verificar estado atual"
echo "2. test_integrations.sql - Testar integrações"
echo "3. setup_initial_data.sql - Configuração inicial"
echo "4. cleanup_database.sql - Limpeza do banco"
echo ""

echo -e "${BLUE}💡 Como usar:${NC}"
echo "1. Execute setup_initial_data.sql primeiro"
echo "2. Execute check_database.sql para verificar"
echo "3. Execute test_integrations.sql para testar"
echo "4. Execute cleanup_database.sql se necessário"
echo ""

echo -e "${GREEN}🎉 Scripts de verificação e configuração criados!${NC}"
