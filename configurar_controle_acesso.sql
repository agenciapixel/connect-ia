-- Script para configurar controle de acesso - apenas usuários cadastrados podem fazer login
-- Execute este script no Supabase Dashboard > SQL Editor

-- ========================================
-- 1. CRIAR TABELA DE USUÁRIOS AUTORIZADOS
-- ========================================

-- Criar tabela para controlar quais usuários podem fazer login
CREATE TABLE IF NOT EXISTS public.authorized_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. CONFIGURAR RLS PARA AUTHORIZED_USERS
-- ========================================

-- Habilitar RLS
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas a si mesmos
CREATE POLICY "Users can view own authorized status" ON public.authorized_users
    FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Política para permitir que admins vejam todos os usuários autorizados
CREATE POLICY "Admins can manage authorized users" ON public.authorized_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.members m
            JOIN public.orgs o ON m.org_id = o.id
            WHERE m.user_id = auth.uid()
            AND m.role = 'admin'
        )
    );

-- ========================================
-- 3. CRIAR FUNÇÃO DE VERIFICAÇÃO DE LOGIN
-- ========================================

-- Função para verificar se um usuário está autorizado a fazer login
CREATE OR REPLACE FUNCTION public.is_user_authorized(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se o usuário está na tabela de usuários autorizados
    RETURN EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = user_email
        AND is_active = true
    );
END;
$$;

-- ========================================
-- 4. CRIAR TRIGGER PARA BLOQUEAR LOGIN NÃO AUTORIZADO
-- ========================================

-- Função que será chamada antes de permitir login
CREATE OR REPLACE FUNCTION public.check_user_authorization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se o usuário está autorizado
    IF NOT public.is_user_authorized(NEW.email) THEN
        RAISE EXCEPTION 'Usuário não autorizado. Entre em contato com o administrador.';
    END IF;
    
    RETURN NEW;
END;
$$;

-- ========================================
-- 5. CRIAR FUNÇÃO PARA ADICIONAR USUÁRIO AUTORIZADO
-- ========================================

-- Função para adicionar um usuário à lista de autorizados
CREATE OR REPLACE FUNCTION public.add_authorized_user(
    user_email TEXT,
    user_name TEXT,
    user_role TEXT DEFAULT 'user'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Inserir usuário autorizado
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

-- ========================================
-- 6. CRIAR FUNÇÃO PARA REMOVER USUÁRIO AUTORIZADO
-- ========================================

-- Função para desativar um usuário autorizado
CREATE OR REPLACE FUNCTION public.remove_authorized_user(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Desativar usuário
    UPDATE public.authorized_users
    SET is_active = false, updated_at = NOW()
    WHERE email = user_email;
    
    RETURN FOUND;
END;
$$;

-- ========================================
-- 7. CRIAR FUNÇÃO PARA LISTAR USUÁRIOS AUTORIZADOS
-- ========================================

-- Função para listar todos os usuários autorizados
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
-- 8. INSERIR USUÁRIO ADMINISTRADOR PADRÃO
-- ========================================

-- Inserir usuário administrador padrão
INSERT INTO public.authorized_users (email, name, role, is_active)
VALUES (
    'admin@connectia.com', 
    'Administrador Connect IA', 
    'admin', 
    true
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

-- ========================================
-- 9. CRIAR POLÍTICA DE SEGURANÇA PARA AUTH.USERS
-- ========================================

-- Política para permitir apenas usuários autorizados
CREATE POLICY "Only authorized users can sign up" ON auth.users
    FOR INSERT WITH CHECK (
        public.is_user_authorized(email)
    );

-- ========================================
-- 10. VERIFICAÇÕES FINAIS
-- ========================================

-- Verificar se a tabela foi criada
SELECT 
    'authorized_users' as tabela,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN is_active = true THEN 1 END) as usuarios_ativos
FROM public.authorized_users;

-- Verificar se as funções foram criadas
SELECT 
    routine_name as funcao,
    routine_type as tipo
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'is_user_authorized',
    'add_authorized_user', 
    'remove_authorized_user',
    'get_authorized_users'
)
ORDER BY routine_name;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('authorized_users', 'users')
ORDER BY tablename, policyname;
