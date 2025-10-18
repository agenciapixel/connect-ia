-- =====================================================
-- RESET COMPLETO: Sistema Ultra-Simples
-- Data: 18/10/2025
-- Descrição: Remove TUDO e cria sistema básico
-- =====================================================

-- 1. DELETAR TUDO (cuidado!)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS public.usage_tracking CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.authorized_users CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.orgs CASCADE;

-- 2. CRIAR TABELAS SIMPLES

-- Tabela de organizações (empresas)
CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de membros (relacionamento user ↔ org)
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'agent', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

-- 3. RLS POLICIES SIMPLES (sem recursão!)

-- Organizações: usuário pode ver apenas suas orgs
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orgs"
  ON public.orgs FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own orgs"
  ON public.orgs FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their orgs"
  ON public.orgs FOR UPDATE
  USING (owner_id = auth.uid());

-- Members: usuário pode ver apenas seus próprios memberships
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memberships"
  ON public.members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Org owners can manage members"
  ON public.members FOR ALL
  USING (
    org_id IN (
      SELECT id FROM public.orgs WHERE owner_id = auth.uid()
    )
  );

-- 4. TRIGGER: Criar organização automaticamente ao cadastrar

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_name TEXT;
  company_name TEXT;
  org_slug TEXT;
BEGIN
  -- Pegar nome do usuário do metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Pegar nome da empresa do metadata
  company_name := COALESCE(
    NEW.raw_user_meta_data->>'company_name',
    user_name || ' - Empresa'
  );

  -- Criar slug único
  org_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9]', '-', 'g'))
              || '-' || substr(gen_random_uuid()::text, 1, 8);

  -- Criar organização
  INSERT INTO public.orgs (name, slug, owner_id)
  VALUES (company_name, org_slug, NEW.id)
  RETURNING id INTO new_org_id;

  -- Adicionar usuário como admin da organização
  INSERT INTO public.members (user_id, org_id, role)
  VALUES (NEW.id, new_org_id, 'admin');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. ÍNDICES para performance
CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_members_org_id ON public.members(org_id);
CREATE INDEX idx_orgs_owner_id ON public.orgs(owner_id);
CREATE INDEX idx_orgs_slug ON public.orgs(slug);

-- FIM DA MIGRAÇÃO
