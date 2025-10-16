# 🧪 Como Testar WhatsApp Webhook (Sem Publicar o App)

## ✅ Opções de Teste Disponíveis

### **1. Teste Manual via Dashboard Meta** (Mais Rápido)

#### Passo a Passo:

1. **Acesse o painel do Meta:**
   - URL: https://developers.facebook.com/apps/
   - Selecione seu App do WhatsApp

2. **Configure o Webhook:**
   ```
   WhatsApp > Configuration > Webhooks
   ```

3. **Envie payload de teste:**
   - Clique no botão **"Test"** ao lado do campo "messages"
   - Meta enviará um payload simulado para sua URL
   - Não precisa de número real ou app publicado

4. **Verifique os logs:**
   ```bash
   # Ver logs da Edge Function
   supabase functions logs whatsapp-webhook --follow
   ```

   Ou no Dashboard Supabase:
   - https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/functions
   - Clique em "whatsapp-webhook" > "Logs"

#### Payload de Teste Esperado:

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "field": "messages",
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15551234567",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "contacts": [{
          "profile": { "name": "Test User" },
          "wa_id": "5511999999999"
        }],
        "messages": [{
          "from": "5511999999999",
          "id": "wamid.TEST123456",
          "timestamp": "1234567890",
          "type": "text",
          "text": { "body": "Esta é uma mensagem de teste" }
        }]
      }
    }]
  }]
}
```

---

### **2. Números de Teste Meta** (Recomendado para Teste Real)

#### Como Funciona:

- Meta fornece números de teste (Test WABA)
- Mensagens entre números de teste são **GRÁTIS**
- Webhooks funcionam normalmente
- NÃO precisa publicar o app

#### Configuração:

1. **Adicione números de teste:**
   ```
   WhatsApp > API Setup > Test Numbers
   ```

2. **Adicione seu número pessoal como teste:**
   - Clique em "Add phone number"
   - Digite seu WhatsApp pessoal
   - Confirme com código OTP

3. **Envie mensagens de teste:**
   - Use seu número pessoal cadastrado
   - Envie mensagem para o número do WhatsApp Business
   - Webhook será acionado automaticamente

#### Limites em Dev Mode:

- **Máximo de 5 números de teste**
- **Mensagens ilimitadas entre números de teste**
- **Webhooks funcionam 100%**

---

### **3. Teste Local com ngrok** (Para Debug Profundo)

Se quiser testar localmente antes de fazer deploy:

#### Passo a Passo:

1. **Instale ngrok:**
   ```bash
   brew install ngrok  # macOS
   # ou baixe em https://ngrok.com/download
   ```

2. **Suba função localmente:**
   ```bash
   supabase functions serve whatsapp-webhook
   # Rodará em http://localhost:54321/functions/v1/whatsapp-webhook
   ```

3. **Exponha com ngrok:**
   ```bash
   ngrok http 54321
   # Você receberá uma URL pública: https://abc123.ngrok.io
   ```

4. **Configure no Meta:**
   ```
   Webhook URL: https://abc123.ngrok.io/functions/v1/whatsapp-webhook
   Verify Token: seu_token_de_verificacao
   ```

5. **Teste e veja logs em tempo real:**
   - Logs do Supabase aparecem no terminal
   - Logs do ngrok mostram todas as requisições

---

## 🚀 Como Mudar para Live Mode (Quando Estiver Pronto)

### ⚠️ **IMPORTANTE: Live Mode vs Production**

- **Dev Mode**: Apenas testes com números de teste
- **Live Mode**: Webhooks funcionam com números reais, MAS ainda limitado
- **Production (após App Review)**: Sem limites, todos os recursos

### Requisitos para Live Mode:

1. **Privacy Policy URL** ✅ OBRIGATÓRIO
   - Adicione URL da política de privacidade
   - Settings > Basic > Privacy Policy URL
   - Sem isso, botão "Live Mode" fica desabilitado

2. **Toggle para Live Mode:**
   ```
   App Dashboard > WhatsApp > Configuration
   Topo da página: Toggle "Development Mode" → "Live Mode"
   ```

3. **Subscribe WABA ao App:**
   ```bash
   # Via API (opcional, pode fazer via Dashboard)
   curl -X POST \
     "https://graph.facebook.com/v21.0/WHATSAPP_BUSINESS_ACCOUNT_ID/subscribed_apps" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Limites em Live Mode (sem App Review):

- ✅ Webhooks de mensagens funcionam
- ✅ Pode usar números reais (limitado)
- ⚠️ **Limite de 250 conversas únicas em 24h**
- ⚠️ **Não pode atender clientes de outras empresas (se for solution provider)**

---

## 🔍 Verificar se Webhook Está Funcionando

### 1. **Check Webhook Status no Meta:**

```
WhatsApp > Configuration > Webhooks
```

- ✅ Verde: Verificado com sucesso
- ❌ Vermelho: Erro na verificação
- ⚠️ Amarelo: Parcialmente configurado

### 2. **Verificar Subscrições:**

Certifique-se que está subscrito em:
- ✅ `messages` (mensagens recebidas)
- ✅ `messaging_handovers` (transferências)
- ✅ `message_template_status_update` (status de templates)

### 3. **Testar Verificação Manual:**

```bash
# Simular verificação do Meta
curl -X GET "https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=TESTE123"

# Resposta esperada: TESTE123
```

### 4. **Ver Logs em Tempo Real:**

```bash
# Terminal
supabase functions logs whatsapp-webhook --follow

# Ou no Dashboard
# https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/functions/whatsapp-webhook/logs
```

---

## 🎯 Checklist de Teste

### Antes de Testar:

- [ ] Webhook URL configurada no Meta
- [ ] Verify Token configurado no Meta
- [ ] Mesmo verify token em `WHATSAPP_VERIFY_TOKEN` (Supabase Edge Functions)
- [ ] Subscrito no campo "messages"
- [ ] `META_ACCESS_TOKEN` configurado no Supabase
- [ ] Edge Function deployed: `supabase functions deploy whatsapp-webhook`

### Teste Manual Dashboard:

- [ ] Acessou Dashboard Meta > WhatsApp > Configuration
- [ ] Clicou em "Test" ao lado de "messages"
- [ ] Verificou logs no Supabase (função recebeu payload)
- [ ] Mensagem foi salva na tabela `messages`
- [ ] Conversa foi criada/atualizada na tabela `conversations`
- [ ] Contato foi criado na tabela `contacts`

### Teste com Número Real (Live Mode):

- [ ] App em Live Mode
- [ ] Privacy Policy URL configurada
- [ ] Número de teste adicionado
- [ ] Enviou mensagem do número de teste
- [ ] Webhook recebeu mensagem
- [ ] Mensagem aparece no Inbox

---

## 🐛 Troubleshooting

### Webhook não recebe mensagens:

1. **Verifique o modo do app:**
   - Dev Mode: Apenas teste manual e números de teste
   - Live Mode: Números reais funcionam

2. **Verifique subscrições:**
   ```
   WhatsApp > Configuration > Webhooks > Subscribed Fields
   Deve ter ✅ em "messages"
   ```

3. **Verifique logs:**
   ```bash
   supabase functions logs whatsapp-webhook --follow
   ```

4. **Teste verificação:**
   ```bash
   curl "https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=123"
   ```

### Erro "Webhook verification failed":

- Verify Token no Meta ≠ `WHATSAPP_VERIFY_TOKEN` no Supabase
- Solução: Certifique-se que são IDÊNTICOS

### Erro 500 ao salvar mensagem:

- Verifique RLS policies nas tabelas
- Verifique se `channel_accounts` tem registro ativo
- Verifique logs: `console.error` mostrará o problema

---

## 📊 Monitoramento

### Queries Úteis no Supabase:

```sql
-- Ver últimas mensagens recebidas
SELECT * FROM messages
WHERE direction = 'inbound'
ORDER BY created_at DESC
LIMIT 10;

-- Ver conversas ativas
SELECT
  c.*,
  co.full_name,
  co.phone_e164
FROM conversations c
JOIN contacts co ON c.contact_id = co.id
WHERE c.status = 'open'
ORDER BY c.last_message_at DESC;

-- Ver canais ativos
SELECT * FROM channel_accounts
WHERE status = 'active'
AND channel_type = 'whatsapp';
```

---

## ✅ Próximos Passos Após Teste

1. **Teste manual funcionou?** → Adicione números de teste
2. **Números de teste funcionaram?** → Mude para Live Mode
3. **Live Mode funcionou?** → Monitore limites (250 conversas/24h)
4. **Precisa de mais?** → Solicite App Review para Production

---

## 🔗 Links Úteis

- **Meta App Dashboard**: https://developers.facebook.com/apps/
- **Supabase Functions**: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/functions
- **WhatsApp Cloud API Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api/
- **Webhook Configuration**: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/

---

**Resumo:** Você PODE testar webhooks sem publicar o app usando:
1. ✅ Teste manual via Dashboard (mais fácil)
2. ✅ Números de teste (mais realista)
3. ⚠️ Live Mode (webhooks reais, mas limitado a 250 conversas/dia)
