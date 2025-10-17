-- Fix auth.users and authorized_users link
-- This migration ensures proper linking between auth.users and authorized_users tables

-- 1. First, let's check if there are any orphaned users in auth.users
-- that don't exist in authorized_users

-- 2. Create a function to sync users from auth.users to authorized_users
CREATE OR REPLACE FUNCTION public.sync_auth_users_to_authorized()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert users from auth.users that don't exist in authorized_users
    INSERT INTO public.authorized_users (email, full_name, role)
    SELECT 
        au.email,
        COALESCE(au.raw_user_meta_data->>'full_name', au.email),
        'user'
    FROM auth.users au
    LEFT JOIN public.authorized_users au2 ON au.email = au2.email
    WHERE au2.email IS NULL
    AND au.email IS NOT NULL;
    
    -- Log the sync
    RAISE NOTICE 'Synced auth.users to authorized_users';
END;
$$;

-- 3. Run the sync function
SELECT public.sync_auth_users_to_authorized();

-- 4. Update the handle_new_user function to be more robust
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
END;
$$;

-- 5. Recreate the trigger to ensure it works properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Create a function to check user authorization
CREATE OR REPLACE FUNCTION public.is_user_authorized(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.authorized_users 
        WHERE email = user_email
    );
END;
$$;

-- 7. Create a function to get user info from both tables
CREATE OR REPLACE FUNCTION public.get_user_info(user_email TEXT)
RETURNS TABLE (
    auth_user_id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    is_authorized BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id as auth_user_id,
        au.email,
        COALESCE(au2.full_name, au.raw_user_meta_data->>'full_name', au.email) as full_name,
        COALESCE(au2.role, 'user') as role,
        (au2.email IS NOT NULL) as is_authorized
    FROM auth.users au
    LEFT JOIN public.authorized_users au2 ON au.email = au2.email
    WHERE au.email = user_email;
END;
$$;

-- 8. Update RLS policies to work with the linked tables
DROP POLICY IF EXISTS "Users can view authorized users" ON public.authorized_users;
CREATE POLICY "Users can view authorized users" ON public.authorized_users
    FOR SELECT USING (
        email IN (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    );

-- 9. Add a policy for admins to manage authorized users
CREATE POLICY "Admins can manage authorized users" ON public.authorized_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.members m
            JOIN public.orgs o ON m.org_id = o.id
            WHERE m.user_id = auth.uid() 
            AND m.role = 'admin'
        )
    );

-- 10. Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_authorized_users_email_lower ON public.authorized_users(LOWER(email));
