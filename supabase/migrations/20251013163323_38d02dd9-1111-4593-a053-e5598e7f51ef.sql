-- Create enum for agent status (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE public.agent_status AS ENUM ('ativo', 'inativo', 'treinamento');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create AI agents table
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type public.agent_type NOT NULL,
  status public.agent_status NOT NULL DEFAULT 'ativo',
  system_prompt TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash',
  temperature DECIMAL(2,1) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all agents"
  ON public.ai_agents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create agents"
  ON public.ai_agents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own agents"
  ON public.ai_agents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own agents"
  ON public.ai_agents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create conversations table to track agent interactions
CREATE TABLE IF NOT EXISTS public.agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  contact_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  assigned_to_human UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transferred_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on conversations
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all conversations"
  ON public.agent_conversations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create conversations"
  ON public.agent_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update conversations"
  ON public.agent_conversations
  FOR UPDATE
  TO authenticated
  USING (true);