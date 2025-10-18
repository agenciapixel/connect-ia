# 🚀 GUIA COMPLETO: Integração Meta (WhatsApp, Instagram, Messenger)

**Do ZERO ao FUNCIONAMENTO COMPLETO**
**Tempo total:** 20-30 minutos
**Última atualização:** 18 de Outubro de 2025

---

## 📋 ÍNDICE

1. [Escolher Método WhatsApp](#1-escolher-método-whatsapp)
2. [Método Rápido: WhatsApp QR Code (5 min)](#2-método-rápido-whatsapp-qr-code)
3. [Método Avançado: API Oficial Meta (30 min)](#3-método-avançado-api-oficial-meta)
4. [Instagram (Opcional)](#4-instagram-opcional)
5. [Messenger (Opcional)](#5-messenger-opcional)
6. [Testar Integrações](#6-testar-integrações)

---

## 1. ESCOLHER MÉTODO WHATSAPP

### 🤔 Qual método usar?

| Característica | QR Code ⚡ | API Oficial 🏢 |
|----------------|-----------|----------------|
| **Tempo configuração** | 5 minutos | 30-45 minutos |
| **Dificuldade** | Fácil ⭐ | Difícil ⭐⭐⭐⭐ |
| **Aprovação Meta** | Não precisa ✅ | Precisa ❌ |
| **Conta WhatsApp** | Usa sua conta ✅ | Precisa criar nova ❌ |
| **Custo** | Grátis ✅ | Pode ter custo |
| **Templates aprovados** | Não ❌ | Sim ✅ |
| **Envio em massa** | Limitado ⚠️ | Ilimitado ✅ |
| **Estabilidade** | Boa ✅ | Excelente ✅✅ |

### 💡 Recomendação:

- **🟢 Use QR Code** se:
  - Quer começar AGORA
  - Tem menos de 500 conversas/mês
  - Não precisa de templates aprovados
  - Quer testar o sistema primeiro

- **🔵 Use API Oficial** se:
  - Precisa de templates aprovados pelo Meta
  - Vai enviar muitas mensagens (1000+/mês)
  - Quer botões interativos oficiais
  - Negócio já está estabelecido

**👉 DICA:** Comece com QR Code, migre para API depois se precisar!

---

## 2. MÉTODO RÁPIDO: WHATSAPP QR CODE

### ⚡ 5 MINUTOS - MAIS FÁCIL

### 2.1 Acessar Integrações

1. Acesse: **https://connectia.agenciapixel.digital/integracoes**
2. Faça login (se não estiver logado)
3. Encontre o card **"WhatsApp"**

### 2.2 Conectar via QR Code

1. Clique em **"Conectar"** ou **"Conectar via QR Code"**
2. Um QR Code vai aparecer na tela
3. No seu celular:
   - Abra o **WhatsApp**
   - Toque nos **3 pontinhos** (⋮ menu)
   - Toque em **"Aparelhos conectados"**
   - Toque em **"Conectar um aparelho"**
   - **Escaneie o QR Code** da tela

### 2.3 Confirmar Conexão

1. Aguarde 5-10 segundos
2. Verá: **"WhatsApp Conectado ✅"**
3. Pronto! Pode fechar

### 2.4 Testar

1. Envie uma mensagem para o número conectado
2. Vá em **Caixa de Entrada** no Connect IA
3. A mensagem deve aparecer lá
4. Responda pelo sistema
5. Deve chegar no WhatsApp

### ✅ PRONTO! WhatsApp funcionando!

**Pule para:** [Seção 6: Testar Integrações](#6-testar-integrações)

---

## 3. MÉTODO AVANÇADO: API OFICIAL META

### 🏢 30-45 MINUTOS - MAIS COMPLETO

### 3.1 Criar App Meta

#### Passo 1: Acessar Meta for Developers

1. Acesse: https://developers.facebook.com/
2. Faça login com sua conta Meta/Facebook
3. Clique em **"My Apps"** (canto superior direito)
4. Clique em **"Create App"**

#### Passo 2: Configurar App

1. Tipo de app: **"Business"**
2. Clique em **"Next"**
3. Preencha:
   - **Display Name:** `Connect IA`
   - **App Contact Email:** `ricardo@agenciapixel.digital`
   - **Business Account:** Selecione ou crie uma
4. Clique em **"Create App"**
5. Resolva o captcha se pedir

#### Passo 3: Obter Credenciais

1. Menu lateral → **"Settings"** → **"Basic"**
2. Você verá:
   - **App ID:** `670209849105494` (copie)
   - **App Secret:** Clique em **"Show"** → Digite senha → Copie
3. **⚠️ GUARDE ESSAS INFORMAÇÕES!**

### 3.2 Configurar Domínio

1. Ainda em **Settings** → **Basic**
2. Adicione em **"App Domains":**
   ```
   agenciapixel.digital
   ```
3. Em **"Website"** → **Site URL:**
   ```
   https://connectia.agenciapixel.digital
   ```
4. Role até o final e adicione:
   - **Privacy Policy URL:**
     ```
     https://connectia.agenciapixel.digital/politica-privacidade
     ```
   - **Terms of Service URL:**
     ```
     https://connectia.agenciapixel.digital/termos-de-servico
     ```
   - **User Data Deletion URL:**
     ```
     https://connectia.agenciapixel.digital/exclusao-dados
     ```
5. Clique em **"Save Changes"**

### 3.3 Adicionar WhatsApp Business

#### Passo 1: Adicionar Produto

1. Menu lateral → **"Add Products"**
2. Encontre **"WhatsApp"**
3. Clique em **"Set Up"**

#### Passo 2: Criar Conta WhatsApp Business

1. Clique em **"Create New WhatsApp Business Account"**
2. Preencha:
   - **Business Name:** `Agência Pixel - Connect IA`
   - **Category:** `Marketing / Advertising`
3. Clique em **"Continue"**

#### Passo 3: Adicionar Número

**Opção A - Número de Teste (Desenvolvimento):**
1. Meta fornece números de teste gratuitos
2. Use para testar

**Opção B - Número Real (Produção):**
1. Digite seu número: `+55 11 98765-4321`
2. Meta envia SMS com código
3. Digite o código
4. Confirme

### 3.4 Configurar Webhook WhatsApp

#### Passo 1: Ir para Configuration

1. Menu lateral → **"WhatsApp"** → **"Configuration"**
2. Seção **"Webhook"** → Clique em **"Edit"**

#### Passo 2: Configurar URL

**⚠️ IMPORTANTE:** Use a Edge Function do Supabase!

```
Callback URL: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook
Verify Token: connect_ia_webhook_2025
```

**Explicação:**
- `bjsuujkbrhjhuyzydxbr` = Seu Project ID do Supabase
- `/functions/v1/` = Caminho das Edge Functions
- `whatsapp-webhook` = Nome da função (já existe no seu projeto)
- `connect_ia_webhook_2025` = Token que você define

#### Passo 3: Salvar e Subscribe

1. Clique em **"Verify and Save"**
2. Se der erro, verifique se Edge Function está rodando
3. Após salvar, clique em **"Manage"** (Webhook Fields)
4. Marque:
   - ✅ `messages`
   - ✅ `message_status`
5. Clique em **"Subscribe"**

### 3.5 Gerar Token Permanente

**⚠️ IMPORTANTE:** Não use temporary token (expira em 24h)!

#### Passo 1: Criar System User

1. Acesse: https://business.facebook.com/settings/system-users
2. Clique em **"Add"**
3. Preencha:
   - **Name:** `Connect IA System User`
   - **Role:** **Admin**
4. Clique em **"Create System User"**

#### Passo 2: Gerar Token

1. Clique no System User criado
2. Clique em **"Generate New Token"**
3. Selecione App: **"Connect IA"**
4. Marque permissões:
   - ✅ `whatsapp_business_management`
   - ✅ `whatsapp_business_messaging`
5. Clique em **"Generate Token"**
6. **COPIE O TOKEN** (não será mostrado novamente!)

#### Passo 3: Atribuir Assets

1. No System User, clique em **"Assign Assets"**
2. Aba **"Apps":**
   - Marque: **Connect IA**
   - Permissões: **Full Control**
   - **Save Changes**
3. Aba **"WhatsApp Accounts":**
   - Marque sua conta WhatsApp Business
   - Permissões: **Full Control**
   - **Save Changes**

### 3.6 Obter IDs Necessários

#### Phone Number ID:

1. **WhatsApp** → **"API Setup"**
2. Na seção **"Phone Numbers"**
3. O ID está abaixo do número
4. Formato: `123456789012345`
5. **Copie!**

#### Business Account ID:

1. **WhatsApp** → **"API Setup"**
2. No topo, clique em configurações ⚙️
3. Copie o **"WhatsApp Business Account ID"**
4. Formato: `123456789012345`

### 3.7 Adicionar ao .env

Crie/edite o arquivo `.env.production`:

```bash
# Meta App Credentials
VITE_META_APP_ID=670209849105494
META_APP_SECRET=seu_app_secret_aqui

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=EAAJZCcpy...seu_token_permanente_aqui
WHATSAPP_VERIFY_TOKEN=connect_ia_webhook_2025
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
```

### 3.8 Passar App para LIVE

**⚠️ IMPORTANTE:** Só faça isso quando tudo estiver testado!

#### Checklist antes de Live:

- [ ] Privacy Policy URL funcionando
- [ ] Terms of Service URL funcionando
- [ ] Data Deletion URL funcionando
- [ ] Webhook configurado e testado
- [ ] Token permanente salvo
- [ ] Testado em modo Development

#### Passar para Live:

1. **Settings** → **Basic**
2. No topo: Status **"Development"**
3. Clique no switch para mudar para **"Live"**
4. Confirme
5. Pronto! App público!

---

## 4. INSTAGRAM (Opcional)

### 📸 15-20 MINUTOS

### 4.1 Adicionar Produto

1. Menu lateral → **"Add Products"**
2. **"Instagram"** → **"Set Up"**

### 4.2 Conectar Conta

1. Clique em **"Connect Instagram Account"**
2. Login na conta Instagram Business
3. Selecione página Facebook associada
4. Autorize

### 4.3 Configurar Webhook

**Webhook (se necessário):**

```
Callback URL: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/instagram-webhook
Verify Token: connect_ia_webhook_2025
```

### 4.4 Gerar Token

Use o mesmo System User do WhatsApp ou gere novo:

1. Permissões:
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_messages`
   - ✅ `instagram_manage_comments`

### 4.5 Obter Instagram Business ID

1. **Instagram** → **"Configuration"**
2. ID está visível na página
3. Copie

### 4.6 Adicionar ao .env

```bash
# Instagram Business API
INSTAGRAM_ACCESS_TOKEN=seu_token_instagram_aqui
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841400000000000
```

---

## 5. MESSENGER (Opcional)

### 💬 15-20 MINUTOS

### 5.1 Adicionar Produto

1. Menu lateral → **"Add Products"**
2. **"Messenger"** → **"Set Up"**

### 5.2 Conectar Página

1. Clique em **"Add or Remove Pages"**
2. Selecione sua página Facebook
3. Autorize

### 5.3 Configurar Webhook

**⚠️ Nota:** Você pode precisar criar a Edge Function `messenger-webhook`

```
Callback URL: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/messenger-webhook
Verify Token: connect_ia_webhook_2025
```

**Subscribe to:**
- ✅ `messages`
- ✅ `messaging_postbacks`
- ✅ `messaging_optins`
- ✅ `message_deliveries`
- ✅ `message_reads`

### 5.4 Gerar Token

1. **Messenger** → **"Settings"**
2. Seção **"Access Tokens"**
3. Selecione sua página
4. **"Generate Token"**
5. Copie

### 5.5 Obter Page ID

1. Acesse sua página Facebook
2. **Sobre** → Role até o final
3. Ou use: https://findmyfbid.com/

### 5.6 Adicionar ao .env

```bash
# Messenger API
MESSENGER_ACCESS_TOKEN=seu_token_messenger_aqui
MESSENGER_PAGE_ID=123456789012345
MESSENGER_VERIFY_TOKEN=connect_ia_webhook_2025
```

---

## 6. TESTAR INTEGRAÇÕES

### 🧪 TESTES FINAIS

### 6.1 Testar WhatsApp

#### Se usou QR Code:

1. Envie mensagem para o número conectado
2. Vá em: https://connectia.agenciapixel.digital/caixa-entrada
3. Mensagem deve aparecer
4. Responda pelo sistema
5. Deve chegar no WhatsApp

#### Se usou API Oficial:

1. Envie mensagem do seu celular para o número Business
2. Verifique logs:
   - Dashboard Supabase → Functions → whatsapp-webhook → Logs
3. Mensagem deve aparecer nos logs
4. Aparece no Connect IA → Caixa de Entrada
5. Teste resposta

### 6.2 Testar Instagram (se configurou)

1. Envie DM para conta Instagram Business
2. Veja logs: Functions → instagram-webhook → Logs
3. Aparece no Connect IA
4. Teste resposta

### 6.3 Testar Messenger (se configurou)

1. Envie mensagem para página Facebook
2. Veja logs: Functions → messenger-webhook → Logs
3. Aparece no Connect IA
4. Teste resposta

---

## 7. CONFIGURAR AGENTES IA (Opcional)

### 🤖 RESPOSTAS AUTOMÁTICAS

### 7.1 Criar Agente IA

1. Acesse: https://connectia.agenciapixel.digital/agentes-ia
2. Clique em **"Criar Agente"**
3. Preencha:
   - **Nome:** `Atendente Virtual`
   - **Descrição:** `Responde automaticamente no WhatsApp`
   - **Prompt/Instruções:** Como o agente deve responder
4. Ative para WhatsApp
5. Salve

### 7.2 Testar Agente

1. Envie mensagem teste
2. Agente deve responder automaticamente
3. Ajuste o prompt se necessário

---

## 8. ARQUIVO .env COMPLETO

### 📝 TEMPLATE FINAL

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
META_APP_SECRET=seu_app_secret_aqui

# WhatsApp Business API (API Oficial)
WHATSAPP_ACCESS_TOKEN=token_permanente_system_user
WHATSAPP_VERIFY_TOKEN=connect_ia_webhook_2025
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345

# Instagram Business API (Opcional)
INSTAGRAM_ACCESS_TOKEN=seu_token_instagram
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841400000000000

# Messenger API (Opcional)
MESSENGER_ACCESS_TOKEN=seu_token_messenger
MESSENGER_PAGE_ID=123456789012345
MESSENGER_VERIFY_TOKEN=connect_ia_webhook_2025

# =====================================================
# APLICAÇÃO
# =====================================================
VITE_APP_URL=https://connectia.agenciapixel.digital
NODE_ENV=production
```

---

## 9. TROUBLESHOOTING

### ❌ Erro: "Webhook Verification Failed"

**Causas:**
- Edge Function não está rodando
- Verify Token diferente
- Edge Function retorna erro

**Soluções:**
1. Teste URL no navegador
2. Verifique logs da Edge Function
3. Confirme verify token: `connect_ia_webhook_2025`

### ❌ Erro: "Invalid Access Token"

**Causas:**
- Token temporário expirou (24h)
- Token sem permissões

**Soluções:**
1. Gere token via System User (nunca expira)
2. Marque todas permissões necessárias
3. Atribua assets ao System User

### ❌ QR Code não aparece

**Soluções:**
1. Verifique console do navegador (F12)
2. Edge Function `whatsapp-qr-connect` está ativa?
3. Teste: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-qr-connect

### ❌ Mensagens não chegam

**Verificar:**
1. WhatsApp está conectado? (QR Code)
2. Webhook subscribed? (API Oficial)
3. Edge Function rodando?
4. Logs têm erros?

---

## 10. PRÓXIMOS PASSOS

### ✅ Após tudo funcionando:

1. **Configure Agentes IA** para respostas automáticas
2. **Importe Contatos** no CRM
3. **Crie Campanhas** de marketing
4. **Monitore Dashboard** com métricas
5. **Escale** conforme crescer

---

## 📞 SUPORTE

### Links Úteis:

- **Connect IA:** https://connectia.agenciapixel.digital
- **Meta Developers:** https://developers.facebook.com/
- **Supabase Dashboard:** https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr
- **Documentação Meta WhatsApp:** https://developers.facebook.com/docs/whatsapp

### Contato:

- **Email:** ricardo@agenciapixel.digital
- **Empresa:** Agência Pixel

---

## ✅ CHECKLIST FINAL

- [ ] **Método escolhido:** QR Code ou API Oficial
- [ ] **WhatsApp configurado**
- [ ] **Webhook testado** (se API Oficial)
- [ ] **Tokens salvos no .env**
- [ ] **Instagram configurado** (se usar)
- [ ] **Messenger configurado** (se usar)
- [ ] **Teste enviando mensagem**
- [ ] **Teste recebendo mensagem**
- [ ] **Teste resposta pelo sistema**
- [ ] **Agente IA configurado** (opcional)
- [ ] **Tudo funcionando ✅**

---

**Última atualização:** 18 de Outubro de 2025
**Versão:** 2.0 - Guia Unificado
**Status:** Completo e Testado ✅

**Bora integrar! 🚀**
