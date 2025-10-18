-- =====================================================
-- ADICIONAR MAIS DADOS DE EXEMPLO PARA TESTES
-- Data: 18/10/2025
-- Uso: docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < adicionar_mais_dados.sql
-- =====================================================

DO $$
DECLARE
  current_org_id UUID;
  contact_id_1 UUID;
  contact_id_2 UUID;
  contact_id_3 UUID;
  conversation_id_1 UUID;
  conversation_id_2 UUID;
BEGIN
  -- Buscar primeira organização
  SELECT id INTO current_org_id FROM public.orgs LIMIT 1;

  RAISE NOTICE 'Adicionando dados para organização: %', current_org_id;

  -- =====================================================
  -- ADICIONAR MAIS 10 CONTATOS
  -- =====================================================
  INSERT INTO public.contacts (org_id, full_name, email, phone_e164, phone_display, status, tags, notes)
  VALUES
    (current_org_id, 'Fernanda Lima', 'fernanda@exemplo.com', '+5511944444444', '(11) 94444-4444', 'active', ARRAY['lead', 'marketing'], 'Interessada em plano premium'),
    (current_org_id, 'Roberto Alves', 'roberto@exemplo.com', '+5511933333333', '(11) 93333-3333', 'active', ARRAY['cliente', 'recorrente'], 'Cliente há 2 anos'),
    (current_org_id, 'Juliana Souza', 'juliana@exemplo.com', '+5511922222222', '(11) 92222-2222', 'active', ARRAY['prospect'], 'Pediu orçamento ontem'),
    (current_org_id, 'Marcos Pereira', 'marcos@exemplo.com', '+5511911111111', '(11) 91111-1111', 'inactive', ARRAY['ex-cliente'], 'Cancelou em agosto/2024'),
    (current_org_id, 'Patricia Rocha', 'patricia@exemplo.com', '+5511900000000', '(11) 90000-0000', 'active', ARRAY['vip', 'parceiro'], 'Revendedora oficial'),
    (current_org_id, 'Bruno Cardoso', 'bruno@exemplo.com', '+5521999999999', '(21) 99999-9999', 'active', ARRAY['lead'], 'Chegou via indicação'),
    (current_org_id, 'Camila Dias', 'camila@exemplo.com', '+5521988888888', '(21) 98888-8888', 'active', ARRAY['cliente'], 'Comprou plano básico'),
    (current_org_id, 'Diego Martins', 'diego@exemplo.com', '+5521977777777', '(21) 97777-7777', 'active', ARRAY['prospect', 'empresa'], 'Empresa com 50 funcionários'),
    (current_org_id, 'Elaine Castro', 'elaine@exemplo.com', '+5521966666666', '(21) 96666-6666', 'blocked', ARRAY['spam'], 'Bloqueado por comportamento suspeito'),
    (current_org_id, 'Felipe Gomes', 'felipe@exemplo.com', '+5521955555555', '(21) 95555-5555', 'active', ARRAY['lead', 'interessado'], 'Quer demonstração do produto')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ 10 contatos adicionados';

  -- =====================================================
  -- ADICIONAR MAIS CONVERSAS
  -- =====================================================

  -- Buscar alguns contatos para criar conversas
  SELECT id INTO contact_id_1 FROM public.contacts WHERE email = 'fernanda@exemplo.com' LIMIT 1;
  SELECT id INTO contact_id_2 FROM public.contacts WHERE email = 'bruno@exemplo.com' LIMIT 1;
  SELECT id INTO contact_id_3 FROM public.contacts WHERE email = 'camila@exemplo.com' LIMIT 1;

  -- Criar 3 conversas
  INSERT INTO public.conversations (org_id, contact_id, channel, status, last_message_at)
  VALUES
    (current_org_id, contact_id_1, 'whatsapp', 'open', NOW() - INTERVAL '2 hours'),
    (current_org_id, contact_id_2, 'instagram', 'pending', NOW() - INTERVAL '5 hours'),
    (current_org_id, contact_id_3, 'email', 'closed', NOW() - INTERVAL '1 day');

  RAISE NOTICE '✅ 3 conversas adicionadas';

  -- =====================================================
  -- ADICIONAR MAIS MENSAGENS
  -- =====================================================

  -- Buscar as últimas 3 conversas criadas
  FOR conversation_id_1 IN
    SELECT id FROM public.conversations WHERE org_id = current_org_id ORDER BY created_at DESC LIMIT 3
  LOOP
    -- Adicionar 3 mensagens por conversa (cliente → agente → cliente)
    INSERT INTO public.messages (conversation_id, content, direction, sender_type, status)
    VALUES
      (conversation_id_1, 'Olá! Tenho interesse em conhecer melhor os serviços de vocês.', 'inbound', 'contact', 'read'),
      (conversation_id_1, 'Olá! Será um prazer ajudar. Qual serviço você gostaria de conhecer?', 'outbound', 'agent', 'read'),
      (conversation_id_1, 'Gostaria de saber sobre o plano premium. Quais os benefícios?', 'inbound', 'contact', 'delivered');
  END LOOP;

  RAISE NOTICE '✅ 9 mensagens adicionadas (3 por conversa)';

  -- =====================================================
  -- ADICIONAR MAIS CAMPANHAS
  -- =====================================================

  INSERT INTO public.campaigns (org_id, name, description, status, channel, total_contacts, sent_count, delivered_count, read_count)
  VALUES
    (current_org_id, 'Campanha Dia das Mães', 'Promoção especial para o Dia das Mães', 'completed', 'whatsapp', 150, 148, 145, 120),
    (current_org_id, 'Newsletter Semanal', 'Envio semanal de novidades e dicas', 'active', 'email', 500, 450, 442, 380),
    (current_org_id, 'Reativação de Clientes', 'Campanha para recuperar clientes inativos', 'active', 'whatsapp', 80, 65, 60, 45),
    (current_org_id, 'Lançamento de Produto', 'Comunicado sobre novo produto', 'draft', 'instagram', 200, 0, 0, 0),
    (current_org_id, 'Pesquisa de Satisfação', 'Coletar feedback dos clientes', 'paused', 'email', 100, 75, 72, 68)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ 5 campanhas adicionadas';

  -- =====================================================
  -- ADICIONAR MAIS PROSPECTS (Pipeline de Vendas)
  -- =====================================================

  -- Buscar alguns contatos para criar prospects
  INSERT INTO public.prospects (org_id, contact_id, title, description, value, pipeline_stage, probability, expected_close_date)
  SELECT
    current_org_id,
    c.id,
    'Venda ' || c.full_name,
    'Proposta comercial para ' || c.full_name,
    CASE
      WHEN random() > 0.7 THEN 8000.00
      WHEN random() > 0.4 THEN 5000.00
      ELSE 2500.00
    END,
    CASE
      WHEN random() > 0.85 THEN 'won'
      WHEN random() > 0.70 THEN 'negotiation'
      WHEN random() > 0.50 THEN 'proposal'
      WHEN random() > 0.30 THEN 'qualified'
      WHEN random() > 0.15 THEN 'lead'
      ELSE 'lost'
    END,
    (random() * 100)::INTEGER,
    CURRENT_DATE + (random() * 120)::INTEGER
  FROM public.contacts c
  WHERE c.org_id = current_org_id
    AND c.email IN ('fernanda@exemplo.com', 'bruno@exemplo.com', 'camila@exemplo.com', 'diego@exemplo.com', 'felipe@exemplo.com')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ 5 prospects adicionados';

  -- =====================================================
  -- RESUMO FINAL
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ DADOS ADICIONADOS COM SUCESSO!';
  RAISE NOTICE '========================================';

END $$;

-- Exibir totais atualizados
SELECT '📊 RESUMO FINAL:' as info;
SELECT 'Contatos:' as tipo, COUNT(*) as total FROM public.contacts
UNION ALL
SELECT 'Conversas:' as tipo, COUNT(*) as total FROM public.conversations
UNION ALL
SELECT 'Mensagens:' as tipo, COUNT(*) as total FROM public.messages
UNION ALL
SELECT 'Campanhas:' as tipo, COUNT(*) as total FROM public.campaigns
UNION ALL
SELECT 'Prospects:' as tipo, COUNT(*) as total FROM public.prospects;

-- Mostrar distribuição de prospects por estágio
SELECT '📈 PROSPECTS POR ESTÁGIO:' as info;
SELECT
  pipeline_stage as estagio,
  COUNT(*) as quantidade,
  SUM(value) as valor_total
FROM public.prospects
GROUP BY pipeline_stage
ORDER BY
  CASE pipeline_stage
    WHEN 'won' THEN 1
    WHEN 'negotiation' THEN 2
    WHEN 'proposal' THEN 3
    WHEN 'qualified' THEN 4
    WHEN 'lead' THEN 5
    WHEN 'lost' THEN 6
  END;

-- FIM
