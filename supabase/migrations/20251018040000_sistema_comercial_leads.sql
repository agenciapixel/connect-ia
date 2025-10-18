-- =====================================================
-- SISTEMA COMERCIAL DE LEADS E APROVAÇÃO
-- Para SaaS com controle de acesso
-- =====================================================

-- 1. CRIAR TABELA DE SOLICITAÇÕES DE ACESSO
CREATE TABLE IF NOT EXISTS public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados do Lead
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  job_title TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),

  -- Interesse
  plan_interest TEXT DEFAULT 'free' CHECK (plan_interest IN ('free', 'pro', 'enterprise')),
  message TEXT,

  -- Status da Solicitação
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active')),

  -- Controle
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Auditoria
  ip_address TEXT,
  user_agent TEXT,
  utm_source TEXT,
  utm_campaign TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_access_requests_email ON public.access_requests(email);
CREATE INDEX idx_access_requests_status ON public.access_requests(status);
CREATE INDEX idx_access_requests_created_at ON public.access_requests(created_at DESC);

COMMENT ON TABLE public.access_requests IS 'Solicitações de acesso ao sistema (leads)';

-- 2. CRIAR TABELA DE CONVITES
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  used_at TIMESTAMPTZ,

  -- Dados pré-configurados
  plan TEXT DEFAULT 'free',
  role TEXT DEFAULT 'admin',

  -- Controle
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);

COMMENT ON TABLE public.invitations IS 'Convites enviados para novos usuários';

-- 3. FUNÇÃO: SOLICITAR ACESSO (Público - chamado pelo formulário)
CREATE OR REPLACE FUNCTION public.request_access(
  p_email TEXT,
  p_full_name TEXT,
  p_company TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_job_title TEXT DEFAULT NULL,
  p_company_size TEXT DEFAULT NULL,
  p_plan_interest TEXT DEFAULT 'free',
  p_message TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  existing_request RECORD;
  new_request_id UUID;
BEGIN
  -- Verificar se já existe solicitação
  SELECT * INTO existing_request
  FROM public.access_requests
  WHERE email = p_email;

  IF existing_request.id IS NOT NULL THEN
    -- Já existe solicitação
    IF existing_request.status = 'pending' THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Sua solicitação já foi enviada e está em análise.',
        'status', 'pending'
      );
    ELSIF existing_request.status = 'approved' THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Seu acesso já foi aprovado! Verifique seu email.',
        'status', 'approved'
      );
    ELSIF existing_request.status = 'rejected' THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Sua solicitação foi recusada. Entre em contato com o suporte.',
        'status', 'rejected'
      );
    END IF;
  END IF;

  -- Criar nova solicitação
  INSERT INTO public.access_requests (
    email, full_name, company, phone, job_title,
    company_size, plan_interest, message
  ) VALUES (
    p_email, p_full_name, p_company, p_phone, p_job_title,
    p_company_size, p_plan_interest, p_message
  ) RETURNING id INTO new_request_id;

  -- TODO: Enviar email de notificação para admin

  RETURN json_build_object(
    'success', true,
    'message', 'Solicitação enviada com sucesso! Entraremos em contato em breve.',
    'request_id', new_request_id
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNÇÃO: APROVAR SOLICITAÇÃO (Admin)
CREATE OR REPLACE FUNCTION public.approve_access_request(
  p_request_id UUID,
  p_send_invitation BOOLEAN DEFAULT true
)
RETURNS JSON AS $$
DECLARE
  request_data RECORD;
  invitation_token TEXT;
BEGIN
  -- Buscar solicitação
  SELECT * INTO request_data
  FROM public.access_requests
  WHERE id = p_request_id;

  IF request_data.id IS NULL THEN
    RAISE EXCEPTION 'Solicitação não encontrada';
  END IF;

  IF request_data.status = 'approved' THEN
    RAISE EXCEPTION 'Solicitação já foi aprovada';
  END IF;

  -- Adicionar email na whitelist
  INSERT INTO public.authorized_users (email)
  VALUES (request_data.email)
  ON CONFLICT (email) DO NOTHING;

  -- Atualizar solicitação
  UPDATE public.access_requests
  SET
    status = 'approved',
    approved_by = auth.uid(),
    approved_at = NOW()
  WHERE id = p_request_id;

  -- Criar convite se solicitado
  IF p_send_invitation THEN
    INSERT INTO public.invitations (email, created_by, plan)
    VALUES (request_data.email, auth.uid(), request_data.plan_interest)
    RETURNING token INTO invitation_token;

    -- TODO: Enviar email com link de ativação
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Acesso aprovado com sucesso',
    'invitation_token', invitation_token
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNÇÃO: REJEITAR SOLICITAÇÃO (Admin)
CREATE OR REPLACE FUNCTION public.reject_access_request(
  p_request_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  UPDATE public.access_requests
  SET
    status = 'rejected',
    rejection_reason = p_reason,
    approved_by = auth.uid(),
    approved_at = NOW()
  WHERE id = p_request_id;

  -- TODO: Enviar email de notificação

  RETURN json_build_object(
    'success', true,
    'message', 'Solicitação rejeitada'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ATUALIZAR TRIGGER PARA USAR WHITELIST
-- (Mantém o trigger anterior que verifica authorized_users)

-- 7. RLS POLICIES

-- access_requests: Apenas admins podem ver todas, públicos podem criar
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create access requests"
  ON public.access_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all access requests"
  ON public.access_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update access requests"
  ON public.access_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- invitations: Apenas admins
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations"
  ON public.invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 8. FUNÇÃO: VERIFICAR CONVITE (Público)
CREATE OR REPLACE FUNCTION public.validate_invitation(p_token TEXT)
RETURNS JSON AS $$
DECLARE
  invitation_data RECORD;
BEGIN
  SELECT * INTO invitation_data
  FROM public.invitations
  WHERE token = p_token
    AND used_at IS NULL
    AND expires_at > NOW();

  IF invitation_data.id IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Convite inválido ou expirado'
    );
  END IF;

  RETURN json_build_object(
    'valid', true,
    'email', invitation_data.email,
    'plan', invitation_data.plan
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. INSERIR PRIMEIRO ADMIN (VOCÊ)
INSERT INTO public.authorized_users (email) VALUES
('dasilva6r@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- PRONTO! Sistema comercial de leads configurado
-- =====================================================

SELECT 'Sistema comercial de leads criado com sucesso!' as status;
