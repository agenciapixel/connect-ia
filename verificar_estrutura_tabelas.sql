-- Script para verificar a estrutura das tabelas do sistema Connect IA
-- Execute este script primeiro para entender a estrutura atual

-- 1. Verificar tabelas existentes
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'organizations', 'members', 'channel_accounts', 
    'conversations', 'messages', 'prospects', 
    'attendants', 'contacts'
)
ORDER BY table_name;

-- 2. Verificar colunas da tabela messages
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar colunas da tabela conversations
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar colunas da tabela contacts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contacts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar relacionamentos (foreign keys)
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('messages', 'conversations', 'contacts', 'attendants')
ORDER BY tc.table_name, kcu.column_name;

-- 6. Verificar dados existentes
SELECT 'organizations' as tabela, COUNT(*) as total FROM public.organizations
UNION ALL
SELECT 'members', COUNT(*) FROM public.members
UNION ALL
SELECT 'channel_accounts', COUNT(*) FROM public.channel_accounts
UNION ALL
SELECT 'conversations', COUNT(*) FROM public.conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM public.messages
UNION ALL
SELECT 'prospects', COUNT(*) FROM public.prospects
UNION ALL
SELECT 'attendants', COUNT(*) FROM public.attendants
UNION ALL
SELECT 'contacts', COUNT(*) FROM public.contacts;

-- 7. Verificar políticas RLS ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('organizations', 'members', 'channel_accounts', 'conversations', 'messages', 'prospects', 'attendants', 'contacts')
ORDER BY tablename, policyname;
