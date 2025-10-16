# 📋 **PASSO A PASSO COMPLETO - PUBLICAÇÃO DO APP NO META**

## 🎯 **FASE 1: PREPARAÇÃO (5-10 minutos)**

### **Passo 1: Acessar Meta for Developers**
1. Abra: https://developers.facebook.com/
2. Faça login com sua conta Facebook/Meta
3. Clique em **"My Apps"** no menu superior
4. Selecione seu app **"Connect IA"**

### **Passo 2: Verificar Configurações Básicas**
1. Vá para **"Settings" > "Basic"**
2. Verifique se está configurado:
   - **App Name**: Connect IA
   - **App ID**: `670209849105494` (já configurado)
   - **App Secret**: (anotar para usar depois)

---

## 🔧 **FASE 2: CONFIGURAÇÃO DE PRODUÇÃO (10-15 minutos)**

### **Passo 3: Configurar URLs de Produção**
1. Na mesma página **"Settings" > "Basic"**:
   - **App Domains**: `connectia.agenciapixel.digital`
   - **Privacy Policy URL**: `https://connectia.agenciapixel.digital/privacy-policy`
   - **Terms of Service URL**: `https://connectia.agenciapixel.digital/terms`
   - **Website URL**: `https://connectia.agenciapixel.digital`

### **Passo 4: Configurar OAuth Redirect URIs**
1. Vá para **"Settings" > "Advanced"**
2. Em **"Valid OAuth Redirect URIs"**, adicione:
   ```
   https://connectia.agenciapixel.digital/integrations
   ```

### **Passo 5: Configurar WhatsApp Business API**
1. No menu lateral, clique em **"WhatsApp"**
2. Vá para **"API Setup"**
3. Configure:
   - **Webhook URL**: `https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook`
   - **Verify Token**: `connectia_webhook_2024` (ou outro token seguro)
   - **Webhook Fields**: Marque todas as opções disponíveis

### **Passo 6: Configurar Instagram Basic Display**
1. No menu lateral, clique em **"Instagram Basic Display"**
2. Configure:
   - **OAuth Redirect URI**: `https://connectia.agenciapixel.digital/integrations`

---

## 📄 **FASE 3: CRIAR DOCUMENTAÇÃO (15-20 minutos)**

### **Passo 7: Verificar Privacy Policy**
✅ **Já existe**: `docs/politica-de-privacidade.html`
- **URL**: `https://connectia.agenciapixel.digital/privacy-policy`

### **Passo 8: Verificar Terms of Service**
✅ **Criado**: `public/terms.html`
- **URL**: `https://connectia.agenciapixel.digital/terms`

---

## 🔍 **FASE 4: APP REVIEW (20-30 minutos)**

### **Passo 9: Acessar App Review**
1. No menu lateral, clique em **"App Review"**
2. Clique em **"Permissions and Features"**

### **Passo 10: Solicitar Permissões Necessárias**
Solicite as seguintes permissões:

#### **WhatsApp Business API:**
- `whatsapp_business_messaging`
- `whatsapp_business_management`

#### **Instagram Basic Display:**
- `instagram_basic`
- `instagram_content_publish`

#### **Pages:**
- `pages_manage_metadata`
- `pages_read_engagement`
- `pages_show_list`

### **Passo 11: Preencher Informações do App**
Para cada permissão, forneça:

1. **Use Case**: Descreva como você usa a permissão
2. **Instructions**: Instruções para testar a funcionalidade
3. **Test Users**: Adicione usuários de teste (opcional)

#### **Exemplo de Use Case para WhatsApp:**
```
O Connect IA é uma plataforma de CRM que permite empresas gerenciarem conversas de clientes via WhatsApp Business API. Usamos esta permissão para:

1. Enviar mensagens automáticas de boas-vindas
2. Responder perguntas frequentes via IA
3. Enviar lembretes de agendamento
4. Notificar sobre status de pedidos

Todas as mensagens são enviadas apenas para clientes que iniciaram contato ou optaram por receber comunicações.
```

#### **Exemplo de Use Case para Instagram:**
```
O Connect IA permite que empresas publiquem conteúdo no Instagram através de nossa plataforma. Usamos esta permissão para:

1. Publicar posts programados
2. Responder comentários automaticamente
3. Gerenciar stories e highlights
4. Analisar engajamento dos posts

O conteúdo é sempre relacionado ao negócio do cliente e segue as diretrizes do Instagram.
```

---

## 📝 **FASE 5: SUBMISSÃO (5-10 minutos)**

### **Passo 12: Revisar Configurações**
Antes de submeter, verifique:

- [ ] **URLs de produção** configuradas
- [ ] **Webhooks** funcionando
- [ ] **Privacy Policy** acessível
- [ ] **Terms of Service** acessíveis
- [ ] **App funcionando** em produção

### **Passo 13: Submeter para Review**
1. Clique em **"Submit for Review"**
2. Preencha o formulário de submissão
3. Aguarde confirmação

### **Passo 14: Aguardar Aprovação**
- **Tempo estimado**: 7-14 dias úteis
- **Status**: Você receberá emails sobre o progresso
- **Possíveis solicitações**: Meta pode pedir mais informações

---

## ⚠️ **IMPORTANTE - ANTES DE SUBMETER**

### **Checklist Final:**
- [ ] Site funcionando: https://connectia.agenciapixel.digital
- [ ] WhatsApp webhook respondendo
- [ ] Instagram integração funcionando
- [ ] Privacy Policy acessível
- [ ] Terms of Service acessíveis
- [ ] Todas as URLs configuradas no Meta
- [ ] App Secret configurado no Supabase

### **URLs que devem funcionar:**
- ✅ Site principal: `https://connectia.agenciapixel.digital`
- ✅ Privacy Policy: `https://connectia.agenciapixel.digital/privacy-policy`
- ✅ Terms: `https://connectia.agenciapixel.digital/terms`
- ✅ Integrations: `https://connectia.agenciapixel.digital/integrations`
- ✅ Webhook: `https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook`

---

## 🚀 **APÓS APROVAÇÃO**

### **Passo 15: Configurar Produção**
1. **Ativar modo produção** no Meta
2. **Configurar variáveis de ambiente** no Supabase
3. **Testar todas as funcionalidades**
4. **Monitorar logs** de webhook

### **Passo 16: Monitoramento**
- **Logs do Supabase**: Verificar Edge Functions
- **Meta Analytics**: Acompanhar uso das APIs
- **Webhook Status**: Monitorar entregas

---

## 📞 **SUPORTE**

### **Se precisar de ajuda:**
- **Meta Developer Support**: https://developers.facebook.com/support/
- **Documentação**: https://developers.facebook.com/docs/
- **Community**: https://developers.facebook.com/community/

### **Contatos do Projeto:**
- **Email**: contato@agenciapixel.digital
- **Website**: https://agenciapixel.digital

---

**🎉 Boa sorte com a publicação do seu app!**
