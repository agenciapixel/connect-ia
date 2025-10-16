-- Criar tabela members para relacionar usuários com organizações
CREATE TABLE IF NOT EXISTS public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role member_role DEFAULT 'member'::member_role,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que um usuário só pode ter um papel por organização
    UNIQUE(user_id, org_id)
);

-- Habilitar RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own memberships" ON public.members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memberships" ON public.members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships" ON public.members
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memberships" ON public.members
    FOR DELETE USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_org_id ON public.members(org_id);

-- Inserir o usuário atual como admin da organização fixa
INSERT INTO public.members (user_id, org_id, role)
SELECT 
    auth.uid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin'::member_role
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, org_id) DO NOTHING;
