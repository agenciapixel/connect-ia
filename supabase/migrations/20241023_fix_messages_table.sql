-- Garantir que a tabela messages tenha a estrutura correta
-- Primeiro, verificar se a coluna sender_type existe e tem o valor padrão correto

-- Se a coluna sender_type não existir, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_type' AND table_schema = 'public') THEN
        ALTER TABLE public.messages ADD COLUMN sender_type TEXT NOT NULL DEFAULT 'contact' CHECK (sender_type IN ('user', 'contact', 'system'));
    END IF;
END $$;

-- Se a coluna channel_type não existir, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'channel_type' AND table_schema = 'public') THEN
        ALTER TABLE public.messages ADD COLUMN channel_type TEXT DEFAULT 'whatsapp' CHECK (channel_type IN ('whatsapp', 'instagram', 'telegram', 'email', 'sms'));
    END IF;
END $$;

-- Atualizar registros existentes que tenham sender_type NULL
UPDATE public.messages 
SET sender_type = 'contact' 
WHERE sender_type IS NULL;

-- Atualizar registros existentes que tenham channel_type NULL
UPDATE public.messages 
SET channel_type = 'whatsapp' 
WHERE channel_type IS NULL;

-- Verificar a estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;
