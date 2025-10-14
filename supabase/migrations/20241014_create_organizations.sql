-- Migration para criar tabela organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir organização de teste com UUID fixo
INSERT INTO public.organizations (id, name, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'Organização de Teste', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS na tabela organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura para usuários autenticados
CREATE POLICY "Allow read access for authenticated users" ON public.organizations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Criar política para permitir inserção para usuários autenticados
CREATE POLICY "Allow insert access for authenticated users" ON public.organizations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Criar política para permitir atualização para usuários autenticados
CREATE POLICY "Allow update access for authenticated users" ON public.organizations
    FOR UPDATE USING (auth.role() = 'authenticated');
