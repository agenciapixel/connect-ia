-- FIX DUPLICATE USERS PREVENTION
-- This migration improves the user creation trigger to prevent duplicate users

-- 1. Drop the old trigger
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;

-- 2. Create improved function with better duplicate prevention
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    user_full_name TEXT;
    user_email TEXT;
    org_slug TEXT;
    plan_id_var TEXT;
    existing_user_id UUID;
BEGIN
    -- Get user data
    user_email := NEW.email;
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(user_email, '@', 1)
    );
    
    -- Check if user already exists in authorized_users
    SELECT id INTO existing_user_id FROM public.authorized_users WHERE email = user_email;
    
    IF existing_user_id IS NOT NULL THEN
        RAISE WARNING 'User % already exists in authorized_users, skipping creation', user_email;
        RETURN NEW;
    END IF;
    
    -- Get free plan ID
    SELECT id INTO plan_id_var FROM public.plans WHERE id = 'free' LIMIT 1;
    
    -- Generate unique org slug
    org_slug := LOWER(REPLACE(user_full_name, ' ', '-'));
    WHILE EXISTS (SELECT 1 FROM public.orgs WHERE slug = org_slug) LOOP
        org_slug := org_slug || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    END LOOP;
    
    -- Create organization
    INSERT INTO public.orgs (name, slug, plan_id, plan, subscription_status)
    VALUES (
        user_full_name || ' Organization',
        org_slug,
        plan_id_var,
        'Gratuito',
        'trial'
    )
    RETURNING id INTO new_org_id;
    
    -- Create authorized user (with explicit conflict handling)
    BEGIN
        INSERT INTO public.authorized_users (id, email, full_name, role, org_id)
        VALUES (
            NEW.id, -- Use the same ID as auth.users
            user_email,
            user_full_name,
            'user',
            new_org_id
        );
    EXCEPTION
        WHEN unique_violation THEN
            RAISE WARNING 'User % already exists, updating instead', user_email;
            UPDATE public.authorized_users 
            SET 
                org_id = new_org_id,
                full_name = user_full_name,
                updated_at = NOW()
            WHERE email = user_email;
    END;
    
    -- Create membership (with explicit conflict handling)
    BEGIN
        INSERT INTO public.members (user_id, org_id, role)
        VALUES (NEW.id, new_org_id, 'admin');
    EXCEPTION
        WHEN unique_violation THEN
            RAISE WARNING 'Membership already exists for user %, updating instead', user_email;
            UPDATE public.members 
            SET 
                role = 'admin',
                updated_at = NOW()
            WHERE user_id = NEW.id AND org_id = new_org_id;
    END;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Error creating user org: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created_simple 
    AFTER INSERT ON auth.users 
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user_simple();

-- 4. Create a cleanup function to remove orphaned records
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_records()
RETURNS TABLE (
    cleaned_auth_users INTEGER,
    cleaned_authorized_users INTEGER,
    cleaned_members INTEGER,
    cleaned_orgs INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_count INTEGER := 0;
    authorized_count INTEGER := 0;
    members_count INTEGER := 0;
    orgs_count INTEGER := 0;
BEGIN
    -- Remove authorized_users that don't have corresponding auth.users
    DELETE FROM public.authorized_users 
    WHERE email NOT IN (SELECT email FROM auth.users);
    GET DIAGNOSTICS authorized_count = ROW_COUNT;
    
    -- Remove members that don't have corresponding auth.users
    DELETE FROM public.members 
    WHERE user_id NOT IN (SELECT id FROM auth.users);
    GET DIAGNOSTICS members_count = ROW_COUNT;
    
    -- Remove orgs that don't have any members
    DELETE FROM public.orgs 
    WHERE id NOT IN (SELECT DISTINCT org_id FROM public.members WHERE org_id IS NOT NULL);
    GET DIAGNOSTICS orgs_count = ROW_COUNT;
    
    RETURN QUERY SELECT auth_count, authorized_count, members_count, orgs_count;
END;
$$;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.cleanup_orphaned_records TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_orphaned_records TO anon;

-- 6. Log success
DO $$
BEGIN
    RAISE NOTICE '🔒 PREVENÇÃO DE USUÁRIOS DUPLICADOS IMPLEMENTADA!';
    RAISE NOTICE '✅ Trigger melhorado com verificação de duplicatas';
    RAISE NOTICE '✅ Função de limpeza de registros órfãos criada';
    RAISE NOTICE '✅ Sistema robusto contra duplicatas';
END $$;
