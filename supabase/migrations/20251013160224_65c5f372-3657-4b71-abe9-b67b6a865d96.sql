-- Create enums
DO $$ BEGIN CREATE TYPE member_role AS ENUM ('admin', 'member', 'viewer'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE message_direction AS ENUM ('inbound', 'outbound'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE consent_status AS ENUM ('opt_in', 'opt_out', 'pending'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE prospect_status AS ENUM ('new', 'validated', 'imported', 'opted_out'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Organizations
CREATE TABLE IF NOT EXISTS orgs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, plan TEXT DEFAULT 'free', created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;

-- Members
CREATE TABLE IF NOT EXISTS members (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role member_role NOT NULL DEFAULT 'member', created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), UNIQUE(org_id, user_id));
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Helper function (create or replace)
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID) RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS(SELECT 1 FROM members WHERE org_id = check_org_id AND user_id = auth.uid()); $$;

-- Channel accounts
CREATE TABLE IF NOT EXISTS channel_accounts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE, channel_type channel_type NOT NULL, name TEXT NOT NULL, credentials_json JSONB, status TEXT DEFAULT 'active', created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());
ALTER TABLE channel_accounts ENABLE ROW LEVEL SECURITY;

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE, full_name TEXT, phone_e164 TEXT, email TEXT, tags TEXT[] DEFAULT '{}', custom_json JSONB DEFAULT '{}', last_seen_at TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(org_id);

-- Consents
CREATE TABLE IF NOT EXISTS consents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE, contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, channel_type channel_type NOT NULL, status consent_status NOT NULL DEFAULT 'pending', source TEXT, timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(), UNIQUE(contact_id, channel_type));
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE, channel_account_id UUID REFERENCES channel_accounts(id), contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, status conversation_status NOT NULL DEFAULT 'open', assigned_to UUID REFERENCES auth.users(id), last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(), created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON conversations(org_id);

-- Messages
CREATE TABLE IF NOT EXISTS messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE, conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE, direction message_direction NOT NULL, body TEXT, media_url TEXT, sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(), delivered_at TIMESTAMP WITH TIME ZONE, read_at TIMESTAMP WITH TIME ZONE, error_code TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT now());
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, sent_at DESC);

-- Templates
CREATE TABLE IF NOT EXISTS templates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE, channel_type channel_type NOT NULL, name TEXT NOT NULL, content_json JSONB NOT NULL, status TEXT DEFAULT 'active', created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE, name TEXT NOT NULL, channel_type channel_type NOT NULL, status campaign_status NOT NULL DEFAULT 'draft', audience_query JSONB, template_id UUID REFERENCES templates(id), schedule_at TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Campaign messages
CREATE TABLE IF NOT EXISTS campaign_messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE, contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, status TEXT DEFAULT 'pending', attempt_count INT DEFAULT 0, sent_at TIMESTAMP WITH TIME ZONE, delivered_at TIMESTAMP WITH TIME ZONE, error_message TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT now());
ALTER TABLE campaign_messages ENABLE ROW LEVEL SECURITY;

-- Places
CREATE TABLE IF NOT EXISTS places (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), place_id TEXT UNIQUE NOT NULL, name TEXT, types TEXT[], location JSONB, formatted_address TEXT, phone_number TEXT, website TEXT, source_ts TIMESTAMP WITH TIME ZONE DEFAULT now(), ttl_ts TIMESTAMP WITH TIME ZONE, raw_json JSONB);
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Prospects
CREATE TABLE IF NOT EXISTS prospects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE, place_id UUID REFERENCES places(id) ON DELETE SET NULL, status prospect_status NOT NULL DEFAULT 'new', tags TEXT[] DEFAULT '{}', assigned_to UUID REFERENCES auth.users(id), notes TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their orgs" ON orgs;
CREATE POLICY "Users can view their orgs" ON orgs FOR SELECT USING (id IN (SELECT org_id FROM members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view org members" ON members;
CREATE POLICY "Users can view org members" ON members FOR SELECT USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Admins can manage members" ON members;
CREATE POLICY "Admins can manage members" ON members FOR ALL USING (EXISTS (SELECT 1 FROM members m WHERE m.org_id = members.org_id AND m.user_id = auth.uid() AND m.role = 'admin'));

DROP POLICY IF EXISTS "Org isolation" ON channel_accounts;
CREATE POLICY "Org isolation" ON channel_accounts FOR ALL USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Contacts org isolation" ON contacts;
CREATE POLICY "Contacts org isolation" ON contacts FOR ALL USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Org isolation" ON consents;
CREATE POLICY "Org isolation" ON consents FOR ALL USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Conversations org isolation" ON conversations;
CREATE POLICY "Conversations org isolation" ON conversations FOR ALL USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Messages org isolation" ON messages;
CREATE POLICY "Messages org isolation" ON messages FOR ALL USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Org isolation" ON templates;
CREATE POLICY "Org isolation" ON templates FOR ALL USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Campaigns org isolation" ON campaigns;
CREATE POLICY "Campaigns org isolation" ON campaigns FOR ALL USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Org isolation" ON campaign_messages;
CREATE POLICY "Org isolation" ON campaign_messages FOR ALL USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_messages.campaign_id AND is_org_member(campaigns.org_id)));

DROP POLICY IF EXISTS "Org isolation" ON prospects;
CREATE POLICY "Org isolation" ON prospects FOR ALL USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Authenticated users can view places" ON places;
CREATE POLICY "Authenticated users can view places" ON places FOR SELECT USING (auth.role() = 'authenticated');

-- Triggers
DROP TRIGGER IF EXISTS update_orgs_updated_at ON orgs;
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON orgs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_channel_accounts_updated_at ON channel_accounts;
CREATE TRIGGER update_channel_accounts_updated_at BEFORE UPDATE ON channel_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prospects_updated_at ON prospects;
CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON prospects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();