# 🔑 REFERÊNCIA RÁPIDA: Secrets e IDs do Meta App

**Use este documento para registrar todas as credenciais geradas**

---

## 📱 APP META - INFORMAÇÕES BÁSICAS

| Item | Valor | Onde Encontrar |
|------|-------|----------------|
| **App ID** | `670209849105494` | Settings → Basic |
| **App Secret** | `[CLIQUE SHOW]` | Settings → Basic → Show |
| **Display Name** | `Connect IA` | Settings → Basic |
| **App Domains** | `agenciapixel.digital` | Settings → Basic |

---

## 🌐 URLS DO SISTEMA

| Tipo | URL |
|------|-----|
| **Site URL** | `https://connectia.agenciapixel.digital` |
| **Privacy Policy** | `https://connectia.agenciapixel.digital/politica-privacidade` |
| **Terms of Service** | `https://connectia.agenciapixel.digital/termos-de-servico` |
| **Data Deletion** | `https://connectia.agenciapixel.digital/exclusao-dados` |
| **OAuth Redirect** | `https://connectia.agenciapixel.digital/auth/callback` |

---

## 💬 WHATSAPP BUSINESS

### Credenciais

| Item | Valor | Como Obter |
|------|-------|------------|
| **Access Token** | `[TOKEN_PERMANENTE]` | WhatsApp → Configuration → System User → Generate Token |
| **Verify Token** | `connect_ia_webhook_2025` | Você define isso |
| **Phone Number ID** | `[ID_DO_NUMERO]` | WhatsApp → API Setup |
| **Business Account ID** | `[ID_DA_CONTA]` | WhatsApp → API Setup |

### Webhook (Supabase Edge Function)

| Item | Valor |
|------|-------|
| **Callback URL** | `https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook` |
| **Verify Token** | `connect_ia_webhook_2025` |

**Formato da URL:**
```
https://[PROJECT_ID].supabase.co/functions/v1/[FUNCTION_NAME]
```

### Webhook Fields (Marcar)

- ✅ `messages`
- ✅ `message_status`
- ✅ `messaging_postbacks`
- ✅ `messaging_optins`

### Permissões Necessárias

- ✅ `whatsapp_business_management`
- ✅ `whatsapp_business_messaging`

---

## 📸 INSTAGRAM BUSINESS (Opcional)

### Credenciais

| Item | Valor | Como Obter |
|------|-------|------------|
| **Access Token** | `[TOKEN_INSTAGRAM]` | Instagram → Configuration → Generate Token |
| **Business Account ID** | `[ID_INSTAGRAM]` | Instagram → Configuration |

### Permissões Necessárias

- ✅ `instagram_basic`
- ✅ `instagram_manage_messages`
- ✅ `instagram_manage_comments`

---

## 💬 MESSENGER (Opcional)

### Credenciais

| Item | Valor | Como Obter |
|------|-------|------------|
| **Page Access Token** | `[TOKEN_MESSENGER]` | Messenger → Settings → Access Tokens |
| **Page ID** | `[ID_DA_PAGINA]` | Messenger → Settings |
| **Verify Token** | `connect_ia_webhook_2025` | Você define isso |

### Webhook (Supabase Edge Function)

| Item | Valor |
|------|-------|
| **Callback URL** | `https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/messenger-webhook` |
| **Verify Token** | `connect_ia_webhook_2025` |

**Nota:** Edge Function `messenger-webhook` precisa ser criada se ainda não existir.

### Webhook Fields (Marcar)

- ✅ `messages`
- ✅ `messaging_postbacks`
- ✅ `messaging_optins`
- ✅ `message_deliveries`
- ✅ `message_reads`

### Permissões Necessárias

- ✅ `pages_messaging`
- ✅ `pages_manage_metadata`

---

## 🔐 FACEBOOK LOGIN

### OAuth Redirect URIs

```
https://connectia.agenciapixel.digital/auth/callback
https://connectia.agenciapixel.digital/autenticacao
```

### Permissões Necessárias

- ✅ `email`
- ✅ `public_profile`

### Client OAuth Settings

- ✅ **Client OAuth Login:** ON
- ✅ **Web OAuth Login:** ON
- ✅ **Force Web OAuth Reauthentication:** OFF
- ✅ **Use Strict Mode for Redirect URIs:** ON
- ✅ **Enforce HTTPS:** ON

---

## 📝 ARQUIVO .env.production COMPLETO

```bash
# =====================================================
# SUPABASE
# =====================================================
VITE_SUPABASE_URL=https://bjsuujkbrhjhuyzydxbr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc3V1amticmhqaHV5enlkeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2NzE0OTYsImV4cCI6MjA0NDI0NzQ5Nn0.WJTBUSDqwTQ-dSC0oWjhWGgcUXAFe6uw4yC2EHDyZqw

# =====================================================
# META APP (FACEBOOK/WHATSAPP/INSTAGRAM)
# =====================================================

# App Credentials
VITE_META_APP_ID=670209849105494
META_APP_SECRET=[PREENCHER - Settings → Basic → Show]

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=[PREENCHER - System User Token Permanente]
WHATSAPP_VERIFY_TOKEN=connect_ia_webhook_2025
WHATSAPP_PHONE_NUMBER_ID=[PREENCHER - WhatsApp → API Setup]
WHATSAPP_BUSINESS_ACCOUNT_ID=[PREENCHER - WhatsApp → API Setup]

# Instagram Business API (Opcional)
INSTAGRAM_ACCESS_TOKEN=[PREENCHER - Se for usar Instagram]
INSTAGRAM_BUSINESS_ACCOUNT_ID=[PREENCHER - Se for usar Instagram]

# Messenger API (Opcional)
MESSENGER_ACCESS_TOKEN=[PREENCHER - Se for usar Messenger]
MESSENGER_PAGE_ID=[PREENCHER - Se for usar Messenger]
MESSENGER_VERIFY_TOKEN=connect_ia_webhook_2025

# =====================================================
# APLICAÇÃO
# =====================================================
VITE_APP_URL=https://connectia.agenciapixel.digital
NODE_ENV=production

# =====================================================
# GOOGLE PLACES API (Opcional)
# =====================================================
VITE_GOOGLE_PLACES_API_KEY=[PREENCHER - Se for usar Google Places]
```

---

## 🎯 COMO GERAR TOKEN PERMANENTE (WHATSAPP)

**IMPORTANTE:** Temporary tokens expiram em 24h. Use System User para token permanente!

### Passo a Passo:

1. **Criar System User:**
   - Acesse: https://business.facebook.com/settings/system-users
   - Clique em **"Add"** (Adicionar)
   - Nome: `Connect IA System User`
   - Role: **Admin**
   - Clique em **"Create System User"**

2. **Gerar Token:**
   - Clique no System User criado
   - Clique em **"Generate New Token"**
   - Selecione seu App: `Connect IA`
   - Marque permissões:
     - ✅ `whatsapp_business_management`
     - ✅ `whatsapp_business_messaging`
   - Clique em **"Generate Token"**
   - **COPIE O TOKEN** (não será mostrado novamente!)

3. **Adicionar ao .env:**
   ```bash
   WHATSAPP_ACCESS_TOKEN=seu_token_permanente_aqui
   ```

4. **Adicionar WhatsApp Assets ao System User:**
   - No System User, clique em **"Assign Assets"**
   - Selecione **"WhatsApp Accounts"**
   - Marque sua conta WhatsApp Business
   - Permissões: **Full Control**
   - Clique em **"Save Changes"**

---

## 🔍 COMO ENCONTRAR IDs

### Phone Number ID (WhatsApp)

1. Vá para **WhatsApp** → **API Setup**
2. Na seção **"Phone Numbers"**
3. O ID está logo abaixo do número
4. Formato: `123456789012345`

### Business Account ID (WhatsApp)

1. Vá para **WhatsApp** → **API Setup**
2. No topo da página, clique em **"Settings"**
3. O ID está em **"WhatsApp Business Account ID"**
4. Formato: `123456789012345`

### Instagram Business Account ID

1. Vá para **Instagram** → **Configuration**
2. Na seção **"Instagram Business Account"**
3. O ID está visível
4. Formato: `17841400000000000`

### Messenger Page ID

1. Acesse sua página Facebook
2. Vá em **"About"** (Sobre)
3. Role até o final
4. O Page ID está lá
5. Ou use: https://findmyfbid.com/

---

## ✅ CHECKLIST DE SECRETS

Use esta lista para garantir que coletou todas as credenciais:

- [ ] **Meta App ID** copiado
- [ ] **Meta App Secret** copiado (clicou Show)
- [ ] **WhatsApp Access Token** (permanente via System User)
- [ ] **WhatsApp Phone Number ID** copiado
- [ ] **WhatsApp Business Account ID** copiado
- [ ] **Instagram Token** copiado (se usar)
- [ ] **Instagram Business ID** copiado (se usar)
- [ ] **Messenger Token** copiado (se usar)
- [ ] **Messenger Page ID** copiado (se usar)
- [ ] Todos os tokens adicionados ao `.env.production`
- [ ] Arquivo `.env.production` está no `.gitignore`
- [ ] Backup dos tokens em local seguro (gerenciador de senhas)

---

## 🛡️ SEGURANÇA

### ⚠️ NUNCA FAÇA ISSO:

- ❌ Commit de `.env` para GitHub
- ❌ Compartilhe tokens em Slack/Discord/Email
- ❌ Coloque tokens em código-fonte
- ❌ Use tokens temporários em produção
- ❌ Dê acesso de Admin para qualquer um

### ✅ SEMPRE FAÇA ISSO:

- ✅ Use `.env` para secrets
- ✅ Adicione `.env` ao `.gitignore`
- ✅ Use System User para tokens permanentes
- ✅ Guarde backup em gerenciador de senhas (1Password, Bitwarden, etc.)
- ✅ Revogue tokens antigos quando gerar novos
- ✅ Use variáveis de ambiente no servidor

---

## 🔄 ROTAÇÃO DE TOKENS

**Quando trocar tokens:**

- A cada 90 dias (boa prática)
- Se houver suspeita de vazamento
- Se app for comprometido
- Quando funcionário sair da empresa

**Como trocar:**

1. Gere novo token via System User
2. Adicione novo token ao `.env`
3. Faça deploy
4. Teste que funciona
5. Revogue token antigo no Meta

---

## 📞 SUPORTE META

**Se precisar de ajuda:**

- **Documentação:** https://developers.facebook.com/docs
- **Community Forum:** https://developers.facebook.com/community
- **Business Support:** https://business.facebook.com/business/help (se tiver conta verificada)

**Problemas comuns:**

- Token expirado → Gere token permanente via System User
- Webhook failed → Verifique HTTPS e verify token
- Permissions denied → Solicite aprovação no App Review

---

**Última atualização:** 18 de Outubro de 2025
**Versão:** 1.0.0
**Autor:** Claude + Ricardo da Silva (Agência Pixel)
