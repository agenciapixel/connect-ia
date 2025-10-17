-- Script para limpar tabelas do Supabase
-- Execute este script no Supabase Dashboard > SQL Editor

-- ========================================
-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- ========================================

-- Desabilitar RLS em todas as tabelas para permitir limpeza
ALTER TABLE IF EXISTS public.agent_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendant_availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendant_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendant_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendant_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendant_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaign_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.channel_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversation_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orgs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.places DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prospect_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prospects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usage_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. LIMPAR DADOS DAS TABELAS (ORDEM CORRETA)
-- ========================================

-- Limpar tabelas dependentes primeiro
DELETE FROM public.agent_conversations;
DELETE FROM public.attendant_availability;
DELETE FROM public.attendant_metrics;
DELETE FROM public.attendant_notes;
DELETE FROM public.attendant_sessions;
DELETE FROM public.attendant_templates;
DELETE FROM public.campaign_messages;
DELETE FROM public.conversation_assignments;
DELETE FROM public.messages;
DELETE FROM public.prospect_activities;
DELETE FROM public.usage_tracking;
DELETE FROM public.user_roles;

-- Limpar tabelas principais
DELETE FROM public.ai_agents;
DELETE FROM public.attendants;
DELETE FROM public.campaigns;
DELETE FROM public.channel_accounts;
DELETE FROM public.consents;
DELETE FROM public.conversations;
DELETE FROM public.contacts;
DELETE FROM public.members;
DELETE FROM public.places;
DELETE FROM public.prospects;
DELETE FROM public.templates;

-- Limpar tabelas de organizações
DELETE FROM public.organizations;
DELETE FROM public.orgs;

-- Limpar perfis (manter apenas estrutura)
DELETE FROM public.profiles;

-- ========================================
-- 3. REABILITAR RLS
-- ========================================

-- Reabilitar RLS em todas as tabelas
ALTER TABLE IF EXISTS public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendant_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendant_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendant_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.channel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prospect_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. VERIFICAÇÕES FINAIS
-- ========================================

-- Verificar se as tabelas estão vazias
SELECT 
    schemaname,
    relname as tablename,
    n_tup_ins as total_inserts,
    n_tup_upd as total_updates,
    n_tup_del as total_deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY relname;

-- Verificar contagem de registros em cada tabela
SELECT 
    'agent_conversations' as tabela, COUNT(*) as registros FROM public.agent_conversations
UNION ALL
SELECT 'ai_agents', COUNT(*) FROM public.ai_agents
UNION ALL
SELECT 'attendant_availability', COUNT(*) FROM public.attendant_availability
UNION ALL
SELECT 'attendant_metrics', COUNT(*) FROM public.attendant_metrics
UNION ALL
SELECT 'attendant_notes', COUNT(*) FROM public.attendant_notes
UNION ALL
SELECT 'attendant_sessions', COUNT(*) FROM public.attendant_sessions
UNION ALL
SELECT 'attendant_templates', COUNT(*) FROM public.attendant_templates
UNION ALL
SELECT 'attendants', COUNT(*) FROM public.attendants
UNION ALL
SELECT 'campaign_messages', COUNT(*) FROM public.campaign_messages
UNION ALL
SELECT 'campaigns', COUNT(*) FROM public.campaigns
UNION ALL
SELECT 'channel_accounts', COUNT(*) FROM public.channel_accounts
UNION ALL
SELECT 'consents', COUNT(*) FROM public.consents
UNION ALL
SELECT 'conversation_assignments', COUNT(*) FROM public.conversation_assignments
UNION ALL
SELECT 'conversations', COUNT(*) FROM public.conversations
UNION ALL
SELECT 'contacts', COUNT(*) FROM public.contacts
UNION ALL
SELECT 'members', COUNT(*) FROM public.members
UNION ALL
SELECT 'messages', COUNT(*) FROM public.messages
UNION ALL
SELECT 'orgs', COUNT(*) FROM public.orgs
UNION ALL
SELECT 'organizations', COUNT(*) FROM public.organizations
UNION ALL
SELECT 'places', COUNT(*) FROM public.places
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles
UNION ALL
SELECT 'prospect_activities', COUNT(*) FROM public.prospect_activities
UNION ALL
SELECT 'prospects', COUNT(*) FROM public.prospects
UNION ALL
SELECT 'templates', COUNT(*) FROM public.templates
UNION ALL
SELECT 'usage_tracking', COUNT(*) FROM public.usage_tracking
UNION ALL
SELECT 'user_roles', COUNT(*) FROM public.user_roles
ORDER BY registros DESC;

-- Verificar se RLS está ativo
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
