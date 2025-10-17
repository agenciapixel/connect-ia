-- Script simples para corrigir warnings de segurança
-- Execute este script no Supabase Dashboard > SQL Editor

-- ========================================
-- CORRIGIR FUNCTION SEARCH PATH MUTABLE
-- ========================================

-- Recriar apenas as funções de controle de acesso com search_path fixo
CREATE OR REPLACE FUNCTION public.is_user_authorized(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = user_email
        AND is_active = true
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.add_authorized_user(
    user_email TEXT,
    user_name TEXT,
    user_role TEXT DEFAULT 'user'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_user_id UUID;
BEGIN
    INSERT INTO public.authorized_users (email, name, role)
    VALUES (user_email, user_name, user_role)
    ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        is_active = true,
        updated_at = NOW()
    RETURNING id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_authorized_user(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.authorized_users
    SET is_active = false, updated_at = NOW()
    WHERE email = user_email;
    
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_authorized_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    role TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.email,
        au.name,
        au.role,
        au.is_active,
        au.created_at,
        au.updated_at
    FROM public.authorized_users au
    ORDER BY au.created_at DESC;
END;
$$;

-- ========================================
-- VERIFICAÇÕES FINAIS
-- ========================================

-- Verificar se as funções foram corrigidas
SELECT 
    routine_name as funcao,
    routine_type as tipo,
    security_type as seguranca
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'is_user_authorized',
    'add_authorized_user', 
    'remove_authorized_user',
    'get_authorized_users'
)
ORDER BY routine_name;
