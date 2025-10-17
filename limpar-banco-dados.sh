#!/bin/bash

# Script para limpar e configurar o banco de dados Supabase
# Este script remove dados de teste e configura o sistema para produção

echo "🧹 Iniciando limpeza e configuração do banco de dados..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para executar SQL no Supabase
execute_sql() {
    local sql="$1"
    local description="$2"
    
    echo -e "${BLUE}📝 $description${NC}"
    
    # Aqui você pode usar o Supabase CLI ou conectar diretamente
    # Por enquanto, vamos criar um arquivo SQL para execução manual
    echo "-- $description" >> cleanup_database.sql
    echo "$sql" >> cleanup_database.sql
    echo "" >> cleanup_database.sql
}

# Limpar arquivo SQL anterior
rm -f cleanup_database.sql

echo -e "${YELLOW}⚠️  ATENÇÃO: Este script irá limpar dados de teste do banco de dados!${NC}"
echo -e "${YELLOW}   Certifique-se de fazer backup antes de executar.${NC}"
echo ""

# 1. Limpar dados de teste dos atendentes
execute_sql "
-- Limpar atendentes de teste
DELETE FROM public.attendants 
WHERE org_id = '00000000-0000-0000-0000-000000000001' 
AND email IN ('joao@empresa.com', 'maria@empresa.com', 'pedro@empresa.com');
" "Removendo atendentes de teste"

# 2. Limpar conversas de teste
execute_sql "
-- Limpar conversas de teste
DELETE FROM public.conversations 
WHERE org_id = '00000000-0000-0000-0000-000000000000' 
AND created_at < NOW() - INTERVAL '1 day';
" "Removendo conversas antigas de teste"

# 3. Limpar mensagens de teste
execute_sql "
-- Limpar mensagens de teste
DELETE FROM public.messages 
WHERE org_id = '00000000-0000-0000-0000-000000000000' 
AND created_at < NOW() - INTERVAL '1 day';
" "Removendo mensagens antigas de teste"

# 4. Limpar prospects de teste
execute_sql "
-- Limpar prospects de teste
DELETE FROM public.prospects 
WHERE org_id = '00000000-0000-0000-0000-000000000000' 
AND created_at < NOW() - INTERVAL '1 day';
" "Removendo prospects antigos de teste"

# 5. Limpar canais de teste
execute_sql "
-- Limpar canais de teste
DELETE FROM public.channel_accounts 
WHERE org_id = '00000000-0000-0000-0000-000000000000' 
AND name LIKE '%teste%' OR name LIKE '%test%';
" "Removendo canais de teste"

# 6. Resetar contadores
execute_sql "
-- Resetar contadores de atendentes
UPDATE public.attendants 
SET 
    total_chats = 0,
    avg_response_time = 0,
    satisfaction_score = 0.0,
    last_activity_at = NULL
WHERE org_id = '00000000-0000-0000-0000-000000000000';
" "Resetando contadores de atendentes"

# 7. Limpar sessões antigas
execute_sql "
-- Limpar sessões antigas de atendentes
DELETE FROM public.attendant_sessions 
WHERE ended_at IS NOT NULL 
AND ended_at < NOW() - INTERVAL '7 days';
" "Removendo sessões antigas de atendentes"

# 8. Limpar métricas antigas
execute_sql "
-- Limpar métricas antigas
DELETE FROM public.attendant_metrics 
WHERE period_end < NOW() - INTERVAL '30 days';
" "Removendo métricas antigas"

# 9. Configurar organização padrão
execute_sql "
-- Configurar organização padrão
INSERT INTO public.organizations (
    id,
    name,
    description,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Connect IA',
    'Organização principal do sistema Connect IA',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();
" "Configurando organização padrão"

# 10. Configurar usuário como admin
execute_sql "
-- Configurar usuário atual como admin
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
" "Configurando usuário como administrador"

# 11. Criar índices para performance
execute_sql "
-- Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_messages_org_created ON public.messages(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_org_status ON public.conversations(org_id, status);
CREATE INDEX IF NOT EXISTS idx_prospects_org_created ON public.prospects(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_accounts_org_status ON public.channel_accounts(org_id, status);
" "Criando índices para performance"

# 12. Configurar políticas RLS
execute_sql "
-- Verificar e corrigir políticas RLS
-- As políticas já estão definidas nas migrações, mas vamos garantir que estão ativas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendants ENABLE ROW LEVEL SECURITY;
" "Configurando políticas RLS"

echo ""
echo -e "${GREEN}✅ Script de limpeza criado: cleanup_database.sql${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo "1. Execute o arquivo cleanup_database.sql no Supabase"
echo "2. Verifique se todas as tabelas estão limpas"
echo "3. Teste o sistema para garantir que está funcionando"
echo ""
echo -e "${BLUE}💡 Para executar no Supabase:${NC}"
echo "   - Acesse o Supabase Dashboard"
echo "   - Vá para SQL Editor"
echo "   - Cole o conteúdo do arquivo cleanup_database.sql"
echo "   - Execute o script"
echo ""
echo -e "${GREEN}🎉 Sistema pronto para produção!${NC}"
