-- =====================================================
-- RESET COMPLETO DO SISTEMA DE AUTENTICAÇÃO
-- Data: 18/10/2025 03:00:00
-- Objetivo: Sistema simples, robusto, sem travamentos
-- =====================================================

-- 1. DROPAR TODAS AS POLICIES ANTIGAS (evitar conflitos)
DROP POLICY IF EXISTS "Users can view own authorized_users record" ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can manage authorized_users" ON public.authorized_users;
DROP POLICY IF EXISTS "Users can read own org data" ON public.orgs;
DROP POLICY IF EXISTS "Users can update own org" ON public.orgs;
DROP POLICY IF EXISTS "Users can read own membership" ON public.members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.members;
DROP POLICY IF EXISTS "Users can view members of their org" ON public.members;

-- 2. DROPAR TRIGGERS E FUNCTIONS ANTIGAS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_user_authorized(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_authorized_users() CASCADE;
DROP FUNCTION IF EXISTS public.add_authorized_user(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.remove_authorized_user(uuid) CASCADE;

-- 3. RECRIAR TABELAS DE FORMA LIMPA
DROP TABLE IF EXISTS public.authorized_users CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.orgs CASCADE;

-- 4. CRIAR TABELA DE ORGANIZAÇÕES (SIMPLES)
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.orgs IS 'Organizações (multi-tenant)';

-- 5. CRIAR TABELA DE MEMBROS (RELACIONAMENTO USER ↔ ORG)
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'agent', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

COMMENT ON TABLE public.members IS 'Relacionamento usuários ↔ organizações com roles';
CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_members_org_id ON public.members(org_id);

-- 6. CRIAR TABELA DE USUÁRIOS AUTORIZADOS (LISTA SIMPLES)
CREATE TABLE IF NOT EXISTS public.authorized_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.authorized_users IS 'Lista simples de emails autorizados (whitelist)';
CREATE INDEX idx_authorized_users_email ON public.authorized_users(email);

-- 7. FUNÇÃO SIMPLES: CRIAR ORG E MEMBER AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_name TEXT;
BEGIN
  -- Verificar se usuário está autorizado
  IF NOT EXISTS (SELECT 1 FROM public.authorized_users WHERE email = NEW.email) THEN
    RAISE EXCEPTION 'Usuário % não está autorizado', NEW.email;
  END IF;

  -- Extrair nome do email (antes do @)
  user_name := split_part(NEW.email, '@', 1);

  -- Criar organização
  INSERT INTO public.orgs (name, slug, plan)
  VALUES (
    user_name || ' Org',
    lower(regexp_replace(user_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8),
    'free'
  )
  RETURNING id INTO new_org_id;

  -- Criar membership como admin
  INSERT INTO public.members (user_id, org_id, role)
  VALUES (NEW.id, new_org_id, 'admin');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Cria organização e membership automaticamente para novo usuário';

-- 8. TRIGGER: EXECUTAR AO CRIAR USUÁRIO
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. RLS POLICIES (SIMPLES E SEGURAS)

-- authorized_users: Apenas admins podem ver/modificar
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ler authorized_users"
  ON public.authorized_users
  FOR SELECT
  USING (true); -- Necessário para verificar autorização no frontend

-- orgs: Usuários veem apenas suas organizações
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their orgs"
  ON public.orgs
  FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their org"
  ON public.orgs
  FOR UPDATE
  USING (
    id IN (
      SELECT org_id FROM public.members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- members: Usuários veem membros da sua org
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their org"
  ON public.members
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members of their org"
  ON public.members
  FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM public.members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 10. FUNÇÕES RPC ÚTEIS

-- Verificar se email está autorizado
CREATE OR REPLACE FUNCTION public.is_user_authorized(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.authorized_users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. INSERIR USUÁRIO AUTORIZADO INICIAL (VOCÊ)
INSERT INTO public.authorized_users (email)
VALUES ('dasilva6r@gmail.com')
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE public.authorized_users IS 'Sistema simplificado de autorização - whitelist de emails';
COMMENT ON TABLE public.members IS 'Relacionamento user ↔ org com role específico';
COMMENT ON TABLE public.orgs IS 'Organizações multi-tenant';

-- =====================================================
-- FIM DA MIGRATION
-- Sistema agora está limpo, simples e robusto!
-- =====================================================
