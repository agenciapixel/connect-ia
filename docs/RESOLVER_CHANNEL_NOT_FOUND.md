# 🔧 Resolver Erro: "Channel account not found"

## ✅ Progresso: Webhook Funcionando!

O erro 401 foi resolvido! Agora o webhook está **recebendo requisições** corretamente. 🎉

O novo erro é:
```
Channel account not found: {
  code: "PGRST116",
  details: "The result contains 0 rows",
  hint: null,
  message: "Cannot coerce the result to a single JSON object"
}
```

---

## 🔍 O Que Este Erro Significa?

O webhook do WhatsApp está procurando por um registro na tabela `channel_accounts` com:
- `channel_type = 'whatsapp'`
- `status = 'active'`

Mas **não encontrou nenhum registro** com esses critérios.

### Trecho do código (linha 136-146):
```typescript
const { data: channelAccount, error: channelError } = await supabase
  .from('channel_accounts')
  .select('*')
  .eq('channel_type', 'whatsapp')
  .eq('status', 'active')
  .single();

if (channelError || !channelAccount) {
  console.error('Channel account not found:', channelError);
  return; // ❌ Para aqui e não salva a mensagem
}
```

---

## ✅ Solução: Criar Canal WhatsApp no Banco

### **Opção 1: Via Dashboard Supabase (SQL Editor)** ⚡ RECOMENDADO

1. **Acesse o SQL Editor:**
   ```
   https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/sql/new
   ```

2. **Execute este SQL:**

```sql
-- Verificar se já existe
SELECT * FROM channel_accounts WHERE channel_type = 'whatsapp';

-- Criar canal WhatsApp de teste
INSERT INTO channel_accounts (
  org_id,
  channel_type,
  channel_name,
  status,
  credentials,
  metadata
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'whatsapp',
  'WhatsApp Business',
  'active',
  jsonb_build_object(
    'phone_number_id', 'SEU_PHONE_NUMBER_ID_DO_META',
    'business_account_id', 'SEU_WABA_ID',
    'access_token', 'SEU_META_ACCESS_TOKEN'
  ),
  jsonb_build_object(
    'phone_number', '+5511999999999',
    'display_name', 'Minha Empresa',
    'is_test', true
  )
)
RETURNING *;
```

3. **Substitua os valores:**
   - `SEU_PHONE_NUMBER_ID_DO_META`: Pegue no Meta Dashboard > WhatsApp > API Setup
   - `SEU_WABA_ID`: WhatsApp Business Account ID
   - `SEU_META_ACCESS_TOKEN`: Token permanente do Meta
   - `+5511999999999`: Seu número do WhatsApp Business

4. **Execute a query** (clique em RUN ou Ctrl+Enter)

5. **Verifique se foi criado:**
```sql
SELECT
  id,
  channel_type,
  channel_name,
  status,
  created_at
FROM channel_accounts
WHERE channel_type = 'whatsapp';
```

---

### **Opção 2: Via Interface de Integrações** (se disponível)

1. **Acesse no app:**
   ```
   http://localhost:8080/integrations
   ```

2. **Conecte WhatsApp:**
   - Clique em "Conectar WhatsApp"
   - Preencha os dados do Meta
   - Salve

3. **Verifique no banco:**
```sql
SELECT * FROM channel_accounts WHERE channel_type = 'whatsapp';
```

---

### **Opção 3: Criar Canal Temporário para Testes**

Se você ainda não tem os dados do Meta, pode criar um canal de teste temporário:

```sql
-- Canal de teste (sem credenciais reais)
INSERT INTO channel_accounts (
  org_id,
  channel_type,
  channel_name,
  status,
  credentials,
  metadata
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'whatsapp',
  'WhatsApp - Teste',
  'active',
  jsonb_build_object(
    'phone_number_id', 'test_phone_id',
    'access_token', 'test_token'
  ),
  jsonb_build_object(
    'phone_number', '+5500000000000',
    'display_name', 'Canal de Teste',
    'is_test', true
  )
)
RETURNING *;
```

**⚠️ Nota:** Este canal de teste **NÃO enviará mensagens reais**, apenas permitirá que o webhook salve mensagens recebidas no banco.

---

## 🧪 Testar Após Criar Canal

### 1. Verificar que o canal existe:

```sql
SELECT
  id,
  org_id,
  channel_type,
  status,
  channel_name,
  credentials->'phone_number_id' as phone_number_id
FROM channel_accounts
WHERE channel_type = 'whatsapp' AND status = 'active';
```

**Resultado esperado:** 1 linha retornada

### 2. Enviar payload de teste novamente:

```bash
curl -X POST "https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "messages": [{
            "from": "5511999999999",
            "id": "wamid.test123",
            "timestamp": "1234567890",
            "type": "text",
            "text": { "body": "Olá, esta é uma mensagem de teste!" }
          }]
        }
      }]
    }]
  }'
```

### 3. Verificar logs do webhook:

```bash
supabase functions logs whatsapp-webhook --follow
```

**Logs esperados:**
```
✅ Found channel account: [UUID do canal]
✅ Message saved successfully
```

### 4. Verificar se mensagem foi salva:

```sql
-- Ver mensagens recebidas
SELECT
  m.id,
  m.content,
  m.direction,
  m.channel_type,
  m.created_at,
  c.full_name as contact_name
FROM messages m
LEFT JOIN conversations conv ON m.conversation_id = conv.id
LEFT JOIN contacts c ON conv.contact_id = c.id
WHERE m.channel_type = 'whatsapp'
ORDER BY m.created_at DESC
LIMIT 10;
```

**Resultado esperado:** Mensagem de teste aparece na lista

---

## 🎯 Checklist Completo

Após criar o canal, verifique:

- [ ] Canal existe na tabela `channel_accounts`
- [ ] `channel_type = 'whatsapp'`
- [ ] `status = 'active'`
- [ ] `org_id = '00000000-0000-0000-0000-000000000000'`
- [ ] Webhook não retorna mais erro "Channel account not found"
- [ ] Mensagem de teste é salva na tabela `messages`
- [ ] Contato é criado na tabela `contacts`
- [ ] Conversa é criada na tabela `conversations`

---

## 📊 Queries Úteis para Debug

### Ver todos os canais:
```sql
SELECT
  id,
  org_id,
  channel_type,
  channel_name,
  status,
  created_at
FROM channel_accounts
ORDER BY created_at DESC;
```

### Ver mensagens por canal:
```sql
SELECT
  channel_type,
  direction,
  COUNT(*) as total
FROM messages
GROUP BY channel_type, direction
ORDER BY channel_type, direction;
```

### Ver últimas mensagens do WhatsApp:
```sql
SELECT
  m.content,
  m.direction,
  m.status,
  m.created_at,
  co.full_name as contact
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
JOIN contacts co ON c.contact_id = co.id
WHERE m.channel_type = 'whatsapp'
ORDER BY m.created_at DESC
LIMIT 20;
```

### Deletar canal de teste (se necessário):
```sql
-- ⚠️ CUIDADO: Isso deletará o canal
DELETE FROM channel_accounts
WHERE channel_type = 'whatsapp'
AND metadata->>'is_test' = 'true';
```

---

## 🔄 Mesmo Processo para Instagram

O Instagram webhook tem o mesmo erro? Execute:

```sql
-- Verificar se existe canal Instagram
SELECT * FROM channel_accounts WHERE channel_type = 'instagram';

-- Criar canal Instagram de teste
INSERT INTO channel_accounts (
  org_id,
  channel_type,
  channel_name,
  status,
  credentials,
  metadata
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'instagram',
  'Instagram Business',
  'active',
  jsonb_build_object(
    'instagram_business_account_id', 'SEU_IG_BUSINESS_ID',
    'access_token', 'SEU_META_ACCESS_TOKEN',
    'page_id', 'SEU_PAGE_ID'
  ),
  jsonb_build_object(
    'username', 'seu_instagram',
    'is_test', true
  )
)
RETURNING *;
```

---

## 📝 Onde Pegar as Credenciais do Meta

### WhatsApp:
1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu App
3. WhatsApp > API Setup
4. Copie:
   - **Phone Number ID** (abaixo do número de telefone)
   - **WhatsApp Business Account ID** (topo da página)
   - **Temporary Access Token** (ou gere um permanente)

### Instagram:
1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu App
3. Instagram > Basic Display ou Instagram Graph API
4. Copie:
   - **Instagram Business Account ID**
   - **Page ID** (da página Facebook conectada)
   - **Access Token**

---

## ⏭️ Próximos Passos

Após criar o canal:

1. ✅ Testar webhook novamente
2. ✅ Confirmar que mensagem é salva no banco
3. ✅ Configurar URL no Meta Dashboard
4. ✅ Enviar mensagem real de teste
5. ✅ Ver mensagem aparecer no Inbox

---

## 🆘 Se Continuar com Erro

Se após criar o canal o erro persistir:

1. **Verifique RLS (Row Level Security):**
```sql
-- Ver políticas RLS da tabela
SELECT * FROM pg_policies WHERE tablename = 'channel_accounts';

-- Temporariamente desabilitar RLS (APENAS PARA DEBUG)
ALTER TABLE channel_accounts DISABLE ROW LEVEL SECURITY;
```

2. **Verifique se Service Role Key está configurada:**
   - O webhook usa `SUPABASE_SERVICE_ROLE_KEY`
   - Esta key bypassa RLS
   - Deve estar configurada nas Edge Functions environment variables

3. **Teste direto no SQL:**
```sql
-- Executar mesma query que o webhook usa
SELECT *
FROM channel_accounts
WHERE channel_type = 'whatsapp'
AND status = 'active'
LIMIT 1;
```

Se retornar 0 linhas: problema no banco
Se retornar 1 linha: problema no webhook

---

**Me avise quando criar o canal para testarmos novamente!** 🚀
