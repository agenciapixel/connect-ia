-- Script Simplificado para Corrigir Hierarquia Organização > Usuários
-- Este script é mais seguro e verifica cada passo antes de executar

-- 1. Verificar estrutura atual
SELECT 
    'ESTRUTURA ATUAL' as status,
    table_name,
    CASE 
        WHEN table_name = 'orgs' THEN '✅ Tabela principal'
        WHEN table_name = 'organizations' THEN '⚠️ Tabela duplicada'
        ELSE '📊 Tabela de dados'
    END as observacao
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orgs', 'organizations', 'members', 'channel_accounts', 'conversations', 'messages', 'prospects', 'attendants', 'contacts')
ORDER BY table_name;

-- 2. Criar tabela orgs com estrutura mínima
CREATE TABLE IF NOT EXISTS public.orgs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Adicionar colunas opcionais se não existirem
DO $$
BEGIN
    -- Adicionar slug se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'slug' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN slug TEXT;
    END IF;
    
    -- Adicionar description se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'description' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN description TEXT;
    END IF;
    
    -- Adicionar plan se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'plan' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN plan TEXT DEFAULT 'free';
    END IF;
    
    -- Adicionar settings se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'settings' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN settings JSONB DEFAULT '{}';
    END IF;
END $$;

-- 4. Migrar dados de organizations para orgs (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations' AND table_schema = 'public') THEN
        -- Inserir dados básicos
        INSERT INTO public.orgs (id, name, created_at, updated_at)
        SELECT 
            id,
            name,
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
        FROM public.organizations
        WHERE NOT EXISTS (SELECT 1 FROM public.orgs WHERE orgs.id = organizations.id);
        
        -- Atualizar slug
        UPDATE public.orgs 
        SET slug = LOWER(REPLACE(name, ' ', '-'))
        WHERE slug IS NULL;
        
        -- Atualizar description se existir na tabela organizations
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'description' AND table_schema = 'public') THEN
            UPDATE public.orgs 
            SET description = o2.description
            FROM public.organizations o2
            WHERE orgs.id = o2.id;
        END IF;
    END IF;
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

-- 6. Corrigir foreign keys para apontar para orgs
DO $$
BEGIN
    -- Corrigir members
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'members' AND table_schema = 'public') THEN
        -- Remover constraint antiga se existir
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'members_org_id_fkey' AND table_name = 'members') THEN
            ALTER TABLE public.members DROP CONSTRAINT members_org_id_fkey;
        END IF;
        
        -- Adicionar nova constraint
        ALTER TABLE public.members ADD CONSTRAINT members_org_id_fkey 
            FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    END IF;
    
    -- Corrigir channel_accounts
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'channel_accounts' AND table_schema = 'public') THEN
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'channel_accounts_org_id_fkey' AND table_name = 'channel_accounts') THEN
            ALTER TABLE public.channel_accounts DROP CONSTRAINT channel_accounts_org_id_fkey;
        END IF;
        
        ALTER TABLE public.channel_accounts ADD CONSTRAINT channel_accounts_org_id_fkey 
            FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    END IF;
    
    -- Corrigir prospects
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'prospects' AND table_schema = 'public') THEN
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'prospects_org_id_fkey' AND table_name = 'prospects') THEN
            ALTER TABLE public.prospects DROP CONSTRAINT prospects_org_id_fkey;
        END IF;
        
        ALTER TABLE public.prospects ADD CONSTRAINT prospects_org_id_fkey 
            FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    END IF;
    
    -- Corrigir attendants
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attendants' AND table_schema = 'public') THEN
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'attendants_org_id_fkey' AND table_name = 'attendants') THEN
            ALTER TABLE public.attendants DROP CONSTRAINT attendants_org_id_fkey;
        END IF;
        
        ALTER TABLE public.attendants ADD CONSTRAINT attendants_org_id_fkey 
            FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    END IF;
    
    -- Corrigir contacts
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contacts' AND table_schema = 'public') THEN
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'contacts_org_id_fkey' AND table_name = 'contacts') THEN
            ALTER TABLE public.contacts DROP CONSTRAINT contacts_org_id_fkey;
        END IF;
        
        ALTER TABLE public.contacts ADD CONSTRAINT contacts_org_id_fkey 
            FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    END IF;
    
    -- Corrigir conversations
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations' AND table_schema = 'public') THEN
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'conversations_org_id_fkey' AND table_name = 'conversations') THEN
            ALTER TABLE public.conversations DROP CONSTRAINT conversations_org_id_fkey;
        END IF;
        
        ALTER TABLE public.conversations ADD CONSTRAINT conversations_org_id_fkey 
            FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 7. Garantir que a tabela members tem as colunas necessárias
DO $$
BEGIN
    -- Adicionar coluna created_at se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'created_at' AND table_schema = 'public') THEN
        ALTER TABLE public.members ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Adicionar coluna updated_at se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        ALTER TABLE public.members ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 8. Configurar usuário atual como admin
INSERT INTO public.members (user_id, org_id, role)
SELECT 
    auth.uid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin'::member_role
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, org_id) DO UPDATE SET
    role = 'admin'::member_role;

-- 9. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON public.orgs(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_plan ON public.orgs(plan);
CREATE INDEX IF NOT EXISTS idx_members_org_id ON public.members(org_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);

-- 10. Habilitar RLS
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 11. Criar políticas RLS básicas
DO $$
BEGIN
    -- Política para orgs
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'orgs' AND policyname = 'Users can view their orgs') THEN
        CREATE POLICY "Users can view their orgs" ON public.orgs
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.members 
                    WHERE members.user_id = auth.uid() 
                    AND members.org_id = orgs.id
                )
            );
    END IF;
    
    -- Política para members
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'members' AND policyname = 'Users can view members in their orgs') THEN
        CREATE POLICY "Users can view members in their orgs" ON public.members
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.members m2
                    WHERE m2.user_id = auth.uid() 
                    AND m2.org_id = members.org_id
                )
            );
    END IF;
END $$;

-- 12. Verificar resultado final
SELECT 
    'RESULTADO FINAL' as status,
    (SELECT COUNT(*) FROM public.orgs) as organizacoes,
    (SELECT COUNT(*) FROM public.members) as membros,
    (SELECT COUNT(*) FROM public.channel_accounts) as canais,
    (SELECT COUNT(*) FROM public.prospects) as prospects,
    (SELECT COUNT(*) FROM public.attendants) as atendentes,
    (SELECT COUNT(*) FROM public.contacts) as contatos,
    (SELECT COUNT(*) FROM public.conversations) as conversas;

-- 13. Verificar foreign keys
SELECT
    'FOREIGN KEYS' as categoria,
    tc.table_name as tabela,
    kcu.column_name as coluna,
    ccu.table_name as tabela_referenciada,
    CASE 
        WHEN ccu.table_name = 'orgs' THEN '✅ CORRETO'
        ELSE '❌ INCORRETO'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND kcu.column_name = 'org_id'
ORDER BY tc.table_name;
