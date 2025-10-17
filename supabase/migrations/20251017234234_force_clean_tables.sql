-- FORCE CLEAN TABLES - Always clean tables on migration
-- This migration ensures tables are always clean

-- 1. Remove ALL triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_working ON auth.users;
DROP TRIGGER IF EXISTS on_authorized_user_created ON public.authorized_users;

-- 2. Disable RLS on all tables
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_users DISABLE ROW LEVEL SECURITY;

-- 3. FORCE CLEAN ALL TABLES
TRUNCATE TABLE public.members CASCADE;
TRUNCATE TABLE public.orgs CASCADE;
TRUNCATE TABLE public.authorized_users CASCADE;
TRUNCATE TABLE public.contacts CASCADE;
TRUNCATE TABLE public.conversations CASCADE;
TRUNCATE TABLE public.messages CASCADE;
TRUNCATE TABLE public.prospects CASCADE;
TRUNCATE TABLE public.attendants CASCADE;
TRUNCATE TABLE public.channel_accounts CASCADE;
TRUNCATE TABLE public.usage_tracking CASCADE;

-- 4. Create simple function for manual user-org creation
CREATE OR REPLACE FUNCTION public.create_user_and_org_clean(
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
    SELECT id INTO plan_id_var FROM public.plans WHERE name = 'Free Trial' LIMIT 1;
    
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
        VALUES (auth_user_id, new_org_id, 'admin'::member_role)
        ON CONFLICT (user_id, org_id) DO UPDATE SET
            role = 'admin'::member_role,
            updated_at = NOW();
    END IF;
    
    RETURN QUERY SELECT TRUE, auth_user_id, new_org_id, 'Success';
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'Error: ' || SQLERRM;
END;
$$;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_user_and_org_clean TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_and_org_clean TO anon;

-- 6. Create function to fix all existing users
CREATE OR REPLACE FUNCTION public.fix_all_users_clean()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    result RECORD;
BEGIN
    -- Process all users in auth.users
    FOR user_record IN 
        SELECT email, raw_user_meta_data->>'full_name' as full_name
        FROM auth.users
    LOOP
        -- Call our function
        SELECT * INTO result FROM public.create_user_and_org_clean(
            user_record.email,
            user_record.full_name
        );
        
        IF result.success THEN
            RAISE NOTICE 'CLEAN FIXED: User % - Org %', user_record.email, result.org_id;
        ELSE
            RAISE WARNING 'CLEAN FAILED: User % - %', user_record.email, result.message;
        END IF;
    END LOOP;
END;
$$;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.fix_all_users_clean TO authenticated;

-- 8. Create status view
CREATE OR REPLACE VIEW public.system_status_clean AS
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

GRANT SELECT ON public.system_status_clean TO authenticated;
GRANT SELECT ON public.system_status_clean TO anon;

-- 9. Log the clean operation
DO $$
BEGIN
    RAISE NOTICE '🧹 TABELAS LIMPAS COM SUCESSO!';
    RAISE NOTICE '📊 Sistema pronto para teste';
END $$;
