-- Migration: Corrigir tabela contacts e orgs
-- Data: 2024-10-30

-- Criar tabela orgs se não existir
CREATE TABLE IF NOT EXISTS public.orgs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para orgs
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON public.orgs(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_plan ON public.orgs(plan);

-- Habilitar RLS na tabela orgs
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para orgs se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orgs' AND policyname = 'Allow read access for authenticated users on orgs') THEN
        CREATE POLICY "Allow read access for authenticated users on orgs" ON public.orgs
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orgs' AND policyname = 'Allow insert access for authenticated users on orgs') THEN
        CREATE POLICY "Allow insert access for authenticated users on orgs" ON public.orgs
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orgs' AND policyname = 'Allow update access for authenticated users on orgs') THEN
        CREATE POLICY "Allow update access for authenticated users on orgs" ON public.orgs
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orgs' AND policyname = 'Allow delete access for authenticated users on orgs') THEN
        CREATE POLICY "Allow delete access for authenticated users on orgs" ON public.orgs
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Inserir organização padrão se não existir
INSERT INTO public.orgs (id, name, slug, plan)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Minha Organização',
  'minha-organizacao',
  'free'
)
ON CONFLICT (id) DO NOTHING;

-- Criar tabela contacts se não existir
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone_e164 TEXT,
    external_id TEXT,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    last_seen_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas que podem não existir
DO $$
BEGIN
    -- Adicionar coluna status se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'status' AND table_schema = 'public') THEN
        ALTER TABLE public.contacts ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked'));
    END IF;
    
    -- Adicionar coluna tags se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'tags' AND table_schema = 'public') THEN
        ALTER TABLE public.contacts ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Adicionar coluna external_id se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'external_id' AND table_schema = 'public') THEN
        ALTER TABLE public.contacts ADD COLUMN external_id TEXT;
    END IF;
    
    -- Adicionar coluna last_seen_at se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'last_seen_at' AND table_schema = 'public') THEN
        ALTER TABLE public.contacts ADD COLUMN last_seen_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Adicionar coluna metadata se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'metadata' AND table_schema = 'public') THEN
        ALTER TABLE public.contacts ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Criar índices para contacts
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone_e164);
CREATE INDEX IF NOT EXISTS idx_contacts_external_id ON public.contacts(external_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);

-- Habilitar RLS na tabela contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para contacts se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Allow read access for authenticated users on contacts') THEN
        CREATE POLICY "Allow read access for authenticated users on contacts" ON public.contacts
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Allow insert access for authenticated users on contacts') THEN
        CREATE POLICY "Allow insert access for authenticated users on contacts" ON public.contacts
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Allow update access for authenticated users on contacts') THEN
        CREATE POLICY "Allow update access for authenticated users on contacts" ON public.contacts
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Allow delete access for authenticated users on contacts') THEN
        CREATE POLICY "Allow delete access for authenticated users on contacts" ON public.contacts
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Inserir membership para o usuário atual (se logado)
INSERT INTO public.members (user_id, org_id, role)
SELECT
  auth.uid(),
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin'::member_role
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, org_id) DO NOTHING;

-- Verificar se as tabelas foram criadas corretamente
SELECT 'orgs' as table_name, COUNT(*) as count FROM public.orgs
UNION ALL
SELECT 'contacts' as table_name, COUNT(*) as count FROM public.contacts
UNION ALL
SELECT 'members' as table_name, COUNT(*) as count FROM public.members;
