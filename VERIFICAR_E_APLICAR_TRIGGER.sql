-- =====================================================
-- VERIFICAR E APLICAR TRIGGER AUTOMÁTICO
-- Para criar org + membership automaticamente ao cadastrar
-- =====================================================

-- PARTE 1: VERIFICAR SE O TRIGGER JÁ EXISTE
-- =====================================================

SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name LIKE '%auth_user_created%';

-- PARTE 2: VERIFICAR SE A FUNÇÃO EXISTE
-- =====================================================

SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- PARTE 3: RECRIAR TRIGGER (se não existir ou para garantir)
-- =====================================================

-- 3.1 Remover trigger antigo (se existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3.2 Remover função antiga (se existir)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3.3 Criar função atualizada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_name TEXT;
  company_name TEXT;
  org_slug TEXT;
BEGIN
  -- Pegar nome do usuário do metadata ou email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Pegar nome da empresa do metadata ou criar padrão
  company_name := COALESCE(
    NEW.raw_user_meta_data->>'company_name',
    user_name || ' - Empresa'
  );

  -- Criar slug único (remover caracteres especiais + adicionar UUID)
  org_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9]', '-', 'g'))
              || '-' || substr(gen_random_uuid()::text, 1, 8);

  -- Criar organização
  INSERT INTO public.orgs (name, slug, owner_id)
  VALUES (company_name, org_slug, NEW.id)
  RETURNING id INTO new_org_id;

  -- Adicionar usuário como ADMIN da organização
  INSERT INTO public.members (user_id, org_id, role)
  VALUES (NEW.id, new_org_id, 'admin');

  -- Log de sucesso
  RAISE NOTICE '✅ Usuário criado: % | Org: % | Role: admin', NEW.email, company_name;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, logar mas não bloquear o cadastro
    RAISE WARNING '⚠️ Erro ao criar org/membership para %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.4 Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PARTE 4: VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
    trigger_exists BOOLEAN;
    function_exists BOOLEAN;
BEGIN
    -- Verificar se trigger foi criado
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.triggers
        WHERE trigger_schema = 'auth'
          AND event_object_table = 'users'
          AND trigger_name = 'on_auth_user_created'
    ) INTO trigger_exists;

    -- Verificar se função foi criada
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.routines
        WHERE routine_schema = 'public'
          AND routine_name = 'handle_new_user'
    ) INTO function_exists;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '    VERIFICAÇÃO DO SISTEMA AUTOMÁTICO';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    IF trigger_exists AND function_exists THEN
        RAISE NOTICE '✅ TRIGGER CONFIGURADO COM SUCESSO!';
        RAISE NOTICE '';
        RAISE NOTICE '🎯 O que acontece agora:';
        RAISE NOTICE '   1. Novo usuário se cadastra';
        RAISE NOTICE '   2. Sistema cria organização automaticamente';
        RAISE NOTICE '   3. Usuário é adicionado como ADMIN';
        RAISE NOTICE '   4. Login funciona imediatamente!';
        RAISE NOTICE '';
        RAISE NOTICE '📋 Função: public.handle_new_user()';
        RAISE NOTICE '📋 Trigger: on_auth_user_created';
        RAISE NOTICE '📋 Tabela: auth.users';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '❌ ERRO: Trigger ou função não foi criado!';
        RAISE NOTICE '';
        IF NOT function_exists THEN
            RAISE NOTICE '   ❌ Função handle_new_user() não encontrada';
        END IF;
        IF NOT trigger_exists THEN
            RAISE NOTICE '   ❌ Trigger on_auth_user_created não encontrado';
        END IF;
        RAISE NOTICE '';
        RAISE NOTICE '⚠️ Execute este SQL novamente ou verifique permissões';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;
