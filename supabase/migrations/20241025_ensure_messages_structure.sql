-- Garantir que a tabela messages tenha a estrutura correta
-- Verificar e corrigir a coluna sender_type

-- Primeiro, verificar se a coluna sender_type existe
DO $$
BEGIN
    -- Se a coluna não existir, criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'sender_type' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.messages 
        ADD COLUMN sender_type TEXT NOT NULL DEFAULT 'contact' 
        CHECK (sender_type IN ('user', 'contact', 'system'));
    ELSE
        -- Se existir mas não tiver valor padrão, adicionar
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' 
            AND column_name = 'sender_type' 
            AND table_schema = 'public'
            AND column_default IS NOT NULL
        ) THEN
            ALTER TABLE public.messages 
            ALTER COLUMN sender_type SET DEFAULT 'contact';
        END IF;
        
        -- Garantir que a constraint existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.check_constraints 
            WHERE constraint_name LIKE '%sender_type%'
        ) THEN
            ALTER TABLE public.messages 
            ADD CONSTRAINT messages_sender_type_check 
            CHECK (sender_type IN ('user', 'contact', 'system'));
        END IF;
    END IF;
END $$;

-- Atualizar registros existentes que tenham sender_type NULL
UPDATE public.messages 
SET sender_type = 'contact' 
WHERE sender_type IS NULL;

-- Verificar a estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;
