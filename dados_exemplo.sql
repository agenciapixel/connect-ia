-- =====================================================
-- DADOS DE EXEMPLO PARA TESTAR DASHBOARD
-- =====================================================

-- Pegar o org_id do usuário atual
DO $$
DECLARE
  current_org_id UUID;
BEGIN
  -- Buscar primeira organização
  SELECT id INTO current_org_id FROM public.orgs LIMIT 1;

  -- Inserir contatos de exemplo
  INSERT INTO public.contacts (org_id, full_name, email, phone_e164, phone_display, status, tags)
  VALUES
    (current_org_id, 'João Silva', 'joao@exemplo.com', '+5511999999999', '(11) 99999-9999', 'active', ARRAY['cliente', 'vip']),
    (current_org_id, 'Maria Santos', 'maria@exemplo.com', '+5511988888888', '(11) 98888-8888', 'active', ARRAY['lead']),
    (current_org_id, 'Pedro Costa', 'pedro@exemplo.com', '+5511977777777', '(11) 97777-7777', 'active', ARRAY['prospect']),
    (current_org_id, 'Ana Paula', 'ana@exemplo.com', '+5511966666666', '(11) 96666-6666', 'active', ARRAY['cliente']),
    (current_org_id, 'Carlos Oliveira', 'carlos@exemplo.com', '+5511955555555', '(11) 95555-5555', 'active', ARRAY['lead', 'interessado'])
  ON CONFLICT DO NOTHING;

  -- Inserir conversas de exemplo
  INSERT INTO public.conversations (org_id, contact_id, channel, status, last_message_at)
  SELECT
    current_org_id,
    c.id,
    'whatsapp',
    CASE WHEN random() > 0.5 THEN 'open' ELSE 'closed' END,
    NOW() - (random() * INTERVAL '7 days')
  FROM public.contacts c
  WHERE c.org_id = current_org_id
  LIMIT 5
  ON CONFLICT DO NOTHING;

  -- Inserir mensagens de exemplo
  INSERT INTO public.messages (conversation_id, content, direction, sender_type)
  SELECT
    conv.id,
    'Olá! Gostaria de saber mais informações sobre seus serviços.',
    'inbound',
    'contact'
  FROM public.conversations conv
  WHERE conv.org_id = current_org_id
  LIMIT 5
  ON CONFLICT DO NOTHING;

  INSERT INTO public.messages (conversation_id, content, direction, sender_type)
  SELECT
    conv.id,
    'Olá! Claro, ficaremos felizes em ajudar. Em que posso ser útil?',
    'outbound',
    'agent'
  FROM public.conversations conv
  WHERE conv.org_id = current_org_id
  LIMIT 5
  ON CONFLICT DO NOTHING;

  -- Inserir campanhas de exemplo
  INSERT INTO public.campaigns (org_id, name, description, status, channel, total_contacts, sent_count, delivered_count, read_count)
  VALUES
    (current_org_id, 'Campanha de Boas-Vindas', 'Mensagem automática para novos clientes', 'active', 'whatsapp', 100, 85, 80, 65),
    (current_org_id, 'Promoção Black Friday', 'Ofertas especiais para clientes VIP', 'completed', 'whatsapp', 50, 50, 48, 42),
    (current_org_id, 'Follow-up Vendas', 'Acompanhamento de propostas enviadas', 'active', 'email', 30, 25, 23, 18)
  ON CONFLICT DO NOTHING;

  -- Inserir prospects de exemplo
  INSERT INTO public.prospects (org_id, contact_id, title, description, value, pipeline_stage, probability, expected_close_date)
  SELECT
    current_org_id,
    c.id,
    'Venda de Serviço Premium - ' || c.full_name,
    'Proposta de serviço premium com suporte 24/7',
    CASE
      WHEN random() > 0.7 THEN 5000.00
      WHEN random() > 0.4 THEN 3000.00
      ELSE 1500.00
    END,
    CASE
      WHEN random() > 0.8 THEN 'won'
      WHEN random() > 0.6 THEN 'negotiation'
      WHEN random() > 0.4 THEN 'proposal'
      WHEN random() > 0.2 THEN 'qualified'
      ELSE 'lead'
    END,
    (random() * 100)::INTEGER,
    CURRENT_DATE + (random() * 90)::INTEGER
  FROM public.contacts c
  WHERE c.org_id = current_org_id
  LIMIT 5
  ON CONFLICT DO NOTHING;

END $$;

-- Verificar dados inseridos
SELECT 'Contatos:', COUNT(*) FROM public.contacts;
SELECT 'Conversas:', COUNT(*) FROM public.conversations;
SELECT 'Mensagens:', COUNT(*) FROM public.messages;
SELECT 'Campanhas:', COUNT(*) FROM public.campaigns;
SELECT 'Prospects:', COUNT(*) FROM public.prospects;
