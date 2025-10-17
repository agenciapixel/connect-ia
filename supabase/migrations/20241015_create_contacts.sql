-- =====================================================
-- MIGRAÇÃO PARA CRIAR TABELA CONTACTS
-- =====================================================

-- Criar tabela contacts
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    position TEXT,
    source TEXT,
    tags TEXT[],
    notes TEXT,
    last_contacted TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que um contato seja único por organização e email
    UNIQUE(org_id, email)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON public.contacts(company);

-- Habilitar RLS na tabela contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para contacts
CREATE POLICY "Users can view contacts in their orgs" ON public.contacts
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert contacts in their orgs" ON public.contacts
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update contacts in their orgs" ON public.contacts
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete contacts in their orgs" ON public.contacts
    FOR DELETE USING (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

-- Atualizar estatísticas
ANALYZE public.contacts;

