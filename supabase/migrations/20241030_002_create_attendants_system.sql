-- Migration: Create Attendants System Tables
-- Description: Create all necessary tables for the attendants management system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create attendants table
CREATE TABLE IF NOT EXISTS public.attendants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    employee_id TEXT,
    department TEXT,
    position TEXT,
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'busy', 'away', 'offline', 'break', 'training')),
    working_hours JSONB DEFAULT '{}',
    max_concurrent_chats INTEGER DEFAULT 5 CHECK (max_concurrent_chats > 0 AND max_concurrent_chats <= 20),
    auto_accept BOOLEAN DEFAULT false,
    skills TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',
    total_chats INTEGER DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0, -- in seconds
    satisfaction_score DECIMAL(3,2) DEFAULT 0.0 CHECK (satisfaction_score >= 0 AND satisfaction_score <= 5),
    last_activity_at TIMESTAMP WITH TIME ZONE,
    notifications JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create conversation_assignments table
CREATE TABLE IF NOT EXISTS public.conversation_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    attendant_id UUID NOT NULL REFERENCES public.attendants(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unassigned_at TIMESTAMP WITH TIME ZONE,
    assigned_by UUID REFERENCES auth.users(id),
    response_time INTEGER, -- in seconds
    resolution_time INTEGER, -- in minutes
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'transferred', 'resolved', 'abandoned')),
    notes TEXT,
    transfer_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendant_sessions table
CREATE TABLE IF NOT EXISTS public.attendant_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attendant_id UUID NOT NULL REFERENCES public.attendants(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    chats_handled INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0, -- in seconds
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'paused')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendant_metrics table
CREATE TABLE IF NOT EXISTS public.attendant_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attendant_id UUID NOT NULL REFERENCES public.attendants(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    total_chats INTEGER DEFAULT 0,
    resolved_chats INTEGER DEFAULT 0,
    transferred_chats INTEGER DEFAULT 0,
    abandoned_chats INTEGER DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0, -- in seconds
    avg_resolution_time INTEGER DEFAULT 0, -- in minutes
    total_work_time INTEGER DEFAULT 0, -- in minutes
    satisfaction_avg DECIMAL(3,2) DEFAULT 0.0,
    satisfaction_count INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    first_contact_resolution DECIMAL(5,2) DEFAULT 0.0, -- percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendant_availability table
CREATE TABLE IF NOT EXISTS public.attendant_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attendant_id UUID NOT NULL REFERENCES public.attendants(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT true,
    break_start TIME,
    break_end TIME,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(attendant_id, date)
);

-- Add assigned_to column to conversations table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' 
        AND column_name = 'assigned_to' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN assigned_to UUID REFERENCES public.attendants(id);
    END IF;
END $$;

-- Add assigned_agent_id column to conversations table if it doesn't exist (alternative naming)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' 
        AND column_name = 'assigned_agent_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN assigned_agent_id UUID REFERENCES public.attendants(id);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendants_org_id ON public.attendants(org_id);
CREATE INDEX IF NOT EXISTS idx_attendants_status ON public.attendants(status);
CREATE INDEX IF NOT EXISTS idx_attendants_user_id ON public.attendants(user_id);
CREATE INDEX IF NOT EXISTS idx_attendants_email ON public.attendants(email);

CREATE INDEX IF NOT EXISTS idx_conversation_assignments_conversation_id ON public.conversation_assignments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_assignments_attendant_id ON public.conversation_assignments(attendant_id);
CREATE INDEX IF NOT EXISTS idx_conversation_assignments_org_id ON public.conversation_assignments(org_id);
CREATE INDEX IF NOT EXISTS idx_conversation_assignments_status ON public.conversation_assignments(status);

CREATE INDEX IF NOT EXISTS idx_attendant_sessions_attendant_id ON public.attendant_sessions(attendant_id);
CREATE INDEX IF NOT EXISTS idx_attendant_sessions_org_id ON public.attendant_sessions(org_id);
CREATE INDEX IF NOT EXISTS idx_attendant_sessions_status ON public.attendant_sessions(status);

CREATE INDEX IF NOT EXISTS idx_attendant_metrics_attendant_id ON public.attendant_metrics(attendant_id);
CREATE INDEX IF NOT EXISTS idx_attendant_metrics_org_id ON public.attendant_metrics(org_id);
CREATE INDEX IF NOT EXISTS idx_attendant_metrics_period ON public.attendant_metrics(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_attendant_availability_attendant_id ON public.attendant_availability(attendant_id);
CREATE INDEX IF NOT EXISTS idx_attendant_availability_date ON public.attendant_availability(date);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_attendants
    BEFORE UPDATE ON public.attendants
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_conversation_assignments
    BEFORE UPDATE ON public.conversation_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_attendant_sessions
    BEFORE UPDATE ON public.attendant_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_attendant_metrics
    BEFORE UPDATE ON public.attendant_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_attendant_availability
    BEFORE UPDATE ON public.attendant_availability
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendant_availability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for attendants
CREATE POLICY "Users can view attendants in their org" ON public.attendants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendants.org_id
        )
    );

CREATE POLICY "Users can insert attendants in their org" ON public.attendants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendants.org_id
            AND members.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can update attendants in their org" ON public.attendants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendants.org_id
            AND members.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can delete attendants in their org" ON public.attendants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendants.org_id
            AND members.role = 'admin'
        )
    );

-- Create RLS policies for conversation_assignments
CREATE POLICY "Users can view conversation_assignments in their org" ON public.conversation_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = conversation_assignments.org_id
        )
    );

CREATE POLICY "Users can insert conversation_assignments in their org" ON public.conversation_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = conversation_assignments.org_id
        )
    );

CREATE POLICY "Users can update conversation_assignments in their org" ON public.conversation_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = conversation_assignments.org_id
        )
    );

-- Create RLS policies for attendant_sessions
CREATE POLICY "Users can view attendant_sessions in their org" ON public.attendant_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendant_sessions.org_id
        )
    );

CREATE POLICY "Users can insert attendant_sessions in their org" ON public.attendant_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendant_sessions.org_id
        )
    );

CREATE POLICY "Users can update attendant_sessions in their org" ON public.attendant_sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendant_sessions.org_id
        )
    );

-- Create RLS policies for attendant_metrics
CREATE POLICY "Users can view attendant_metrics in their org" ON public.attendant_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendant_metrics.org_id
        )
    );

CREATE POLICY "Users can insert attendant_metrics in their org" ON public.attendant_metrics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendant_metrics.org_id
        )
    );

-- Create RLS policies for attendant_availability
CREATE POLICY "Users can view attendant_availability in their org" ON public.attendant_availability
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendant_availability.org_id
        )
    );

CREATE POLICY "Users can insert attendant_availability in their org" ON public.attendant_availability
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendant_availability.org_id
        )
    );

CREATE POLICY "Users can update attendant_availability in their org" ON public.attendant_availability
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.user_id = auth.uid() 
            AND members.org_id = attendant_availability.org_id
        )
    );

-- Create function for auto-assigning conversations
CREATE OR REPLACE FUNCTION public.auto_assign_conversation(p_conversation_id UUID)
RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
    v_attendant_id UUID;
    v_assigned_by UUID;
BEGIN
    -- Get the organization ID from the conversation
    SELECT org_id INTO v_org_id
    FROM public.conversations
    WHERE id = p_conversation_id;
    
    IF v_org_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get the current user ID
    v_assigned_by := auth.uid();
    
    -- Find the best available attendant
    SELECT a.id INTO v_attendant_id
    FROM public.attendants a
    WHERE a.org_id = v_org_id
    AND a.status = 'online'
    AND (
        SELECT COUNT(*)
        FROM public.conversation_assignments ca
        WHERE ca.attendant_id = a.id
        AND ca.status = 'active'
    ) < a.max_concurrent_chats
    ORDER BY (
        SELECT COUNT(*)
        FROM public.conversation_assignments ca
        WHERE ca.attendant_id = a.id
        AND ca.status = 'active'
    ), a.avg_response_time ASC
    LIMIT 1;
    
    IF v_attendant_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Create the assignment
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
        v_assigned_by,
        'assigned'
    );
    
    -- Update the conversation
    UPDATE public.conversations
    SET assigned_to = v_attendant_id,
        status = 'assigned'
    WHERE id = p_conversation_id;
    
    RETURN v_attendant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample attendants for testing
INSERT INTO public.attendants (
    org_id,
    full_name,
    email,
    department,
    position,
    status,
    max_concurrent_chats,
    auto_accept,
    skills,
    specializations
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'João Silva',
    'joao@empresa.com',
    'atendimento',
    'Atendente Sênior',
    'offline',
    5,
    true,
    ARRAY['WhatsApp', 'Instagram', 'Vendas'],
    ARRAY['Suporte Técnico', 'Vendas']
), (
    '00000000-0000-0000-0000-000000000001',
    'Maria Santos',
    'maria@empresa.com',
    'vendas',
    'Especialista em Vendas',
    'offline',
    3,
    false,
    ARRAY['Vendas', 'Negociação', 'CRM'],
    ARRAY['Vendas B2B', 'Upselling']
), (
    '00000000-0000-0000-0000-000000000001',
    'Pedro Costa',
    'pedro@empresa.com',
    'suporte',
    'Analista de Suporte',
    'offline',
    8,
    true,
    ARRAY['Suporte Técnico', 'Troubleshooting', 'Documentação'],
    ARRAY['Produtos', 'Integrações', 'API']
)
ON CONFLICT (email) DO NOTHING;





