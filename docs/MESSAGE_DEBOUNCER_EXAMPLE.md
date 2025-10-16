# 📨 Message Debouncer - Exemplo de Uso

## 🎯 Objetivo

O Message Debouncer resolve o problema de **mensagens quebradas** - quando um usuário envia várias mensagens rápidas que deveriam ser tratadas como uma única mensagem.

**Exemplo:**
```
[10:30:01] Cliente: "Oi"
[10:30:02] Cliente: "Queria saber"
[10:30:03] Cliente: "Se vocês fazem entrega"
```

Ao invés de processar 3 mensagens separadas, o debouncer aguarda 3 segundos e processa tudo como:
```
"Oi
Queria saber
Se vocês fazem entrega"
```

---

## 💻 Como Usar

### **1. Importar o Debouncer**

```typescript
import { messageDebouncer } from '@/lib/messageDebouncer';
```

### **2. Adicionar Mensagem ao Debouncer**

```typescript
messageDebouncer.addMessage(
  conversationId,           // Chave única (ex: ID da conversa)
  messageContent,           // Conteúdo da mensagem
  (fullMessage) => {        // Callback quando mensagem completa
    // Processar mensagem completa aqui
    processWithAI(fullMessage);
  },
  3000                      // Delay em ms (opcional, padrão: 3000)
);
```

---

## 📝 Exemplo Completo - Webhook do WhatsApp

```typescript
// supabase/functions/whatsapp-webhook/index.ts

async function processWhatsAppMessage(message: any, webhookData: any) {
  const messageId = message.id;
  const from = message.from;
  const messageText = message.text?.body || '';
  const conversationId = `whatsapp_${from}`;

  console.log(`📱 Nova mensagem recebida de ${from}`);

  // Verificar se já há mensagens pendentes desta conversa
  const hasPending = messageDebouncer.hasPending(conversationId);
  const pendingCount = messageDebouncer.getPendingCount(conversationId);

  if (hasPending) {
    console.log(`⏳ Já existem ${pendingCount} mensagens pendentes. Aguardando mais...`);
  }

  // Adicionar ao debouncer
  messageDebouncer.addMessage(
    conversationId,
    messageText,
    async (fullMessage) => {
      console.log(`✅ Mensagem completa recebida (${fullMessage.split('\n').length} partes)`);

      // Buscar agente apropriado
      const agentId = await getAgentForConversation(conversationId);

      // Chamar IA com mensagem completa
      const { data, error } = await supabase.functions.invoke('ai-agent-chat', {
        body: {
          agentId: agentId,
          message: fullMessage,
          conversationId: conversationId
        }
      });

      if (!error && data.response) {
        // Enviar resposta
        await sendWhatsAppMessage(from, data.response);

        // Salvar no banco
        await saveMessage(conversationId, fullMessage, data.response);
      }
    },
    3000 // Aguardar 3 segundos
  );

  // Salvar mensagem individual no banco (para histórico)
  await saveIncomingMessage(conversationId, from, messageText);
}
```

---

## 🎛️ Configurações Personalizadas

### **Alterar Delay Padrão**

```typescript
// Alterar para 5 segundos
messageDebouncer.setDefaultDelay(5000);
```

### **Forçar Processamento Imediato**

```typescript
// Útil quando detecta que a mensagem está completa
// (ex: quando termina com ponto final ou ponto de interrogação)
if (messageText.endsWith('?') || messageText.endsWith('.')) {
  messageDebouncer.forceProcess(conversationId);
}
```

### **Verificar Estado**

```typescript
// Verificar se tem mensagens pendentes
if (messageDebouncer.hasPending(conversationId)) {
  console.log('Aguardando mensagens adicionais...');
}

// Ver quantas partes foram recebidas
const count = messageDebouncer.getPendingCount(conversationId);
console.log(`${count} partes recebidas até agora`);
```

---

## 🧠 Lógica Inteligente

Você pode adicionar lógica para decidir quando processar:

```typescript
messageDebouncer.addMessage(
  conversationId,
  messageText,
  async (fullMessage) => {
    // Processar mensagem completa
    await processWithAI(fullMessage);
  },
  // Delay dinâmico baseado no comprimento da mensagem
  messageText.length < 20 ? 5000 : 3000
);

// Ou processar imediatamente em certos casos
if (messageText.includes('urgente') || messageText.includes('agora')) {
  messageDebouncer.forceProcess(conversationId);
}
```

---

## 📊 Métricas e Monitoramento

```typescript
// Log antes de adicionar
console.log('📨 Mensagem recebida:', {
  conversationId,
  hasPending: messageDebouncer.hasPending(conversationId),
  pendingCount: messageDebouncer.getPendingCount(conversationId),
  messageLength: messageText.length
});

// No callback
messageDebouncer.addMessage(conversationId, messageText, (fullMessage) => {
  const parts = fullMessage.split('\n').length;

  console.log('✅ Mensagem processada:', {
    conversationId,
    totalParts: parts,
    totalLength: fullMessage.length,
    timestamp: new Date().toISOString()
  });

  // Enviar métrica para analytics
  trackEvent('message_processed', {
    parts: parts,
    length: fullMessage.length,
    delay: 3000
  });
});
```

---

## ⚠️ Considerações Importantes

### **1. Persistência**
O debouncer é **in-memory** - se o servidor reiniciar, mensagens pendentes são perdidas.

**Solução**: Salvar cada mensagem no banco conforme chega, e usar o debouncer apenas para decidir quando chamar a IA.

### **2. Múltiplas Instâncias**
Se você tem múltiplos servidores/workers, cada um terá seu próprio debouncer.

**Solução**: Use Redis ou similar para debouncing distribuído em produção.

### **3. Timeout muito Curto**
Se o delay for muito curto (ex: 1 segundo), pode processar antes de todas as partes chegarem.

**Recomendação**: 3-5 segundos é um bom equilíbrio.

### **4. Timeout muito Longo**
Se for muito longo (ex: 30 segundos), o usuário vai achar que ninguém respondeu.

**Recomendação**: Máximo de 5-7 segundos.

---

## 🎯 Melhores Práticas

✅ **Use 3-5 segundos de delay** para a maioria dos casos
✅ **Salve cada mensagem individual** no banco (histórico completo)
✅ **Force processamento** para mensagens com pontuação final
✅ **Adicione logs** para debug e monitoramento
✅ **Mostre indicador de "digitando"** enquanto aguarda
✅ **Configure delays diferentes** por tipo de conversa (suporte vs vendas)

---

## 🔍 Debugging

```typescript
// Ativar logs detalhados
messageDebouncer.addMessage(
  conversationId,
  messageText,
  (fullMessage) => {
    console.log('=== DEBUG: Mensagem Processada ===');
    console.log('Conversation ID:', conversationId);
    console.log('Partes:', fullMessage.split('\n').length);
    console.log('Comprimento total:', fullMessage.length);
    console.log('Conteúdo:', fullMessage);
    console.log('================================');

    // Processar...
  },
  3000
);
```

---

## 🚀 Implementação Produção

Para produção, considere usar Redis:

```typescript
// Exemplo com Redis (pseudocódigo)
import { Redis } from '@upstash/redis';

class RedisMessageDebouncer {
  private redis: Redis;
  private delay: number = 3000;

  async addMessage(key: string, message: string, callback: Function) {
    // Adicionar à lista no Redis
    await this.redis.rpush(`messages:${key}`, message);

    // Configurar TTL
    await this.redis.expire(`messages:${key}`, 10);

    // Agendar processamento (usando Redis Streams ou similar)
    // ...
  }
}
```

---

## 📚 Referências

- **Código Fonte**: [src/lib/messageDebouncer.ts](../src/lib/messageDebouncer.ts)
- **Edge Function**: [supabase/functions/ai-agent-chat/index.ts](../supabase/functions/ai-agent-chat/index.ts)
- **Webhook WhatsApp**: [supabase/functions/whatsapp-webhook/index.ts](../supabase/functions/whatsapp-webhook/index.ts)

---

**Última atualização**: 15 de outubro de 2024
