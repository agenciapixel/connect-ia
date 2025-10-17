-- Script definitivo para corrigir TODOS os warnings de segurança
-- Execute este script no Supabase Dashboard > SQL Editor

-- ========================================
-- CORRIGIR FUNCTION SEARCH PATH MUTABLE
-- ========================================

-- Forçar correção das 3 funções problemáticas
DROP FUNCTION IF EXISTS public.insert_message(UUID, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.insert_message(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.check_plan_limit(UUID, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.check_plan_limit(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.record_usage(UUID, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.record_usage(UUID, TEXT) CASCADE;

-- Recriar insert_message com search_path fixo
CREATE FUNCTION public.insert_message(
    p_conversation_id UUID,
    p_content TEXT,
    p_sender_type TEXT,
    p_sender_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_message_id UUID;
BEGIN
    INSERT INTO public.messages (
        conversation_id,
        content,
        sender_type,
        sender_id,
        created_at
    ) VALUES (
        p_conversation_id,
        p_content,
        p_sender_type,
        p_sender_id,
        NOW()
    ) RETURNING id INTO new_message_id;
    
    RETURN new_message_id;
END;
$$;

-- Recriar check_plan_limit com search_path fixo
CREATE FUNCTION public.check_plan_limit(
    p_org_id UUID,
    p_metric_type TEXT,
    p_requested_count INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_usage INTEGER := 0;
    plan_limit INTEGER := 0;
BEGIN
    -- Buscar uso atual
    SELECT COALESCE(SUM(count), 0) INTO current_usage
    FROM public.usage_tracking
    WHERE org_id = p_org_id
    AND metric_type = p_metric_type
    AND period_start >= date_trunc('month', CURRENT_DATE)
    AND period_end <= date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day';
    
    -- Buscar limite do plano
    SELECT 
        CASE p_metric_type
            WHEN 'contacts' THEN p.limits->>'contacts'
            WHEN 'campaigns_per_month' THEN p.limits->>'campaigns_per_month'
            WHEN 'integrations' THEN p.limits->>'integrations'
            WHEN 'ai_agents' THEN p.limits->>'ai_agents'
            WHEN 'google_places_searches' THEN p.limits->>'google_places_searches'
            ELSE '0'
        END::INTEGER INTO plan_limit
    FROM public.orgs o
    JOIN public.plans p ON o.plan_id = p.id
    WHERE o.id = p_org_id;
    
    -- Verificar se pode usar
    IF plan_limit = -1 THEN
        RETURN TRUE; -- Ilimitado
    END IF;
    
    RETURN (current_usage + p_requested_count) <= plan_limit;
END;
$$;

-- Recriar record_usage com search_path fixo
CREATE FUNCTION public.record_usage(
    p_org_id UUID,
    p_metric_type TEXT,
    p_count INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_month_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
    current_month_end DATE := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
BEGIN
    INSERT INTO public.usage_tracking (
        org_id,
        metric_type,
        count,
        period_start,
        period_end
    ) VALUES (
        p_org_id,
        p_metric_type,
        p_count,
        current_month_start,
        current_month_end
    )
    ON CONFLICT (org_id, metric_type, period_start, period_end)
    DO UPDATE SET
        count = usage_tracking.count + p_count,
        updated_at = NOW();
END;
$$;

-- ========================================
-- CORRIGIR WARNINGS RLS AUTHORIZED_USERS
-- ========================================

-- Remover políticas RLS existentes
DROP POLICY IF EXISTS "Users can view own authorized status" ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can manage authorized users" ON public.authorized_users;
DROP POLICY IF EXISTS "Optimized select policy for authorized_users" ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can insert authorized users" ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can update authorized users" ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can delete authorized users" ON public.authorized_users;

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

-- Verificar funções corrigidas
SELECT 
    routine_name as funcao,
    routine_type as tipo,
    security_type as seguranca
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'insert_message',
    'check_plan_limit',
    'record_usage'
)
ORDER BY routine_name;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'authorized_users'
ORDER BY policyname;

-- Status final
SELECT 
    'Script executado com sucesso' as status,
    'Aguarde alguns minutos para o linter atualizar' as observacao;
