# 🗄️ COMANDOS ÚTEIS DO DATABASE

## 📋 Tabela de Conteúdos
- [Consultas Rápidas](#consultas-rápidas)
- [Inserir Dados](#inserir-dados)
- [Atualizar Dados](#atualizar-dados)
- [Deletar Dados](#deletar-dados)
- [Estatísticas](#estatísticas)
- [Manutenção](#manutenção)

---

## 🔍 Consultas Rápidas

### Ver todas as organizações
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "SELECT id, name, slug, created_at FROM public.orgs;"
```

### Ver todos os usuários e suas organizações
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  u.email,
  m.role,
  o.name as org_name
FROM auth.users u
LEFT JOIN public.members m ON u.id = m.user_id
LEFT JOIN public.orgs o ON m.org_id = o.id;
"
```

### Ver todos os contatos com tags
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  full_name,
  email,
  status,
  tags,
  created_at
FROM public.contacts
ORDER BY created_at DESC
LIMIT 10;
"
```

### Ver conversas com nomes dos contatos
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  c.id,
  co.full_name as contato,
  c.channel,
  c.status,
  c.last_message_at
FROM public.conversations c
LEFT JOIN public.contacts co ON c.contact_id = co.id
ORDER BY c.last_message_at DESC
LIMIT 10;
"
```

### Ver mensagens de uma conversa
```bash
# Substitua CONVERSATION_ID pelo ID real
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  created_at,
  direction,
  sender_type,
  content,
  status
FROM public.messages
WHERE conversation_id = 'CONVERSATION_ID'
ORDER BY created_at ASC;
"
```

### Ver campanhas e performance
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  name,
  status,
  channel,
  total_contacts,
  sent_count,
  delivered_count,
  read_count,
  ROUND((read_count::DECIMAL / NULLIF(sent_count, 0)) * 100, 2) as taxa_abertura
FROM public.campaigns
ORDER BY created_at DESC;
"
```

### Ver prospects por estágio
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  pipeline_stage,
  COUNT(*) as quantidade,
  SUM(value) as valor_total,
  ROUND(AVG(probability), 2) as probabilidade_media
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
"
```

---

## ➕ Inserir Dados

### Adicionar 1 contato
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
INSERT INTO public.contacts (org_id, full_name, email, phone_e164, phone_display, status, tags)
VALUES (
  (SELECT id FROM public.orgs LIMIT 1),
  'Teste Usuário',
  'teste@exemplo.com',
  '+5511987654321',
  '(11) 98765-4321',
  'active',
  ARRAY['teste', 'manual']
);
"
```

### Adicionar 1 campanha
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
INSERT INTO public.campaigns (org_id, name, description, status, channel, total_contacts, sent_count, delivered_count, read_count)
VALUES (
  (SELECT id FROM public.orgs LIMIT 1),
  'Teste Campanha',
  'Campanha criada manualmente para testes',
  'draft',
  'whatsapp',
  0,
  0,
  0,
  0
);
"
```

### Adicionar lote de dados de exemplo
```bash
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < dados_exemplo.sql
```

### Adicionar MAIS dados de exemplo
```bash
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < adicionar_mais_dados.sql
```

---

## 🔄 Atualizar Dados

### Atualizar status de um contato
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
UPDATE public.contacts
SET status = 'inactive'
WHERE email = 'teste@exemplo.com';
"
```

### Adicionar tag a um contato
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
UPDATE public.contacts
SET tags = array_append(tags, 'nova_tag')
WHERE email = 'joao@exemplo.com';
"
```

### Mudar estágio de um prospect
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
UPDATE public.prospects
SET
  pipeline_stage = 'won',
  probability = 100
WHERE title LIKE 'Venda João%';
"
```

### Fechar uma conversa
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
UPDATE public.conversations
SET status = 'closed'
WHERE id = 'CONVERSATION_ID';
"
```

---

## 🗑️ Deletar Dados

### Deletar um contato específico
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
DELETE FROM public.contacts
WHERE email = 'teste@exemplo.com';
"
```

### Deletar contatos inativos
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
DELETE FROM public.contacts
WHERE status = 'inactive';
"
```

### Deletar campanhas em draft
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
DELETE FROM public.campaigns
WHERE status = 'draft';
"
```

### Deletar prospects perdidos
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
DELETE FROM public.prospects
WHERE pipeline_stage = 'lost';
"
```

### LIMPAR TUDO (CUIDADO!)
```bash
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < LIMPAR_SUPABASE_COMPLETO.sql
```

---

## 📊 Estatísticas

### Contadores gerais
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT 'Organizações' as tipo, COUNT(*) as total FROM public.orgs
UNION ALL
SELECT 'Membros', COUNT(*) FROM public.members
UNION ALL
SELECT 'Contatos', COUNT(*) FROM public.contacts
UNION ALL
SELECT 'Conversas', COUNT(*) FROM public.conversations
UNION ALL
SELECT 'Mensagens', COUNT(*) FROM public.messages
UNION ALL
SELECT 'Campanhas', COUNT(*) FROM public.campaigns
UNION ALL
SELECT 'Prospects', COUNT(*) FROM public.prospects;
"
```

### Contatos por status
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  status,
  COUNT(*) as quantidade,
  ROUND((COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM public.contacts)) * 100, 2) as percentual
FROM public.contacts
GROUP BY status
ORDER BY quantidade DESC;
"
```

### Conversas por canal
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  channel,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as abertas,
  SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as fechadas
FROM public.conversations
GROUP BY channel
ORDER BY total DESC;
"
```

### Mensagens por direção
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  direction,
  sender_type,
  COUNT(*) as quantidade
FROM public.messages
GROUP BY direction, sender_type
ORDER BY quantidade DESC;
"
```

### Performance de campanhas
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  name,
  channel,
  sent_count,
  ROUND((delivered_count::DECIMAL / NULLIF(sent_count, 0)) * 100, 2) as taxa_entrega,
  ROUND((read_count::DECIMAL / NULLIF(delivered_count, 0)) * 100, 2) as taxa_abertura
FROM public.campaigns
WHERE sent_count > 0
ORDER BY taxa_abertura DESC;
"
```

### Funil de vendas
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  pipeline_stage,
  COUNT(*) as quantidade,
  ROUND(SUM(value), 2) as valor_total,
  ROUND(AVG(value), 2) as ticket_medio,
  ROUND(AVG(probability), 2) as prob_media
FROM public.prospects
GROUP BY pipeline_stage
ORDER BY
  CASE pipeline_stage
    WHEN 'lead' THEN 1
    WHEN 'qualified' THEN 2
    WHEN 'proposal' THEN 3
    WHEN 'negotiation' THEN 4
    WHEN 'won' THEN 5
    WHEN 'lost' THEN 6
  END;
"
```

---

## 🔧 Manutenção

### Ver tamanho das tabelas
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamanho
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### Ver índices
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
"
```

### Ver políticas RLS
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
"
```

### Verificar triggers
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  event_object_table AS tabela,
  trigger_name,
  event_manipulation AS evento,
  action_statement AS acao
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
"
```

### VACUUM ANALYZE (otimizar performance)
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "VACUUM ANALYZE;"
```

---

## 🎯 Comandos Rápidos de Cópia-Cola

### Ver dashboard resumido
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres << 'EOF'
\echo '📊 DASHBOARD RÁPIDO'
\echo ''
\echo '📈 TOTAIS:'
SELECT 'Contatos' as tipo, COUNT(*) as total FROM public.contacts
UNION ALL SELECT 'Conversas', COUNT(*) FROM public.conversations
UNION ALL SELECT 'Mensagens', COUNT(*) FROM public.messages
UNION ALL SELECT 'Campanhas', COUNT(*) FROM public.campaigns
UNION ALL SELECT 'Prospects', COUNT(*) FROM public.prospects;

\echo ''
\echo '💬 CONVERSAS POR STATUS:'
SELECT status, COUNT(*) as total FROM public.conversations GROUP BY status;

\echo ''
\echo '🎯 PROSPECTS POR ESTÁGIO:'
SELECT pipeline_stage, COUNT(*) as total, SUM(value) as valor FROM public.prospects GROUP BY pipeline_stage ORDER BY CASE pipeline_stage WHEN 'won' THEN 1 WHEN 'negotiation' THEN 2 WHEN 'proposal' THEN 3 WHEN 'qualified' THEN 4 WHEN 'lead' THEN 5 WHEN 'lost' THEN 6 END;
EOF
```

### Resetar banco e inserir dados de exemplo
```bash
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < LIMPAR_SUPABASE_COMPLETO.sql && \
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < dados_exemplo.sql
```

---

## 📝 Notas Importantes

1. **SEMPRE** tenha backup antes de executar DELETE ou UPDATE em produção
2. Os comandos assumem que você está na pasta raiz do projeto
3. Use `LIMIT` em queries grandes para não travar o terminal
4. Verifique o `org_id` antes de inserir dados manualmente
5. RLS está ativo - alguns comandos podem falhar se executados sem contexto de auth

---

**Última atualização:** 18 de Outubro de 2025
