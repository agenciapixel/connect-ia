-- Configuração inicial do sistema Connect IA

-- 1. Garantir que a organização principal existe
INSERT INTO public.organizations (
    id,
    name,
    description,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Connect IA',
    'Sistema de CRM com IA para WhatsApp Business',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 2. Configurar usuário atual como admin (se autenticado)
INSERT INTO public.members (
    user_id,
    org_id,
    role,
    created_at,
    updated_at
) 
SELECT 
    auth.uid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin'::member_role,
    NOW(),
    NOW()
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, org_id) DO UPDATE SET
    role = 'admin'::member_role,
    updated_at = NOW();

-- 3. Criar atendente padrão
INSERT INTO public.attendants (
    org_id,
    full_name,
    email,
    department,
    position,
    status,
    max_concurrent_chats,
    auto_accept,
    skills,
    specializations
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Atendente Automático',
    'bot@connectia.com',
    'atendimento',
    'Atendente IA',
    'online',
    10,
    true,
    ARRAY['WhatsApp', 'Instagram', 'IA', 'Atendimento'],
    ARRAY['Suporte', 'Vendas', 'Qualificação']
) ON CONFLICT (email) DO NOTHING;

-- 4. Verificar configuração
SELECT 
    'Configuração Inicial' as status,
    (SELECT COUNT(*) FROM public.organizations) as organizacoes,
    (SELECT COUNT(*) FROM public.members) as membros,
    (SELECT COUNT(*) FROM public.attendants) as atendentes;
