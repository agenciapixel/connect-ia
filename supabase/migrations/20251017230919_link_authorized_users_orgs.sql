-- Link between authorized_users and orgs tables
-- This migration creates better relationships and functions to manage the link

-- 1. Add org_id column to authorized_users table for direct relationship
ALTER TABLE public.authorized_users 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE;

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_authorized_users_org_id ON public.authorized_users(org_id);

-- 3. Create function to get user's organization from authorized_users
CREATE OR REPLACE FUNCTION public.get_user_org_from_authorized(user_email TEXT)
RETURNS TABLE (
    org_id UUID,
    org_name TEXT,
    org_slug TEXT,
    plan_id TEXT,
    subscription_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as org_id,
        o.name as org_name,
        o.slug as org_slug,
        o.plan_id,
        o.subscription_status
    FROM public.authorized_users au
    JOIN public.orgs o ON au.org_id = o.id
    WHERE au.email = user_email;
END;
$$;

-- 4. Create function to get all users in an organization
CREATE OR REPLACE FUNCTION public.get_org_users(org_uuid UUID)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    member_role TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au2.id as user_id,
        au.email,
        au.full_name,
        au.role,
        m.role as member_role,
        au.created_at
    FROM public.authorized_users au
    LEFT JOIN public.members m ON au.email = (
        SELECT email FROM auth.users WHERE id = m.user_id
    )
    LEFT JOIN auth.users au2 ON au.email = au2.email
    WHERE au.org_id = org_uuid
    AND m.org_id = org_uuid;
END;
$$;

-- 5. Create function to assign user to organization
CREATE OR REPLACE FUNCTION public.assign_user_to_org(user_email TEXT, org_uuid UUID, user_role TEXT DEFAULT 'user')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_id UUID;
BEGIN
    -- Get auth user ID
    SELECT id INTO auth_user_id FROM auth.users WHERE email = user_email;
    
    IF auth_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update authorized_users with org_id
    UPDATE public.authorized_users 
    SET org_id = org_uuid, role = user_role, updated_at = NOW()
    WHERE email = user_email;
    
    -- Add to members table if not exists
    INSERT INTO public.members (user_id, org_id, role)
    VALUES (auth_user_id, org_uuid, user_role::member_role)
    ON CONFLICT (user_id, org_id) DO UPDATE SET
        role = user_role::member_role,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$;

-- 6. Create function to create organization and assign user
CREATE OR REPLACE FUNCTION public.create_org_and_assign_user(
    user_email TEXT,
    org_name TEXT,
    org_slug TEXT DEFAULT NULL,
    plan_id TEXT DEFAULT 'free'
)
RETURNS TABLE (
    org_id UUID,
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_org_id UUID;
    auth_user_id UUID;
    generated_slug TEXT;
BEGIN
    -- Generate slug if not provided
    generated_slug := COALESCE(org_slug, LOWER(REPLACE(org_name, ' ', '-')));
    
    -- Get auth user ID
    SELECT id INTO auth_user_id FROM auth.users WHERE email = user_email;
    
    IF auth_user_id IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, FALSE, 'User not found in auth.users';
        RETURN;
    END IF;
    
    -- Create organization
    INSERT INTO public.orgs (name, slug, plan_id, plan_name, subscription_status)
    VALUES (
        org_name,
        generated_slug,
        plan_id,
        (SELECT name FROM public.plans WHERE id = plan_id),
        'trial'
    )
    RETURNING id INTO new_org_id;
    
    -- Assign user to organization
    PERFORM public.assign_user_to_org(user_email, new_org_id, 'admin');
    
    RETURN QUERY SELECT new_org_id, TRUE, 'Organization created and user assigned successfully';
END;
$$;

-- 7. Update the handle_new_user function to use the new organization creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result RECORD;
BEGIN
    -- Use the new function to create org and assign user
    SELECT * INTO result FROM public.create_org_and_assign_user(
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nova Organização'),
        NULL, -- Let function generate slug
        'free'
    );
    
    -- Log the result
    IF result.success THEN
        RAISE NOTICE 'Created organization % for user %', result.org_id, NEW.email;
    ELSE
        RAISE WARNING 'Failed to create organization for user %: %', NEW.email, result.message;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 8. Create function to sync existing users with their organizations
CREATE OR REPLACE FUNCTION public.sync_users_with_orgs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update authorized_users with org_id from members table
    UPDATE public.authorized_users 
    SET org_id = m.org_id,
        updated_at = NOW()
    FROM public.members m
    JOIN auth.users au ON m.user_id = au.id
    WHERE authorized_users.email = au.email
    AND authorized_users.org_id IS NULL;
    
    RAISE NOTICE 'Synced users with their organizations';
END;
$$;

-- 9. Run the sync function
SELECT public.sync_users_with_orgs();

-- 10. Create RLS policies for the new relationships
DROP POLICY IF EXISTS "Users can view their org info" ON public.authorized_users;
CREATE POLICY "Users can view their org info" ON public.authorized_users
    FOR SELECT USING (
        email IN (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    );

-- 11. Create policy for admins to manage organization users
CREATE POLICY "Admins can manage org users" ON public.authorized_users
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 12. Create view for easy access to user-org relationships
CREATE OR REPLACE VIEW public.user_org_view AS
SELECT 
    au.id as auth_user_id,
    au.email,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.created_at as auth_created_at,
    au2.id as authorized_user_id,
    au2.full_name as authorized_full_name,
    au2.role as authorized_role,
    au2.org_id,
    o.name as org_name,
    o.slug as org_slug,
    o.plan_id,
    o.subscription_status,
    m.role as member_role,
    m.created_at as member_since
FROM auth.users au
LEFT JOIN public.authorized_users au2 ON au.email = au2.email
LEFT JOIN public.orgs o ON au2.org_id = o.id
LEFT JOIN public.members m ON au.id = m.user_id AND au2.org_id = m.org_id;

-- 13. Grant permissions on the view
GRANT SELECT ON public.user_org_view TO authenticated;
GRANT SELECT ON public.user_org_view TO anon;
