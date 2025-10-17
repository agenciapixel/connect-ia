-- Migration: Criar sistema de planos e controle de uso
-- Data: 2024-12-01

-- Tabela plans já foi criada na migração base
-- Apenas adicionar coluna description se não existir
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;

-- Inserir planos com custos calculados
INSERT INTO public.plans (id, name, description, price_monthly, price_yearly, trial_days, limits, features, is_active, is_popular) VALUES 
('free', 'Free Trial', 'Teste grátis por 14 dias', 0, 0, 14, 
 '{"contacts": 100, "campaigns_per_month": 0, "integrations": 1, "ai_agents": 0, "api_calls_per_month": 1000, "google_places_searches": 0, "estimated_cost_usd": 40, "price_usd": 0, "margin_percentage": -100}', 
 '{"Dashboard básico", "Inbox (50 conversas)", "100 contatos", "1 integração", "Suporte por email"}', 
 true, false),
 
('basic', 'Basic', 'Ideal para pequenas empresas', 197, 1970, 0, 
 '{"contacts": -1, "campaigns_per_month": 200, "integrations": 2, "ai_agents": 0, "api_calls_per_month": 5000, "google_places_searches": 50, "estimated_cost_usd": 42, "price_usd": 39, "margin_percentage": -8}', 
 '{"Contatos ilimitados", "200 campanhas/mês", "2 integrações", "50 buscas Google Places", "Suporte prioritário"}', 
 true, true),
 
('pro', 'Pro', 'Para agências e empresas médias', 397, 3970, 0, 
 '{"contacts": -1, "campaigns_per_month": 1000, "integrations": -1, "ai_agents": 3, "api_calls_per_month": 10000, "google_places_searches": 200, "estimated_cost_usd": 57, "price_usd": 79, "margin_percentage": 28}', 
 '{"Tudo do Basic", "1.000 campanhas/mês", "3 Agentes IA", "200 buscas Google Places", "Analytics avançados", "API Access"}', 
 true, false),
 
('business', 'Business', 'Para equipes grandes', 797, 7970, 0, 
 '{"contacts": -1, "campaigns_per_month": 5000, "integrations": -1, "ai_agents": 10, "api_calls_per_month": 50000, "google_places_searches": 1000, "estimated_cost_usd": 112, "price_usd": 159, "margin_percentage": 30}', 
 '{"Tudo do Pro", "5.000 campanhas/mês", "10 Agentes IA", "1.000 buscas Google Places", "Suporte telefônico", "SLA garantido"}', 
 true, false)
ON CONFLICT (id) DO NOTHING;

-- Adicionar coluna plan_id na tabela orgs se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'plan_id' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN plan_id VARCHAR(20) DEFAULT 'free';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'trial_ends_at' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'subscription_status' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired'));
    END IF;
END $$;

-- Criar tabela de controle de uso
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,  -- 'campaigns', 'api_calls', 'google_places_searches', 'ai_requests'
    count INTEGER NOT NULL DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(org_id, metric_type, period_start)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_org_id ON public.usage_tracking(org_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_metric_type ON public.usage_tracking(metric_type);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON public.usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_orgs_plan_id ON public.orgs(plan_id);
CREATE INDEX IF NOT EXISTS idx_orgs_subscription_status ON public.orgs(subscription_status);

-- Habilitar RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plans (todos podem ler)
CREATE POLICY "Allow read access for all users on plans" ON public.plans
    FOR SELECT USING (true);

-- Políticas RLS para usage_tracking
CREATE POLICY "Allow read access for org members on usage_tracking" ON public.usage_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.org_id = usage_tracking.org_id 
            AND members.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow insert access for org members on usage_tracking" ON public.usage_tracking
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.org_id = usage_tracking.org_id 
            AND members.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow update access for org members on usage_tracking" ON public.usage_tracking
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.org_id = usage_tracking.org_id 
            AND members.user_id = auth.uid()
        )
    );

-- Função para verificar limites do plano
CREATE OR REPLACE FUNCTION check_plan_limit(
    p_org_id UUID,
    p_metric_type VARCHAR(50),
    p_requested_count INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
    v_plan_limits JSONB;
    v_current_usage INTEGER;
    v_limit INTEGER;
BEGIN
    -- Buscar limites do plano da organização
    SELECT p.limits INTO v_plan_limits
    FROM public.orgs o
    JOIN public.plans p ON p.id = o.plan_id
    WHERE o.id = p_org_id;
    
    -- Se não encontrar plano, retornar false
    IF v_plan_limits IS NULL THEN
        RETURN false;
    END IF;
    
    -- Buscar limite específico
    v_limit := (v_plan_limits->>p_metric_type)::INTEGER;
    
    -- Se limite é -1 (ilimitado), retornar true
    IF v_limit = -1 THEN
        RETURN true;
    END IF;
    
    -- Buscar uso atual do mês
    SELECT COALESCE(SUM(count), 0) INTO v_current_usage
    FROM public.usage_tracking
    WHERE org_id = p_org_id
    AND metric_type = p_metric_type
    AND period_start = DATE_TRUNC('month', CURRENT_DATE)::DATE
    AND period_end = (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    -- Verificar se pode usar
    RETURN (v_current_usage + p_requested_count) <= v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar uso
CREATE OR REPLACE FUNCTION record_usage(
    p_org_id UUID,
    p_metric_type VARCHAR(50),
    p_count INTEGER DEFAULT 1
) RETURNS VOID AS $$
DECLARE
    v_period_start DATE;
    v_period_end DATE;
BEGIN
    v_period_start := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    v_period_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    INSERT INTO public.usage_tracking (org_id, metric_type, count, period_start, period_end)
    VALUES (p_org_id, p_metric_type, p_count, v_period_start, v_period_end)
    ON CONFLICT (org_id, metric_type, period_start)
    DO UPDATE SET 
        count = usage_tracking.count + p_count,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se organização está em trial válido
CREATE OR REPLACE FUNCTION is_trial_valid(p_org_id UUID) RETURNS BOOLEAN AS $$
DECLARE
    v_trial_ends_at TIMESTAMP WITH TIME ZONE;
    v_subscription_status VARCHAR(20);
BEGIN
    SELECT trial_ends_at, subscription_status
    INTO v_trial_ends_at, v_subscription_status
    FROM public.orgs
    WHERE id = p_org_id;
    
    -- Se não está em trial, retornar true (plano pago)
    IF v_subscription_status != 'trial' THEN
        RETURN true;
    END IF;
    
    -- Se trial expirou, retornar false
    IF v_trial_ends_at IS NOT NULL AND v_trial_ends_at < NOW() THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se as tabelas foram criadas corretamente
SELECT 'plans' as table_name, COUNT(*) as count FROM public.plans
UNION ALL
SELECT 'usage_tracking' as table_name, COUNT(*) as count FROM public.usage_tracking
UNION ALL
SELECT 'orgs_with_plan' as table_name, COUNT(*) as count FROM public.orgs WHERE plan_id IS NOT NULL;
