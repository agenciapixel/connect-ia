-- =====================================================
-- MIGRAÇÃO PARA CRIAR TABELA CONVERSATIONS
-- =====================================================

-- Criar tabela conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.channel_accounts(id) ON DELETE CASCADE,
    title TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    tags TEXT[],
    metadata JSONB,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'agent', 'system')),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video')),
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON public.conversations(org_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON public.conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Habilitar RLS nas tabelas
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para conversations
CREATE POLICY "Users can view conversations in their orgs" ON public.conversations
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert conversations in their orgs" ON public.conversations
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update conversations in their orgs" ON public.conversations
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete conversations in their orgs" ON public.conversations
    FOR DELETE USING (
        org_id IN (
            SELECT org_id FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

-- Criar políticas RLS para messages
CREATE POLICY "Users can view messages in their orgs" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE org_id IN (
                SELECT org_id FROM public.members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert messages in their orgs" ON public.messages
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE org_id IN (
                SELECT org_id FROM public.members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update messages in their orgs" ON public.messages
    FOR UPDATE USING (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE org_id IN (
                SELECT org_id FROM public.members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete messages in their orgs" ON public.messages
    FOR DELETE USING (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE org_id IN (
                SELECT org_id FROM public.members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Atualizar estatísticas
ANALYZE public.conversations;
ANALYZE public.messages;

