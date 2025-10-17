-- Remove problematic trigger and create manual solution
-- The trigger is causing the system to hang

-- 1. Remove the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;

-- 2. Create a simple function to manually create user and org
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

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_user_and_org_manual TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_and_org_manual TO anon;

-- 4. Create a function to fix existing users
CREATE OR REPLACE FUNCTION public.fix_all_users()
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
        SELECT * INTO result FROM public.create_user_and_org_manual(
            user_record.email,
            user_record.full_name
        );
        
        IF result.success THEN
            RAISE NOTICE 'FIXED: User % - Org %', user_record.email, result.org_id;
        ELSE
            RAISE WARNING 'FAILED: User % - %', user_record.email, result.message;
        END IF;
    END LOOP;
END;
$$;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.fix_all_users TO authenticated;

-- 6. Create status view
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
