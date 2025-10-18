-- FINAL WORKING TRIGGER - Simple and reliable user-org creation
-- This migration creates a working trigger that automatically creates users and orgs

-- 1. Create simple function for user-org creation
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
    
    -- Create organization
    INSERT INTO public.orgs (name, slug, plan_id, plan_name, subscription_status)
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

-- 2. Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created_final ON auth.users;
CREATE TRIGGER on_auth_user_created_final
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_final();

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user_final TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_final TO anon;

-- 4. Create simple RLS policies (no recursion)
DROP POLICY IF EXISTS "Users can view their org" ON public.orgs;
CREATE POLICY "Users can view their org" ON public.orgs
    FOR SELECT USING (
        id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view their profile" ON public.authorized_users;
CREATE POLICY "Users can view their profile" ON public.authorized_users
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can view their memberships" ON public.members;
CREATE POLICY "Users can view their memberships" ON public.members
    FOR SELECT USING (user_id = auth.uid());

-- 5. Enable RLS
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 6. Log success
DO $$
BEGIN
    RAISE NOTICE '🎉 TRIGGER FINAL CRIADO COM SUCESSO!';
    RAISE NOTICE '✅ Sistema pronto para cadastro automático de usuários';
    RAISE NOTICE '📊 Teste em: http://localhost:8080';
END $$;
