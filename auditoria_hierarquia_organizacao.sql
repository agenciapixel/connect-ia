-- Script de Auditoria da Hierarquia Organização > Usuários
-- Este script verifica se todas as tabelas seguem a hierarquia correta

-- 1. Verificar estrutura da hierarquia
SELECT 
    'ESTRUTURA DA HIERARQUIA' as categoria,
    'orgs' as tabela_pai,
    'Tabela principal de organizações' as descricao
UNION ALL
SELECT 
    'ESTRUTURA DA HIERARQUIA',
    'members',
    'Relaciona usuários com organizações (user_id + org_id)'
UNION ALL
SELECT 
    'ESTRUTURA DA HIERARQUIA',
    'channel_accounts',
    'Canais de comunicação por organização'
UNION ALL
SELECT 
    'ESTRUTURA DA HIERARQUIA',
    'prospects',
    'Prospects qualificados por organização'
UNION ALL
SELECT 
    'ESTRUTURA DA HIERARQUIA',
    'attendants',
    'Atendentes por organização'
UNION ALL
SELECT 
    'ESTRUTURA DA HIERARQUIA',
    'contacts',
    'Contatos por organização'
UNION ALL
SELECT 
    'ESTRUTURA DA HIERARQUIA',
    'conversations',
    'Conversas por organização'
UNION ALL
SELECT 
    'ESTRUTURA DA HIERARQUIA',
    'messages',
    'Mensagens através de conversations (indireto)';

-- 2. Verificar foreign keys para orgs
SELECT 
    'FOREIGN KEYS PARA ORGS' as categoria,
    tc.table_name as tabela_filha,
    kcu.column_name as coluna_fk,
    CASE 
        WHEN ccu.table_name = 'orgs' THEN '✅ CORRETO'
        ELSE '❌ INCORRETO - Referencia ' || ccu.table_name
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND kcu.column_name = 'org_id'
ORDER BY tc.table_name;

-- 3. Verificar dados órfãos (registros sem organização válida)
SELECT 
    'DADOS ÓRFÃOS' as categoria,
    'members' as tabela,
    COUNT(*) as registros_orfãos
FROM public.members m
LEFT JOIN public.orgs o ON m.org_id = o.id
WHERE o.id IS NULL
UNION ALL
SELECT 
    'DADOS ÓRFÃOS',
    'channel_accounts',
    COUNT(*)
FROM public.channel_accounts ca
LEFT JOIN public.orgs o ON ca.org_id = o.id
WHERE o.id IS NULL
UNION ALL
SELECT 
    'DADOS ÓRFÃOS',
    'prospects',
    COUNT(*)
FROM public.prospects p
LEFT JOIN public.orgs o ON p.org_id = o.id
WHERE o.id IS NULL
UNION ALL
SELECT 
    'DADOS ÓRFÃOS',
    'attendants',
    COUNT(*)
FROM public.attendants a
LEFT JOIN public.orgs o ON a.org_id = o.id
WHERE o.id IS NULL
UNION ALL
SELECT 
    'DADOS ÓRFÃOS',
    'contacts',
    COUNT(*)
FROM public.contacts c
LEFT JOIN public.orgs o ON c.org_id = o.id
WHERE o.id IS NULL
UNION ALL
SELECT 
    'DADOS ÓRFÃOS',
    'conversations',
    COUNT(*)
FROM public.conversations conv
LEFT JOIN public.orgs o ON conv.org_id = o.id
WHERE o.id IS NULL;

-- 4. Verificar políticas RLS (Row Level Security)
SELECT 
    'POLÍTICAS RLS' as categoria,
    tablename as tabela,
    policyname as politica,
    CASE 
        WHEN policyname LIKE '%org%' THEN '✅ Baseada em organização'
        ELSE '⚠️ Não baseada em organização'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('orgs', 'members', 'channel_accounts', 'prospects', 'attendants', 'contacts', 'conversations')
ORDER BY tablename, policyname;

-- 5. Verificar isolamento por organização
SELECT 
    'ISOLAMENTO POR ORGANIZAÇÃO' as categoria,
    'orgs' as tabela,
    COUNT(*) as total_organizacoes,
    COUNT(DISTINCT id) as organizacoes_unicas
FROM public.orgs
UNION ALL
SELECT 
    'ISOLAMENTO POR ORGANIZAÇÃO',
    'members',
    COUNT(*) as total_membros,
    COUNT(DISTINCT org_id) as organizacoes_com_membros
FROM public.members
UNION ALL
SELECT 
    'ISOLAMENTO POR ORGANIZAÇÃO',
    'channel_accounts',
    COUNT(*) as total_canais,
    COUNT(DISTINCT org_id) as organizacoes_com_canais
FROM public.channel_accounts
UNION ALL
SELECT 
    'ISOLAMENTO POR ORGANIZAÇÃO',
    'prospects',
    COUNT(*) as total_prospects,
    COUNT(DISTINCT org_id) as organizacoes_com_prospects
FROM public.prospects
UNION ALL
SELECT 
    'ISOLAMENTO POR ORGANIZAÇÃO',
    'attendants',
    COUNT(*) as total_atendentes,
    COUNT(DISTINCT org_id) as organizacoes_com_atendentes
FROM public.attendants
UNION ALL
SELECT 
    'ISOLAMENTO POR ORGANIZAÇÃO',
    'contacts',
    COUNT(*) as total_contatos,
    COUNT(DISTINCT org_id) as organizacoes_com_contatos
FROM public.contacts
UNION ALL
SELECT 
    'ISOLAMENTO POR ORGANIZAÇÃO',
    'conversations',
    COUNT(*) as total_conversas,
    COUNT(DISTINCT org_id) as organizacoes_com_conversas
FROM public.conversations;

-- 6. Verificar usuários e suas organizações
SELECT 
    'USUÁRIOS E ORGANIZAÇÕES' as categoria,
    u.email as usuario,
    o.name as organizacao,
    m.role as papel,
    CASE 
        WHEN m.role = 'admin' THEN '✅ Administrador'
        WHEN m.role = 'member' THEN '👤 Membro'
        ELSE '❓ Papel desconhecido: ' || m.role
    END as status_papel
FROM auth.users u
JOIN public.members m ON u.id = m.user_id
JOIN public.orgs o ON m.org_id = o.id
ORDER BY o.name, m.role, u.email;

-- 7. Verificar integridade referencial
SELECT 
    'INTEGRIDADE REFERENCIAL' as categoria,
    'messages -> conversations' as relacionamento,
    COUNT(*) as total_mensagens,
    COUNT(DISTINCT m.conversation_id) as conversas_com_mensagens,
    COUNT(DISTINCT c.id) as conversas_validas,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT m.conversation_id) THEN '✅ INTEGRO'
        ELSE '❌ PROBLEMA - Mensagens órfãs'
    END as status
FROM public.messages m
LEFT JOIN public.conversations c ON m.conversation_id = c.id;

-- 8. Resumo da auditoria
SELECT 
    'RESUMO DA AUDITORIA' as categoria,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.orgs) > 0 THEN '✅ Organizações existem'
        ELSE '❌ Nenhuma organização encontrada'
    END as organizacoes,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.members) > 0 THEN '✅ Membros existem'
        ELSE '❌ Nenhum membro encontrado'
    END as membros,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name LIKE '%org_id_fkey%' 
            AND table_schema = 'public'
        ) THEN '✅ Foreign keys configuradas'
        ELSE '❌ Foreign keys não configuradas'
    END as foreign_keys,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND policyname LIKE '%org%'
        ) THEN '✅ RLS baseado em organização'
        ELSE '❌ RLS não baseado em organização'
    END as rls;
