-- Script para forçar correção dos warnings persistentes
-- Execute este script no Supabase Dashboard > SQL Editor

-- ========================================
-- FORÇAR ATUALIZAÇÃO DAS FUNÇÕES
-- ========================================

-- Remover e recriar insert_message com força
DROP FUNCTION IF EXISTS public.insert_message(UUID, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.insert_message(UUID, TEXT, TEXT) CASCADE;

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

-- Remover e recriar check_plan_limit com força
DROP FUNCTION IF EXISTS public.check_plan_limit(UUID, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.check_plan_limit(UUID, TEXT) CASCADE;

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

-- Remover e recriar record_usage com força
DROP FUNCTION IF EXISTS public.record_usage(UUID, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.record_usage(UUID, TEXT) CASCADE;

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
-- VERIFICAÇÕES DETALHADAS
-- ========================================

-- Verificar definições das funções
SELECT 
    routine_name as funcao,
    routine_type as tipo,
    security_type as seguranca,
    routine_definition as definicao
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'insert_message',
    'check_plan_limit',
    'record_usage'
)
ORDER BY routine_name;

-- Verificar se search_path está definido
SELECT 
    'Verificação search_path' as status,
    'Funções recriadas com SET search_path = public' as resultado;
