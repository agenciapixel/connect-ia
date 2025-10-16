# 📱 Como Configurar WhatsApp Business API Oficial

Este guia mostra como configurar a **WhatsApp Business API oficial** da Meta no Connect IA.

---

## 🎯 Visão Geral

**WhatsApp Business API** é a solução oficial da Meta para empresas enviarem e receberem mensagens em escala.

### ✅ Vantagens:
- Oficial e suportado pela Meta/WhatsApp
- Mais confiável e estável
- Webhooks nativos
- Suporte para templates de mensagens
- Certificação para produção

### ⚠️ Limitações:
- Requer verificação da empresa (para produção)
- Número dedicado (não pode usar número pessoal)
- Aprovação de templates de mensagens
- Custos por mensagem (após período gratuito)

---

## 📋 Pré-requisitos

Antes de começar, você precisa:

- [ ] Conta no [Meta for Developers](https://developers.facebook.com/)
- [ ] Facebook Business Manager configurado
- [ ] Número de telefone dedicado (ou use número de teste da Meta)
- [ ] Empresa verificada (apenas para produção)

---

## 🚀 Passo a Passo

### **1. Criar App no Meta for Developers**

1. Acesse: https://developers.facebook.com/apps
2. Clique em **"Create App"**
3. Escolha o tipo: **"Business"**
4. Preencha:
   - **App Name**: "Connect IA WhatsApp"
   - **App Contact Email**: seu email
   - **Business Portfolio**: Selecione seu Business Manager
5. Clique em **"Create App"**

---

### **2. Adicionar WhatsApp ao App**

1. No painel do app, procure por **"WhatsApp"**
2. Clique em **"Set up"** no produto WhatsApp
3. Escolha o **Business Portfolio**
4. Clique em **"Continue"**

---

### **3. Configurar Número de Telefone**

#### **Opção A: Número de Teste (Recomendado para desenvolvimento)**

1. No painel WhatsApp, vá em **"API Setup"**
2. A Meta fornece automaticamente um número de teste
3. Você pode enviar mensagens para até 5 números verificados
4. **Adicione números de teste**:
   - Clique em "Manage phone number list"
   - Adicione seu número pessoal para testes
   - Você receberá um código de verificação no WhatsApp

#### **Opção B: Seu Próprio Número (Produção)**

1. Clique em **"Add Phone Number"**
2. Escolha **"Use your own number"**
3. **Requisitos**:
   - Número não pode estar no WhatsApp comum
   - Precisa receber SMS para verificação
   - Recomendado: chip novo dedicado
4. Siga o processo de verificação

---

### **4. Obter Credenciais**

No painel **API Setup**, você verá:

#### **📱 Phone Number ID**
```
Phone Number ID: 123456789012345
```

#### **🔑 WhatsApp Business Account ID**
```
WhatsApp Business Account ID: 987654321098765
```

#### **🎫 Temporary Access Token**
- Token temporário (24h) para testes
- Para produção, gere um token permanente

#### **🔐 Gerar Token Permanente**

1. Vá em **Tools** → **Graph API Explorer**
2. Selecione seu app
3. Em **User or Page**, selecione **System User**
4. Gere um token com permissões:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
5. **IMPORTANTE**: Copie e salve este token imediatamente!

---

### **5. Configurar Webhook**

#### **5.1. Deploy da Edge Function**

```bash
# No seu terminal
supabase functions deploy whatsapp-webhook
```

Anote a URL gerada, algo como:
```
https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook
```

#### **5.2. Configurar no Meta**

1. No painel WhatsApp, vá em **"Configuration"**
2. Clique em **"Edit"** em Webhook
3. Preencha:
   - **Callback URL**: Sua URL da Edge Function
   ```
   https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook
   ```
   - **Verify Token**: Crie um token secreto (ex: `meu-token-super-secreto-123`)
4. Clique em **"Verify and Save"**
5. Subscribe nos campos:
   - `messages`
   - `message_status` (opcional)

---

### **6. Configurar Variáveis de Ambiente no Supabase**

Execute no terminal OU configure no Dashboard:

```bash
# Via CLI
supabase secrets set META_ACCESS_TOKEN="seu-token-permanente-aqui"
supabase secrets set META_VERIFY_TOKEN="meu-token-super-secreto-123"
supabase secrets set WHATSAPP_PHONE_NUMBER_ID="123456789012345"
supabase secrets set WHATSAPP_BUSINESS_ACCOUNT_ID="987654321098765"
```

**OU via Dashboard:**

1. Acesse: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/settings/functions
2. Vá em **Edge Functions** → **Secrets**
3. Adicione cada variável:

| Nome | Valor |
|------|-------|
| `META_ACCESS_TOKEN` | Seu token permanente |
| `META_VERIFY_TOKEN` | Token que você definiu |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | ID da conta business |

---

### **7. Configurar .env Local (Opcional)**

Para desenvolvimento local:

```bash
# .env
VITE_SUPABASE_URL=https://bjsuujkbrhjhuyzydxbr.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key

# WhatsApp Business API
META_ACCESS_TOKEN=seu-token-aqui
META_VERIFY_TOKEN=meu-token-secreto
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321098765
```

---

## 🧪 Testar a Integração

### **1. Verificar Webhook**

```bash
# Ver logs da Edge Function
supabase functions logs whatsapp-webhook --follow
```

### **2. Enviar Mensagem de Teste via API**

```bash
curl -X POST \
  "https://graph.facebook.com/v21.0/SEU_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "5511999999999",
    "type": "text",
    "text": {
      "body": "Olá! Esta é uma mensagem de teste do Connect IA."
    }
  }'
```

### **3. Testar pelo Connect IA**

1. Acesse: http://localhost:8080
2. Vá em **Integrações** → **WhatsApp**
3. Configure as credenciais
4. Envie uma mensagem de teste

---

## 📊 Monitoramento

### **Logs no Supabase**

```bash
# Ver logs em tempo real
supabase functions logs whatsapp-webhook --follow

# Ver logs específicos
supabase functions logs whatsapp-webhook --tail 100
```

### **Logs no Meta**

1. Vá no painel WhatsApp
2. **Insights** → **Analytics**
3. Veja mensagens enviadas/recebidas

---

## 🔧 Troubleshooting

### **Erro: Webhook não verifica**

✅ **Solução**:
- Verifique se `META_VERIFY_TOKEN` está correto no Supabase
- Certifique-se que a Edge Function foi deployada
- Teste a URL diretamente: `https://sua-url/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=seu-token&hub.challenge=123`

### **Erro: 401 Unauthorized ao enviar mensagem**

✅ **Solução**:
- Verifique se `META_ACCESS_TOKEN` está correto
- Gere um novo token permanente se necessário
- Confirme que o token tem as permissões corretas

### **Erro: Número não pode receber mensagens**

✅ **Solução**:
- Se estiver usando número de teste, adicione o destinatário na lista
- Verifique se o número está no formato internacional: `5511999999999`

---

## 💰 Custos

### **Período Gratuito**
- Meta oferece **1.000 conversas gratuitas por mês**
- Perfeito para desenvolvimento e pequenas empresas

### **Após período gratuito**
- Varia por país
- Brasil: ~R$ 0,15 por conversa (preço aproximado)
- Conversa = janela de 24h após mensagem do cliente

---

## 📚 Recursos Adicionais

- **Documentação Oficial**: https://developers.facebook.com/docs/whatsapp
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer
- **Suporte Meta**: https://business.facebook.com/business/help

---

## ✅ Checklist Final

Após configurar tudo:

- [ ] App criado no Meta for Developers
- [ ] WhatsApp adicionado ao app
- [ ] Número configurado (teste ou produção)
- [ ] Token permanente gerado e salvo
- [ ] Webhook configurado e verificado
- [ ] Variáveis de ambiente no Supabase
- [ ] Edge Functions deployadas
- [ ] Teste de envio/recebimento bem-sucedido

---

**Pronto! Seu WhatsApp Business API está configurado! 🎉**

Para dúvidas ou problemas, consulte a [Documentação Oficial da Meta](https://developers.facebook.com/docs/whatsapp).
