-- FIX RLS POLICIES FINAL - Create simple RLS policies without recursion
-- This migration creates working RLS policies that don't cause recursion

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "Users can view orgs they belong to" ON public.orgs;
DROP POLICY IF EXISTS "Users can view their org" ON public.orgs;
DROP POLICY IF EXISTS "Users can view their profile" ON public.authorized_users;
DROP POLICY IF EXISTS "Users can view their memberships" ON public.members;

-- 2. Create simple policies without recursion
-- Policy for orgs - users can view orgs where they are members
CREATE POLICY "Users can view their organizations" ON public.orgs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.org_id = orgs.id 
            AND members.user_id = auth.uid()
        )
    );

-- Policy for authorized_users - users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.authorized_users
    FOR SELECT USING (id = auth.uid());

-- Policy for members - users can view their own memberships
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.members;
CREATE POLICY "Users can view their own memberships" ON public.members
    FOR SELECT USING (user_id = auth.uid());

-- 3. Enable RLS
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 4. Log success
DO $$
BEGIN
    RAISE NOTICE '🔒 POLÍTICAS RLS CORRIGIDAS!';
    RAISE NOTICE '✅ Sem recursão - sistema funcionando';
END $$;
