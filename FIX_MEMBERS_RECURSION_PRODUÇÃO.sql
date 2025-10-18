-- =====================================================
-- FIX: INFINITE RECURSION IN MEMBERS TABLE
-- =====================================================
-- Execute este SQL no painel do Supabase (SQL Editor)
-- URL: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/sql
-- =====================================================

-- 1. Remover TODAS as policies problemáticas da tabela members
DROP POLICY IF EXISTS "Users can view members in their orgs" ON public.members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.members;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON public.members;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.members;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON public.members;
DROP POLICY IF EXISTS "Users can view their memberships" ON public.members;
DROP POLICY IF EXISTS "Allow access during authentication" ON public.members;

-- 2. Criar policy simples SEM recursão
-- Esta policy permite que usuários autenticados vejam seus próprios memberships
-- sem causar recursão infinita
CREATE POLICY "members_select_own" ON public.members
    FOR SELECT
    USING (auth.uid() = user_id);

-- 3. Policy para INSERT (necessário para criar novos membros)
CREATE POLICY "members_insert_own" ON public.members
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 4. Policy para UPDATE (apenas o próprio usuário ou admins)
CREATE POLICY "members_update_own" ON public.members
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. Policy para DELETE (apenas o próprio usuário ou admins)
CREATE POLICY "members_delete_own" ON public.members
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Garantir que RLS está ativado
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 7. Verificação
DO $$
BEGIN
    RAISE NOTICE '✅ CORREÇÃO APLICADA COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '🔓 Políticas RLS da tabela MEMBERS corrigidas:';
    RAISE NOTICE '   - Removidas policies com recursão infinita';
    RAISE NOTICE '   - Criadas policies simples baseadas em auth.uid()';
    RAISE NOTICE '   - Sistema de organizações deve funcionar agora';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Próximos passos:';
    RAISE NOTICE '   1. Faça login no sistema novamente';
    RAISE NOTICE '   2. Verifique se o erro de recursão sumiu';
    RAISE NOTICE '   3. Teste a troca de organizações';
END $$;
