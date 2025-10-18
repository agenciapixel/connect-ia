-- =====================================================
-- ADICIONAR COLUNA SLUG À TABELA PLANS
-- E garantir que todas as colunas necessárias existam
-- =====================================================

-- 1. ADICIONAR COLUNA SLUG (se não existir)
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. ADICIONAR OUTRAS COLUNAS QUE PODEM ESTAR FALTANDO
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS price_monthly DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_yearly DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_contacts INTEGER,
  ADD COLUMN IF NOT EXISTS max_conversations INTEGER,
  ADD COLUMN IF NOT EXISTS max_campaigns INTEGER,
  ADD COLUMN IF NOT EXISTS max_ai_agents INTEGER,
  ADD COLUMN IF NOT EXISTS max_attendants INTEGER,
  ADD COLUMN IF NOT EXISTS max_integrations INTEGER,
  ADD COLUMN IF NOT EXISTS max_storage_gb INTEGER,
  ADD COLUMN IF NOT EXISTS has_ai_features BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_advanced_analytics BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_api_access BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_whatsapp_business BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_custom_domain BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_priority_support BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 3. CRIAR ÍNDICE ÚNICO NA COLUNA SLUG (se não existir)
CREATE UNIQUE INDEX IF NOT EXISTS plans_slug_idx ON public.plans(slug);

-- 4. ATUALIZAR PLANOS EXISTENTES COM SLUGS (se ainda não tiverem)
UPDATE public.plans
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]', '-', 'g'))
WHERE slug IS NULL;

-- 5. TORNAR SLUG OBRIGATÓRIO (depois de preencher valores)
ALTER TABLE public.plans
  ALTER COLUMN slug SET NOT NULL;

-- 6. VERIFICAR RESULTADO
SELECT 'Coluna slug adicionada com sucesso!' as status;

-- 7. MOSTRAR ESTRUTURA DA TABELA
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'plans'
  AND table_schema = 'public'
ORDER BY ordinal_position;
