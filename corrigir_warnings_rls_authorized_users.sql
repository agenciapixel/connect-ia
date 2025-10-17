-- Script para corrigir warnings RLS da tabela authorized_users
-- Execute este script no Supabase Dashboard > SQL Editor

-- ========================================
-- CORRIGIR WARNINGS RLS AUTHORIZED_USERS
-- ========================================

-- Remover políticas RLS existentes
DROP POLICY IF EXISTS "Users can view own authorized status" ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can manage authorized users" ON public.authorized_users;

-- Recriar políticas RLS otimizadas
-- Política única para SELECT que combina ambas as condições
CREATE POLICY "Optimized select policy for authorized_users" ON public.authorized_users
    FOR SELECT USING (
        -- Usuários podem ver a si mesmos OU admins podem ver todos
        email = (SELECT auth.jwt() ->> 'email') OR
        EXISTS (
            SELECT 1 FROM public.members m
            JOIN public.orgs o ON m.org_id = o.id
            WHERE m.user_id = (SELECT auth.uid())
            AND m.role = 'admin'
        )
    );

-- Política para INSERT (apenas admins)
CREATE POLICY "Admins can insert authorized users" ON public.authorized_users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.members m
            JOIN public.orgs o ON m.org_id = o.id
            WHERE m.user_id = (SELECT auth.uid())
            AND m.role = 'admin'
        )
    );

-- Política para UPDATE (apenas admins)
CREATE POLICY "Admins can update authorized users" ON public.authorized_users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.members m
            JOIN public.orgs o ON m.org_id = o.id
            WHERE m.user_id = (SELECT auth.uid())
            AND m.role = 'admin'
        )
    );

-- Política para DELETE (apenas admins)
CREATE POLICY "Admins can delete authorized users" ON public.authorized_users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.members m
            JOIN public.orgs o ON m.org_id = o.id
            WHERE m.user_id = (SELECT auth.uid())
            AND m.role = 'admin'
        )
    );

-- ========================================
-- VERIFICAÇÕES FINAIS
-- ========================================

-- Verificar políticas RLS criadas
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
AND tablename = 'authorized_users'
ORDER BY policyname;

-- Contar políticas por ação
SELECT 
    cmd as acao,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'authorized_users'
GROUP BY cmd
ORDER BY cmd;

-- Status final dos warnings
SELECT 
    'Warnings RLS corrigidos' as status,
    'Políticas consolidadas' as resultado,
    'Performance otimizada' as beneficio;
