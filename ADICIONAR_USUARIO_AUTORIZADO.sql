-- =====================================================
-- ADICIONAR ricardo@agenciapixel.digital À TABELA AUTHORIZED_USERS
-- =====================================================

-- 1. Verificar se tabela existe
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'authorized_users';

-- 2. Inserir usuário na tabela authorized_users
INSERT INTO public.authorized_users (email, role)
VALUES ('ricardo@agenciapixel.digital', 'admin')
ON CONFLICT (email)
DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

-- 3. Verificar inserção
SELECT
    id,
    email,
    role,
    created_at,
    updated_at
FROM public.authorized_users
WHERE email = 'ricardo@agenciapixel.digital';

-- 4. Log de sucesso
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ USUÁRIO ADICIONADO À TABELA AUTHORIZED_USERS!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Detalhes:';
    RAISE NOTICE '   Email: ricardo@agenciapixel.digital';
    RAISE NOTICE '   Role: admin';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Próximos passos:';
    RAISE NOTICE '   1. Faça logout do sistema';
    RAISE NOTICE '   2. Faça login novamente';
    RAISE NOTICE '   3. Sistema deve reconhecer como ADMIN agora';
    RAISE NOTICE '';
END $$;
