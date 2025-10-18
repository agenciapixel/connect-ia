-- =====================================================
-- VERIFICAR ROLE DO USUÁRIO ricardo@agenciapixel.digital
-- =====================================================

-- 1. Buscar user_id do usuário
SELECT
    id as user_id,
    email,
    created_at
FROM auth.users
WHERE email = 'ricardo@agenciapixel.digital';

-- 2. Verificar organizações e role
SELECT
    m.id as membership_id,
    m.user_id,
    m.org_id,
    m.role,
    o.name as org_name,
    o.slug as org_slug,
    o.owner_id,
    CASE
        WHEN o.owner_id = m.user_id THEN 'É OWNER'
        ELSE 'NÃO É OWNER'
    END as owner_status
FROM public.members m
JOIN public.orgs o ON o.id = m.org_id
JOIN auth.users u ON u.id = m.user_id
WHERE u.email = 'ricardo@agenciapixel.digital';

-- 3. Verificar tabela authorized_users
SELECT
    id,
    email,
    role as authorized_role,
    created_at
FROM public.authorized_users
WHERE email = 'ricardo@agenciapixel.digital';

-- 4. Se NÃO existir registro em members, vamos criar
-- Primeiro, buscar user_id e org_id
DO $$
DECLARE
    v_user_id UUID;
    v_org_id UUID;
    v_member_exists BOOLEAN;
BEGIN
    -- Buscar user_id
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'ricardo@agenciapixel.digital';

    IF v_user_id IS NULL THEN
        RAISE NOTICE '❌ Usuário não encontrado em auth.users';
        RETURN;
    END IF;

    -- Buscar primeira organização (ou criar)
    SELECT id INTO v_org_id
    FROM public.orgs
    WHERE owner_id = v_user_id
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RAISE NOTICE '⚠️ Nenhuma organização encontrada para este usuário';
        RAISE NOTICE '💡 Criando organização padrão...';

        INSERT INTO public.orgs (name, slug, owner_id)
        VALUES ('Agência Pixel', 'agencia-pixel', v_user_id)
        RETURNING id INTO v_org_id;

        RAISE NOTICE '✅ Organização criada: %', v_org_id;
    END IF;

    -- Verificar se já existe membership
    SELECT EXISTS(
        SELECT 1 FROM public.members
        WHERE user_id = v_user_id AND org_id = v_org_id
    ) INTO v_member_exists;

    IF NOT v_member_exists THEN
        RAISE NOTICE '⚠️ Membership não encontrado';
        RAISE NOTICE '💡 Criando membership como ADMIN...';

        INSERT INTO public.members (user_id, org_id, role)
        VALUES (v_user_id, v_org_id, 'admin');

        RAISE NOTICE '✅ Membership criado com role ADMIN';
    ELSE
        RAISE NOTICE '✅ Membership já existe';

        -- Mostrar role atual
        DECLARE
            v_current_role TEXT;
        BEGIN
            SELECT role INTO v_current_role
            FROM public.members
            WHERE user_id = v_user_id AND org_id = v_org_id;

            RAISE NOTICE '📋 Role atual: %', v_current_role;

            -- Se não for admin, atualizar
            IF v_current_role != 'admin' THEN
                RAISE NOTICE '⚠️ Role incorreto! Atualizando para ADMIN...';

                UPDATE public.members
                SET role = 'admin'
                WHERE user_id = v_user_id AND org_id = v_org_id;

                RAISE NOTICE '✅ Role atualizado para ADMIN';
            END IF;
        END;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '📊 RESUMO:';
    RAISE NOTICE '   User ID: %', v_user_id;
    RAISE NOTICE '   Org ID: %', v_org_id;
    RAISE NOTICE '   Role: admin';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Próximo passo: Faça logout e login novamente';
END $$;
