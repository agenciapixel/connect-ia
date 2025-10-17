-- Teste das integrações do sistema Connect IA

-- 1. Testar criação de organização
INSERT INTO public.organizations (id, name, description) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Connect IA', 'Organização principal')
ON CONFLICT (id) DO NOTHING;

-- 2. Testar criação de canal WhatsApp
INSERT INTO public.channel_accounts (org_id, channel_type, name, credentials_json, status)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'whatsapp',
    'WhatsApp Principal',
    '{"phone_number": "+5511999999999", "webhook_url": "https://connectia.agenciapixel.digital/api/webhook"}',
    'active'
) ON CONFLICT DO NOTHING;

-- 3. Testar criação de canal Instagram
INSERT INTO public.channel_accounts (org_id, channel_type, name, credentials_json, status)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'instagram',
    'Instagram Principal',
    '{"instagram_account_id": "123456789", "access_token": "EAAG..."}',
    'active'
) ON CONFLICT DO NOTHING;

-- 4. Testar criação de atendente
INSERT INTO public.attendants (org_id, full_name, email, department, position, status, max_concurrent_chats)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Atendente Principal',
    'atendente@connectia.com',
    'atendimento',
    'Atendente Sênior',
    'offline',
    5
) ON CONFLICT DO NOTHING;

-- 5. Verificar se tudo foi criado
SELECT 'Organizações' as tabela, COUNT(*) as total FROM public.organizations
UNION ALL
SELECT 'Canais Ativos', COUNT(*) FROM public.channel_accounts WHERE status = 'active'
UNION ALL
SELECT 'Atendentes', COUNT(*) FROM public.attendants
UNION ALL
SELECT 'Membros', COUNT(*) FROM public.members;
