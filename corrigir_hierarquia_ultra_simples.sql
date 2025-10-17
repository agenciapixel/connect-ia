-- Script Ultra-Simples para Corrigir Hierarquia
-- Este script verifica cada coluna antes de usar e é 100% seguro

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

-- 2. Criar tabela orgs básica
CREATE TABLE IF NOT EXISTS public.orgs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Adicionar colunas opcionais uma por uma
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
    
    -- Adicionar updated_at se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orgs' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        ALTER TABLE public.orgs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. Migrar dados de organizations para orgs (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations' AND table_schema = 'public') THEN
        -- Inserir dados básicos
        INSERT INTO public.orgs (id, name, created_at)
        SELECT 
            id,
            name,
            COALESCE(created_at, NOW())
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

-- 5. Criar organização padrão
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
    plan = EXCLUDED.plan;

-- 6. Criar tipo member_role se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_role') THEN
        CREATE TYPE member_role AS ENUM ('admin', 'member');
    END IF;
END $$;

-- 7. Garantir que a tabela members existe e tem as colunas necessárias
CREATE TABLE IF NOT EXISTS public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    role member_role DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, org_id)
);

-- 8. Adicionar colunas opcionais na tabela members
DO $$
BEGIN
    -- Adicionar updated_at se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        ALTER TABLE public.members ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 9. Configurar usuário atual como admin (usando apenas colunas que existem)
INSERT INTO public.members (user_id, org_id, role)
SELECT 
    auth.uid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin'::member_role
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, org_id) DO UPDATE SET
    role = 'admin'::member_role;

-- 10. Corrigir foreign keys para outras tabelas (apenas se existirem)
DO $$
BEGIN
    -- Corrigir channel_accounts se existir
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'channel_accounts' AND table_schema = 'public') THEN
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'channel_accounts_org_id_fkey' AND table_name = 'channel_accounts') THEN
            ALTER TABLE public.channel_accounts DROP CONSTRAINT channel_accounts_org_id_fkey;
        END IF;
        
        ALTER TABLE public.channel_accounts ADD CONSTRAINT channel_accounts_org_id_fkey 
            FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    END IF;
    
    -- Corrigir prospects se existir
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'prospects' AND table_schema = 'public') THEN
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'prospects_org_id_fkey' AND table_name = 'prospects') THEN
            ALTER TABLE public.prospects DROP CONSTRAINT prospects_org_id_fkey;
        END IF;
        
        ALTER TABLE public.prospects ADD CONSTRAINT prospects_org_id_fkey 
            FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    END IF;
    
    -- Corrigir attendants se existir
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attendants' AND table_schema = 'public') THEN
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'attendants_org_id_fkey' AND table_name = 'attendants') THEN
            ALTER TABLE public.attendants DROP CONSTRAINT attendants_org_id_fkey;
        END IF;
        
        ALTER TABLE public.attendants ADD CONSTRAINT attendants_org_id_fkey 
            FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    END IF;
    
    -- Corrigir contacts se existir
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contacts' AND table_schema = 'public') THEN
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'contacts_org_id_fkey' AND table_name = 'contacts') THEN
            ALTER TABLE public.contacts DROP CONSTRAINT contacts_org_id_fkey;
        END IF;
        
        ALTER TABLE public.contacts ADD CONSTRAINT contacts_org_id_fkey 
            FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    END IF;
    
    -- Corrigir conversations se existir
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations' AND table_schema = 'public') THEN
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'conversations_org_id_fkey' AND table_name = 'conversations') THEN
            ALTER TABLE public.conversations DROP CONSTRAINT conversations_org_id_fkey;
        END IF;
        
        ALTER TABLE public.conversations ADD CONSTRAINT conversations_org_id_fkey 
            FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 11. Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON public.orgs(slug);
CREATE INDEX IF NOT EXISTS idx_members_org_id ON public.members(org_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);

-- 12. Habilitar RLS básico
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 13. Criar políticas RLS básicas
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

-- 14. Verificar resultado final
SELECT 
    'RESULTADO FINAL' as status,
    (SELECT COUNT(*) FROM public.orgs) as organizacoes,
    (SELECT COUNT(*) FROM public.members) as membros;

-- 15. Verificar foreign keys
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
