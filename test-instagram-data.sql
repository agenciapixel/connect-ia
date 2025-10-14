-- Script para inserir dados de teste do Instagram
-- Primeiro, verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'channel_accounts';

-- Inserir dados de teste do Instagram
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

-- Verificar se os dados foram inseridos
SELECT * FROM public.channel_accounts WHERE channel_type = 'instagram';
