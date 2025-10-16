-- Script para criar canal WhatsApp de teste
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, verificar se já existe algum canal WhatsApp
SELECT * FROM channel_accounts WHERE channel_type = 'whatsapp';

-- Se não existir, criar um canal de teste
-- IMPORTANTE: Substitua os valores entre aspas pelos seus dados reais

INSERT INTO channel_accounts (
  org_id,
  channel_type,
  name,
  status,
  credentials_json,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- orgId fixo que estamos usando
  'whatsapp',
  'WhatsApp Business - Teste',
  'active',
  jsonb_build_object(
    'phone_number_id', 'SEU_PHONE_NUMBER_ID',
    'business_account_id', 'SEU_WHATSAPP_BUSINESS_ACCOUNT_ID',
    'access_token', 'seu_meta_access_token_aqui'
  ),
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING
RETURNING *;

-- Verificar se foi criado
SELECT
  id,
  org_id,
  channel_type,
  name,
  status,
  created_at
FROM channel_accounts
WHERE channel_type = 'whatsapp'
ORDER BY created_at DESC
LIMIT 1;
