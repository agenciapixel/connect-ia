# 🚀 CONNECT IA - CONFIGURAÇÃO APP META

**Status:** ✅ Páginas criadas e prontas para publicação
**Servidor Dev:** http://localhost:8083
**Produção:** https://connectia.agenciapixel.digital

---

## ✅ O QUE JÁ ESTÁ PRONTO

### Páginas Obrigatórias (Meta) - ✅ Criadas

1. **Política de Privacidade**
   - Arquivo: `src/pages/PrivacyPolicy.tsx`
   - URL Local: http://localhost:8083/politica-privacidade
   - URL Produção: https://connectia.agenciapixel.digital/politica-privacidade
   - ✅ LGPD compliant
   - ✅ Informações do Connect IA atualizadas
   - ✅ Contato: ricardo@agenciapixel.digital

2. **Termos de Serviço**
   - Arquivo: `src/pages/TermsOfService.tsx`
   - URL Local: http://localhost:8083/termos-de-servico
   - URL Produção: https://connectia.agenciapixel.digital/termos-de-servico
   - ✅ Termos específicos do CRM
   - ✅ Integrações Meta (WhatsApp, Instagram, Messenger)
   - ✅ Direitos e responsabilidades

3. **Exclusão de Dados**
   - Arquivo: `src/pages/DataDeletion.tsx`
   - URL Local: http://localhost:8083/exclusao-dados
   - URL Produção: https://connectia.agenciapixel.digital/exclusao-dados
   - ✅ Processo de exclusão detalhado
   - ✅ LGPD compliant
   - ✅ Prazo de 48h + 30 dias

### Rotas Configuradas - ✅ App.tsx

Rotas adicionadas no arquivo `src/App.tsx`:
```typescript
<Route path="/politica-privacidade" element={<PrivacyPolicy />} />
<Route path="/termos-de-servico" element={<TermsOfService />} />
<Route path="/exclusao-dados" element={<DataDeletion />} />
```

### Configuração de Produção - ✅ .env.production

Arquivo `.env.production` já existe com:
- ✅ URLs de produção configuradas
- ✅ Meta App ID: `670209849105494`
- ⚠️ Tokens precisam ser preenchidos (veja Passo 7 do guia)

---

## 📋 PRÓXIMOS PASSOS

### PASSO 1: Testar Localmente ✅

O servidor já está rodando em: **http://localhost:8083**

Teste as 3 páginas:
- ✅ http://localhost:8083/politica-privacidade
- ✅ http://localhost:8083/termos-de-servico
- ✅ http://localhost:8083/exclusao-dados

**Se todas carregarem corretamente → Pronto para deploy!**

---

### PASSO 2: Fazer Deploy

```bash
# 1. Parar o servidor dev (Ctrl+C no terminal)

# 2. Build de produção
npm run build

# 3. Se o build funcionar sem erros, faça o deploy:
git add .
git commit -m "feat: Adicionar páginas obrigatórias do App Meta"
git push origin main
```

⏱️ **Aguarde 2-5 minutos** para o deploy completar no Hostinger

---

### PASSO 3: Testar em Produção

Após o deploy, abra no navegador:

1. https://connectia.agenciapixel.digital/politica-privacidade
2. https://connectia.agenciapixel.digital/termos-de-servico
3. https://connectia.agenciapixel.digital/exclusao-dados

**Se todas carregarem → Prossiga para configurar o App Meta!**

---

### PASSO 4: Configurar App Meta

Siga um dos guias:

**Opção 1 - Guia Rápido (Recomendado):**
📄 Abra: `PASSO_A_PASSO_APP_META.md`

**Opção 2 - Guia Resumido:**
📄 Abra: `CONFIGURAR_APP_META_RESUMIDO.md`

**Opção 3 - Guia Completo:**
📄 Abra: `CONFIGURAR_APP_META.md`

---

## 🎯 RESUMO DO QUE CONFIGURAR NO META

Você vai precisar configurar no Meta for Developers:

1. **Settings → Basic**
   - Privacy Policy URL
   - Terms of Service URL
   - Data Deletion URL
   - App Domains

2. **Facebook Login**
   - OAuth Redirect URIs

3. **WhatsApp** (opcional)
   - Webhook URL
   - Verify Token

4. **Instagram** (opcional)
   - OAuth Redirect URIs

5. **Messenger** (opcional)
   - Webhook URL

---

## 📊 INFORMAÇÕES IMPORTANTES

### URLs que você vai usar:

**Produção:**
```
https://connectia.agenciapixel.digital/politica-privacidade
https://connectia.agenciapixel.digital/termos-de-servico
https://connectia.agenciapixel.digital/exclusao-dados
https://connectia.agenciapixel.digital/autenticacao
```

**Desenvolvimento:**
```
http://localhost:8083/politica-privacidade
http://localhost:8083/termos-de-servico
http://localhost:8083/exclusao-dados
http://localhost:8083/autenticacao
```

### Tokens e IDs:

```
Meta App ID: 670209849105494
Verify Token: connect_ia_webhook_2025
```

### Contato (DPO):

```
Nome: Ricardo da Silva
Email: ricardo@agenciapixel.digital
Empresa: Connect IA - Agência Pixel
```

---

## 🆘 PRECISA DE AJUDA?

### Servidor não inicia?
```bash
export PATH="/opt/homebrew/bin:$PATH"
npm run dev
```

### Build falha?
```bash
rm -rf node_modules/.vite
npm run build
```

### Páginas não carregam?
- Limpe o cache do navegador (Ctrl+Shift+R)
- Aguarde 5 minutos após o deploy
- Verifique se o servidor está rodando

---

## 📁 ARQUIVOS CRIADOS NESTA SESSÃO

### Páginas:
- ✅ `src/pages/PrivacyPolicy.tsx` (atualizado)
- ✅ `src/pages/TermsOfService.tsx` (novo)
- ✅ `src/pages/DataDeletion.tsx` (novo)

### Rotas:
- ✅ `src/App.tsx` (atualizado com 2 novas rotas)

### Documentação:
- ✅ `CONFIGURAR_APP_META.md` - Guia completo detalhado
- ✅ `CONFIGURAR_APP_META_RESUMIDO.md` - Guia resumido rápido
- ✅ `PASSO_A_PASSO_APP_META.md` - Passo a passo numerado
- ✅ `LEIA_PRIMEIRO_APP_META.md` - Este arquivo

### Configuração:
- ✅ `.env.production` - Já existia, pronto para preencher tokens

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Marque conforme completar:

- [x] Páginas criadas (Privacy, Terms, Data Deletion)
- [x] Rotas adicionadas no App.tsx
- [x] Páginas testadas localmente
- [ ] Build de produção funcionando
- [ ] Deploy realizado (git push)
- [ ] Páginas testadas em produção
- [ ] App Meta configurado (Settings básicas)
- [ ] Facebook Login configurado
- [ ] WhatsApp configurado (se aplicável)
- [ ] Instagram configurado (se aplicável)
- [ ] Tokens preenchidos no .env.production
- [ ] App publicado (Development → Live)

---

## 🚀 COMANDO RÁPIDO PARA COMEÇAR

```bash
# 1. Ver as páginas localmente
# Servidor já está rodando em http://localhost:8083

# 2. Quando estiver pronto para publicar:
npm run build && git add . && git commit -m "feat: App Meta pronto" && git push origin main

# 3. Aguarde 5 minutos e teste em produção
```

---

**Próximo passo:** Teste as 3 páginas localmente e depois faça o deploy!

**Dúvidas?** ricardo@agenciapixel.digital

---

**Última atualização:** 18 de Outubro de 2025, 11:52 BRT
**Status:** ✅ Pronto para deploy e configuração do App Meta
