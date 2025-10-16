-- Adicionar coluna channel_type na tabela messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS channel_type TEXT DEFAULT 'whatsapp' 
CHECK (channel_type IN ('whatsapp', 'instagram', 'telegram', 'email', 'sms'));

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_messages_channel_type ON public.messages(channel_type);

-- Atualizar registros existentes para ter o valor padrão
UPDATE public.messages 
SET channel_type = 'whatsapp' 
WHERE channel_type IS NULL;
