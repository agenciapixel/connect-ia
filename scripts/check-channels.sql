-- Verificar canais existentes
SELECT
  id,
  org_id,
  channel_type,
  status,
  name,
  created_at
FROM channel_accounts
ORDER BY created_at DESC;

-- Ver quantos canais por tipo
SELECT
  channel_type,
  status,
  COUNT(*) as total
FROM channel_accounts
GROUP BY channel_type, status;
