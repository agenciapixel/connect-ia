# ⚡ GUIA RÁPIDO: Configurar App Meta (Produção)

**App ID:** `670209849105494`
**URL Produção:** `https://connectia.agenciapixel.digital`

---

## 📋 CHECKLIST RÁPIDO

### 1️⃣ PÁGINAS OBRIGATÓRIAS (✅ Criadas)

- ✅ `/politica-privacidade` - Política de Privacidade
- ✅ `/termos-de-servico` - Termos de Serviço
- ✅ `/exclusao-dados` - Exclusão de Dados

**Testar localmente:**
```bash
npm run dev
# Abrir: http://localhost:8082/politica-privacidade
# Abrir: http://localhost:8082/termos-de-servico
# Abrir: http://localhost:8082/exclusao-dados
```

---

### 2️⃣ CONFIGURAÇÕES BÁSICAS DO APP

**Acesse:** https://developers.facebook.com/apps/670209849105494/settings/basic/

**Configure:**

1. **App Domains:**
   ```
   connectia.agenciapixel.digital
   localhost
   ```

2. **App URL:**
   ```
   https://connectia.agenciapixel.digital
   ```

3. **Privacy Policy URL:**
   ```
   https://connectia.agenciapixel.digital/politica-privacidade
   ```

4. **Terms of Service URL:**
   ```
   https://connectia.agenciapixel.digital/termos-de-servico
   ```

5. **Data Deletion Instructions URL:**
   ```
   https://connectia.agenciapixel.digital/exclusao-dados
   ```

6. Clique **Save Changes**

---

### 3️⃣ FACEBOOK LOGIN (OAuth)

**Acesse:** https://developers.facebook.com/apps/670209849105494/fb-login/settings/

**Configure Valid OAuth Redirect URIs:**
```
https://connectia.agenciapixel.digital/autenticacao
https://connectia.agenciapixel.digital/
http://localhost:8082/autenticacao
http://localhost:8082/
```

**Configurações:**
- ✅ Client OAuth Login: ON
- ✅ Web OAuth Login: ON
- ✅ Enforce HTTPS: ON

**Save Changes**

---

### 4️⃣ WHATSAPP BUSINESS

**Acesse:** https://developers.facebook.com/apps/670209849105494/whatsapp-business/wa-settings/

#### Configure Webhook:

1. **Callback URL:**
   ```
   https://connectia.agenciapixel.digital/api/webhooks/whatsapp
   ```

2. **Verify Token:** (use este exato valor)
   ```
   connect_ia_webhook_2025
   ```

3. **Webhook Fields** - Marque todos:
   - ✅ messages
   - ✅ message_status
   - ✅ message_echoes
   - ✅ message_template_status_update

4. Clique **Verify and Save**

#### Obter Access Token:

1. Na página **API Setup**
2. Copie o **Temporary access token**
3. **⚠️ IMPORTANTE:** Este token expira em 24h!

**Para token permanente:**
- Siga o wizard de produção do WhatsApp
- Ou gere via API do Meta

---

### 5️⃣ INSTAGRAM BUSINESS

**Acesse:** https://developers.facebook.com/apps/670209849105494/instagram-basic-display/basic-display/

**Configure Valid OAuth Redirect URIs:**
```
https://connectia.agenciapixel.digital/integracoes/instagram/callback
http://localhost:8082/integracoes/instagram/callback
```

**Save Changes**

---

### 6️⃣ MESSENGER

**Acesse:** https://developers.facebook.com/apps/670209849105494/messenger/settings/

#### Configure Webhook:

1. **Callback URL:**
   ```
   https://connectia.agenciapixel.digital/api/webhooks/messenger
   ```

2. **Verify Token:**
   ```
   connect_ia_webhook_2025
   ```

3. **Webhook Fields** - Marque:
   - ✅ messages
   - ✅ messaging_postbacks
   - ✅ messaging_optins
   - ✅ message_deliveries
   - ✅ message_reads

4. **Verify and Save**

---

### 7️⃣ ATUALIZAR .env.production

Edite o arquivo `.env.production` e preencha:

```bash
# META APP SECRET
META_APP_SECRET=COLE_SEU_APP_SECRET_AQUI

# WHATSAPP
WHATSAPP_ACCESS_TOKEN=COLE_SEU_TOKEN_WHATSAPP_AQUI
WHATSAPP_PHONE_NUMBER_ID=COLE_SEU_PHONE_ID_AQUI
WHATSAPP_VERIFY_TOKEN=connect_ia_webhook_2025

# INSTAGRAM
INSTAGRAM_ACCESS_TOKEN=COLE_SEU_TOKEN_INSTAGRAM_AQUI
INSTAGRAM_PAGE_ID=COLE_SEU_PAGE_ID_AQUI
INSTAGRAM_VERIFY_TOKEN=connect_ia_webhook_2025
```

**Onde obter cada valor:**

| Variável | Onde Obter |
|----------|-----------|
| `META_APP_SECRET` | Settings → Basic → App Secret → Show |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp → API Setup → Temporary access token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp → API Setup → Phone Number ID |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram → Basic Display → User Token Generator |
| `INSTAGRAM_PAGE_ID` | Instagram → Basic Display → Instagram Account ID |

---

### 8️⃣ BUILD E DEPLOY

```bash
# 1. Build local (testar)
npm run build

# 2. Testar build localmente
npm run preview

# 3. Deploy para produção (Git Deploy automático)
git add .
git commit -m "feat: Configurar App Meta com URLs de produção"
git push origin main
```

**⏱️ Aguarde:** 2-5 minutos para deploy completar no Hostinger

---

### 9️⃣ TESTAR EM PRODUÇÃO

Após deploy, teste:

1. **Páginas Públicas:**
   - ✅ https://connectia.agenciapixel.digital/politica-privacidade
   - ✅ https://connectia.agenciapixel.digital/termos-de-servico
   - ✅ https://connectia.agenciapixel.digital/exclusao-dados

2. **Login:**
   - ✅ https://connectia.agenciapixel.digital/autenticacao

3. **Webhooks:**
   - No Meta for Developers, clique em "Test" nos webhooks
   - Deve retornar **200 OK**

---

### 🔟 MODO PRODUÇÃO (Publicar App)

**⚠️ Só faça isso depois de testar tudo!**

1. **Settings** → **Basic**
2. Role até **App Mode**
3. Clique no switch: **Development** → **Live**
4. Leia e aceite os termos
5. Clique **Switch to Live Mode**

---

## 🚨 PROBLEMAS COMUNS

### Webhook não verifica

**Erro:** "Webhook verification failed"

**Solução:**
1. Verifique se o `VERIFY_TOKEN` está correto em ambos os lados
2. Certifique-se que a URL está acessível publicamente
3. Teste o endpoint manualmente:
   ```
   https://connectia.agenciapixel.digital/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=connect_ia_webhook_2025&hub.challenge=teste
   ```
   Deve retornar: `teste`

### Redirect URI inválido

**Erro:** "Invalid OAuth Redirect URI"

**Solução:**
1. URLs devem ser EXATAMENTE iguais (sem / no final)
2. HTTPS obrigatório em produção
3. Domínio deve estar em **App Domains**

### Token expirado

**Erro:** "Token expired"

**Solução:**
- Tokens temporários do WhatsApp expiram em 24h
- Gere um token permanente seguindo o wizard de produção

---

## 📊 RESUMO DO QUE FAZER

```
1. ✅ Testar páginas localmente (npm run dev)
2. ⚙️ Configurar Settings básicas no Meta
3. 🔐 Configurar Facebook Login OAuth
4. 📱 Configurar WhatsApp Webhook
5. 📸 Configurar Instagram OAuth
6. 💬 Configurar Messenger Webhook
7. 🔑 Preencher .env.production com tokens
8. 🏗️ Build e deploy (git push)
9. ✅ Testar tudo em produção
10. 🚀 Publicar app (Development → Live)
```

---

## 📞 LINKS ÚTEIS

- **Meta for Developers:** https://developers.facebook.com
- **Seu App:** https://developers.facebook.com/apps/670209849105494
- **Produção:** https://connectia.agenciapixel.digital
- **Supabase:** https://supabase.com/dashboard

---

## 💾 BACKUP

Antes de fazer mudanças, sempre:
```bash
# Fazer backup do .env
cp .env.production .env.production.backup

# Criar tag de versão
git tag -a v1.0-meta-config -m "Configuração App Meta"
git push --tags
```

---

**Última atualização:** 18 de Outubro de 2025
**Guia completo:** Veja `CONFIGURAR_APP_META.md` para detalhes
