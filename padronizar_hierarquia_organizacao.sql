-- Script para padronizar hierarquia Organização > Usuários
-- Este script corrige inconsistências e garante que todas as tabelas sigam a hierarquia correta

-- 1. Verificar tabelas existentes
SELECT 
    'Tabelas Existentes' as status,
    table_name,
    CASE 
        WHEN table_name = 'orgs' THEN '✅ Tabela principal de organizações'
        WHEN table_name = 'organizations' THEN '⚠️ Tabela duplicada (será removida)'
        ELSE '📊 Tabela de dados'
    END as observacao
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orgs', 'organizations', 'members', 'channel_accounts', 'conversations', 'messages', 'prospects', 'attendants', 'contacts')
ORDER BY table_name;

-- 2. Garantir que a tabela principal 'orgs' existe e está correta
CREATE TABLE IF NOT EXISTS public.orgs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Adicionar colunas que podem não existir
DO $$
BEGIN
    -- Adicionar coluna description se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'description' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN description TEXT;
    END IF;
    
    -- Adicionar coluna settings se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'settings' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN settings JSONB DEFAULT '{}';
    END IF;
    
    -- Adicionar coluna billing_info se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'billing_info' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN billing_info JSONB DEFAULT '{}';
    END IF;
    
    -- Adicionar coluna slug se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'slug' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN slug TEXT UNIQUE;
    END IF;
    
    -- Adicionar coluna plan se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'plan' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro', 'enterprise'));
    END IF;
END $$;

-- 4. Migrar dados de 'organizations' para 'orgs' se existir
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations' AND table_schema = 'public') THEN
        -- Migrar dados (apenas colunas que existem)
        INSERT INTO public.orgs (id, name, slug, created_at, updated_at)
        SELECT 
            id,
            name,
            LOWER(REPLACE(name, ' ', '-')) as slug,
            COALESCE(created_at, NOW()) as created_at,
            COALESCE(updated_at, NOW()) as updated_at
        FROM public.organizations
        WHERE NOT EXISTS (SELECT 1 FROM public.orgs WHERE orgs.id = organizations.id);
        
        -- Atualizar description se a coluna existir na tabela organizations
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'description' AND table_schema = 'public') THEN
            UPDATE public.orgs 
            SET description = o2.description
            FROM public.organizations o2
            WHERE orgs.id = o2.id 
            AND orgs.description IS NULL;
        END IF;
        
        -- Atualizar referências em members
        UPDATE public.members 
        SET org_id = (
            SELECT id FROM public.orgs 
            WHERE orgs.name = (
                SELECT name FROM public.organizations 
                WHERE organizations.id = members.org_id
            )
        )
        WHERE org_id IN (SELECT id FROM public.organizations);
        
        -- Atualizar referências em channel_accounts
        UPDATE public.channel_accounts 
        SET org_id = (
            SELECT id FROM public.orgs 
            WHERE orgs.name = (
                SELECT name FROM public.organizations 
                WHERE organizations.id = channel_accounts.org_id
            )
        )
        WHERE org_id IN (SELECT id FROM public.organizations);
        
        -- Atualizar referências em prospects
        UPDATE public.prospects 
        SET org_id = (
            SELECT id FROM public.orgs 
            WHERE orgs.name = (
                SELECT name FROM public.organizations 
                WHERE organizations.id = prospects.org_id
            )
        )
        WHERE org_id IN (SELECT id FROM public.organizations);
        
        -- Atualizar referências em attendants
        UPDATE public.attendants 
        SET org_id = (
            SELECT id FROM public.orgs 
            WHERE orgs.name = (
                SELECT name FROM public.organizations 
                WHERE organizations.id = attendants.org_id
            )
        )
        WHERE org_id IN (SELECT id FROM public.organizations);
        
        -- Atualizar referências em contacts
        UPDATE public.contacts 
        SET org_id = (
            SELECT id FROM public.orgs 
            WHERE orgs.name = (
                SELECT name FROM public.organizations 
                WHERE organizations.id = contacts.org_id
            )
        )
        WHERE org_id IN (SELECT id FROM public.organizations);
        
        -- Atualizar referências em conversations
        UPDATE public.conversations 
        SET org_id = (
            SELECT id FROM public.orgs 
            WHERE orgs.name = (
                SELECT name FROM public.organizations 
                WHERE organizations.id = conversations.org_id
            )
        )
        WHERE org_id IN (SELECT id FROM public.organizations);
        
        -- Remover tabela organizations
        DROP TABLE public.organizations CASCADE;
    END IF;
END $$;

-- 4. Garantir que todas as tabelas referenciam 'orgs' corretamente
-- Verificar e corrigir foreign keys
DO $$
BEGIN
    -- Corrigir members se necessário
    IF EXISTS (SELECT FROM information_schema.table_constraints 
               WHERE constraint_name = 'members_org_id_fkey' 
               AND table_name = 'members') THEN
        ALTER TABLE public.members DROP CONSTRAINT members_org_id_fkey;
    END IF;
    ALTER TABLE public.members ADD CONSTRAINT members_org_id_fkey 
        FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    
    -- Corrigir channel_accounts se necessário
    IF EXISTS (SELECT FROM information_schema.table_constraints 
               WHERE constraint_name = 'channel_accounts_org_id_fkey' 
               AND table_name = 'channel_accounts') THEN
        ALTER TABLE public.channel_accounts DROP CONSTRAINT channel_accounts_org_id_fkey;
    END IF;
    ALTER TABLE public.channel_accounts ADD CONSTRAINT channel_accounts_org_id_fkey 
        FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    
    -- Corrigir prospects se necessário
    IF EXISTS (SELECT FROM information_schema.table_constraints 
               WHERE constraint_name = 'prospects_org_id_fkey' 
               AND table_name = 'prospects') THEN
        ALTER TABLE public.prospects DROP CONSTRAINT prospects_org_id_fkey;
    END IF;
    ALTER TABLE public.prospects ADD CONSTRAINT prospects_org_id_fkey 
        FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    
    -- Corrigir attendants se necessário
    IF EXISTS (SELECT FROM information_schema.table_constraints 
               WHERE constraint_name = 'attendants_org_id_fkey' 
               AND table_name = 'attendants') THEN
        ALTER TABLE public.attendants DROP CONSTRAINT attendants_org_id_fkey;
    END IF;
    ALTER TABLE public.attendants ADD CONSTRAINT attendants_org_id_fkey 
        FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    
    -- Corrigir contacts se necessário
    IF EXISTS (SELECT FROM information_schema.table_constraints 
               WHERE constraint_name = 'contacts_org_id_fkey' 
               AND table_name = 'contacts') THEN
        ALTER TABLE public.contacts DROP CONSTRAINT contacts_org_id_fkey;
    END IF;
    ALTER TABLE public.contacts ADD CONSTRAINT contacts_org_id_fkey 
        FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    
    -- Corrigir conversations se necessário
    IF EXISTS (SELECT FROM information_schema.table_constraints 
               WHERE constraint_name = 'conversations_org_id_fkey' 
               AND table_name = 'conversations') THEN
        ALTER TABLE public.conversations DROP CONSTRAINT conversations_org_id_fkey;
    END IF;
    ALTER TABLE public.conversations ADD CONSTRAINT conversations_org_id_fkey 
        FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
END $$;

-- 5. Criar organização padrão se não existir
INSERT INTO public.orgs (id, name, slug, description, plan)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Connect IA',
    'connect-ia',
    'Sistema de CRM com IA para WhatsApp Business',
    'pro'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    plan = EXCLUDED.plan,
    updated_at = NOW();

-- 6. Garantir que o usuário atual é admin da organização
INSERT INTO public.members (user_id, org_id, role, created_at, updated_at)
SELECT 
    auth.uid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin'::member_role,
    NOW(),
    NOW()
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, org_id) DO UPDATE SET
    role = 'admin'::member_role,
    updated_at = NOW();

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON public.orgs(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_plan ON public.orgs(plan);
CREATE INDEX IF NOT EXISTS idx_members_org_id ON public.members(org_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_accounts_org_id ON public.channel_accounts(org_id);
CREATE INDEX IF NOT EXISTS idx_prospects_org_id ON public.prospects(org_id);
CREATE INDEX IF NOT EXISTS idx_attendants_org_id ON public.attendants(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON public.conversations(org_id);

-- 8. Configurar RLS (Row Level Security) para garantir isolamento por organização
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas RLS para isolamento por organização
-- Política para orgs
DROP POLICY IF EXISTS "Users can view their orgs" ON public.orgs;
CREATE POLICY "Users can view their orgs" ON public.orgs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = orgs.id
        )
    );

-- Política para members
DROP POLICY IF EXISTS "Users can view members in their orgs" ON public.members;
CREATE POLICY "Users can view members in their orgs" ON public.members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members m2
            WHERE m2.user_id = auth.uid() 
            AND m2.org_id = members.org_id
        )
    );

-- Política para channel_accounts
DROP POLICY IF EXISTS "Users can view channels in their orgs" ON public.channel_accounts;
CREATE POLICY "Users can view channels in their orgs" ON public.channel_accounts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = channel_accounts.org_id
        )
    );

-- Política para prospects
DROP POLICY IF EXISTS "Users can view prospects in their orgs" ON public.prospects;
CREATE POLICY "Users can view prospects in their orgs" ON public.prospects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = prospects.org_id
        )
    );

-- Política para attendants
DROP POLICY IF EXISTS "Users can view attendants in their orgs" ON public.attendants;
CREATE POLICY "Users can view attendants in their orgs" ON public.attendants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendants.org_id
        )
    );

-- Política para contacts
DROP POLICY IF EXISTS "Users can view contacts in their orgs" ON public.contacts;
CREATE POLICY "Users can view contacts in their orgs" ON public.contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = contacts.org_id
        )
    );

-- Política para conversations
DROP POLICY IF EXISTS "Users can view conversations in their orgs" ON public.conversations;
CREATE POLICY "Users can view conversations in their orgs" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = conversations.org_id
        )
    );

-- 10. Verificar hierarquia final
SELECT 
    'Hierarquia Final' as status,
    (SELECT COUNT(*) FROM public.orgs) as organizacoes,
    (SELECT COUNT(*) FROM public.members) as membros,
    (SELECT COUNT(*) FROM public.channel_accounts) as canais,
    (SELECT COUNT(*) FROM public.prospects) as prospects,
    (SELECT COUNT(*) FROM public.attendants) as atendentes,
    (SELECT COUNT(*) FROM public.contacts) as contatos,
    (SELECT COUNT(*) FROM public.conversations) as conversas;

-- 11. Verificar foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND ccu.table_name = 'orgs'
ORDER BY tc.table_name, kcu.column_name;
