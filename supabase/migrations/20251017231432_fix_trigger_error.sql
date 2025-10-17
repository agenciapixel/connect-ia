-- Fix trigger error that's causing database error on user creation
-- The issue is likely with the trigger trying to create org before user is fully created

-- 1. Drop the problematic trigger temporarily
DROP TRIGGER IF EXISTS on_authorized_user_created ON public.authorized_users;

-- 2. Create a simpler, more robust trigger
CREATE OR REPLACE FUNCTION public.handle_new_authorized_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_org_id UUID;
    plan_id_var TEXT;
    org_slug TEXT;
    auth_user_exists BOOLEAN;
BEGIN
    -- Check if the user exists in auth.users
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = NEW.email) INTO auth_user_exists;
    
    -- Only proceed if user exists in auth.users
    IF NOT auth_user_exists THEN
        RAISE WARNING 'User % does not exist in auth.users yet, skipping org creation', NEW.email;
        RETURN NEW;
    END IF;
    
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
    
    -- Generate organization slug from user name or email
    org_slug := LOWER(REPLACE(
        COALESCE(NEW.full_name, SPLIT_PART(NEW.email, '@', 1)), 
        ' ', '-'
    ));
    
    -- Make slug unique by adding timestamp if needed
    WHILE EXISTS (SELECT 1 FROM public.orgs WHERE slug = org_slug) LOOP
        org_slug := org_slug || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    END LOOP;
    
    -- Create organization for the new authorized user
    INSERT INTO public.orgs (name, slug, plan_id, plan_name, subscription_status)
    VALUES (
        COALESCE(NEW.full_name, SPLIT_PART(NEW.email, '@', 1) || ' Organization'),
        org_slug,
        plan_id_var,
        'Gratuito',
        'trial'
    )
    RETURNING id INTO new_org_id;
    
    -- Update the authorized_user with the org_id
    NEW.org_id := new_org_id;
    
    -- Add user to members table if they exist in auth.users
    INSERT INTO public.members (user_id, org_id, role)
    SELECT 
        au.id,
        new_org_id,
        'admin'::member_role
    FROM auth.users au
    WHERE au.email = NEW.email
    ON CONFLICT (user_id, org_id) DO NOTHING;
    
    RAISE NOTICE 'Created organization % for authorized user %', new_org_id, NEW.email;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error creating organization for user %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$;

-- 3. Recreate the trigger
CREATE TRIGGER on_authorized_user_created
    BEFORE INSERT ON public.authorized_users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_authorized_user();

-- 4. Also update the original handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    plan_id_var UUID;
    new_org_id UUID;
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
    
    -- Create organization for the new user
    INSERT INTO public.orgs (name, slug, plan_id, plan_name)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nova Organização'),
        LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', 'nova-organizacao'), ' ', '-')),
        plan_id_var,
        'Gratuito'
    )
    RETURNING id INTO new_org_id;
    
    -- Add user as admin of the new organization
    INSERT INTO public.members (user_id, org_id, role)
    VALUES (NEW.id, new_org_id, 'admin');
    
    -- Add user to authorized_users table (with conflict handling)
    INSERT INTO public.authorized_users (email, full_name, role)
    VALUES (
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'user'
    )
    ON CONFLICT (email) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, authorized_users.full_name),
        updated_at = NOW();
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$;

-- 5. Recreate the auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
