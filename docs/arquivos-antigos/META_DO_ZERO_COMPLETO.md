# 🚀 GUIA COMPLETO: Criar App Meta do ZERO

**Tempo:** 30-45 minutos
**Objetivo:** Criar e configurar App Meta para WhatsApp Business, Instagram e Messenger

---

## 📋 PRÉ-REQUISITOS

Antes de começar, tenha em mãos:

- [ ] Conta Facebook/Meta (pessoal ou business)
- [ ] Número de telefone para WhatsApp Business
- [ ] Conta Instagram Business (se for usar Instagram)
- [ ] Página Facebook (se for usar Messenger)
- [ ] Domínio verificado: `connectia.agenciapixel.digital`

---

## 🎯 ETAPA 1: CRIAR APP META

### 1.1 Acessar Meta for Developers

1. Acesse: https://developers.facebook.com/
2. Faça login com sua conta Meta
3. Clique em **"My Apps"** (Meus Apps) no canto superior direito
4. Clique em **"Create App"** (Criar App)

### 1.2 Escolher Tipo de App

**Opção recomendada:** Business

1. Selecione: **"Business"**
2. Clique em **"Next"** (Próximo)

### 1.3 Configurar Detalhes do App

Preencha:

| Campo | Valor |
|-------|-------|
| **Display Name** | `Connect IA` |
| **App Contact Email** | `ricardo@agenciapixel.digital` |
| **Business Account** | Selecione ou crie uma conta business |

Clique em **"Create App"** (Criar App)

### 1.4 Confirmar Criação

- Meta pode pedir para resolver um captcha
- Aguarde a criação do app (10-30 segundos)

---

## 🔑 ETAPA 2: OBTER APP ID E APP SECRET

### 2.1 Acessar Configurações Básicas

1. No menu lateral, clique em **"Settings"** → **"Basic"**
2. Você verá:

```
App ID: 123456789012345
App Secret: [Clique em "Show" para revelar]
```

### 2.2 Copiar Credenciais

**⚠️ IMPORTANTE: Guarde essas informações em local seguro!**

1. **App ID:**
   - Copie o número visível
   - Exemplo: `670209849105494`

2. **App Secret:**
   - Clique em **"Show"** (Mostrar)
   - Meta pode pedir sua senha
   - Copie o código secreto
   - **NUNCA compartilhe isso publicamente!**

### 2.3 Adicionar ao .env

Abra o arquivo `.env.production` e adicione:

```bash
# Meta App Credentials
VITE_META_APP_ID=670209849105494
META_APP_SECRET=seu_app_secret_aqui
```

---

## 🌐 ETAPA 3: CONFIGURAR DOMÍNIO E URLs

### 3.1 Adicionar Domínio de App

1. Em **Settings** → **Basic**
2. Role até **"App Domains"**
3. Clique em **"Add Domain"**
4. Digite: `agenciapixel.digital`
5. Clique em **"Save Changes"**

### 3.2 Configurar Site URL

Role até **"Website"** e adicione:

```
Site URL: https://connectia.agenciapixel.digital
```

Clique em **"Save Changes"**

### 3.3 Adicionar URLs de Privacy e Terms

Em **Settings** → **Basic**, role até o final e adicione:

| Campo | URL |
|-------|-----|
| **Privacy Policy URL** | `https://connectia.agenciapixel.digital/politica-privacidade` |
| **Terms of Service URL** | `https://connectia.agenciapixel.digital/termos-de-servico` |
| **User Data Deletion URL** | `https://connectia.agenciapixel.digital/exclusao-dados` |

Clique em **"Save Changes"**

---

## 📱 ETAPA 4: ADICIONAR WHATSAPP BUSINESS

### 4.1 Adicionar Produto WhatsApp

1. No menu lateral, procure **"Add Products"** (Adicionar Produtos)
2. Encontre **"WhatsApp"**
3. Clique em **"Set Up"** (Configurar)

### 4.2 Criar Conta WhatsApp Business

1. Meta vai pedir para criar uma conta WhatsApp Business
2. Clique em **"Create New WhatsApp Business Account"**
3. Preencha:
   - **Business Name:** `Agência Pixel - Connect IA`
   - **Business Category:** `Marketing / Advertising`
4. Clique em **"Continue"**

### 4.3 Adicionar Número de Telefone

**Opção A: Usar Número de Teste (Desenvolvimento)**

1. Clique em **"Add Phone Number"**
2. Meta fornece números de teste gratuitos
3. Use para desenvolvimento

**Opção B: Usar Número Real (Produção)**

1. Clique em **"Add Phone Number"**
2. Digite seu número no formato: `+55 11 98765-4321`
3. Meta vai enviar SMS com código
4. Digite o código de verificação
5. Confirme

### 4.4 Obter WhatsApp Token

1. Vá para **WhatsApp** → **API Setup**
2. Na seção **"Temporary Access Token"**:
   - Clique em **"Copy"**
   - Este token expira em 24h (apenas para testes)

3. **Para Produção (Token Permanente):**
   - Vá para **WhatsApp** → **Configuration**
   - Clique em **"Create System User"**
   - Nome: `Connect IA System User`
   - Role: **Admin**
   - Clique em **"Generate New Token"**
   - Selecione permissões:
     - ✅ `whatsapp_business_management`
     - ✅ `whatsapp_business_messaging`
   - Copie o token
   - **ESTE TOKEN NÃO EXPIRA!**

### 4.5 Adicionar Token ao .env

```bash
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=seu_token_permanente_aqui
```

### 4.6 Configurar Webhook do WhatsApp

**IMPORTANTE:** Os webhooks devem apontar para **Supabase Edge Functions**, não para o frontend!

1. Vá para **WhatsApp** → **Configuration**
2. Na seção **"Webhook"**, clique em **"Edit"**
3. Preencha:

```
Callback URL: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook
Verify Token: connect_ia_webhook_2025
```

**Explicação:**
- `bjsuujkbrhjhuyzydxbr` = Seu Project ID do Supabase
- `/functions/v1/` = Caminho padrão das Edge Functions
- `whatsapp-webhook` = Nome da Edge Function

4. Adicione ao `.env`:

```bash
WHATSAPP_VERIFY_TOKEN=connect_ia_webhook_2025
```

5. Clique em **"Verify and Save"**

6. **Subscribe to Webhook Fields:**
   - ✅ `messages`
   - ✅ `message_status`
   - ✅ `messaging_postbacks`
   - ✅ `messaging_optins`

---

## 📸 ETAPA 5: ADICIONAR INSTAGRAM (OPCIONAL)

### 5.1 Adicionar Produto Instagram

1. No menu lateral, **"Add Products"**
2. Encontre **"Instagram"**
3. Clique em **"Set Up"**

### 5.2 Conectar Conta Instagram Business

1. Clique em **"Connect Instagram Account"**
2. Faça login na sua conta Instagram
3. Selecione a página Facebook associada
4. Autorize o acesso

### 5.3 Obter Instagram Token

1. Vá para **Instagram** → **Configuration**
2. Siga os mesmos passos do WhatsApp para gerar token
3. Permissões necessárias:
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_messages`
   - ✅ `instagram_manage_comments`

### 5.4 Adicionar Token ao .env

```bash
# Instagram Business API
INSTAGRAM_ACCESS_TOKEN=seu_token_instagram_aqui
```

---

## 💬 ETAPA 6: ADICIONAR MESSENGER (OPCIONAL)

### 6.1 Adicionar Produto Messenger

1. No menu lateral, **"Add Products"**
2. Encontre **"Messenger"**
3. Clique em **"Set Up"**

### 6.2 Conectar Página Facebook

1. Clique em **"Add or Remove Pages"**
2. Selecione sua página Facebook
3. Autorize o acesso

### 6.3 Configurar Webhook do Messenger

**IMPORTANTE:** Webhook deve apontar para Supabase Edge Function!

1. Vá para **Messenger** → **Settings**
2. Na seção **"Webhooks"**, clique em **"Add Callback URL"**
3. Preencha:

```
Callback URL: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/messenger-webhook
Verify Token: connect_ia_webhook_2025
```

**Nota:** Se você não tiver criado a Edge Function `messenger-webhook` ainda, precisará criá-la seguindo o mesmo padrão da `whatsapp-webhook`.

4. Subscribe to webhook fields:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `messaging_optins`
   - ✅ `message_deliveries`
   - ✅ `message_reads`

### 6.4 Obter Messenger Token

1. Em **Messenger** → **Settings**
2. Na seção **"Access Tokens"**
3. Selecione sua página
4. Clique em **"Generate Token"**
5. Copie o token

### 6.5 Adicionar Token ao .env

```bash
# Messenger API
MESSENGER_ACCESS_TOKEN=seu_token_messenger_aqui
MESSENGER_PAGE_ID=sua_page_id_aqui
```

---

## 🔐 ETAPA 7: CONFIGURAR FACEBOOK LOGIN (OAUTH)

### 7.1 Adicionar Produto Facebook Login

1. No menu lateral, **"Add Products"**
2. Encontre **"Facebook Login"**
3. Clique em **"Set Up"**

### 7.2 Escolher Plataforma

Selecione: **"Web"**

### 7.3 Configurar OAuth Redirect URIs

1. Vá para **Facebook Login** → **Settings**
2. Em **"Valid OAuth Redirect URIs"**, adicione:

```
https://connectia.agenciapixel.digital/auth/callback
https://connectia.agenciapixel.digital/autenticacao
```

3. Clique em **"Save Changes"**

### 7.4 Configurar Client OAuth Settings

Em **"Client OAuth Settings"**:

- ✅ **Client OAuth Login:** ON
- ✅ **Web OAuth Login:** ON
- ✅ **Force Web OAuth Reauthentication:** OFF
- ✅ **Use Strict Mode for Redirect URIs:** ON
- ✅ **Enforce HTTPS:** ON

---

## 🎨 ETAPA 8: CONFIGURAR INFORMAÇÕES DO APP

### 8.1 Adicionar Ícone do App

1. Vá para **Settings** → **Basic**
2. Role até **"App Icon"**
3. Faça upload de um ícone 1024x1024px
4. Formato: PNG com fundo transparente

### 8.2 Adicionar Categoria

Em **"Category"**, selecione:
- **Primary:** Business and Pages
- **Secondary:** Communication

### 8.3 Configurar Data Use Checkup

1. No menu lateral, clique em **"Data Use Checkup"**
2. Responda as perguntas sobre como você usa os dados:
   - Como você coleta dados? → Via API
   - Para que usa os dados? → CRM e atendimento ao cliente
   - Como protege os dados? → Criptografia, HTTPS, LGPD
3. Complete todas as seções

---

## ✅ ETAPA 9: REVISAR PERMISSÕES

### 9.1 Revisar App Permissions

1. Vá para **App Review** → **Permissions and Features**
2. Verifique se estas permissões estão ativas:

**WhatsApp:**
- ✅ `whatsapp_business_management`
- ✅ `whatsapp_business_messaging`

**Instagram:**
- ✅ `instagram_basic`
- ✅ `instagram_manage_messages`

**Messenger:**
- ✅ `pages_messaging`
- ✅ `pages_manage_metadata`

**Facebook Login:**
- ✅ `email`
- ✅ `public_profile`

### 9.2 Solicitar Permissões Avançadas (se necessário)

Algumas permissões requerem aprovação da Meta:

1. Clique em **"Request Advanced Access"**
2. Preencha o formulário explicando:
   - O que seu app faz
   - Por que precisa das permissões
   - Como protege dados de usuários
3. Adicione screenshots/vídeo demonstrativo
4. Aguarde aprovação (1-7 dias)

---

## 🚀 ETAPA 10: MODO DE DESENVOLVIMENTO → PRODUÇÃO

### 10.1 Testar em Modo Desenvolvimento

**IMPORTANTE:** Por padrão, seu app está em **Development Mode**

- Apenas você (admin) e testadores adicionados podem usar
- Perfeito para testar tudo antes de lançar

**Adicionar Testadores:**
1. Vá para **Roles** → **Test Users**
2. Clique em **"Add Test Users"**
3. Digite emails ou crie usuários de teste

### 10.2 Passar para Modo Live (Produção)

**Só faça isso quando tudo estiver 100% testado!**

1. Vá para **Settings** → **Basic**
2. No topo da página, você verá o status: **"Development"**
3. Clique no switch para mudar para **"Live"**

**Checklist antes de Live:**
- [ ] Privacy Policy URL funcionando
- [ ] Terms of Service URL funcionando
- [ ] Data Deletion URL funcionando
- [ ] Webhooks configurados e testados
- [ ] Tokens salvos e funcionando
- [ ] App testado completamente
- [ ] Data Use Checkup completo

4. Clique em **"Switch Mode"**
5. Confirme que deseja passar para Live

---

## 📝 ETAPA 11: ARQUIVO .env COMPLETO

Após seguir todos os passos, seu `.env.production` deve estar assim:

```bash
# =====================================================
# SUPABASE
# =====================================================
VITE_SUPABASE_URL=https://bjsuujkbrhjhuyzydxbr.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui

# =====================================================
# META APP (FACEBOOK/WHATSAPP/INSTAGRAM)
# =====================================================

# App Credentials
VITE_META_APP_ID=670209849105494
META_APP_SECRET=seu_app_secret_aqui

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=seu_token_permanente_aqui
WHATSAPP_VERIFY_TOKEN=connect_ia_webhook_2025
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id_aqui
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id_aqui

# Instagram Business API (Opcional)
INSTAGRAM_ACCESS_TOKEN=seu_token_instagram_aqui
INSTAGRAM_BUSINESS_ACCOUNT_ID=seu_ig_business_id_aqui

# Messenger API (Opcional)
MESSENGER_ACCESS_TOKEN=seu_token_messenger_aqui
MESSENGER_PAGE_ID=sua_page_id_aqui
MESSENGER_VERIFY_TOKEN=connect_ia_webhook_2025

# =====================================================
# APLICAÇÃO
# =====================================================
VITE_APP_URL=https://connectia.agenciapixel.digital
NODE_ENV=production

# =====================================================
# GOOGLE PLACES API (Opcional)
# =====================================================
VITE_GOOGLE_PLACES_API_KEY=sua_chave_google_places_aqui
```

---

## 🧪 ETAPA 12: TESTAR TUDO

### 12.1 Testar WhatsApp

1. Envie mensagem do seu número para o número WhatsApp Business
2. Verifique se webhook recebe a mensagem
3. Teste resposta automática

### 12.2 Testar Instagram (se configurado)

1. Envie DM para conta Instagram Business
2. Verifique se webhook recebe
3. Teste resposta

### 12.3 Testar Messenger (se configurado)

1. Envie mensagem para página Facebook
2. Verifique webhook
3. Teste resposta

### 12.4 Testar Login Facebook

1. Acesse: https://connectia.agenciapixel.digital/autenticacao
2. Clique em "Login com Facebook"
3. Autorize o app
4. Verifique se login funciona

---

## 📋 CHECKLIST FINAL

- [ ] App Meta criado
- [ ] App ID e App Secret salvos no .env
- [ ] Domínio adicionado e verificado
- [ ] Privacy Policy, Terms e Data Deletion URLs configuradas
- [ ] WhatsApp Business configurado
- [ ] Token WhatsApp permanente gerado
- [ ] Webhook WhatsApp configurado e funcionando
- [ ] Instagram configurado (opcional)
- [ ] Messenger configurado (opcional)
- [ ] Facebook Login configurado
- [ ] OAuth Redirect URIs adicionadas
- [ ] Data Use Checkup completo
- [ ] App testado em modo desenvolvimento
- [ ] Testadores adicionados e testaram
- [ ] App passou para modo Live (quando pronto)

---

## 🆘 TROUBLESHOOTING

### Erro: "Invalid Verify Token"
**Solução:** Verifique se `WHATSAPP_VERIFY_TOKEN` no `.env` é exatamente igual ao configurado no webhook

### Erro: "Token Expired"
**Solução:** Gere um token permanente via System User, não use temporary token

### Erro: "Webhook Failed"
**Solução:**
1. Verifique se a URL é HTTPS
2. Verifique se a rota `/api/webhooks/whatsapp` existe
3. Verifique logs do servidor

### Erro: "Permissions Required"
**Solução:** Solicite aprovação das permissões avançadas no App Review

---

## 📚 RECURSOS ÚTEIS

- **Meta for Developers:** https://developers.facebook.com/
- **WhatsApp Business API Docs:** https://developers.facebook.com/docs/whatsapp
- **Instagram API Docs:** https://developers.facebook.com/docs/instagram-api
- **Messenger API Docs:** https://developers.facebook.com/docs/messenger-platform

---

## 🎯 PRÓXIMOS PASSOS

Após completar este guia:

1. **Teste extensivamente** em modo desenvolvimento
2. **Configure webhooks** no backend (Supabase Edge Functions)
3. **Implemente handlers** para mensagens recebidas
4. **Teste respostas automáticas** com agentes IA
5. **Passe para produção** quando tudo estiver funcionando

---

**Última atualização:** 18 de Outubro de 2025
**Versão:** 1.0.0 - Guia Completo
**Autor:** Claude + Ricardo da Silva (Agência Pixel)
