-- Garantir que o perfil do usuário atual existe
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Obter o ID do usuário atual (se houver)
    SELECT auth.uid() INTO user_id;
    
    IF user_id IS NOT NULL THEN
        -- Inserir perfil se não existir
        INSERT INTO public.profiles (id, full_name, created_at, updated_at)
        VALUES (user_id, 'Usuário', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
