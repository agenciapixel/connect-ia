-- Verificar Organizações
SELECT COUNT(*) as total_organizations FROM public.organizations;
SELECT * FROM public.organizations LIMIT 5;

-- Verificar Membros
SELECT COUNT(*) as total_members FROM public.members;
SELECT * FROM public.members LIMIT 5;

-- Verificar Contas de Canal
SELECT COUNT(*) as total_channel_accounts FROM public.channel_accounts;
SELECT * FROM public.channel_accounts LIMIT 5;

-- Verificar Conversas
SELECT COUNT(*) as total_conversations FROM public.conversations;
SELECT * FROM public.conversations LIMIT 5;

-- Verificar Mensagens
SELECT COUNT(*) as total_messages FROM public.messages;
SELECT * FROM public.messages LIMIT 5;

-- Verificar Prospects
SELECT COUNT(*) as total_prospects FROM public.prospects;
SELECT * FROM public.prospects LIMIT 5;

-- Verificar Atendentes
SELECT COUNT(*) as total_attendants FROM public.attendants;
SELECT * FROM public.attendants LIMIT 5;

-- Verificar integrações ativas
SELECT channel_type, COUNT(*) as total FROM public.channel_accounts WHERE status = 'active' GROUP BY channel_type;

-- Verificar usuários ativos
SELECT u.email, m.role, o.name as org_name FROM auth.users u JOIN public.members m ON u.id = m.user_id JOIN public.organizations o ON m.org_id = o.id;

-- Estatísticas gerais do sistema
SELECT 
  (SELECT COUNT(*) FROM public.organizations) as total_organizations,
  (SELECT COUNT(*) FROM public.members) as total_members,
  (SELECT COUNT(*) FROM public.channel_accounts WHERE status = 'active') as active_channels,
  (SELECT COUNT(*) FROM public.conversations) as total_conversations,
  (SELECT COUNT(*) FROM public.messages) as total_messages,
  (SELECT COUNT(*) FROM public.prospects) as total_prospects,
  (SELECT COUNT(*) FROM public.attendants) as total_attendants;

