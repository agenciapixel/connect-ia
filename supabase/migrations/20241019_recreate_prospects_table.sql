-- Dropar e recriar tabelas places e prospects com schema correto

-- Drop tabelas antigas (se existirem)
DROP TABLE IF EXISTS public.prospects CASCADE;
DROP TABLE IF EXISTS public.places CASCADE;

-- Criar tabela places
CREATE TABLE public.places (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    place_id TEXT UNIQUE NOT NULL,
    name TEXT,
    formatted_address TEXT,
    phone_number TEXT,
    website TEXT,
    types TEXT[],
    location JSONB,
    raw_json JSONB,
    source_ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ttl_ts TIMESTAMP WITH TIME ZONE
);

-- Criar tabela prospects
CREATE TABLE public.prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'validated', 'imported', 'opted_out')),
    tags TEXT[],
    notes TEXT,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Garantir que um prospect seja único por organização e lugar
    UNIQUE(org_id, place_id)
);

-- Habilitar RLS
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- Políticas para places (todos autenticados podem ver e inserir)
DROP POLICY IF EXISTS "Anyone can view places" ON public.places;
CREATE POLICY "Authenticated users can view places"
    ON public.places
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Anyone can insert places" ON public.places;
CREATE POLICY "Authenticated users can insert places"
    ON public.places
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update places" ON public.places;
CREATE POLICY "Authenticated users can update places"
    ON public.places
    FOR UPDATE
    TO authenticated
    USING (true);

-- Políticas para prospects (apenas membros da organização)
DROP POLICY IF EXISTS "Users can view prospects from their org" ON public.prospects;
CREATE POLICY "Users can view prospects from their org"
    ON public.prospects
    FOR SELECT
    TO authenticated
    USING (
        org_id IN (
            SELECT org_id FROM public.members
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert prospects to their org" ON public.prospects;
CREATE POLICY "Users can insert prospects to their org"
    ON public.prospects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        org_id IN (
            SELECT org_id FROM public.members
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update prospects from their org" ON public.prospects;
CREATE POLICY "Users can update prospects from their org"
    ON public.prospects
    FOR UPDATE
    TO authenticated
    USING (
        org_id IN (
            SELECT org_id FROM public.members
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete prospects from their org" ON public.prospects;
CREATE POLICY "Users can delete prospects from their org"
    ON public.prospects
    FOR DELETE
    TO authenticated
    USING (
        org_id IN (
            SELECT org_id FROM public.members
            WHERE user_id = auth.uid()
        )
    );

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_places_place_id ON public.places(place_id);
CREATE INDEX IF NOT EXISTS idx_places_types ON public.places USING GIN(types);
CREATE INDEX IF NOT EXISTS idx_places_location ON public.places USING GIN(location);

CREATE INDEX IF NOT EXISTS idx_prospects_org_id ON public.prospects(org_id);
CREATE INDEX IF NOT EXISTS idx_prospects_place_id ON public.prospects(place_id);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON public.prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_tags ON public.prospects USING GIN(tags);

-- Comentários nas tabelas
COMMENT ON TABLE public.places IS 'Armazena dados de lugares do Google Places API';
COMMENT ON TABLE public.prospects IS 'Armazena prospects identificados via prospecção';
