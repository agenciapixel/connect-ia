-- Migration para criar tabela channel_accounts
CREATE TABLE IF NOT EXISTS public.channel_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    channel_type TEXT NOT NULL,
    name TEXT NOT NULL,
    credentials_json JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_channel_accounts_org_id ON public.channel_accounts(org_id);
CREATE INDEX IF NOT EXISTS idx_channel_accounts_channel_type ON public.channel_accounts(channel_type);
CREATE INDEX IF NOT EXISTS idx_channel_accounts_status ON public.channel_accounts(status);

-- Habilitar RLS na tabela channel_accounts
ALTER TABLE public.channel_accounts ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura para usuários autenticados
CREATE POLICY "Allow read access for authenticated users on channel_accounts" ON public.channel_accounts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Criar política para permitir inserção para usuários autenticados
CREATE POLICY "Allow insert access for authenticated users on channel_accounts" ON public.channel_accounts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Criar política para permitir atualização para usuários autenticados
CREATE POLICY "Allow update access for authenticated users on channel_accounts" ON public.channel_accounts
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Criar política para permitir exclusão para usuários autenticados
CREATE POLICY "Allow delete access for authenticated users on channel_accounts" ON public.channel_accounts
    FOR DELETE USING (auth.role() = 'authenticated');