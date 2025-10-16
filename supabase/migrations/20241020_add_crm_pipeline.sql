-- Adicionar campos de CRM ao prospects
ALTER TABLE public.prospects
ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'lead' CHECK (pipeline_stage IN ('lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
ADD COLUMN IF NOT EXISTS pipeline_position INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS expected_revenue DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS probability INTEGER CHECK (probability >= 0 AND probability <= 100),
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_followup TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'google_places',
ADD COLUMN IF NOT EXISTS deal_value DECIMAL(10,2);

-- Criar tabela de atividades do CRM
CREATE TABLE IF NOT EXISTS public.prospect_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'call', 'email', 'meeting', 'task', 'status_change')),
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.prospect_activities ENABLE ROW LEVEL SECURITY;

-- Políticas para prospect_activities
CREATE POLICY "Users can view activities from their org prospects"
    ON public.prospect_activities
    FOR SELECT
    TO authenticated
    USING (
        prospect_id IN (
            SELECT id FROM public.prospects
            WHERE org_id IN (
                SELECT org_id FROM public.members
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert activities to their org prospects"
    ON public.prospect_activities
    FOR INSERT
    TO authenticated
    WITH CHECK (
        prospect_id IN (
            SELECT id FROM public.prospects
            WHERE org_id IN (
                SELECT org_id FROM public.members
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update activities from their org prospects"
    ON public.prospect_activities
    FOR UPDATE
    TO authenticated
    USING (
        prospect_id IN (
            SELECT id FROM public.prospects
            WHERE org_id IN (
                SELECT org_id FROM public.members
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete activities from their org prospects"
    ON public.prospect_activities
    FOR DELETE
    TO authenticated
    USING (
        prospect_id IN (
            SELECT id FROM public.prospects
            WHERE org_id IN (
                SELECT org_id FROM public.members
                WHERE user_id = auth.uid()
            )
        )
    );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_prospects_pipeline_stage ON public.prospects(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_prospects_pipeline_position ON public.prospects(pipeline_position);
CREATE INDEX IF NOT EXISTS idx_prospect_activities_prospect_id ON public.prospect_activities(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospect_activities_created_at ON public.prospect_activities(created_at DESC);

-- Comentários
COMMENT ON COLUMN public.prospects.pipeline_stage IS 'Estágio atual no pipeline de vendas';
COMMENT ON COLUMN public.prospects.expected_revenue IS 'Receita esperada deste prospect';
COMMENT ON COLUMN public.prospects.probability IS 'Probabilidade de conversão (0-100%)';
COMMENT ON TABLE public.prospect_activities IS 'Histórico de atividades e interações com prospects';
