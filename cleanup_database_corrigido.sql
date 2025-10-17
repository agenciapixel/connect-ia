-- Script corrigido para limpeza e configuração do banco de dados
-- Este script verifica a estrutura das tabelas antes de executar as operações

-- 1. Verificar e criar tabela conversations se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations' AND table_schema = 'public') THEN
        CREATE TABLE public.conversations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
            contact_id UUID,
            channel_type TEXT NOT NULL CHECK (channel_type IN ('whatsapp', 'instagram', 'telegram', 'email', 'sms')),
            channel_account_id UUID REFERENCES public.channel_accounts(id),
            status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'active', 'closed', 'resolved')),
            priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
            subject TEXT,
            last_message_at TIMESTAMP WITH TIME ZONE,
            last_message_content TEXT,
            message_count INTEGER DEFAULT 0,
            assigned_to UUID,
            assigned_agent_id UUID,
            tags TEXT[] DEFAULT '{}',
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_conversations_org_id ON public.conversations(org_id);
        CREATE INDEX idx_conversations_status ON public.conversations(status);
        CREATE INDEX idx_conversations_channel_type ON public.conversations(channel_type);
        CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
        
        -- Habilitar RLS
        ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
        
        -- Criar política RLS
        CREATE POLICY "Users can view conversations in their org" ON public.conversations
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.members 
                    WHERE members.user_id = auth.uid() 
                    AND members.org_id = conversations.org_id
                )
            );
            
        CREATE POLICY "Users can insert conversations in their org" ON public.conversations
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.members 
                    WHERE members.user_id = auth.uid() 
                    AND members.org_id = conversations.org_id
                )
            );
            
        CREATE POLICY "Users can update conversations in their org" ON public.conversations
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.members 
                    WHERE members.user_id = auth.uid() 
                    AND members.org_id = conversations.org_id
                )
            );
    END IF;
END $$;

-- 2. Verificar e criar tabela contacts se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contacts' AND table_schema = 'public') THEN
        CREATE TABLE public.contacts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
            name TEXT,
            phone TEXT,
            email TEXT,
            whatsapp_id TEXT,
            instagram_id TEXT,
            avatar_url TEXT,
            tags TEXT[] DEFAULT '{}',
            notes TEXT,
            metadata JSONB DEFAULT '{}',
            last_contact_at TIMESTAMP WITH TIME ZONE,
            total_conversations INTEGER DEFAULT 0,
            total_messages INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_contacts_org_id ON public.contacts(org_id);
        CREATE INDEX idx_contacts_phone ON public.contacts(phone);
        CREATE INDEX idx_contacts_email ON public.contacts(email);
        CREATE INDEX idx_contacts_whatsapp_id ON public.contacts(whatsapp_id);
        CREATE INDEX idx_contacts_instagram_id ON public.contacts(instagram_id);
        
        -- Habilitar RLS
        ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
        
        -- Criar política RLS
        CREATE POLICY "Users can view contacts in their org" ON public.contacts
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.members 
                    WHERE members.user_id = auth.uid() 
                    AND members.org_id = contacts.org_id
                )
            );
    END IF;
END $$;

-- 3. Limpar dados de teste dos atendentes (usando org_id correto)
DELETE FROM public.attendants 
WHERE org_id = '00000000-0000-0000-0000-000000000000' 
AND email IN ('joao@empresa.com', 'maria@empresa.com', 'pedro@empresa.com');

-- 4. Limpar conversas de teste (usando org_id correto)
DELETE FROM public.conversations 
WHERE org_id = '00000000-0000-0000-0000-000000000000' 
AND created_at < NOW() - INTERVAL '1 day';

-- 5. Limpar mensagens de teste (através de conversation_id)
DELETE FROM public.messages 
WHERE conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE org_id = '00000000-0000-0000-0000-000000000000' 
    AND created_at < NOW() - INTERVAL '1 day'
);

-- 6. Limpar prospects de teste (usando org_id correto)
DELETE FROM public.prospects 
WHERE org_id = '00000000-0000-0000-0000-000000000000' 
AND created_at < NOW() - INTERVAL '1 day';

-- 7. Limpar canais de teste (usando org_id correto)
DELETE FROM public.channel_accounts 
WHERE org_id = '00000000-0000-0000-0000-000000000000' 
AND (name LIKE '%teste%' OR name LIKE '%test%');

-- 8. Limpar contatos de teste (usando org_id correto)
DELETE FROM public.contacts 
WHERE org_id = '00000000-0000-0000-0000-000000000000' 
AND created_at < NOW() - INTERVAL '1 day';

-- 9. Resetar contadores de atendentes
UPDATE public.attendants 
SET 
    total_chats = 0,
    avg_response_time = 0,
    satisfaction_score = 0.0,
    last_activity_at = NULL
WHERE org_id = '00000000-0000-0000-0000-000000000000';

-- 10. Limpar sessões antigas de atendentes
DELETE FROM public.attendant_sessions 
WHERE ended_at IS NOT NULL 
AND ended_at < NOW() - INTERVAL '7 days';

-- 11. Limpar métricas antigas
DELETE FROM public.attendant_metrics 
WHERE period_end < NOW() - INTERVAL '30 days';

-- 12. Configurar organização padrão
INSERT INTO public.organizations (
    id,
    name,
    description,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Connect IA',
    'Organização principal do sistema Connect IA',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 13. Configurar usuário atual como admin
INSERT INTO public.members (
    user_id,
    org_id,
    role,
    created_at,
    updated_at
) 
SELECT 
    auth.uid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin'::member_role,
    NOW(),
    NOW()
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, org_id) DO UPDATE SET
    role = 'admin'::member_role,
    updated_at = NOW();

-- 14. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_org_status ON public.conversations(org_id, status);
CREATE INDEX IF NOT EXISTS idx_prospects_org_created ON public.prospects(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_accounts_org_status ON public.channel_accounts(org_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_org_created ON public.contacts(org_id, created_at DESC);

-- 15. Configurar políticas RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 16. Verificar estrutura final
SELECT 
    'Estrutura Final' as status,
    (SELECT COUNT(*) FROM public.organizations) as organizacoes,
    (SELECT COUNT(*) FROM public.members) as membros,
    (SELECT COUNT(*) FROM public.channel_accounts) as canais,
    (SELECT COUNT(*) FROM public.conversations) as conversas,
    (SELECT COUNT(*) FROM public.messages) as mensagens,
    (SELECT COUNT(*) FROM public.prospects) as prospects,
    (SELECT COUNT(*) FROM public.attendants) as atendentes,
    (SELECT COUNT(*) FROM public.contacts) as contatos;
