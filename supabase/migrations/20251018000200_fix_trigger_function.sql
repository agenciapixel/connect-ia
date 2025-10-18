-- FIX TRIGGER FUNCTION - Correct the column names in the trigger function
-- This migration fixes the column name mismatch in the trigger function

-- 1. Fix the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_final()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    user_full_name TEXT;
    user_email TEXT;
    org_slug TEXT;
    plan_id_var TEXT;
BEGIN
    -- Get user data
    user_email := NEW.email;
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(user_email, '@', 1)
    );
    
    -- Get free plan ID
    SELECT id INTO plan_id_var FROM public.plans WHERE id = 'free' LIMIT 1;
    
    -- Generate unique org slug
    org_slug := LOWER(REPLACE(user_full_name, ' ', '-'));
    WHILE EXISTS (SELECT 1 FROM public.orgs WHERE slug = org_slug) LOOP
        org_slug := org_slug || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    END LOOP;
    
    -- Create organization (using correct column names)
    INSERT INTO public.orgs (name, slug, plan_id, plan, subscription_status)
    VALUES (
        user_full_name || ' Organization',
        org_slug,
        plan_id_var,
        'Gratuito',
        'trial'
    )
    RETURNING id INTO new_org_id;
    
    -- Create authorized user
    INSERT INTO public.authorized_users (email, full_name, role, org_id)
    VALUES (
        user_email,
        user_full_name,
        'user',
        new_org_id
    )
    ON CONFLICT (email) DO UPDATE SET
        org_id = new_org_id,
        full_name = user_full_name,
        updated_at = NOW();
    
    -- Create membership
    INSERT INTO public.members (user_id, org_id, role)
    VALUES (NEW.id, new_org_id, 'admin')
    ON CONFLICT (user_id, org_id) DO UPDATE SET
        role = 'admin',
        updated_at = NOW();
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Error creating user org: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix the manual function too
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
    SELECT id INTO plan_id_var FROM public.plans WHERE id = 'free' LIMIT 1;
    
    -- Generate org slug
    org_slug := LOWER(REPLACE(
        COALESCE(user_name, SPLIT_PART(user_email, '@', 1)), 
        ' ', '-'
    ));
    
    -- Make slug unique
    WHILE EXISTS (SELECT 1 FROM public.orgs WHERE slug = org_slug) LOOP
        org_slug := org_slug || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    END LOOP;
    
    -- Create organization (using correct column names)
    INSERT INTO public.orgs (name, slug, plan_id, plan, subscription_status)
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

-- 3. Log success
DO $$
BEGIN
    RAISE NOTICE '🔧 FUNÇÃO DO TRIGGER CORRIGIDA!';
    RAISE NOTICE '✅ Agora usando colunas corretas da tabela orgs';
END $$;
