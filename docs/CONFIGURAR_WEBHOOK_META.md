# 🔗 Configurar Webhook do WhatsApp no Meta for Developers

## ✅ Pré-requisitos Confirmados:
- App ID: `670209849105494`
- WhatsApp adicionado ao app: ✅
- Verify Token: `connectia_whatsapp_2024`
- Webhook URL: `https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook`

---

## 📋 Passo a Passo Completo

### **1. Acesse a Configuração do WhatsApp**

🔗 Link direto: https://developers.facebook.com/apps/670209849105494/whatsapp-business/wa-settings/

Ou navegue manualmente:
1. Acesse: https://developers.facebook.com/apps/
2. Clique no app **670209849105494**
3. No menu lateral esquerdo, clique em **WhatsApp** → **Configuration**

---

### **2. Configure o Webhook**

Na seção **Configuration**, procure por **Webhook**:

#### **2.1. Editar Webhook**
- Clique no botão **Edit** (se já existe) ou **Configure Webhook** (se for a primeira vez)

#### **2.2. Preencher os Dados**

Um modal vai abrir. Preencha **exatamente assim**:

```
Callback URL: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook

Verify Token: connectia_whatsapp_2024
```

⚠️ **IMPORTANTE**:
- Cole a URL completa, sem espaços
- O Verify Token é case-sensitive (diferencia maiúsculas/minúsculas)
- Use exatamente `connectia_whatsapp_2024`

#### **2.3. Verificar e Salvar**
- Clique em **Verify and Save**
- ✅ Se tudo estiver correto, você verá: **"Callback URL verified successfully"**
- ❌ Se der erro, verifique se copiou exatamente os valores acima

---

### **3. Inscrever-se nos Eventos (Webhook Fields)**

Logo abaixo da seção de Webhook, você verá **Webhook fields** (campos do webhook):

#### **3.1. Marcar o Campo Messages**
- Procure por **messages** na lista
- Marque a caixa ✅ ao lado de **messages**
- Clique em **Subscribe** ou **Manage**

#### **3.2. Campos Opcionais (recomendados)**
Você também pode marcar:
- ✅ **message_echoes** (eco de mensagens enviadas)
- ✅ **messaging_postbacks** (respostas de botões)

---

### **4. Configurar Número de Telefone**

#### **4.1. Número de Teste (Desenvolvimento)**

Para testar sem custos:

1. No menu lateral, vá em **WhatsApp** → **API Setup**
2. Na seção **Send and receive messages**, você verá um número de teste fornecido pelo Meta
3. Clique em **Add phone number** para adicionar um número de teste
4. Insira **seu número pessoal do WhatsApp**
5. Você receberá um código de verificação no WhatsApp
6. Confirme o código

**Limitação**: Números de teste só recebem mensagens de números pré-autorizados.

#### **4.2. Número de Produção**

Para usar em produção:

1. Vá em **WhatsApp** → **Phone Numbers**
2. Adicione um número real de telefone
3. Verifique o número
4. Aguarde aprovação do Meta (pode levar alguns minutos a horas)

---

### **5. Testar o Webhook**

#### **5.1. Enviar Mensagem de Teste**

**Se estiver usando número de teste:**
- Envie uma mensagem **DO** número que você registrou como teste
- Envie **PARA** o número de teste do WhatsApp Business fornecido pelo Meta

**Se estiver usando número de produção:**
- Envie uma mensagem de qualquer número
- Envie **PARA** o seu número do WhatsApp Business

**Exemplo de mensagem:**
```
Olá! Esta é uma mensagem de teste do Connect IA.
```

#### **5.2. Verificar se a Mensagem Chegou**

**Opção A: Logs do Supabase (Tempo Real)**
1. Acesse: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/logs/edge-functions
2. Filtre por: `whatsapp-webhook`
3. Você deve ver logs mostrando a mensagem recebida

**Opção B: Banco de Dados (Mensagens Salvas)**
1. Acesse: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/editor
2. Execute a query:
```sql
SELECT
    m.id,
    m.content,
    m.direction,
    m.channel_type,
    m.created_at,
    c.external_id as contact_phone
FROM messages m
LEFT JOIN conversations conv ON m.conversation_id = conv.id
LEFT JOIN contacts c ON conv.contact_id = c.id
WHERE m.channel_type = 'whatsapp'
ORDER BY m.created_at DESC
LIMIT 10;
```

**Opção C: Interface do Connect IA**
1. Acesse: http://localhost:8080/inbox
2. Verifique se a mensagem apareceu na caixa de entrada

---

## 🔧 Troubleshooting (Resolução de Problemas)

### **Problema 1: "Callback URL verification failed"**

**Causa**: Verify token incorreto ou webhook não está acessível.

**Solução**:
1. Verifique se você copiou exatamente: `connectia_whatsapp_2024`
2. Teste o webhook manualmente:
```bash
curl -X GET "https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=connectia_whatsapp_2024&hub.challenge=TEST"
```
3. Deve retornar: `TEST`

### **Problema 2: Webhook verificou, mas mensagens não chegam**

**Causa**: Campo "messages" não está marcado no Webhook fields.

**Solução**:
1. Volte em Configuration → Webhook fields
2. Certifique-se de que **messages** está marcado ✅
3. Clique em Subscribe/Save

### **Problema 3: Mensagens não salvam no banco**

**Causa**: Canal não está ativo ou organização não está configurada.

**Solução**:
1. Verifique se o canal está ativo no banco:
```sql
SELECT * FROM channel_accounts WHERE channel_type = 'whatsapp' AND status = 'active';
```
2. Se não houver canal ativo, reconecte via interface do Connect IA

### **Problema 4: Erro 403 Forbidden**

**Causa**: Verify token está diferente entre Supabase e Meta.

**Solução**:
1. Use exatamente o mesmo token em ambos os lugares
2. Token configurado no Supabase: `connectia_whatsapp_2024`
3. Use esse mesmo token no Meta

---

## 📊 Verificações Finais

Marque conforme for completando:

- [ ] Webhook configurado no Meta com sucesso ✅
- [ ] Campo "messages" marcado e subscrito ✅
- [ ] Número de teste adicionado (ou número de produção aprovado) ✅
- [ ] Mensagem de teste enviada 📤
- [ ] Mensagem apareceu nos logs do Supabase 📋
- [ ] Mensagem salva no banco de dados 💾
- [ ] Mensagem apareceu na interface do Connect IA 🖥️

---

## 🎯 Status Atual

✅ **Webhook URL**: Funcionando e acessível
✅ **Verify Token**: Configurado no Supabase
⏳ **Configuração no Meta**: Aguardando sua confirmação
⏳ **Teste de Mensagem**: Aguardando teste

---

## 📞 Próximos Passos

Depois que o WhatsApp estiver funcionando:

1. **Configure o Instagram** usando o mesmo processo
2. **Teste envio de mensagens** (não só recebimento)
3. **Configure respostas automáticas** com AI Agents
4. **Implemente templates de mensagens** para campanhas

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique os logs do Supabase
2. Execute o script de teste: `./scripts/test-whatsapp-webhook.sh`
3. Verifique o banco de dados com: `./scripts/check-messages.sh`
4. Consulte a documentação completa em `docs/WHATSAPP_BUSINESS_API_SETUP.md`

---

**Última atualização**: 15 de outubro de 2024
**App ID**: 670209849105494
**Webhook**: https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook
**Verify Token**: connectia_whatsapp_2024
