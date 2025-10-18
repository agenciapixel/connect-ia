-- =====================================================
-- RESET COMPLETO DO SUPABASE - DO ZERO
-- Data: 18/10/2025
-- Objetivo: Limpar tudo e recriar estrutura correta
-- ⚠️ CUIDADO: Isso vai DELETAR todos os dados!
-- =====================================================

-- =====================================================
-- ETAPA 1: LIMPAR TUDO (DROP)
-- =====================================================

-- Desabilitar triggers temporariamente
SET session_replication_role = replica;

-- Drop todas as policies RLS
DROP POLICY IF EXISTS "Users can view orgs they are member of" ON public.orgs;
DROP POLICY IF EXISTS "Users can update orgs they own" ON public.orgs;
DROP POLICY IF EXISTS "Users can view members of their orgs" ON public.members;
DROP POLICY IF EXISTS "Users can view contacts of their org" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert contacts in their org" ON public.contacts;
DROP POLICY IF EXISTS "Users can update contacts in their org" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete contacts in their org" ON public.contacts;
DROP POLICY IF EXISTS "Users can view conversations of their org" ON public.conversations;
DROP POLICY IF EXISTS "Users can manage conversations in their org" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages of their org" ON public.messages;
DROP POLICY IF EXISTS "Users can manage messages in their org" ON public.messages;
DROP POLICY IF EXISTS "Users can manage campaigns in their org" ON public.campaigns;
DROP POLICY IF EXISTS "Users can manage prospects in their org" ON public.prospects;

-- Drop todos os triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_updated_at ON public.orgs;
DROP TRIGGER IF EXISTS set_updated_at ON public.members;
DROP TRIGGER IF EXISTS set_updated_at ON public.contacts;
DROP TRIGGER IF EXISTS set_updated_at ON public.conversations;
DROP TRIGGER IF EXISTS set_updated_at ON public.campaigns;
DROP TRIGGER IF EXISTS set_updated_at ON public.prospects;

-- Drop todas as functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Drop todas as tabelas (em ordem reversa de dependência)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.prospects CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.orgs CASCADE;

-- Drop tipos customizados
DROP TYPE IF EXISTS member_role CASCADE;

-- Reabilitar triggers
SET session_replication_role = DEFAULT;

-- =====================================================
-- ETAPA 2: CRIAR ESTRUTURA DO ZERO
-- =====================================================

-- =====================================================
-- TABELAS
-- =====================================================

-- 1. Organizações
CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Membros (usuários nas organizações)
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'agent', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

-- 3. Contatos
CREATE TABLE public.contacts (
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

-- 4. Conversas
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'instagram', 'messenger', 'email')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Mensagens
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_type TEXT DEFAULT 'contact' CHECK (sender_type IN ('contact', 'agent', 'bot')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Campanhas
CREATE TABLE public.campaigns (
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

-- 7. Prospects (Pipeline de Vendas)
CREATE TABLE public.prospects (
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
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Orgs
CREATE INDEX idx_orgs_owner_id ON public.orgs(owner_id);
CREATE INDEX idx_orgs_slug ON public.orgs(slug);

-- Members
CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_members_org_id ON public.members(org_id);

-- Contacts
CREATE INDEX idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_contacts_email ON public.contacts(email);

-- Conversations
CREATE INDEX idx_conversations_org_id ON public.conversations(org_id);
CREATE INDEX idx_conversations_contact_id ON public.conversations(contact_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);

-- Messages
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Campaigns
CREATE INDEX idx_campaigns_org_id ON public.campaigns(org_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);

-- Prospects
CREATE INDEX idx_prospects_org_id ON public.prospects(org_id);
CREATE INDEX idx_prospects_contact_id ON public.prospects(contact_id);
CREATE INDEX idx_prospects_pipeline_stage ON public.prospects(pipeline_stage);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- Policies para ORGS
CREATE POLICY "Users can view orgs they are member of"
  ON public.orgs FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update orgs they own"
  ON public.orgs FOR UPDATE
  USING (owner_id = auth.uid());

-- Policies para MEMBERS
CREATE POLICY "Users can view members of their orgs"
  ON public.members FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- Policies para CONTACTS
CREATE POLICY "Users can view contacts of their org"
  ON public.contacts FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert contacts in their org"
  ON public.contacts FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update contacts in their org"
  ON public.contacts FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete contacts in their org"
  ON public.contacts FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- Policies para CONVERSATIONS
CREATE POLICY "Users can view conversations of their org"
  ON public.conversations FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage conversations in their org"
  ON public.conversations FOR ALL
  USING (
    org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
  );

-- Policies para MESSAGES
CREATE POLICY "Users can view messages of their org"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage messages in their org"
  ON public.messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
    )
  );

-- Policies para CAMPAIGNS
CREATE POLICY "Users can manage campaigns in their org"
  ON public.campaigns FOR ALL
  USING (
    org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
  );

-- Policies para PROSPECTS
CREATE POLICY "Users can manage prospects in their org"
  ON public.prospects FOR ALL
  USING (
    org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
  );

-- =====================================================
-- FUNCTIONS E TRIGGERS
-- =====================================================

-- 1. Function para auto-criar organização ao criar usuário
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

-- Trigger para criar org ao criar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Function para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.orgs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- CONCLUÍDO!
-- =====================================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ RESET COMPLETO EXECUTADO COM SUCESSO!';
  RAISE NOTICE '✅ Todas as tabelas foram recriadas';
  RAISE NOTICE '✅ RLS policies aplicadas';
  RAISE NOTICE '✅ Triggers configurados';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 PRÓXIMO PASSO:';
  RAISE NOTICE '1. Teste criar um usuário em: https://connectia.agenciapixel.digital/autenticacao';
  RAISE NOTICE '2. Verifique se a organização foi criada automaticamente';
  RAISE NOTICE '3. Continue configurando o App Meta';
END $$;
