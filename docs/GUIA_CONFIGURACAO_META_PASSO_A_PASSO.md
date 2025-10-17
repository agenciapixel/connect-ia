# 📱 **GUIA PASSO A PASSO - CONFIGURAÇÃO META**
## **WhatsApp Business API + Instagram Basic Display**

---

## 🎯 **OBJETIVO**
Configurar completamente a integração com Meta (Facebook) para WhatsApp Business API e Instagram Basic Display no sistema Connect IA.

---

## 📋 **PRÉ-REQUISITOS**

### **1. Contas Necessárias**
- [ ] **Facebook Business Account** (com verificação)
- [ ] **WhatsApp Business Account** (verificado)
- [ ] **Instagram Business Account** (conectado ao Facebook)
- [ ] **Conta Supabase** (ativa)

### **2. Acesso Necessário**
- [ ] **Meta for Developers** (https://developers.facebook.com/)
- [ ] **WhatsApp Business Manager** (https://business.whatsapp.com/)
- [ ] **Supabase Dashboard** (https://supabase.com/)

---

## 🚀 **PASSO 1: CONFIGURAÇÃO DO APP META**

### **1.1 Criar App no Meta for Developers**

1. **Acesse**: https://developers.facebook.com/
2. **Login** com conta Facebook Business
3. **Criar App** → **Business** → **Continuar**
4. **Preencher dados**:
   ```
   Nome do App: Connect IA
   Email de contato: contato@agenciapixel.digital
   Categoria: Business
   Propósito: Gerenciar clientes e conversas
   ```

### **1.2 Configurações Básicas**

1. **App Dashboard** → **Configurações** → **Básicas**
2. **Adicionar domínio**:
   ```
   Domínio do App: connectia.agenciapixel.digital
   ```
3. **Privacy Policy URL**:
   ```
   https://connectia.agenciapixel.digital/terms.html
   ```
4. **Terms of Service URL**:
   ```
   https://connectia.agenciapixel.digital/terms.html
   ```

### **1.3 Anotar Credenciais**

```
App ID: 670209849105494
App Secret: [Copiar do painel]
```

---

## 📱 **PASSO 2: CONFIGURAÇÃO WHATSAPP BUSINESS API**

### **2.1 Adicionar Produto WhatsApp**

1. **App Dashboard** → **Produtos** → **WhatsApp** → **Configurar**
2. **Selecionar conta business** (ou criar nova)
3. **Configurar número de telefone**:
   - Número de teste (para desenvolvimento)
   - Número de produção (para produção)

### **2.2 Configurar Webhook**

1. **WhatsApp** → **Configuração** → **Webhooks**
2. **URL do Webhook**:
   ```
   https://seu-projeto.supabase.co/functions/v1/whatsapp-webhook
   ```
3. **Verify Token** (criar token seguro):
   ```
   Exemplo: meta_whatsapp_verify_2024_secure_token
   ```
4. **Campos de Assinatura**:
   - ✅ `messages`
   - ✅ `message_deliveries`
   - ✅ `message_reads`

### **2.3 Anotar Credenciais WhatsApp**

```
Phone Number ID: [Copiar do painel]
Business Account ID: [Copiar do painel]
Access Token: [Token temporário - será trocado por permanente]
Verify Token: [Token criado no passo anterior]
```

### **2.4 Obter Token Permanente**

1. **WhatsApp** → **Configuração** → **Tokens de Acesso**
2. **Gerar Token Permanente**:
   - Selecionar permissões necessárias
   - Gerar token
   - **IMPORTANTE**: Salvar token (não será mostrado novamente)

---

## 📸 **PASSO 3: CONFIGURAÇÃO INSTAGRAM BASIC DISPLAY**

### **3.1 Adicionar Produto Instagram**

1. **App Dashboard** → **Produtos** → **Instagram Basic Display** → **Configurar**
2. **Adicionar Instagram Account ID** (da conta business)

### **3.2 Configurar OAuth**

1. **Instagram Basic Display** → **Configuração** → **OAuth Redirect URIs**
2. **Adicionar URL**:
   ```
   https://connectia.agenciapixel.digital/auth/instagram/callback
   ```
3. **Deauthorize Callback URL**:
   ```
   https://connectia.agenciapixel.digital/auth/instagram/deauthorize
   ```

### **3.3 Anotar Credenciais Instagram**

```
Client ID: [Copiar do painel]
Client Secret: [Copiar do painel]
```

---

## ⚙️ **PASSO 4: CONFIGURAÇÃO DO PROJETO**

### **4.1 Executar Script de Configuração**

```bash
# No diretório do projeto
chmod +x scripts/configurar-meta-integracao.sh
./scripts/configurar-meta-integracao.sh
```

### **4.2 Configurar Variáveis de Ambiente**

Editar arquivo `.env.local`:

```bash
# Meta App Configuration
NEXT_PUBLIC_META_APP_ID=670209849105494
META_APP_SECRET=seu_app_secret_aqui

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=seu_access_token_permanente
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id
WHATSAPP_VERIFY_TOKEN=meta_whatsapp_verify_2024_secure_token

# Instagram Basic Display
INSTAGRAM_CLIENT_ID=seu_client_id
INSTAGRAM_CLIENT_SECRET=seu_client_secret

# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

### **4.3 Configurar Supabase Secrets**

```bash
# WhatsApp
supabase secrets set WHATSAPP_ACCESS_TOKEN=seu_access_token_permanente
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
supabase secrets set WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id
supabase secrets set WHATSAPP_VERIFY_TOKEN=meta_whatsapp_verify_2024_secure_token

# Instagram
supabase secrets set INSTAGRAM_CLIENT_SECRET=seu_client_secret

# Meta
supabase secrets set META_APP_SECRET=seu_app_secret
```

---

## 🚀 **PASSO 5: DEPLOY E TESTE**

### **5.1 Deploy das Edge Functions**

```bash
# Deploy todas as funções
supabase functions deploy

# Ou deploy individual
supabase functions deploy whatsapp-webhook
supabase functions deploy instagram-webhook
supabase functions deploy whatsapp-send-message
supabase functions deploy instagram-send-message
```

### **5.2 Teste do Webhook WhatsApp**

```bash
# Teste de verificação
curl -X GET "https://seu-projeto.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.challenge=test&hub.verify_token=meta_whatsapp_verify_2024_secure_token"
```

**Resultado esperado**: `test`

### **5.3 Teste de Envio de Mensagem**

```bash
curl -X POST "https://graph.facebook.com/v19.0/SEU_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "5511999999999",
    "type": "text",
    "text": {
      "body": "Teste de mensagem Connect IA"
    }
  }'
```

### **5.4 Teste Instagram OAuth**

1. **Acessar URL de teste**:
   ```
   https://connectia.agenciapixel.digital/integrations
   ```
2. **Clicar em "Conectar Instagram"**
3. **Verificar redirecionamento** para Instagram
4. **Autorizar aplicativo**
5. **Verificar callback** funcionando

---

## 📊 **PASSO 6: CONFIGURAÇÃO NO SISTEMA**

### **6.1 Conectar WhatsApp**

1. **Acessar**: https://connectia.agenciapixel.digital/integrations
2. **Clicar**: "Conectar WhatsApp"
3. **Preencher formulário**:
   ```
   Nome do Canal: WhatsApp Principal
   Phone Number ID: [copiar do painel]
   Business Account ID: [copiar do painel]
   Access Token: [token permanente]
   Verify Token: [token criado]
   ```
4. **Clicar**: "Conectar"
5. **Verificar**: Canal ativo na lista

### **6.2 Conectar Instagram**

1. **Clicar**: "Conectar Instagram"
2. **Autorizar** no Instagram
3. **Verificar**: Canal ativo na lista

---

## 🧪 **PASSO 7: TESTES FINAIS**

### **7.1 Teste WhatsApp**

1. **Enviar mensagem** para número configurado
2. **Verificar recebimento** no sistema
3. **Responder** via sistema
4. **Verificar entrega** no WhatsApp

### **7.2 Teste Instagram**

1. **Enviar mensagem** via Instagram
2. **Verificar recebimento** no sistema
3. **Responder** via sistema
4. **Verificar entrega** no Instagram

### **7.3 Verificar Logs**

```bash
# Ver logs WhatsApp
supabase functions logs whatsapp-webhook

# Ver logs Instagram
supabase functions logs instagram-webhook
```

---

## 📤 **PASSO 8: SUBMISSÃO PARA REVISÃO**

### **8.1 Preparar Documentação**

- [ ] **Privacy Policy** completa
- [ ] **Terms of Service** atualizados
- [ ] **Screenshots** do sistema
- [ ] **Demo video** (opcional)
- [ ] **App description** detalhada

### **8.2 Submeter App**

1. **Meta for Developers** → **App Review**
2. **Selecionar permissões** necessárias
3. **Upload documentação**
4. **Submeter** para revisão
5. **Aguardar** aprovação (7-14 dias)

### **8.3 Permissões Necessárias**

```
WhatsApp Business API:
- whatsapp_business_messaging
- whatsapp_business_management

Instagram Basic Display:
- instagram_basic
- pages_show_list
```

---

## ✅ **CHECKLIST FINAL**

### **Configuração Completa**
- [ ] App Meta criado e configurado
- [ ] WhatsApp Business API ativo
- [ ] Instagram Basic Display configurado
- [ ] Webhooks funcionando
- [ ] Edge Functions deployadas
- [ ] Variáveis de ambiente configuradas
- [ ] Supabase secrets configurados
- [ ] Testes básicos funcionando
- [ ] Canais conectados no sistema
- [ ] App submetido para revisão

### **Testes Realizados**
- [ ] Webhook WhatsApp verificado
- [ ] Envio de mensagem WhatsApp testado
- [ ] Recebimento de mensagem WhatsApp testado
- [ ] OAuth Instagram funcionando
- [ ] Envio de mensagem Instagram testado
- [ ] Logs sem erros críticos

---

## 🔧 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **1. Webhook não recebe mensagens**
- Verificar URL do webhook
- Confirmar verify token
- Verificar logs do Supabase

#### **2. Token de acesso expirado**
- Gerar novo token permanente
- Atualizar variáveis de ambiente
- Fazer redeploy das funções

#### **3. Erro de permissão**
- Verificar permissões do app
- Confirmar revisão aprovada
- Verificar domínio configurado

#### **4. Instagram não conecta**
- Verificar OAuth URLs
- Confirmar Client ID/Secret
- Verificar callback URL

---

## 📞 **SUPORTE**

### **Contatos**
- **Email**: contato@agenciapixel.digital
- **Meta Developer Support**: https://developers.facebook.com/support/
- **WhatsApp Business Support**: https://business.whatsapp.com/support

### **Documentação**
- **Guia Completo**: `docs/INTEGRACAO_META_COMPLETA_2024.md`
- **Script de Configuração**: `scripts/configurar-meta-integracao.sh`

---

**🎯 Siga este guia passo a passo para configurar completamente a integração Meta no Connect IA. Última atualização: Janeiro 2024**
