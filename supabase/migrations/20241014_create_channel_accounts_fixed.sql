-- Migration para criar tabela channel_accounts (versão corrigida)
-- Primeiro, verificar se a tabela já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'channel_accounts') THEN
        -- Criar tabela channel_accounts
        CREATE TABLE public.channel_accounts (
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
        CREATE INDEX idx_channel_accounts_org_id ON public.channel_accounts(org_id);
        CREATE INDEX idx_channel_accounts_channel_type ON public.channel_accounts(channel_type);
        CREATE INDEX idx_channel_accounts_status ON public.channel_accounts(status);

        -- Habilitar RLS na tabela channel_accounts
        ALTER TABLE public.channel_accounts ENABLE ROW LEVEL SECURITY;

        -- Criar políticas de acesso
        CREATE POLICY "Allow read access for authenticated users on channel_accounts" ON public.channel_accounts
            FOR SELECT USING (auth.role() = 'authenticated');

        CREATE POLICY "Allow insert access for authenticated users on channel_accounts" ON public.channel_accounts
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');

        CREATE POLICY "Allow update access for authenticated users on channel_accounts" ON public.channel_accounts
            FOR UPDATE USING (auth.role() = 'authenticated');

        CREATE POLICY "Allow delete access for authenticated users on channel_accounts" ON public.channel_accounts
            FOR DELETE USING (auth.role() = 'authenticated');
            
        RAISE NOTICE 'Tabela channel_accounts criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela channel_accounts já existe';
    END IF;
END $$;

-- Inserir dados de teste do Instagram se não existirem
INSERT INTO public.channel_accounts (
    id,
    org_id,
    channel_type,
    name,
    credentials_json,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'instagram',
    'Instagram Business Account',
    '{"access_token": "test_token", "user_id": "test_user", "username": "test_account"}',
    'active',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;
