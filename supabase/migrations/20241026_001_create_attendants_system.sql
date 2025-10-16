-- Migration: Sistema Completo de Gestão de Atendentes
-- Data: 2024-10-26

-- 1. Criar enums primeiro
CREATE TYPE attendants_status AS ENUM (
  'online',      -- Disponível para atendimento
  'busy',        -- Atendendo (máximo de conversas)
  'away',        -- Ausente temporariamente
  'offline',     -- Desconectado
  'break',       -- Pausa/intervalo
  'training'     -- Em treinamento
);

CREATE TYPE session_status AS ENUM ('active', 'ended', 'paused');

CREATE TYPE assignment_status AS ENUM (
  'assigned',    -- Atribuído mas não iniciado
  'active',      -- Atendimento ativo
  'transferred', -- Transferido para outro atendente
  'resolved',    -- Resolvido
  'abandoned'    -- Abandonado pelo atendente
);

CREATE TYPE metric_period AS ENUM ('daily', 'weekly', 'monthly');

CREATE TYPE note_type AS ENUM ('general', 'training', 'feedback', 'performance', 'incident');

-- 2. Criar tabela de atendentes (separada do sistema de membros)
CREATE TABLE IF NOT EXISTS public.attendants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  
  -- Informações pessoais
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  
  -- Informações profissionais
  employee_id TEXT, -- ID interno do funcionário
  department TEXT, -- Departamento (atendimento, vendas, suporte)
  position TEXT, -- Cargo (supervisor, agente, especialista)
  
  -- Configurações de trabalho
  status attendants_status DEFAULT 'offline',
  working_hours JSONB, -- {"start": "09:00", "end": "18:00", "timezone": "America/Sao_Paulo", "days": [1,2,3,4,5]}
  max_concurrent_chats INTEGER DEFAULT 5,
  auto_accept BOOLEAN DEFAULT false,
  
  -- Especialidades e habilidades
  skills TEXT[], -- ["vendas", "suporte_tecnico", "cobranca"]
  languages TEXT[] DEFAULT ARRAY['pt-BR'], -- Idiomas que fala
  specializations TEXT[], -- ["produto_a", "produto_b"]
  
  -- Métricas e performance
  total_chats INTEGER DEFAULT 0,
  avg_response_time INTEGER DEFAULT 0, -- em segundos
  satisfaction_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 a 5.00
  last_activity_at TIMESTAMP WITH TIME ZONE,
  
  -- Configurações de notificação
  notifications JSONB DEFAULT '{"email": true, "push": true, "sound": true}',
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(user_id, org_id),
  CHECK (max_concurrent_chats > 0),
  CHECK (satisfaction_score >= 0.00 AND satisfaction_score <= 5.00)
);

-- 3. Criar tabela de sessões de atendimento
CREATE TABLE IF NOT EXISTS public.attendant_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attendant_id UUID REFERENCES public.attendants(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  
  -- Dados da sessão
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Métricas da sessão
  chats_handled INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  avg_response_time INTEGER DEFAULT 0,
  
  -- Status
  status session_status DEFAULT 'active',
  notes TEXT, -- Observações sobre a sessão
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de atribuições de conversas
CREATE TABLE IF NOT EXISTS public.conversation_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  attendant_id UUID REFERENCES public.attendants(id) ON DELETE SET NULL,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  
  -- Dados da atribuição
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unassigned_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID REFERENCES auth.users(id), -- Quem fez a atribuição
  
  -- Métricas da atribuição
  response_time INTEGER, -- Tempo até primeira resposta em segundos
  resolution_time INTEGER, -- Tempo até resolução em segundos
  satisfaction_rating INTEGER, -- Avaliação do cliente (1-5)
  
  -- Status e observações
  status assignment_status DEFAULT 'assigned',
  notes TEXT,
  transfer_reason TEXT, -- Motivo da transferência se houver
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de disponibilidade dos atendentes
CREATE TABLE IF NOT EXISTS public.attendant_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attendant_id UUID REFERENCES public.attendants(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  
  -- Período de disponibilidade
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Configurações
  max_concurrent INTEGER DEFAULT 5,
  auto_accept BOOLEAN DEFAULT false,
  
  -- Status
  is_available BOOLEAN DEFAULT true,
  reason TEXT, -- Motivo da indisponibilidade
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar sobreposição
  UNIQUE(attendant_id, date, start_time, end_time)
);

-- 6. Criar tabela de métricas de performance
CREATE TABLE IF NOT EXISTS public.attendant_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attendant_id UUID REFERENCES public.attendants(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  
  -- Período das métricas
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type metric_period DEFAULT 'daily', -- daily, weekly, monthly
  
  -- Métricas quantitativas
  total_chats INTEGER DEFAULT 0,
  resolved_chats INTEGER DEFAULT 0,
  transferred_chats INTEGER DEFAULT 0,
  abandoned_chats INTEGER DEFAULT 0,
  
  -- Métricas de tempo
  avg_response_time INTEGER DEFAULT 0, -- segundos
  avg_resolution_time INTEGER DEFAULT 0, -- segundos
  total_work_time INTEGER DEFAULT 0, -- minutos
  
  -- Métricas de qualidade
  satisfaction_avg DECIMAL(3,2) DEFAULT 0.00,
  satisfaction_count INTEGER DEFAULT 0,
  
  -- Métricas de produtividade
  messages_sent INTEGER DEFAULT 0,
  first_contact_resolution DECIMAL(5,2) DEFAULT 0.00, -- %
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(attendant_id, period_start, period_end, period_type)
);

-- 7. Criar tabela de templates de resposta dos atendentes
CREATE TABLE IF NOT EXISTS public.attendant_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attendant_id UUID REFERENCES public.attendants(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  
  -- Conteúdo do template
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- "saudacao", "despedida", "produto", etc.
  
  -- Configurações
  is_public BOOLEAN DEFAULT false, -- Se outros atendentes podem usar
  tags TEXT[],
  
  -- Métricas de uso
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Criar tabela de notas e observações dos atendentes
CREATE TABLE IF NOT EXISTS public.attendant_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attendant_id UUID REFERENCES public.attendants(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  
  -- Conteúdo da nota
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type note_type DEFAULT 'general',
  
  -- Metadados
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_attendants_org_status ON public.attendants(org_id, status);
CREATE INDEX IF NOT EXISTS idx_attendants_user_id ON public.attendants(user_id);
CREATE INDEX IF NOT EXISTS idx_attendant_sessions_attendant ON public.attendant_sessions(attendant_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_assignments_conversation ON public.conversation_assignments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_assignments_attendant ON public.conversation_assignments(attendant_id, assigned_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendant_availability_date ON public.attendant_availability(attendant_id, date);
CREATE INDEX IF NOT EXISTS idx_attendant_metrics_period ON public.attendant_metrics(attendant_id, period_start, period_end);

-- 10. Criar triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_attendants_updated_at BEFORE UPDATE ON public.attendants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_assignments_updated_at BEFORE UPDATE ON public.conversation_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendant_templates_updated_at BEFORE UPDATE ON public.attendant_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendant_notes_updated_at BEFORE UPDATE ON public.attendant_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Criar RLS (Row Level Security)
ALTER TABLE public.attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendant_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendant_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendant_notes ENABLE ROW LEVEL SECURITY;

-- 12. Criar políticas RLS
-- Políticas para atendentes
CREATE POLICY "Users can view attendants in their org" ON public.attendants
    FOR SELECT USING (org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage attendants in their org" ON public.attendants
    FOR ALL USING (org_id IN (
        SELECT org_id FROM public.members 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Políticas para sessões
CREATE POLICY "Users can view sessions in their org" ON public.attendant_sessions
    FOR SELECT USING (org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid()));

-- Políticas para atribuições
CREATE POLICY "Users can view assignments in their org" ON public.conversation_assignments
    FOR SELECT USING (org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid()));

-- Políticas para disponibilidade
CREATE POLICY "Users can view availability in their org" ON public.attendant_availability
    FOR SELECT USING (org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid()));

-- Políticas para métricas
CREATE POLICY "Users can view metrics in their org" ON public.attendant_metrics
    FOR SELECT USING (org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid()));

-- Políticas para templates
CREATE POLICY "Users can view templates in their org" ON public.attendant_templates
    FOR SELECT USING (org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid()));

-- Políticas para notas
CREATE POLICY "Users can view notes in their org" ON public.attendant_notes
    FOR SELECT USING (org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid()));

-- 13. Criar funções auxiliares
-- Função para obter atendentes disponíveis
CREATE OR REPLACE FUNCTION get_available_attendants(p_org_id UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    current_chats INTEGER,
    max_concurrent INTEGER,
    skills TEXT[],
    avg_response_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.full_name,
        COALESCE(current_chats.count, 0)::INTEGER as current_chats,
        a.max_concurrent_chats,
        a.skills,
        a.avg_response_time
    FROM public.attendants a
    LEFT JOIN (
        SELECT 
            attendant_id,
            COUNT(*) as count
        FROM public.conversation_assignments ca
        WHERE ca.status = 'active' 
        AND ca.assigned_at >= CURRENT_DATE
        GROUP BY attendant_id
    ) current_chats ON a.id = current_chats.attendant_id
    WHERE a.org_id = p_org_id 
    AND a.status IN ('online', 'away')
    AND COALESCE(current_chats.count, 0) < a.max_concurrent_chats
    ORDER BY COALESCE(current_chats.count, 0) ASC, a.avg_response_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atribuir conversa automaticamente
CREATE OR REPLACE FUNCTION auto_assign_conversation(p_conversation_id UUID)
RETURNS UUID AS $$
DECLARE
    v_attendant_id UUID;
    v_org_id UUID;
BEGIN
    -- Buscar org_id da conversa
    SELECT org_id INTO v_org_id 
    FROM public.conversations 
    WHERE id = p_conversation_id;
    
    -- Buscar atendente disponível
    SELECT id INTO v_attendant_id
    FROM get_available_attendants(v_org_id)
    LIMIT 1;
    
    -- Se encontrou atendente, atribuir
    IF v_attendant_id IS NOT NULL THEN
        INSERT INTO public.conversation_assignments (
            conversation_id,
            attendant_id,
            org_id,
            assigned_by,
            status
        ) VALUES (
            p_conversation_id,
            v_attendant_id,
            v_org_id,
            NULL, -- Sistema fez a atribuição
            'assigned'
        );
        
        -- Atualizar conversa
        UPDATE public.conversations 
        SET assigned_to = v_attendant_id::TEXT, status = 'assigned'
        WHERE id = p_conversation_id;
    END IF;
    
    RETURN v_attendant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Comentários nas tabelas
COMMENT ON TABLE public.attendants IS 'Sistema completo de gestão de atendentes';
COMMENT ON TABLE public.attendant_sessions IS 'Sessões de trabalho dos atendentes';
COMMENT ON TABLE public.conversation_assignments IS 'Atribuições de conversas para atendentes';
COMMENT ON TABLE public.attendant_availability IS 'Disponibilidade e horários dos atendentes';
COMMENT ON TABLE public.attendant_metrics IS 'Métricas e performance dos atendentes';
COMMENT ON TABLE public.attendant_templates IS 'Templates de resposta dos atendentes';
COMMENT ON TABLE public.attendant_notes IS 'Notas e observações sobre atendentes';


