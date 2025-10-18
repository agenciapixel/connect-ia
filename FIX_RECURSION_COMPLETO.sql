-- =====================================================
-- FIX COMPLETO: INFINITE RECURSION (MEMBERS + ORGS)
-- =====================================================
-- Execute este SQL no painel do Supabase (SQL Editor)
-- URL: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/sql
-- =====================================================

-- =====================================================
-- PARTE 1: LIMPAR TODAS AS POLICIES (MEMBERS + ORGS)
-- =====================================================

-- 1.1 Remover TODAS as policies da tabela MEMBERS
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'members'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.members';
        RAISE NOTICE 'Removida policy: %', pol.policyname;
    END LOOP;
END $$;

-- 1.2 Remover TODAS as policies da tabela ORGS
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'orgs'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.orgs';
        RAISE NOTICE 'Removida policy: %', pol.policyname;
    END LOOP;
END $$;

-- =====================================================
-- PARTE 2: CRIAR POLICIES SIMPLES (SEM RECURSÃO)
-- =====================================================

-- 2.1 MEMBERS: Policies baseadas apenas em auth.uid()
-- Usuário pode ver seus próprios memberships
CREATE POLICY "members_select_policy" ON public.members
    FOR SELECT
    USING (user_id = auth.uid());

-- Usuário pode criar seu próprio membership (registro inicial)
CREATE POLICY "members_insert_policy" ON public.members
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Usuário pode atualizar seu próprio membership
CREATE POLICY "members_update_policy" ON public.members
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Usuário pode deletar seu próprio membership
CREATE POLICY "members_delete_policy" ON public.members
    FOR DELETE
    USING (user_id = auth.uid());

-- 2.2 ORGS: Policies baseadas em owner_id (sem JOIN com members)
-- Usuário pode ver organizações onde é owner
CREATE POLICY "orgs_select_owner" ON public.orgs
    FOR SELECT
    USING (owner_id = auth.uid());

-- Usuário pode ver organizações onde é membro (via subquery simples)
CREATE POLICY "orgs_select_member" ON public.orgs
    FOR SELECT
    USING (
        id IN (
            SELECT org_id
            FROM public.members
            WHERE user_id = auth.uid()
        )
    );

-- Apenas owner pode criar organizações
CREATE POLICY "orgs_insert_policy" ON public.orgs
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Apenas owner pode atualizar sua organização
CREATE POLICY "orgs_update_policy" ON public.orgs
    FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Apenas owner pode deletar sua organização
CREATE POLICY "orgs_delete_policy" ON public.orgs
    FOR DELETE
    USING (owner_id = auth.uid());

-- =====================================================
-- PARTE 3: GARANTIR RLS ATIVADO
-- =====================================================

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 4: VERIFICAÇÃO E LOG
-- =====================================================

DO $$
DECLARE
    members_count INTEGER;
    orgs_count INTEGER;
BEGIN
    -- Contar policies criadas
    SELECT COUNT(*) INTO members_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'members';

    SELECT COUNT(*) INTO orgs_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orgs';

    RAISE NOTICE '';
    RAISE NOTICE '✅ CORREÇÃO COMPLETA APLICADA COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Estatísticas:';
    RAISE NOTICE '   - Policies em MEMBERS: %', members_count;
    RAISE NOTICE '   - Policies em ORGS: %', orgs_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔓 Mudanças aplicadas:';
    RAISE NOTICE '   ✓ Removidas TODAS as policies antigas (members + orgs)';
    RAISE NOTICE '   ✓ Criadas policies simples baseadas em auth.uid()';
    RAISE NOTICE '   ✓ Policies de ORGS usam subquery (não JOIN)';
    RAISE NOTICE '   ✓ RLS ativado em ambas as tabelas';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Próximos passos:';
    RAISE NOTICE '   1. Limpe o cache do navegador (Ctrl+Shift+R)';
    RAISE NOTICE '   2. Faça logout e login novamente';
    RAISE NOTICE '   3. Verifique se o erro de recursão sumiu';
    RAISE NOTICE '';
END $$;
