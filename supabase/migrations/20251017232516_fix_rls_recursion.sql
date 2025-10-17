-- Fix RLS infinite recursion in members table
-- The issue is with circular references in RLS policies

-- 1. Drop all existing policies on members table
DROP POLICY IF EXISTS "Users can view members in their orgs" ON public.members;
DROP POLICY IF EXISTS "Users can insert members in their orgs" ON public.members;
DROP POLICY IF EXISTS "Users can update members in their orgs" ON public.members;
DROP POLICY IF EXISTS "Users can delete members in their orgs" ON public.members;

-- 2. Create simple, non-recursive policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.members;
CREATE POLICY "Users can view their own memberships" ON public.members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view members in their organizations" ON public.members
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert members" ON public.members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own memberships" ON public.members
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage members in their orgs" ON public.members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.user_id = auth.uid() 
            AND m.org_id = members.org_id
            AND m.role = 'admin'
        )
    );

-- 3. Fix policies on orgs table to avoid recursion
DROP POLICY IF EXISTS "Users can view orgs they belong to" ON public.orgs;
DROP POLICY IF EXISTS "Users can insert orgs" ON public.orgs;
DROP POLICY IF EXISTS "Users can update orgs" ON public.orgs;
DROP POLICY IF EXISTS "Users can delete orgs" ON public.orgs;

CREATE POLICY "Users can view their organizations" ON public.orgs
    FOR SELECT USING (
        id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert orgs" ON public.orgs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update their orgs" ON public.orgs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.user_id = auth.uid() 
            AND m.org_id = orgs.id
            AND m.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete their orgs" ON public.orgs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.user_id = auth.uid() 
            AND m.org_id = orgs.id
            AND m.role = 'admin'
        )
    );

-- 4. Fix policies on authorized_users table
DROP POLICY IF EXISTS "Users can view their org" ON public.authorized_users;
DROP POLICY IF EXISTS "Users can view authorized users" ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can manage authorized users" ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can manage org users" ON public.authorized_users;

CREATE POLICY "Users can view their own authorized record" ON public.authorized_users
    FOR SELECT USING (
        email IN (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    );

CREATE POLICY "System can insert authorized users" ON public.authorized_users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update authorized users" ON public.authorized_users
    FOR UPDATE WITH CHECK (true);

CREATE POLICY "Admins can view org authorized users" ON public.authorized_users
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 5. Create a simple function to check if user is admin of an org
CREATE OR REPLACE FUNCTION public.is_user_admin_of_org(org_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.members 
        WHERE user_id = auth.uid() 
        AND org_id = org_uuid 
        AND role = 'admin'
    );
END;
$$;

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_user_admin_of_org TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin_of_org TO anon;

-- 7. Create a simple view for user organizations without RLS issues
CREATE OR REPLACE VIEW public.user_organizations AS
SELECT 
    m.user_id,
    m.role as member_role,
    o.id as org_id,
    o.name as org_name,
    o.slug as org_slug,
    o.plan_id,
    o.subscription_status,
    o.created_at as org_created_at
FROM public.members m
JOIN public.orgs o ON m.org_id = o.id
WHERE m.user_id = auth.uid();

-- 8. Grant permissions on the view
GRANT SELECT ON public.user_organizations TO authenticated;
GRANT SELECT ON public.user_organizations TO anon;
