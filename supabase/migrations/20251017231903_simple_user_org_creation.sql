-- Simple and working user-organization creation system
-- This migration removes complex triggers and creates a simple, reliable system

-- 1. Remove all problematic triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_authorized_user_created ON public.authorized_users;

-- 2. Create a simple function that works reliably
CREATE OR REPLACE FUNCTION public.create_user_with_org(
    user_email TEXT,
    user_name TEXT DEFAULT NULL,
    user_password TEXT DEFAULT NULL
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
    new_user_id UUID;
    new_org_id UUID;
    plan_id_var TEXT;
    org_slug TEXT;
BEGIN
    -- Get the free plan ID
    SELECT id INTO plan_id_var FROM public.plans WHERE name = 'Free Trial' LIMIT 1;
    
    -- If no free plan exists, create one
    IF plan_id_var IS NULL THEN
        INSERT INTO public.plans (id, name, description, price_monthly, price_yearly, trial_days, limits, features, is_active, is_popular)
        VALUES (
            'free',
            'Free Trial',
            'Teste grátis por 14 dias',
            0.00,
            0.00,
            14,
            '{"contacts": 100, "ai_agents": 0, "price_usd": 0, "integrations": 1, "margin_percentage": -100, "estimated_cost_usd": 40, "api_calls_per_month": 1000, "campaigns_per_month": 0, "google_places_searches": 0}',
            '{"Dashboard básico","Inbox (50 conversas)","100 contatos","1 integração","Suporte por email"}',
            true,
            false
        )
        RETURNING id INTO plan_id_var;
    END IF;
    
    -- Generate organization slug
    org_slug := LOWER(REPLACE(
        COALESCE(user_name, SPLIT_PART(user_email, '@', 1)), 
        ' ', '-'
    ));
    
    -- Make slug unique
    WHILE EXISTS (SELECT 1 FROM public.orgs WHERE slug = org_slug) LOOP
        org_slug := org_slug || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    END LOOP;
    
    -- Create organization first
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
    
    -- Get the user ID from auth.users if it exists
    SELECT id INTO new_user_id FROM auth.users WHERE email = user_email;
    
    -- If user exists in auth.users, add to members
    IF new_user_id IS NOT NULL THEN
        INSERT INTO public.members (user_id, org_id, role)
        VALUES (new_user_id, new_org_id, 'admin'::member_role)
        ON CONFLICT (user_id, org_id) DO UPDATE SET
            role = 'admin'::member_role,
            updated_at = NOW();
    END IF;
    
    RETURN QUERY SELECT TRUE, new_user_id, new_org_id, 'User and organization created successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'Error: ' || SQLERRM;
END;
$$;

-- 3. Create a simple trigger that just calls our function
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result RECORD;
BEGIN
    -- Call our reliable function
    SELECT * INTO result FROM public.create_user_with_org(
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    
    -- Log the result
    IF result.success THEN
        RAISE NOTICE 'Successfully created user % and org %', NEW.email, result.org_id;
    ELSE
        RAISE WARNING 'Failed to create user %: %', NEW.email, result.message;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. Create the trigger
CREATE TRIGGER on_auth_user_created_simple
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_simple();

-- 5. Create a function to manually create org for existing users
CREATE OR REPLACE FUNCTION public.create_orgs_for_existing_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    result RECORD;
BEGIN
    -- Process users that don't have an organization yet
    FOR user_record IN 
        SELECT DISTINCT au.email, au.raw_user_meta_data->>'full_name' as full_name
        FROM auth.users au
        LEFT JOIN public.authorized_users au2 ON au.email = au2.email
        WHERE au2.email IS NULL OR au2.org_id IS NULL
    LOOP
        -- Call our reliable function
        SELECT * INTO result FROM public.create_user_with_org(
            user_record.email,
            user_record.full_name
        );
        
        IF result.success THEN
            RAISE NOTICE 'Created org % for existing user %', result.org_id, user_record.email;
        ELSE
            RAISE WARNING 'Failed to create org for user %: %', user_record.email, result.message;
        END IF;
    END LOOP;
END;
$$;

-- 6. Run the function to create orgs for existing users
SELECT public.create_orgs_for_existing_users();

-- 7. Create a simple view to check the data
CREATE OR REPLACE VIEW public.user_org_status AS
SELECT 
    au.email,
    au.raw_user_meta_data->>'full_name' as auth_name,
    au.created_at as auth_created_at,
    au2.full_name as authorized_name,
    au2.role as authorized_role,
    au2.org_id,
    o.name as org_name,
    o.slug as org_slug,
    o.created_at as org_created_at,
    m.role as member_role,
    CASE 
        WHEN au2.email IS NULL THEN 'Missing in authorized_users'
        WHEN au2.org_id IS NULL THEN 'Missing organization'
        WHEN o.id IS NULL THEN 'Organization not found'
        WHEN m.user_id IS NULL THEN 'Missing member record'
        ELSE 'Complete'
    END as status
FROM auth.users au
LEFT JOIN public.authorized_users au2 ON au.email = au2.email
LEFT JOIN public.orgs o ON au2.org_id = o.id
LEFT JOIN public.members m ON au.id = m.user_id AND au2.org_id = m.org_id
ORDER BY au.created_at DESC;

-- 8. Grant permissions
GRANT SELECT ON public.user_org_status TO authenticated;
GRANT SELECT ON public.user_org_status TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_with_org TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_orgs_for_existing_users TO authenticated;
