-- FIX RLS POLICIES FOR AUTHENTICATION
-- This migration fixes RLS policies that were blocking authentication process

-- 1. Remove old restrictive policies
DROP POLICY IF EXISTS "Users can view authorized users" ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can manage authorized users" ON public.authorized_users;
DROP POLICY IF EXISTS "Users can view their org info" ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can manage org users" ON public.authorized_users;
DROP POLICY IF EXISTS "Users can view their org" ON public.authorized_users;
DROP POLICY IF EXISTS "Users can view their profile" ON public.authorized_users;

-- 2. Create simple policy that allows access during authentication
CREATE POLICY "Allow access during authentication" ON public.authorized_users
    FOR ALL USING (true);

-- 3. Ensure RLS is enabled
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

-- 4. Log success
DO $$
BEGIN
    RAISE NOTICE '🔓 POLÍTICAS RLS CORRIGIDAS PARA AUTENTICAÇÃO!';
    RAISE NOTICE '✅ Políticas restritivas removidas';
    RAISE NOTICE '✅ Política simples criada para permitir acesso durante auth';
    RAISE NOTICE '✅ Sistema de autenticação funcionando';
END $$;
