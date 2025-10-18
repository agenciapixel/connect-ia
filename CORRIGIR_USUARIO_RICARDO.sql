-- =====================================================
-- CORRIGIR USUÁRIO ricardo@agenciapixel.digital
-- Adicionar à tabela members com role admin
-- =====================================================

-- Passo 1: Verificar se já existe organização
DO $$
DECLARE
    v_user_id UUID;
    v_org_id UUID;
    v_member_count INTEGER;
BEGIN
    -- Buscar user_id
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'ricardo@agenciapixel.digital';

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado!';
    END IF;

    RAISE NOTICE '✅ User ID encontrado: %', v_user_id;

    -- Verificar se já tem organização
    SELECT id INTO v_org_id
    FROM public.orgs
    WHERE owner_id = v_user_id
    LIMIT 1;

    IF v_org_id IS NULL THEN
        -- Criar organização
        RAISE NOTICE '📝 Criando organização...';

        INSERT INTO public.orgs (name, slug, owner_id)
        VALUES ('Agência Pixel', 'agencia-pixel', v_user_id)
        RETURNING id INTO v_org_id;

        RAISE NOTICE '✅ Organização criada: %', v_org_id;
    ELSE
        RAISE NOTICE '✅ Organização já existe: %', v_org_id;
    END IF;

    -- Verificar se já tem membership
    SELECT COUNT(*) INTO v_member_count
    FROM public.members
    WHERE user_id = v_user_id AND org_id = v_org_id;

    IF v_member_count = 0 THEN
        -- Criar membership com role admin
        RAISE NOTICE '📝 Criando membership...';

        INSERT INTO public.members (user_id, org_id, role)
        VALUES (v_user_id, v_org_id, 'admin');

        RAISE NOTICE '✅ Membership criado com role ADMIN';
    ELSE
        -- Atualizar role para admin (se não for)
        RAISE NOTICE '📝 Atualizando role para ADMIN...';

        UPDATE public.members
        SET role = 'admin'
        WHERE user_id = v_user_id AND org_id = v_org_id;

        RAISE NOTICE '✅ Role atualizado para ADMIN';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Resumo:';
    RAISE NOTICE '   Email: ricardo@agenciapixel.digital';
    RAISE NOTICE '   User ID: %', v_user_id;
    RAISE NOTICE '   Org ID: %', v_org_id;
    RAISE NOTICE '   Role: admin';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Próximo passo:';
    RAISE NOTICE '   Faça logout e login novamente no sistema';
    RAISE NOTICE '';
END $$;

-- Verificar resultado final
SELECT
    u.email,
    m.role,
    o.name as org_name,
    o.slug as org_slug
FROM auth.users u
JOIN public.members m ON m.user_id = u.id
JOIN public.orgs o ON o.id = m.org_id
WHERE u.email = 'ricardo@agenciapixel.digital';
