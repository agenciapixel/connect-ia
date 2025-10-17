-- Script para corrigir warnings de segurança finais
-- Execute este script no Supabase Dashboard > SQL Editor

-- ========================================
-- 1. CORRIGIR FUNCTION SEARCH PATH MUTABLE
-- ========================================

-- Recriar funções com SECURITY DEFINER e search_path fixo
CREATE OR REPLACE FUNCTION public.is_user_authorized(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = user_email
        AND is_active = true
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.add_authorized_user(
    user_email TEXT,
    user_name TEXT,
    user_role TEXT DEFAULT 'user'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_user_id UUID;
BEGIN
    INSERT INTO public.authorized_users (email, name, role)
    VALUES (user_email, user_name, user_role)
    ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        is_active = true,
        updated_at = NOW()
    RETURNING id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_authorized_user(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.authorized_users
    SET is_active = false, updated_at = NOW()
    WHERE email = user_email;
    
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_authorized_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    role TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.email,
        au.name,
        au.role,
        au.is_active,
        au.created_at,
        au.updated_at
    FROM public.authorized_users au
    ORDER BY au.created_at DESC;
END;
$$;

-- ========================================
-- 2. CORRIGIR OUTRAS FUNÇÕES COM SEARCH_PATH
-- ========================================

-- Remover funções existentes primeiro
DROP FUNCTION IF EXISTS public.check_plan_limit(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.record_usage(UUID, TEXT, INTEGER);

-- Recriar funções existentes com search_path fixo
CREATE OR REPLACE FUNCTION public.check_plan_limit(
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

CREATE OR REPLACE FUNCTION public.record_usage(
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
-- 3. VERIFICAÇÕES FINAIS
-- ========================================

-- Verificar se as funções foram corrigidas
SELECT 
    routine_name as funcao,
    routine_type as tipo,
    security_type as seguranca
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'is_user_authorized',
    'add_authorized_user', 
    'remove_authorized_user',
    'get_authorized_users',
    'check_plan_limit',
    'record_usage'
)
ORDER BY routine_name;
