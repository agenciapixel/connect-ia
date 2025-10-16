# 🔧 Troubleshooting: Webhook retornando erro 401

## ❌ Problema Encontrado

Ao testar o webhook do WhatsApp, recebemos:
```json
{"code":401,"message":"Missing authorization header"}
```

## 🔍 Causa

Por padrão, as Edge Functions do Supabase **requerem autenticação** (JWT token). Webhooks externos (como do Meta/WhatsApp) **não enviam** tokens de autorização do Supabase, apenas tokens de verificação próprios.

## ✅ Solução 1: Desabilitar Verificação JWT (RECOMENDADO para Webhooks)

### Método A: Via Dashboard Supabase

1. **Acesse o Dashboard:**
   ```
   https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/functions
   ```

2. **Selecione a função:**
   - Clique em `whatsapp-webhook`

3. **Configure JWT Verification:**
   - Procure por "Verification" ou "Settings"
   - **Desmarque** a opção "Verify JWT"
   - Ou mude "Authentication" de "Required" para "None"

4. **Salve as alterações**

5. **Repita para `instagram-webhook`**

### Método B: Via arquivo de configuração (se disponível)

No arquivo `supabase/functions/whatsapp-webhook/.well-known.json`:

```json
{
  "verify": false,
  "jwt_required": false
}
```

Ou criar arquivo `supabase/functions/whatsapp-webhook/deno.json`:

```json
{
  "deploy": {
    "verify_jwt": false
  }
}
```

Depois fazer redeploy:
```bash
supabase functions deploy whatsapp-webhook
supabase functions deploy instagram-webhook
```

---

## ✅ Solução 2: Usar Service Role Key (MENOS SEGURO)

Se não conseguir desabilitar JWT, pode enviar o Service Role Key no header:

```bash
curl -X GET \
  "https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=teste123&hub.challenge=TESTE" \
  -H "Authorization: Bearer SEU_SERVICE_ROLE_KEY"
```

**⚠️ PROBLEMA:** O Meta não pode enviar Service Role Key, então isso só serve para teste manual.

---

## ✅ Solução 3: Usar Supabase CLI para Configuração

```bash
# Verificar configuração atual
supabase functions list

# Atualizar configuração da função
supabase functions update whatsapp-webhook --no-verify-jwt

# Ou via flags no deploy
supabase functions deploy whatsapp-webhook --no-verify-jwt
```

---

## ✅ Solução 4: Proxy/Middleware (Alternativa)

Se nada funcionar, criar uma função intermediária que aceita requisições públicas e repassa para o webhook:

```typescript
// supabase/functions/public-whatsapp-webhook/index.ts
serve(async (req) => {
  // Esta função NÃO requer JWT

  // Repassar para função interna com Service Role Key
  const response = await fetch(
    'https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook',
    {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: req.method === 'POST' ? await req.text() : undefined
    }
  );

  return response;
});
```

---

## 🧪 Como Testar Após Configurar

### 1. Teste de Verificação (GET)

```bash
curl -X GET "https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=SEU_VERIFY_TOKEN&hub.challenge=TESTE123"

# Resposta esperada: TESTE123
```

### 2. Teste de Mensagem (POST)

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
            "text": { "body": "Teste de mensagem" }
          }]
        }
      }]
    }]
  }'

# Resposta esperada: OK
```

### 3. Verificar Logs

```bash
supabase functions logs whatsapp-webhook --follow
```

Ou no Dashboard:
```
https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/functions/whatsapp-webhook/logs
```

---

## 📋 Checklist de Verificação

Antes de configurar no Meta, certifique-se:

- [ ] Webhook responde a requisições GET sem erro 401
- [ ] Challenge é retornado corretamente na verificação
- [ ] Webhook responde a requisições POST sem erro 401
- [ ] Logs aparecem no Supabase quando recebe requisições
- [ ] Variáveis de ambiente estão configuradas:
  - [ ] `WHATSAPP_VERIFY_TOKEN` ou `META_VERIFY_TOKEN`
  - [ ] `META_ACCESS_TOKEN`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

---

## 🎯 Configuração no Meta (após resolver 401)

1. **Acesse Meta App Dashboard:**
   ```
   https://developers.facebook.com/apps/
   ```

2. **Configure Webhook:**
   ```
   WhatsApp > Configuration > Webhooks

   Callback URL: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook
   Verify Token: [mesmo valor de WHATSAPP_VERIFY_TOKEN]
   ```

3. **Subscribe aos campos:**
   - [x] messages
   - [x] messaging_handovers
   - [x] message_template_status_update

4. **Clique em "Verify and Save"**

5. **Teste via Dashboard:**
   - Clique em "Test" ao lado de "messages"
   - Verifique logs no Supabase

---

## 🔗 Links Úteis

- **Dashboard Supabase Functions**: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/functions
- **Supabase Edge Functions Docs**: https://supabase.com/docs/guides/functions
- **Meta Webhooks Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/

---

## 💡 Próximo Passo

**Você precisa fazer:**

1. ✅ Acessar o Dashboard do Supabase
2. ✅ Ir em Functions > whatsapp-webhook > Settings
3. ✅ Desabilitar "Verify JWT" ou mudar Authentication para "None"
4. ✅ Salvar
5. ✅ Repetir para instagram-webhook
6. ✅ Testar novamente com curl

**Depois de configurar, me avise e eu testo novamente!** 🚀
