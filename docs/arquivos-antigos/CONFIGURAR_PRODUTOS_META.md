# ⚡ GUIA RÁPIDO: Configurar Produtos do App Meta

**App já está LIVE (Público)** ✅
**Agora:** Configurar WhatsApp, Instagram e Messenger

**Tempo:** 15-20 minutos

---

## 📱 PRODUTO 1: WHATSAPP BUSINESS

### 1.1 Adicionar Produto

1. Acesse: https://developers.facebook.com/apps/670209849105494
2. Menu lateral → **"Add Products"** (se não adicionou ainda)
3. Encontre **"WhatsApp"** → Clique em **"Set Up"**

### 1.2 Configurar Webhook

1. Menu lateral → **"WhatsApp"** → **"Configuration"**
2. Seção **"Webhook"** → Clique em **"Edit"**
3. Preencha:

```
Callback URL: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook
Verify Token: connect_ia_webhook_2025
```

4. Clique em **"Verify and Save"**

**Se der erro "Verify Failed":**
- Verifique se a Edge Function está rodando no Supabase
- Teste a URL no navegador: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook
- Deve retornar algo (não erro 404)

### 1.3 Subscribe to Webhook Fields

Após salvar o webhook, na mesma página:

1. Clique em **"Manage"** ao lado de Webhook Fields
2. Marque:
   - ✅ `messages`
   - ✅ `message_status`
   - ✅ `messaging_postbacks` (se disponível)
   - ✅ `messaging_optins` (se disponível)
3. Clique em **"Subscribe"**

### 1.4 Obter Credenciais

**Phone Number ID:**
1. **WhatsApp** → **"API Setup"**
2. Na seção **"Phone Numbers"**
3. Copie o **Phone Number ID** (abaixo do número)
4. Formato: `123456789012345`

**Business Account ID:**
1. **WhatsApp** → **"API Setup"**
2. No topo, clique em configurações ⚙️
3. Copie o **WhatsApp Business Account ID**

**Access Token (Permanente):**
1. Acesse: https://business.facebook.com/settings/system-users
2. Se não tiver System User:
   - Clique em **"Add"**
   - Nome: `Connect IA System User`
   - Role: **Admin**
   - **Create**
3. Clique no System User criado
4. Clique em **"Generate New Token"**
5. Selecione App: **Connect IA**
6. Marque permissões:
   - ✅ `whatsapp_business_management`
   - ✅ `whatsapp_business_messaging`
7. **Generate Token**
8. **COPIE E GUARDE** (não será mostrado novamente!)

**Adicionar WhatsApp Assets ao System User:**
1. No System User, clique em **"Assign Assets"**
2. Aba **"Apps"**:
   - Marque: **Connect IA**
   - Permissões: **Full Control**
   - **Save Changes**
3. Aba **"WhatsApp Accounts"**:
   - Marque sua conta WhatsApp Business
   - Permissões: **Full Control**
   - **Save Changes**

### 1.5 Adicionar ao .env

```bash
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=EAAJZCcpy...seu_token_permanente_aqui
WHATSAPP_VERIFY_TOKEN=connect_ia_webhook_2025
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
```

---

## 📸 PRODUTO 2: INSTAGRAM BUSINESS (Opcional)

### 2.1 Adicionar Produto

1. Menu lateral → **"Add Products"**
2. **"Instagram"** → **"Set Up"**

### 2.2 Conectar Conta Instagram

1. Clique em **"Connect Instagram Account"**
2. Login na conta Instagram Business
3. Selecione página Facebook associada
4. Autorize

### 2.3 Configurar Webhook (Instagram usa mesmo webhook)

**Instagram usa a Edge Function `instagram-webhook` que você já tem!**

1. Menu lateral → **"Instagram"** → **"Configuration"**
2. Se pedir webhook, use:

```
Callback URL: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/instagram-webhook
Verify Token: connect_ia_webhook_2025
```

### 2.4 Obter Credenciais

**Instagram Business Account ID:**
1. **Instagram** → **"Configuration"**
2. ID está visível na página

**Access Token:**
1. Use o mesmo System User do WhatsApp
2. Ou gere novo token com permissões:
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_messages`
   - ✅ `instagram_manage_comments`

### 2.5 Adicionar ao .env

```bash
# Instagram Business API
INSTAGRAM_ACCESS_TOKEN=EAAJZCcpy...seu_token_aqui
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841400000000000
```

---

## 💬 PRODUTO 3: MESSENGER (Opcional)

### 3.1 Adicionar Produto

1. Menu lateral → **"Add Products"**
2. **"Messenger"** → **"Set Up"**

### 3.2 Conectar Página Facebook

1. Clique em **"Add or Remove Pages"**
2. Selecione sua página Facebook
3. Autorize

### 3.3 Configurar Webhook

**IMPORTANTE:** Você precisa criar a Edge Function `messenger-webhook` primeiro!

#### Criar Edge Function (Via Supabase Dashboard ou CLI):

**Opção A - Supabase CLI:**
```bash
supabase functions new messenger-webhook
```

**Opção B - Copiar da whatsapp-webhook:**
1. Copie o código de `supabase/functions/whatsapp-webhook/index.ts`
2. Adapte para Messenger (substitua lógica WhatsApp por Messenger)

#### Configurar no Meta:

1. **Messenger** → **"Settings"**
2. Seção **"Webhooks"** → **"Add Callback URL"**
3. Preencha:

```
Callback URL: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/messenger-webhook
Verify Token: connect_ia_webhook_2025
```

4. Subscribe to fields:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `messaging_optins`
   - ✅ `message_deliveries`
   - ✅ `message_reads`

### 3.4 Obter Credenciais

**Page Access Token:**
1. **Messenger** → **"Settings"**
2. Seção **"Access Tokens"**
3. Selecione sua página
4. Clique em **"Generate Token"**
5. Copie o token

**Page ID:**
1. Acesse sua página Facebook
2. Sobre → Role até o final
3. Ou use: https://findmyfbid.com/

### 3.5 Adicionar ao .env

```bash
# Messenger API
MESSENGER_ACCESS_TOKEN=EAAJZCcpy...seu_token_aqui
MESSENGER_PAGE_ID=123456789012345
MESSENGER_VERIFY_TOKEN=connect_ia_webhook_2025
```

---

## 🔐 FACEBOOK LOGIN (OAuth)

### 4.1 Produto já deve estar ativo

Se não estiver:
1. **"Add Products"** → **"Facebook Login"** → **"Set Up"**
2. Escolha plataforma: **"Web"**

### 4.2 Configurar OAuth Redirect URIs

1. **Facebook Login** → **"Settings"**
2. **"Valid OAuth Redirect URIs"**, adicione:

```
https://connectia.agenciapixel.digital/auth/callback
https://connectia.agenciapixel.digital/autenticacao
```

3. **Client OAuth Settings:**
   - ✅ **Client OAuth Login:** ON
   - ✅ **Web OAuth Login:** ON
   - ✅ **Use Strict Mode for Redirect URIs:** ON
   - ✅ **Enforce HTTPS:** ON

4. **Save Changes**

---

## ✅ CHECKLIST RÁPIDO

### WhatsApp:
- [ ] Produto adicionado
- [ ] Webhook configurado e verificado
- [ ] Webhook fields subscribed
- [ ] System User criado
- [ ] Token permanente gerado
- [ ] WhatsApp Assets atribuídos ao System User
- [ ] Phone Number ID copiado
- [ ] Business Account ID copiado
- [ ] Tudo adicionado ao .env

### Instagram (Se usar):
- [ ] Produto adicionado
- [ ] Conta Instagram conectada
- [ ] Webhook configurado
- [ ] Token gerado
- [ ] Business Account ID copiado
- [ ] Adicionado ao .env

### Messenger (Se usar):
- [ ] Produto adicionado
- [ ] Página conectada
- [ ] Edge Function criada
- [ ] Webhook configurado
- [ ] Token gerado
- [ ] Page ID copiado
- [ ] Adicionado ao .env

### Facebook Login:
- [ ] OAuth Redirect URIs configuradas
- [ ] Client OAuth Settings ativados

---

## 🧪 TESTAR WEBHOOKS

### Testar WhatsApp:

1. Envie mensagem do seu celular para o número WhatsApp Business
2. Verifique logs do Supabase:
   - Dashboard → Functions → whatsapp-webhook → Logs
3. Deve aparecer log da mensagem recebida

### Testar Instagram:

1. Envie DM para conta Instagram Business
2. Verifique logs: Functions → instagram-webhook → Logs

### Testar Messenger:

1. Envie mensagem para página Facebook
2. Verifique logs: Functions → messenger-webhook → Logs

---

## 🆘 TROUBLESHOOTING

### Erro: "Webhook Verification Failed"

**Causas:**
1. Edge Function não está rodando
2. Verify Token diferente
3. Edge Function retorna erro 500

**Solução:**
1. Teste a URL direto no navegador
2. Verifique logs da Edge Function
3. Confirme que verify token é: `connect_ia_webhook_2025`

### Erro: "Invalid Access Token"

**Causas:**
1. Token temporário expirou (24h)
2. Token não tem permissões

**Solução:**
1. Gere token via System User (nunca expira)
2. Marque todas as permissões necessárias
3. Atribua assets ao System User

### Erro: "Permission Denied"

**Solução:**
1. Vá em App Review → Permissions
2. Solicite Advanced Access para permissões necessárias
3. Aguarde aprovação (1-7 dias)

---

## 📁 ARQUIVO .env FINAL

Após configurar tudo:

```bash
# =====================================================
# SUPABASE
# =====================================================
VITE_SUPABASE_URL=https://bjsuujkbrhjhuyzydxbr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =====================================================
# META APP
# =====================================================

# App Credentials
VITE_META_APP_ID=670209849105494
META_APP_SECRET=[SEU_APP_SECRET]

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=[TOKEN_PERMANENTE_SYSTEM_USER]
WHATSAPP_VERIFY_TOKEN=connect_ia_webhook_2025
WHATSAPP_PHONE_NUMBER_ID=[SEU_PHONE_NUMBER_ID]
WHATSAPP_BUSINESS_ACCOUNT_ID=[SEU_BUSINESS_ACCOUNT_ID]

# Instagram Business API (Opcional)
INSTAGRAM_ACCESS_TOKEN=[SEU_TOKEN_INSTAGRAM]
INSTAGRAM_BUSINESS_ACCOUNT_ID=[SEU_IG_BUSINESS_ID]

# Messenger API (Opcional)
MESSENGER_ACCESS_TOKEN=[SEU_TOKEN_MESSENGER]
MESSENGER_PAGE_ID=[SUA_PAGE_ID]
MESSENGER_VERIFY_TOKEN=connect_ia_webhook_2025

# =====================================================
# APLICAÇÃO
# =====================================================
VITE_APP_URL=https://connectia.agenciapixel.digital
NODE_ENV=production
```

---

## 🎯 PRÓXIMO PASSO

**Após configurar tudo:**

1. ✅ Salve o .env
2. ✅ Teste enviar mensagem WhatsApp
3. ✅ Verifique se webhook recebe no Supabase
4. ✅ Configure respostas automáticas
5. ✅ Conecte com Agentes IA do sistema

---

**Última atualização:** 18 de Outubro de 2025
**Versão:** 1.0
**Status:** App Meta LIVE ✅
