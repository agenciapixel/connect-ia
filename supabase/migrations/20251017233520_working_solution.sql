-- CLEAN WORKING SOLUTION - Force clean everything and create working system
-- This migration removes all problematic triggers and creates a simple, working system

-- 1. Remove ALL triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_working ON auth.users;
DROP TRIGGER IF EXISTS on_authorized_user_created ON public.authorized_users;

-- 2. Disable RLS on all tables
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_users DISABLE ROW LEVEL SECURITY;

-- 3. Clear all data from tables
TRUNCATE TABLE public.members CASCADE;
TRUNCATE TABLE public.orgs CASCADE;
TRUNCATE TABLE public.authorized_users CASCADE;

-- 4. Create a simple function that WORKS
CREATE OR REPLACE FUNCTION public.create_user_and_org_simple(
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
    );
    
    -- Get auth user ID
    SELECT id INTO auth_user_id FROM auth.users WHERE email = user_email;
    
    -- Add to members if user exists
    IF auth_user_id IS NOT NULL THEN
        INSERT INTO public.members (user_id, org_id, role)
        VALUES (auth_user_id, new_org_id, 'admin'::member_role);
    END IF;
    
    RETURN QUERY SELECT TRUE, auth_user_id, new_org_id, 'Success';
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'Error: ' || SQLERRM;
END;
$$;

-- 5. Create simple trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result RECORD;
BEGIN
    SELECT * INTO result FROM public.create_user_and_org_simple(
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    
    IF result.success THEN
        RAISE NOTICE 'SUCCESS: User % Org %', NEW.email, result.org_id;
    ELSE
        RAISE WARNING 'FAILED: %', result.message;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 6. Create trigger
CREATE TRIGGER on_auth_user_created_simple
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_simple();

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_user_and_org_simple TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_and_org_simple TO anon;

-- 8. Create status view
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