-- =====================================================
-- APLICAR MIGRAÇÕES NO SUPABASE REMOTO
-- Data: 18/10/2025
-- Objetivo: Sincronizar banco remoto com local
-- =====================================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/sql

-- =====================================================
-- ETAPA 1: LIMPAR SISTEMA ANTIGO (SE NECESSÁRIO)
-- =====================================================

-- Comentário: Descomente apenas se quiser resetar TUDO
-- ATENÇÃO: Isso irá DELETAR TODOS OS DADOS!

/*
-- Deletar todos os usuários (cascata para tudo)
DELETE FROM auth.users;

-- Dropar tabelas antigas
DROP TABLE IF EXISTS public.usage_tracking CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.authorized_users CASCADE;
*/

-- =====================================================
-- ETAPA 2: VERIFICAR ESTRUTURA ATUAL
-- =====================================================

-- Ver tabelas existentes
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- ETAPA 3: CRIAR/ATUALIZAR TABELAS ESSENCIAIS
-- =====================================================

-- Tabela de organizações (sem coluna plan)
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Remover coluna plan se existir (sistema antigo)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'orgs'
    AND column_name = 'plan'
  ) THEN
    ALTER TABLE public.orgs DROP COLUMN plan;
  END IF;
END $$;

-- Adicionar coluna owner_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'orgs'
    AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.orgs ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Tabela de membros (usuários nas organizações)
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'agent', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

-- =====================================================
-- ETAPA 4: CRIAR TABELAS CRM
-- =====================================================

-- Contatos
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone_e164 TEXT,
  phone_display TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversas (criar sem contact_id primeiro)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'instagram', 'messenger', 'email')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar coluna contact_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'conversations'
    AND column_name = 'contact_id'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Mensagens
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_type TEXT DEFAULT 'contact' CHECK (sender_type IN ('contact', 'agent', 'bot')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campanhas
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'instagram', 'messenger', 'email')),
  total_contacts INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prospects (Pipeline de Vendas)
CREATE TABLE IF NOT EXISTS public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  value DECIMAL(10,2) DEFAULT 0,
  pipeline_stage TEXT DEFAULT 'lead' CHECK (pipeline_stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ETAPA 5: CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices em orgs
CREATE INDEX IF NOT EXISTS idx_orgs_owner_id ON public.orgs(owner_id);
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON public.orgs(slug);

-- Índices em members
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_org_id ON public.members(org_id);

-- Índices em contacts
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);

-- Índices em conversations
CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON public.conversations(org_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON public.conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);

-- Índices em messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Índices em campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_org_id ON public.campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

-- Índices em prospects
CREATE INDEX IF NOT EXISTS idx_prospects_org_id ON public.prospects(org_id);
CREATE INDEX IF NOT EXISTS idx_prospects_contact_id ON public.prospects(contact_id);
CREATE INDEX IF NOT EXISTS idx_prospects_pipeline_stage ON public.prospects(pipeline_stage);

-- =====================================================
-- ETAPA 6: CRIAR/ATUALIZAR RLS POLICIES
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- Policies para ORGS
DROP POLICY IF EXISTS "Users can view orgs they are member of" ON public.orgs;
CREATE POLICY "Users can view orgs they are member of"
  ON public.orgs FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update orgs they own" ON public.orgs;
CREATE POLICY "Users can update orgs they own"
  ON public.orgs FOR UPDATE
  USING (owner_id = auth.uid());

-- Policies para MEMBERS
DROP POLICY IF EXISTS "Users can view members of their orgs" ON public.members;
CREATE POLICY "Users can view members of their orgs"
  ON public.members FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- Policies para CONTACTS
DROP POLICY IF EXISTS "Users can view contacts of their org" ON public.contacts;
CREATE POLICY "Users can view contacts of their org"
  ON public.contacts FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert contacts in their org" ON public.contacts;
CREATE POLICY "Users can insert contacts in their org"
  ON public.contacts FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update contacts in their org" ON public.contacts;
CREATE POLICY "Users can update contacts in their org"
  ON public.contacts FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete contacts in their org" ON public.contacts;
CREATE POLICY "Users can delete contacts in their org"
  ON public.contacts FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- Policies similares para conversations, messages, campaigns, prospects
-- (Copiando o mesmo padrão)

DROP POLICY IF EXISTS "Users can view conversations of their org" ON public.conversations;
CREATE POLICY "Users can view conversations of their org"
  ON public.conversations FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage conversations in their org" ON public.conversations;
CREATE POLICY "Users can manage conversations in their org"
  ON public.conversations FOR ALL
  USING (
    org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view messages of their org" ON public.messages;
CREATE POLICY "Users can view messages of their org"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage messages in their org" ON public.messages;
CREATE POLICY "Users can manage messages in their org"
  ON public.messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage campaigns in their org" ON public.campaigns;
CREATE POLICY "Users can manage campaigns in their org"
  ON public.campaigns FOR ALL
  USING (
    org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage prospects in their org" ON public.prospects;
CREATE POLICY "Users can manage prospects in their org"
  ON public.prospects FOR ALL
  USING (
    org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
  );

-- =====================================================
-- ETAPA 7: CRIAR TRIGGER DE AUTO-CRIAÇÃO DE ORG
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_name TEXT;
  company_name TEXT;
  org_slug TEXT;
BEGIN
  -- Extrair nome do usuário
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Extrair nome da empresa
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

  -- Adicionar usuário como admin da org
  INSERT INTO public.members (user_id, org_id, role)
  VALUES (NEW.id, new_org_id, 'admin');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ETAPA 8: CRIAR TRIGGERS DE UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas que têm updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.orgs;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.orgs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.members;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.contacts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.conversations;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.campaigns;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.prospects;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- ETAPA 9: VERIFICAÇÃO FINAL
-- =====================================================

-- Ver todas as tabelas criadas
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Ver todas as policies
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Ver todos os triggers
SELECT
  event_object_table AS tabela,
  trigger_name,
  event_manipulation AS evento
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Mensagem de sucesso
SELECT '✅ Migrações aplicadas com sucesso!' as status;
SELECT 'Próximo passo: Inserir dados de exemplo (se necessário)' as proxima_acao;
