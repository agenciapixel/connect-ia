# 🎯 **CONFIGURAÇÃO META COMPLETA - CONNECT IA**

## **📋 RESUMO EXECUTIVO**

**Produtos Necessários:**
- ✅ **Login do Facebook para Empresas** (essencial)
- ✅ **WhatsApp** (principal canal)
- ✅ **Instagram** (inbox para atendimento)
- ✅ **Webhook** (essencial para receber mensagens)

**Produto para Remover:**
- ❌ **Messenger** (não necessário)

---

## **🔧 PASSO A PASSO - META FOR DEVELOPERS**

### **PASSO 1: Acessar Meta for Developers**
1. **Acesse:** [Meta for Developers](https://developers.facebook.com/)
2. **Faça login** com sua conta
3. **Selecione** seu app Connect IA

### **PASSO 2: Remover Messenger (Otimização)**
1. **Vá em:** Products → **Messenger**
2. **Clique:** Remove Product
3. **Confirme** a remoção
4. **Aguarde** confirmação

### **PASSO 3: Verificar WhatsApp**
1. **Vá em:** Products → **WhatsApp**
2. **Verifique** se está ativo
3. **Clique** em "Set up" se necessário
4. **Anote** as credenciais necessárias

### **PASSO 4: Verificar Instagram**
1. **Vá em:** Products → **Instagram Basic Display**
2. **Verifique** se está ativo
3. **Clique** em "Set up" se necessário
4. **Anote** as credenciais necessárias

### **PASSO 5: Configurar Webhook**
1. **Vá em:** Products → **Webhook**
2. **Verifique** se está ativo
3. **Configure** as URLs de webhook

---

## **🎯 PERMISSÕES NECESSÁRIAS**

### **WhatsApp Business API:**
```
whatsapp_business_management
whatsapp_business_messaging
pages_show_list
pages_messaging
```

### **Instagram Basic Display:**
```
instagram_basic
instagram_manage_messages
pages_show_list
pages_messaging
```

### **Webhook:**
```
webhook_subscriptions
```

### **Facebook Login:**
```
email
public_profile
pages_show_list
```

---

## **📱 CONFIGURAÇÃO DOS CANAIS**

### **1. 🟢 WHATSAPP BUSINESS**

**Credenciais Necessárias:**
- **Phone Number ID:** `123456789012345`
- **Business Account ID:** `987654321098765`
- **Access Token:** `EAAG...`
- **Verify Token:** `meu_token_seguro_123` (você cria)

**Webhook URL:**
```
https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook
```

**Configuração no Meta:**
1. **Meta for Developers** → **WhatsApp** → **Configuration**
2. **Webhook URL:** Cole a URL acima
3. **Verify Token:** Use o mesmo token do formulário
4. **Subscribe to:** `messages`
5. **Clique:** Verify and Save

### **2. 🟢 INSTAGRAM INBOX**

**Credenciais Necessárias:**
- **Access Token:** `INSTAGRAM_ACCESS_TOKEN`
- **Page ID:** `INSTAGRAM_PAGE_ID`

**Webhook URL:**
```
https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/instagram-webhook
```

**Configuração no Meta:**
1. **Meta for Developers** → **Instagram Basic Display** → **Configuration**
2. **Webhook URL:** Cole a URL acima
3. **Subscribe to:** `messages`
4. **Clique:** Save

### **3. 🟢 WEBHOOK GERAL**

**URLs de Webhook Disponíveis:**
```
WhatsApp: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook
Instagram: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/instagram-webhook
```

**Eventos Suportados:**
- `messages` - Receber mensagens
- `message_deliveries` - Status de entrega
- `message_reads` - Status de leitura

---

## **🔗 INTEGRAÇÃO NO SISTEMA CONNECT IA**

### **WhatsApp Setup:**
1. **Abra Connect IA**
2. **Vá em:** Integrações → WhatsApp
3. **Clique:** "Conectar Canal WhatsApp"
4. **Preencha o formulário:**
   ```
   Nome do Canal: WhatsApp Vendas
   Phone Number ID: 123456789012345
   Business Account ID: 987654321098765
   Access Token: EAAG...
   Verify Token: meu_token_seguro_123
   ```
5. **Clique:** Conectar

### **Instagram Setup:**
1. **Vá em:** Integrações → Instagram
2. **Clique:** "Conectar Canal Instagram"
3. **Preencha o formulário:**
   ```
   Nome do Canal: Instagram Inbox
   Access Token: [Instagram Access Token]
   Page ID: [Instagram Page ID]
   ```
4. **Clique:** Conectar

---

## **📊 FUNCIONALIDADES DISPONÍVEIS**

### **WhatsApp Business:**
- ✅ **Envio de mensagens** de texto
- ✅ **Envio de imagens** e documentos
- ✅ **Mensagens template** (aprovadas pelo Meta)
- ✅ **Webhook** para receber mensagens
- ✅ **Respostas automáticas** via IA
- ✅ **Campanhas** de marketing
- ✅ **Status de entrega** e leitura

### **Instagram Inbox:**
- ✅ **Envio de mensagens** diretas
- ✅ **Envio de mídia** (imagens, vídeos)
- ✅ **Webhook** para receber mensagens
- ✅ **Respostas automáticas** via IA
- ✅ **Gestão de conversas**
- ✅ **Integração** com CRM
- ✅ **Status de entrega** e leitura

### **Webhook:**
- ✅ **Recebimento** de mensagens em tempo real
- ✅ **Processamento** automático de eventos
- ✅ **Integração** com sistema de CRM
- ✅ **Logs** de atividade
- ✅ **Monitoramento** de status

---

## **🎯 FLUXO DE ATENDIMENTO**

### **Cenário 1: Cliente envia mensagem no WhatsApp**
1. **Webhook** recebe a mensagem em tempo real
2. **Sistema** processa e identifica o contato
3. **IA** gera resposta automática
4. **Atendente** pode intervir se necessário
5. **Conversa** fica salva no CRM
6. **Status** de entrega/leitura é monitorado

### **Cenário 2: Cliente envia mensagem no Instagram**
1. **Webhook** recebe a mensagem em tempo real
2. **Sistema** processa e identifica o contato
3. **IA** gera resposta automática
4. **Atendente** pode intervir se necessário
5. **Conversa** fica salva no CRM
6. **Status** de entrega/leitura é monitorado

---

## **📋 CHECKLIST COMPLETO**

### **Meta for Developers:**
- [ ] Remover produto Messenger
- [ ] Verificar WhatsApp ativo
- [ ] Verificar Instagram Basic Display ativo
- [ ] Verificar Webhook ativo
- [ ] Configurar webhook do WhatsApp
- [ ] Configurar webhook do Instagram
- [ ] Configurar eventos do Webhook
- [ ] Verificar permissões necessárias
- [ ] Testar webhooks

### **Sistema Connect IA:**
- [ ] Conectar canal WhatsApp
- [ ] Conectar canal Instagram
- [ ] Testar envio de mensagens
- [ ] Verificar recebimento de mensagens
- [ ] Testar webhook em tempo real
- [ ] Configurar respostas automáticas
- [ ] Testar integração com CRM
- [ ] Verificar logs de webhook

---

## **🧪 TESTES DE FUNCIONALIDADE**

### **Teste WhatsApp:**
```bash
curl -X POST https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-send-message \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "message": "Teste de conexão WhatsApp",
    "channelId": "your_whatsapp_channel_id"
  }'
```

### **Teste Instagram:**
```bash
curl -X POST https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/instagram-send-message \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "instagram_user_id",
    "message": "Teste de conexão Instagram",
    "channelId": "your_instagram_channel_id"
  }'
```

### **Teste Webhook:**
```bash
curl -X POST https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15551234567",
            "phone_number_id": "PHONE_NUMBER_ID"
          },
          "messages": [{
            "from": "5511999999999",
            "id": "wamid.test123",
            "timestamp": "1234567890",
            "text": {
              "body": "Teste de webhook"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

---

## **⚠️ PROBLEMAS COMUNS E SOLUÇÕES**

### **WhatsApp:**
- **Erro:** `Invalid access token`
  - **Solução:** Verificar se o token está correto e não expirou

- **Erro:** `Phone number not found`
  - **Solução:** Verificar o Phone Number ID no Meta

- **Erro:** `Webhook verification failed`
  - **Solução:** Verificar se o Verify Token é o mesmo

### **Instagram:**
- **Erro:** `Instagram access token invalid`
  - **Solução:** Verificar se o token do Instagram está correto

- **Erro:** `Page not found`
  - **Solução:** Verificar se a página do Instagram está conectada

### **Webhook:**
- **Erro:** `Webhook endpoint not responding`
  - **Solução:** Verificar se as URLs estão corretas e acessíveis

- **Erro:** `Invalid webhook signature`
  - **Solução:** Verificar configuração de assinatura no Meta

---

## **📈 BENEFÍCIOS DA CONFIGURAÇÃO**

### **WhatsApp + Instagram + Webhook:**
- 🎯 **Cobertura completa** dos principais canais
- 📱 **Atendimento unificado** em uma plataforma
- 🤖 **IA automatizada** para ambos os canais
- 📊 **CRM integrado** para todos os contatos
- 🚀 **Escalabilidade** para crescimento
- ⚡ **Tempo real** com webhooks
- 📈 **Monitoramento** de status e métricas

### **Otimização:**
- ✅ **Menos produtos** = aprovação mais rápida
- ✅ **Foco nos canais** que realmente usa
- ✅ **Manutenção simplificada**
- ✅ **Menos complexidade** técnica
- ✅ **Webhook essencial** para funcionamento

---

## **🎯 PRÓXIMOS PASSOS**

### **1. Otimizar no Meta:**
1. Remover Messenger
2. Verificar WhatsApp, Instagram e Webhook ativos
3. Configurar webhooks
4. Configurar eventos do webhook

### **2. Configurar no Sistema:**
1. Conectar canal WhatsApp
2. Conectar canal Instagram
3. Testar funcionalidades
4. Testar webhook em tempo real

### **3. Configurar IA:**
1. Criar agentes de IA
2. Configurar respostas automáticas
3. Treinar para ambos os canais
4. Configurar monitoramento

---

## **🔧 CONFIGURAÇÃO ESPECÍFICA DO WEBHOOK**

### **Eventos a Configurar:**
- `messages` - Receber mensagens
- `message_deliveries` - Status de entrega
- `message_reads` - Status de leitura

### **URLs de Webhook:**
```
WhatsApp: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook
Instagram: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/instagram-webhook
```

### **Verificação de Webhook:**
1. **Meta for Developers** → **Webhook**
2. **Teste** as URLs de webhook
3. **Verifique** se estão respondendo
4. **Configure** os eventos necessários

---

## **📋 RESUMO FINAL**

**Produtos Configurados:**
- ✅ **Login do Facebook para Empresas**
- ✅ **WhatsApp Business API**
- ✅ **Instagram Basic Display**
- ✅ **Webhook**

**Funcionalidades:**
- 📱 **Atendimento unificado** WhatsApp + Instagram
- 🤖 **IA automatizada** para respostas
- 📊 **CRM integrado** com todos os contatos
- ⚡ **Webhook em tempo real** para mensagens
- 📈 **Monitoramento** de status e métricas

**Benefícios:**
- 🚀 **Aprovação mais rápida** no Meta
- 🔧 **Manutenção simplificada**
- 💰 **Menos complexidade** técnica
- 🎯 **Foco nos canais** essenciais

---

**🎉 CONFIGURAÇÃO COMPLETA!**

**Agora você tem tudo configurado para o Connect IA funcionar perfeitamente com WhatsApp, Instagram e Webhook. Esta é a configuração ideal para aprovação rápida no Meta for Developers.**
