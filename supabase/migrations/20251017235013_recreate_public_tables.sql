-- RECREATE PUBLIC TABLES - Recreate essential public tables after cleanup
-- This migration recreates the necessary public tables

-- 1. Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    max_users INTEGER DEFAULT 1,
    max_contacts INTEGER DEFAULT 1000,
    max_conversations INTEGER DEFAULT 100,
    max_attendants INTEGER DEFAULT 1,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create orgs table
CREATE TABLE IF NOT EXISTS public.orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan_id TEXT REFERENCES public.plans(id),
    plan_name TEXT DEFAULT 'Gratuito',
    subscription_status TEXT DEFAULT 'trial',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create authorized_users table
CREATE TABLE IF NOT EXISTS public.authorized_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    org_id UUID REFERENCES public.orgs(id),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create members table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    org_id UUID NOT NULL REFERENCES public.orgs(id),
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, org_id)
);

-- 5. Create other essential tables
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id),
    name TEXT,
    phone TEXT,
    email TEXT,
    source TEXT DEFAULT 'manual',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id),
    contact_id UUID REFERENCES public.contacts(id),
    channel TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id),
    content TEXT NOT NULL,
    sender TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.channel_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id),
    channel TEXT NOT NULL,
    account_id TEXT NOT NULL,
    account_name TEXT,
    settings JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id),
    metric_name TEXT NOT NULL,
    metric_value INTEGER DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insert default plan
INSERT INTO public.plans (id, name, description, price_monthly, price_yearly, features, limits, is_active, is_trial, trial_days)
VALUES (
    'free',
    'Gratuito',
    'Plano gratuito com funcionalidades básicas',
    0.00,
    0.00,
    ARRAY['ai_agents', 'basic_analytics', 'whatsapp'],
    '{"max_users": 1, "max_contacts": 1000, "max_conversations": 100, "max_attendants": 1}'::jsonb,
    true,
    true,
    30
) ON CONFLICT (id) DO NOTHING;

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_orgs_plan_id ON public.orgs(plan_id);
CREATE INDEX IF NOT EXISTS idx_authorized_users_org_id ON public.authorized_users(org_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_org_id ON public.members(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON public.conversations(org_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_attendants_org_id ON public.attendants(org_id);
CREATE INDEX IF NOT EXISTS idx_channel_accounts_org_id ON public.channel_accounts(org_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_org_id ON public.usage_tracking(org_id);

-- 8. Create function to manually create user and org
CREATE OR REPLACE FUNCTION public.create_user_and_org_manual(
    user_email TEXT,
    user_name TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    user_id UUID,
    org_id UUID,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_org_id UUID;
    plan_id_var TEXT;
    org_slug TEXT;
    auth_user_id UUID;
BEGIN
    -- Get free plan
    SELECT id INTO plan_id_var FROM public.plans WHERE name = 'Gratuito' LIMIT 1;
    
    -- Generate org slug
    org_slug := LOWER(REPLACE(
        COALESCE(user_name, SPLIT_PART(user_email, '@', 1)), 
        ' ', '-'
    ));
    
    -- Make slug unique
    WHILE EXISTS (SELECT 1 FROM public.orgs WHERE slug = org_slug) LOOP
        org_slug := org_slug || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    END LOOP;
    
    -- Create organization
    INSERT INTO public.orgs (name, slug, plan_id, plan_name, subscription_status)
    VALUES (
        COALESCE(user_name, SPLIT_PART(user_email, '@', 1) || ' Organization'),
        org_slug,
        plan_id_var,
        'Gratuito',
        'trial'
    )
    RETURNING id INTO new_org_id;
    
    -- Add to authorized_users
    INSERT INTO public.authorized_users (email, full_name, role, org_id)
    VALUES (
        user_email,
        COALESCE(user_name, SPLIT_PART(user_email, '@', 1)),
        'user',
        new_org_id
    )
    ON CONFLICT (email) DO UPDATE SET
        org_id = new_org_id,
        full_name = COALESCE(EXCLUDED.full_name, authorized_users.full_name),
        updated_at = NOW();
    
    -- Get auth user ID
    SELECT id INTO auth_user_id FROM auth.users WHERE email = user_email;
    
    -- Add to members if user exists
    IF auth_user_id IS NOT NULL THEN
        INSERT INTO public.members (user_id, org_id, role)
        VALUES (auth_user_id, new_org_id, 'admin')
        ON CONFLICT (user_id, org_id) DO UPDATE SET
            role = 'admin',
            updated_at = NOW();
    END IF;
    
    RETURN QUERY SELECT TRUE, auth_user_id, new_org_id, 'Success';
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'Error: ' || SQLERRM;
END;
$$;

-- 9. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_user_and_org_manual TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_and_org_manual TO anon;

-- 10. Create status view
CREATE OR REPLACE VIEW public.system_status AS
SELECT 
    'auth.users' as table_name,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'authorized_users' as table_name,
    COUNT(*) as count
FROM public.authorized_users
UNION ALL
SELECT 
    'orgs' as table_name,
    COUNT(*) as count
FROM public.orgs
UNION ALL
SELECT 
    'members' as table_name,
    COUNT(*) as count
FROM public.members;

GRANT SELECT ON public.system_status TO authenticated;
GRANT SELECT ON public.system_status TO anon;

-- 11. Log success
DO $$
BEGIN
    RAISE NOTICE '✅ TABELAS PÚBLICAS RECRIADAS COM SUCESSO!';
    RAISE NOTICE '📊 Sistema pronto para cadastro de usuários';
END $$;
