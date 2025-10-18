# 🎯 PASSO A PASSO: Publicar App Meta

**Tempo estimado:** 30-45 minutos

---

## ✅ ANTES DE COMEÇAR

### Já Está Pronto:
- ✅ 3 páginas obrigatórias criadas (Privacy, Terms, Data Deletion)
- ✅ Rotas configuradas no App.tsx
- ✅ Arquivo .env.production configurado
- ✅ App Meta ID: `670209849105494`

### Você Vai Precisar:
- [ ] Acesso ao Meta for Developers
- [ ] Acesso ao Hostinger (para deploy)
- [ ] 30-45 minutos de tempo

---

## 📝 PASSO A PASSO

### PASSO 1: Testar Páginas Localmente (5 min)

```bash
# 1. Iniciar servidor
cd "/Users/ricardodasilva/Documents/Connect IA"
npm run dev

# 2. Testar as 3 páginas no navegador:
```

Abra no navegador:
- ✅ http://localhost:8082/politica-privacidade
- ✅ http://localhost:8082/termos-de-servico
- ✅ http://localhost:8082/exclusao-dados

**Se todas carregarem → Prossiga para Passo 2**

---

### PASSO 2: Configurar App Meta - Settings Básicas (5 min)

1. Acesse: https://developers.facebook.com
2. Login com sua conta Meta
3. Vá em: **Apps** → Selecione seu app (`670209849105494`)
4. Menu lateral: **Settings** → **Basic**

**Cole estes valores:**

| Campo | Valor |
|-------|-------|
| App Domains | `connectia.agenciapixel.digital` (adicione também `localhost` em nova linha) |
| App URL | `https://connectia.agenciapixel.digital` |
| Privacy Policy URL | `https://connectia.agenciapixel.digital/politica-privacidade` |
| Terms of Service URL | `https://connectia.agenciapixel.digital/termos-de-servico` |
| Data Deletion Instructions URL | `https://connectia.agenciapixel.digital/exclusao-dados` |

5. Clique **Save Changes** (canto inferior direito)

---

### PASSO 3: Configurar Facebook Login (5 min)

1. Menu lateral: **Facebook Login** → **Settings**

2. Em **Valid OAuth Redirect URIs**, adicione (uma por linha):
   ```
   https://connectia.agenciapixel.digital/autenticacao
   https://connectia.agenciapixel.digital/
   http://localhost:8082/autenticacao
   http://localhost:8082/
   ```

3. Ative os switches:
   - ✅ Client OAuth Login → ON
   - ✅ Web OAuth Login → ON
   - ✅ Enforce HTTPS → ON

4. Clique **Save Changes**

---

### PASSO 4: Obter App Secret (2 min)

1. Volte para **Settings** → **Basic**
2. Procure **App Secret**
3. Clique em **Show**
4. Digite sua senha do Meta
5. **Copie o App Secret** (você vai usar no Passo 7)

---

### PASSO 5: Configurar WhatsApp (Opcional - 10 min)

**Só faça se vai usar WhatsApp Business**

1. Menu lateral: **WhatsApp** → **Configuration**
2. Clique em **Configure Webhooks**

**Callback URL:**
```
https://connectia.agenciapixel.digital/api/webhooks/whatsapp
```

**Verify Token:**
```
connect_ia_webhook_2025
```

3. Marque todos os campos:
   - ✅ messages
   - ✅ message_status
   - ✅ message_echoes
   - ✅ message_template_status_update

4. Clique **Verify and Save**

5. Vá em **API Setup** → Copie o **Temporary access token**

---

### PASSO 6: Configurar Instagram (Opcional - 5 min)

**Só faça se vai usar Instagram**

1. Menu lateral: **Instagram** → **Basic Display** → **Settings**

2. Em **Valid OAuth Redirect URIs**:
   ```
   https://connectia.agenciapixel.digital/integracoes/instagram/callback
   http://localhost:8082/integracoes/instagram/callback
   ```

3. Clique **Save Changes**

---

### PASSO 7: Atualizar .env.production (5 min)

1. Abra o arquivo: `.env.production`

2. Preencha os valores que você copiou:

```bash
# Cole o App Secret que copiou no Passo 4
META_APP_SECRET=COLE_AQUI

# Cole o WhatsApp Token que copiou no Passo 5
WHATSAPP_ACCESS_TOKEN=COLE_AQUI
WHATSAPP_PHONE_NUMBER_ID=COLE_AQUI
WHATSAPP_VERIFY_TOKEN=connect_ia_webhook_2025

# Se for usar Instagram
INSTAGRAM_ACCESS_TOKEN=COLE_AQUI
INSTAGRAM_PAGE_ID=COLE_AQUI
```

3. Salve o arquivo

---

### PASSO 8: Build e Deploy (5 min)

```bash
# 1. Build para testar
npm run build

# Se o build funcionar sem erros:

# 2. Commit e push (Git Deploy automático)
git add .
git commit -m "feat: Configurar App Meta para produção"
git push origin main
```

**Aguarde 2-5 minutos** para o deploy completar no Hostinger

---

### PASSO 9: Testar em Produção (5 min)

Abra no navegador (produção):

1. **Páginas públicas:**
   - ✅ https://connectia.agenciapixel.digital/politica-privacidade
   - ✅ https://connectia.agenciapixel.digital/termos-de-servico
   - ✅ https://connectia.agenciapixel.digital/exclusao-dados

2. **Login:**
   - ✅ https://connectia.agenciapixel.digital/autenticacao

3. **Dashboard:**
   - ✅ https://connectia.agenciapixel.digital

**Se tudo funcionar → Prossiga para Passo 10**

---

### PASSO 10: Publicar App (2 min)

**⚠️ Só faça depois de testar tudo!**

1. No Meta for Developers
2. **Settings** → **Basic**
3. Role até **App Mode**
4. Clique no switch: **Development** → **Live**
5. Leia e aceite os termos
6. Clique **Switch to Live Mode**

🎉 **PRONTO! Seu app está publicado!**

---

## ✅ CHECKLIST FINAL

Marque conforme completar:

- [ ] Passo 1: Páginas testadas localmente
- [ ] Passo 2: Settings básicas configuradas
- [ ] Passo 3: Facebook Login configurado
- [ ] Passo 4: App Secret copiado
- [ ] Passo 5: WhatsApp configurado (se aplicável)
- [ ] Passo 6: Instagram configurado (se aplicável)
- [ ] Passo 7: .env.production preenchido
- [ ] Passo 8: Build e deploy realizados
- [ ] Passo 9: Tudo testado em produção
- [ ] Passo 10: App publicado (Live Mode)

---

## 🆘 PROBLEMAS?

### Build falha com erro
```bash
# Limpar cache e tentar novamente
rm -rf node_modules/.vite
npm run build
```

### Páginas não carregam em produção
- Aguarde 5 minutos (deploy pode demorar)
- Limpe o cache do navegador (Ctrl+Shift+R)
- Verifique se o deploy terminou no Hostinger

### Webhook não verifica
- Certifique-se que a URL está acessível
- Verifique se o Verify Token está correto
- Aguarde alguns minutos e tente novamente

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **Guia Rápido:** `CONFIGURAR_APP_META_RESUMIDO.md`
- **Guia Completo:** `CONFIGURAR_APP_META.md`
- **Sistema Atual:** `SISTEMA_ATUAL.md`

---

## 📞 DÚVIDAS?

**Email:** ricardo@agenciapixel.digital

---

**Boa sorte com a configuração! 🚀**
