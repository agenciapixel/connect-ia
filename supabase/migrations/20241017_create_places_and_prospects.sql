-- Criar enum para status de prospects
CREATE TYPE prospect_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');

-- Criar tabela places para armazenar dados do Google Places
CREATE TABLE IF NOT EXISTS public.places (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    place_id TEXT UNIQUE NOT NULL,
    name TEXT,
    formatted_address TEXT,
    phone_number TEXT,
    website TEXT,
    types TEXT[],
    location JSONB,
    rating DECIMAL(2,1),
    user_ratings_total INTEGER,
    business_status TEXT,
    opening_hours JSONB,
    photos JSONB,
    raw_json JSONB,
    source_ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ttl_ts TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela prospects para armazenar prospects identificados
CREATE TABLE IF NOT EXISTS public.prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    status prospect_status DEFAULT 'new'::prospect_status,
    tags TEXT[],
    notes TEXT,
    last_contacted TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que um prospect seja único por organização e lugar
    UNIQUE(org_id, place_id)
);

-- Habilitar RLS
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- Políticas para places (todos podem ver)
CREATE POLICY "Anyone can view places" ON public.places
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert places" ON public.places
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update places" ON public.places
    FOR UPDATE USING (true);

-- Políticas para prospects (apenas membros da organização)
CREATE POLICY "Users can view prospects from their org" ON public.prospects
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert prospects to their org" ON public.prospects
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update prospects from their org" ON public.prospects
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete prospects from their org" ON public.prospects
    FOR DELETE USING (
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
