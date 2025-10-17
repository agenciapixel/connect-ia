-- =====================================================
-- MIGRAÇÃO BASE - CRIAR TABELAS FUNDAMENTAIS
-- =====================================================

-- 1. Criar enum para roles de membros
CREATE TYPE member_role AS ENUM ('admin', 'member', 'manager');

-- 2. Criar tabela plans primeiro
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_monthly DECIMAL(10,2) DEFAULT 0,
    price_yearly DECIMAL(10,2) DEFAULT 0,
    features TEXT[] DEFAULT '{}',
    limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_trial BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela orgs
CREATE TABLE IF NOT EXISTS public.orgs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    plan_id TEXT REFERENCES public.plans(id) ON DELETE SET NULL,
    plan TEXT, -- Coluna para compatibilidade com frontend
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela authorized_users
CREATE TABLE IF NOT EXISTS public.authorized_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela members
CREATE TABLE IF NOT EXISTS public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    role member_role DEFAULT 'member'::member_role,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que um usuário só pode ter um papel por organização
    UNIQUE(user_id, org_id)
);

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON public.orgs(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_plan_id ON public.orgs(plan_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_org_id ON public.members(org_id);
CREATE INDEX IF NOT EXISTS idx_authorized_users_email ON public.authorized_users(email);

-- 7. Habilitar RLS nas tabelas
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS básicas
-- Políticas para orgs
CREATE POLICY "Users can view orgs they belong to" ON public.orgs
    FOR SELECT USING (
        id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

-- Políticas para members
CREATE POLICY "Users can view members in their orgs" ON public.members
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

-- Políticas para authorized_users
CREATE POLICY "Users can view authorized users" ON public.authorized_users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para plans
CREATE POLICY "Users can view plans" ON public.plans
    FOR SELECT USING (auth.role() = 'authenticated');

-- 9. Inserir plano gratuito padrão
INSERT INTO public.plans (id, name, price_monthly, price_yearly, features, limits)
VALUES (
    'free',
    'Gratuito',
    0.00,
    0.00,
    ARRAY['basic'],
    '{"contacts": 100, "campaigns": 5, "ai_agents": 1}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 10. Criar função para verificar se usuário está autorizado
CREATE OR REPLACE FUNCTION public.is_user_authorized(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.authorized_users 
        WHERE email = user_email
    );
END;
$$;

-- 11. Criar função para adicionar usuário à organização atual
CREATE OR REPLACE FUNCTION public.add_user_to_current_org(user_email TEXT, user_full_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    current_org_id UUID;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO new_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Buscar organização do usuário atual
    SELECT org_id INTO current_org_id
    FROM public.members 
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    -- Adicionar usuário à organização
    INSERT INTO public.members (user_id, org_id, role)
    VALUES (new_user_id, current_org_id, 'member')
    ON CONFLICT (user_id, org_id) DO NOTHING;
    
    RETURN new_user_id;
END;
$$;

-- 12. Criar trigger para cadastro automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_org_id UUID;
    plan_id_var TEXT;
    is_internal_signup BOOLEAN;
BEGIN
    -- Verificar se é cadastro interno (vem das configurações)
    is_internal_signup := COALESCE(
        (NEW.raw_user_meta_data->>'internal_signup')::BOOLEAN, 
        false
    );
    
    IF is_internal_signup THEN
        -- Cadastro interno: adicionar à organização atual
        PERFORM public.add_user_to_current_org(NEW.email, NEW.raw_user_meta_data->>'full_name');
    ELSE
        -- Cadastro externo: criar nova organização
        -- Buscar plano gratuito
        SELECT id INTO plan_id_var FROM public.plans WHERE id = 'free' LIMIT 1;
        
        -- Criar nova organização
        INSERT INTO public.orgs (name, slug, plan_id, plan)
        VALUES (
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nova Organização'),
            LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', 'nova-organizacao'), ' ', '-')),
            plan_id_var,
            'Gratuito'
        )
        RETURNING id INTO new_org_id;
        
        -- Adicionar usuário como admin da nova organização
        INSERT INTO public.members (user_id, org_id, role)
        VALUES (NEW.id, new_org_id, 'admin');
    END IF;
    
    -- Adicionar usuário à tabela authorized_users
    INSERT INTO public.authorized_users (email, full_name, role)
    VALUES (
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        'user'
    )
    ON CONFLICT (email) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- 13. Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. Atualizar estatísticas
ANALYZE public.orgs;
ANALYZE public.authorized_users;
ANALYZE public.members;
ANALYZE public.plans;
