-- Auto-create organization when authorized_user is created
-- This migration ensures that when a user is added to authorized_users, 
-- an organization is automatically created for them

-- 1. Create function to auto-create organization for new authorized user
CREATE OR REPLACE FUNCTION public.handle_new_authorized_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
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
    
    -- Generate organization slug from user name or email
    org_slug := LOWER(REPLACE(
        COALESCE(NEW.full_name, SPLIT_PART(NEW.email, '@', 1)), 
        ' ', '-'
    ));
    
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
END;
$$;

-- 2. Create trigger on authorized_users table
DROP TRIGGER IF EXISTS on_authorized_user_created ON public.authorized_users;
CREATE TRIGGER on_authorized_user_created
    BEFORE INSERT ON public.authorized_users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_authorized_user();

-- 3. Add org_id column to authorized_users if it doesn't exist
ALTER TABLE public.authorized_users 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE;

-- 4. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_authorized_users_org_id ON public.authorized_users(org_id);

-- 5. Create function to manually create org for existing users
CREATE OR REPLACE FUNCTION public.create_org_for_existing_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    new_org_id UUID;
    plan_id_var TEXT;
    org_slug TEXT;
BEGIN
    -- Get the free plan ID
    SELECT id INTO plan_id_var FROM public.plans WHERE name = 'Free Trial' LIMIT 1;
    
    -- Process users that don't have an organization yet
    FOR user_record IN 
        SELECT * FROM public.authorized_users 
        WHERE org_id IS NULL
    LOOP
        -- Generate organization slug
        org_slug := LOWER(REPLACE(
            COALESCE(user_record.full_name, SPLIT_PART(user_record.email, '@', 1)), 
            ' ', '-'
        ));
        
        -- Create organization
        INSERT INTO public.orgs (name, slug, plan_id, plan_name, subscription_status)
        VALUES (
            COALESCE(user_record.full_name, SPLIT_PART(user_record.email, '@', 1) || ' Organization'),
            org_slug,
            plan_id_var,
            'Gratuito',
            'trial'
        )
        RETURNING id INTO new_org_id;
        
        -- Update authorized_user with org_id
        UPDATE public.authorized_users 
        SET org_id = new_org_id, updated_at = NOW()
        WHERE id = user_record.id;
        
        -- Add user to members table if they exist in auth.users
        INSERT INTO public.members (user_id, org_id, role)
        SELECT 
            au.id,
            new_org_id,
            'admin'::member_role
        FROM auth.users au
        WHERE au.email = user_record.email
        ON CONFLICT (user_id, org_id) DO NOTHING;
        
        RAISE NOTICE 'Created organization % for existing user %', new_org_id, user_record.email;
    END LOOP;
END;
$$;

-- 6. Run the function to create orgs for existing users
SELECT public.create_org_for_existing_users();

-- 7. Update RLS policies
DROP POLICY IF EXISTS "Users can view their org" ON public.authorized_users;
CREATE POLICY "Users can view their org" ON public.authorized_users
    FOR SELECT USING (
        email IN (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    );

-- 8. Create simple view for user-org relationship
CREATE OR REPLACE VIEW public.user_org_simple AS
SELECT 
    au.email,
    au.full_name,
    au.role as user_role,
    au.org_id,
    o.name as org_name,
    o.slug as org_slug,
    o.plan_id,
    o.subscription_status
FROM public.authorized_users au
LEFT JOIN public.orgs o ON au.org_id = o.id;

-- 9. Grant permissions
GRANT SELECT ON public.user_org_simple TO authenticated;
GRANT SELECT ON public.user_org_simple TO anon;
