-- Removendo atendentes de teste

-- Limpar atendentes de teste
DELETE FROM public.attendants 
WHERE org_id = '00000000-0000-0000-0000-000000000001' 
AND email IN ('joao@empresa.com', 'maria@empresa.com', 'pedro@empresa.com');


-- Removendo conversas antigas de teste

-- Limpar conversas de teste
DELETE FROM public.conversations 
WHERE org_id = '00000000-0000-0000-0000-000000000000' 
AND created_at < NOW() - INTERVAL '1 day';


-- Removendo mensagens antigas de teste

-- Limpar mensagens de teste (através de conversation_id)
DELETE FROM public.messages 
WHERE conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE org_id = '00000000-0000-0000-0000-000000000000' 
    AND created_at < NOW() - INTERVAL '1 day'
);


-- Removendo prospects antigos de teste

-- Limpar prospects de teste
DELETE FROM public.prospects 
WHERE org_id = '00000000-0000-0000-0000-000000000000' 
AND created_at < NOW() - INTERVAL '1 day';


-- Removendo canais de teste

-- Limpar canais de teste
DELETE FROM public.channel_accounts 
WHERE org_id = '00000000-0000-0000-0000-000000000000' 
AND name LIKE '%teste%' OR name LIKE '%test%';


-- Resetando contadores de atendentes

-- Resetar contadores de atendentes
UPDATE public.attendants 
SET 
    total_chats = 0,
    avg_response_time = 0,
    satisfaction_score = 0.0,
    last_activity_at = NULL
WHERE org_id = '00000000-0000-0000-0000-000000000000';


-- Removendo sessões antigas de atendentes

-- Limpar sessões antigas de atendentes
DELETE FROM public.attendant_sessions 
WHERE ended_at IS NOT NULL 
AND ended_at < NOW() - INTERVAL '7 days';


-- Removendo métricas antigas

-- Limpar métricas antigas
DELETE FROM public.attendant_metrics 
WHERE period_end < NOW() - INTERVAL '30 days';


-- Configurando organização padrão

-- Configurar organização padrão
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


-- Configurando usuário como administrador

-- Configurar usuário atual como admin
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


-- Criando índices para performance

-- Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_messages_org_created ON public.messages(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_org_status ON public.conversations(org_id, status);
CREATE INDEX IF NOT EXISTS idx_prospects_org_created ON public.prospects(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_accounts_org_status ON public.channel_accounts(org_id, status);


-- Configurando políticas RLS

-- Verificar e corrigir políticas RLS
-- As políticas já estão definidas nas migrações, mas vamos garantir que estão ativas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendants ENABLE ROW LEVEL SECURITY;


