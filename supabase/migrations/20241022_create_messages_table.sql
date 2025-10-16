-- Garantir que a tabela messages tenha a estrutura correta
-- Primeiro, verificar se a tabela existe e sua estrutura
DO $$
BEGIN
    -- Se a tabela não existir, criar
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
        CREATE TABLE public.messages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
            sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'contact', 'system')),
            direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
            content TEXT,
            message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document', 'sticker')),
            media_url TEXT,
            channel_type TEXT DEFAULT 'whatsapp' CHECK (channel_type IN ('whatsapp', 'instagram', 'telegram', 'email', 'sms')),
            metadata JSONB DEFAULT '{}',
            status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
            external_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Se a tabela existir, garantir que as colunas necessárias existam
        -- Adicionar sender_type se não existir
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_type' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN sender_type TEXT NOT NULL DEFAULT 'contact' CHECK (sender_type IN ('user', 'contact', 'system'));
        END IF;
        
        -- Adicionar channel_type se não existir
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'channel_type' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN channel_type TEXT DEFAULT 'whatsapp' CHECK (channel_type IN ('whatsapp', 'instagram', 'telegram', 'email', 'sms'));
        END IF;
    END IF;
END $$;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_type ON public.messages(channel_type);
CREATE INDEX IF NOT EXISTS idx_messages_external_id ON public.messages(external_id);

-- Habilitar RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Criar política RLS se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Allow all for authenticated users on messages') THEN
        CREATE POLICY "Allow all for authenticated users on messages" ON public.messages
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;
