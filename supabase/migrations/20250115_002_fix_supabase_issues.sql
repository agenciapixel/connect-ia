-- Migração para corrigir issues do Supabase
-- Resolver conflitos de políticas RLS e estruturas duplicadas

-- 1. Remover políticas duplicadas primeiro
DROP POLICY IF EXISTS "Users can view attendants in their org" ON public.attendants;
DROP POLICY IF EXISTS "Users can insert attendants in their org" ON public.attendants;
DROP POLICY IF EXISTS "Users can update attendants in their org" ON public.attendants;
DROP POLICY IF EXISTS "Users can delete attendants in their org" ON public.attendants;

-- 2. Remover políticas duplicadas de conversation_assignments
DROP POLICY IF EXISTS "Users can view assignments in their org" ON public.conversation_assignments;
DROP POLICY IF EXISTS "Users can insert assignments in their org" ON public.conversation_assignments;
DROP POLICY IF EXISTS "Users can update assignments in their org" ON public.conversation_assignments;
DROP POLICY IF EXISTS "Users can delete assignments in their org" ON public.conversation_assignments;

-- 3. Remover políticas duplicadas de attendant_sessions
DROP POLICY IF EXISTS "Users can view sessions in their org" ON public.attendant_sessions;
DROP POLICY IF EXISTS "Users can insert sessions in their org" ON public.attendant_sessions;
DROP POLICY IF EXISTS "Users can update sessions in their org" ON public.attendant_sessions;
DROP POLICY IF EXISTS "Users can delete sessions in their org" ON public.attendant_sessions;

-- 4. Remover políticas duplicadas de attendant_metrics
DROP POLICY IF EXISTS "Users can view metrics in their org" ON public.attendant_metrics;
DROP POLICY IF EXISTS "Users can insert metrics in their org" ON public.attendant_metrics;
DROP POLICY IF EXISTS "Users can update metrics in their org" ON public.attendant_metrics;
DROP POLICY IF EXISTS "Users can delete metrics in their org" ON public.attendant_metrics;

-- 5. Remover políticas duplicadas de attendant_availability
DROP POLICY IF EXISTS "Users can view availability in their org" ON public.attendant_availability;
DROP POLICY IF EXISTS "Users can insert availability in their org" ON public.attendant_availability;
DROP POLICY IF EXISTS "Users can update availability in their org" ON public.attendant_availability;
DROP POLICY IF EXISTS "Users can delete availability in their org" ON public.attendant_availability;

-- 6. Verificar e corrigir tabela orgs
-- Primeiro, vamos verificar se há dados duplicados
DO $$
BEGIN
    -- Verificar se a tabela orgs tem dados válidos
    IF NOT EXISTS (SELECT 1 FROM public.orgs LIMIT 1) THEN
        -- Se não há dados em orgs, criar um registro padrão
        INSERT INTO public.orgs (id, name, slug, description, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'Organização Padrão',
            'organizacao-padrao',
            'Organização padrão do sistema',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 7. Garantir que todas as colunas necessárias existem em orgs
DO $$
BEGIN
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'description') THEN
        ALTER TABLE public.orgs ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'slug') THEN
        ALTER TABLE public.orgs ADD COLUMN slug TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'settings') THEN
        ALTER TABLE public.orgs ADD COLUMN settings JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'billing_info') THEN
        ALTER TABLE public.orgs ADD COLUMN billing_info JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'plan_id') THEN
        ALTER TABLE public.orgs ADD COLUMN plan_id TEXT REFERENCES public.plans(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'trial_ends_at') THEN
        ALTER TABLE public.orgs ADD COLUMN trial_ends_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'subscription_status') THEN
        ALTER TABLE public.orgs ADD COLUMN subscription_status TEXT DEFAULT 'active';
    END IF;
END $$;

-- 8. Garantir que members tem as colunas necessárias
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'created_at') THEN
        ALTER TABLE public.members ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'updated_at') THEN
        ALTER TABLE public.members ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 9. Criar enum member_role se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_role') THEN
        CREATE TYPE public.member_role AS ENUM ('admin', 'member');
    END IF;
END $$;

-- 10. Atualizar coluna role em members para usar o enum
DO $$
BEGIN
    -- Se a coluna role existe mas não é do tipo enum, alterar
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'role' AND data_type != 'USER-DEFINED') THEN
        -- Primeiro, converter valores existentes
        UPDATE public.members SET role = 'admin' WHERE role = 'manager' OR role = 'owner';
        UPDATE public.members SET role = 'member' WHERE role = 'user' OR role = 'employee';
        
        -- Depois alterar o tipo
        ALTER TABLE public.members ALTER COLUMN role TYPE public.member_role USING role::public.member_role;
    END IF;
END $$;

-- 11. Garantir que plans e usage_tracking existem
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) DEFAULT 0,
    price_yearly DECIMAL(10,2) DEFAULT 0,
    trial_days INTEGER DEFAULT 0,
    limits JSONB DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Inserir planos padrão se não existirem
INSERT INTO public.plans (id, name, description, price_monthly, price_yearly, trial_days, limits, features, is_active, is_popular) VALUES
('free', 'Gratuito', 'Plano gratuito com funcionalidades básicas', 0, 0, 14, 
 '{"contacts": 100, "campaigns_per_month": 5, "integrations": 1, "ai_agents": 1, "google_places_searches": 50, "estimated_cost_usd": 0, "price_usd": 0, "margin_percentage": 0}',
 '{"WhatsApp Business", "Instagram Inbox", "CRM Básico", "1 Agente IA", "50 buscas Google Places"}', 
 true, false),
('basic', 'Básico', 'Plano básico para pequenas empresas', 29.90, 299.00, 14,
 '{"contacts": 1000, "campaigns_per_month": 50, "integrations": 3, "ai_agents": 3, "google_places_searches": 500, "estimated_cost_usd": 15, "price_usd": 29.90, "margin_percentage": 50}',
 '{"WhatsApp Business", "Instagram Inbox", "CRM Completo", "3 Agentes IA", "500 buscas Google Places", "Relatórios Avançados"}',
 true, true),
('pro', 'Profissional', 'Plano profissional para empresas em crescimento', 79.90, 799.00, 14,
 '{"contacts": 5000, "campaigns_per_month": 200, "integrations": 5, "ai_agents": 10, "google_places_searches": 2000, "estimated_cost_usd": 40, "price_usd": 79.90, "margin_percentage": 50}',
 '{"WhatsApp Business", "Instagram Inbox", "CRM Avançado", "10 Agentes IA", "2000 buscas Google Places", "Relatórios Avançados", "Automações", "API Access"}',
 true, false),
('business', 'Empresarial', 'Plano empresarial para grandes empresas', 199.90, 1999.00, 14,
 '{"contacts": 25000, "campaigns_per_month": 1000, "integrations": 10, "ai_agents": 50, "google_places_searches": 10000, "estimated_cost_usd": 100, "price_usd": 199.90, "margin_percentage": 50}',
 '{"WhatsApp Business", "Instagram Inbox", "CRM Empresarial", "50 Agentes IA", "10000 buscas Google Places", "Relatórios Avançados", "Automações", "API Access", "Suporte Prioritário", "Treinamento"}',
 true, false)
ON CONFLICT (id) DO NOTHING;

-- 13. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_plans_active ON public.plans(is_active);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_org_period ON public.usage_tracking(org_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_metric ON public.usage_tracking(metric_type);

-- 14. Habilitar RLS nas tabelas
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- 15. Criar políticas RLS para plans (todos podem ler)
DROP POLICY IF EXISTS "Plans are viewable by everyone" ON public.plans;
CREATE POLICY "Plans are viewable by everyone" ON public.plans
    FOR SELECT USING (true);

-- 16. Criar políticas RLS para usage_tracking
DROP POLICY IF EXISTS "Users can view usage in their org" ON public.usage_tracking;
CREATE POLICY "Users can view usage in their org" ON public.usage_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.user_id = auth.uid()
            AND members.org_id = usage_tracking.org_id
        )
    );

DROP POLICY IF EXISTS "Users can insert usage in their org" ON public.usage_tracking;
CREATE POLICY "Users can insert usage in their org" ON public.usage_tracking
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.user_id = auth.uid()
            AND members.org_id = usage_tracking.org_id
        )
    );

-- Política de update será criada separadamente
-- DROP POLICY IF EXISTS "Users can update usage in their org" ON public.usage_tracking;

-- 17. Criar funções para planos
CREATE OR REPLACE FUNCTION public.check_plan_limit(org_id UUID, metric_type TEXT, limit_value INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INTEGER;
    plan_limits JSONB;
BEGIN
    -- Buscar limites do plano da organização
    SELECT p.limits INTO plan_limits
    FROM public.orgs o
    JOIN public.plans p ON o.plan_id = p.id
    WHERE o.id = org_id;
    
    -- Se não encontrou plano, usar limites do plano gratuito
    IF plan_limits IS NULL THEN
        SELECT limits INTO plan_limits FROM public.plans WHERE id = 'free';
    END IF;
    
    -- Verificar se a métrica tem limite definido
    IF NOT (plan_limits ? metric_type) THEN
        RETURN true; -- Sem limite definido, permitir
    END IF;
    
    -- Buscar uso atual do período
    SELECT COALESCE(SUM(count), 0) INTO current_usage
    FROM public.usage_tracking
    WHERE usage_tracking.org_id = check_plan_limit.org_id
    AND usage_tracking.metric_type = check_plan_limit.metric_type
    AND usage_tracking.period_start <= NOW()
    AND usage_tracking.period_end >= NOW();
    
    -- Verificar se está dentro do limite
    RETURN current_usage < (plan_limits ->> metric_type)::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.record_usage(org_id UUID, metric_type TEXT, count_value INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.usage_tracking (org_id, metric_type, count, period_start, period_end)
    VALUES (
        org_id,
        metric_type,
        count_value,
        DATE_TRUNC('month', NOW()),
        DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second'
    )
    ON CONFLICT (org_id, metric_type, period_start, period_end)
    DO UPDATE SET 
        count = usage_tracking.count + count_value,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.is_trial_valid(UUID);
CREATE FUNCTION public.is_trial_valid(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    trial_end TIMESTAMPTZ;
    plan_id TEXT;
BEGIN
    SELECT o.trial_ends_at, o.plan_id INTO trial_end, plan_id
    FROM public.orgs o
    WHERE o.id = org_id;
    
    -- Se não tem trial_ends_at, verificar se é plano gratuito
    IF trial_end IS NULL THEN
        RETURN plan_id = 'free' OR plan_id IS NULL;
    END IF;
    
    -- Verificar se o trial ainda é válido
    RETURN trial_end > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. Limpar dados órfãos
DELETE FROM public.messages WHERE conversation_id NOT IN (SELECT id FROM public.conversations);
DELETE FROM public.conversations WHERE org_id NOT IN (SELECT id FROM public.orgs);
DELETE FROM public.members WHERE org_id NOT IN (SELECT id FROM public.orgs);
DELETE FROM public.contacts WHERE org_id NOT IN (SELECT id FROM public.orgs);
DELETE FROM public.prospects WHERE org_id NOT IN (SELECT id FROM public.orgs);
-- DELETE FROM public.campaigns WHERE org_id NOT IN (SELECT id FROM public.orgs);
DELETE FROM public.attendants WHERE org_id NOT IN (SELECT id FROM public.orgs);
DELETE FROM public.usage_tracking WHERE org_id NOT IN (SELECT id FROM public.orgs);

-- 19. Garantir que há pelo menos uma organização padrão
INSERT INTO public.orgs (id, name, slug, description, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Organização Padrão',
    'organizacao-padrao-sistema',
    'Organização padrão do sistema',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 20. Atualizar estatísticas das tabelas
ANALYZE public.orgs;
ANALYZE public.members;
ANALYZE public.contacts;
ANALYZE public.conversations;
ANALYZE public.messages;
ANALYZE public.prospects;
-- ANALYZE public.campaigns;
ANALYZE public.attendants;
ANALYZE public.plans;
ANALYZE public.usage_tracking;
