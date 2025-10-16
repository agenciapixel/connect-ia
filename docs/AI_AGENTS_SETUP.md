# 🤖 Configuração de Agentes de IA - Connect IA

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Instalação Rápida](#instalação-rápida)
- [Agentes Pré-Configurados](#agentes-pré-configurados)
- [Como Testar](#como-testar)
- [Personalização](#personalização)
- [Integração com Conversas](#integração-com-conversas)

---

## 🎯 Visão Geral

O Connect IA possui um sistema completo de Agentes de IA que podem:

✅ **Atender clientes automaticamente** em múltiplos canais (WhatsApp, Instagram, etc.)
✅ **Qualificar leads** e agendar reuniões
✅ **Resolver problemas técnicos** com instruções passo a passo
✅ **Gerar mensagens** personalizadas com IA
✅ **Resumir conversas** e extrair insights
✅ **Otimizar campanhas** com recomendações inteligentes

---

## ⚡ Instalação Rápida

### **1. Execute o Script SQL**

Abra o **Supabase SQL Editor**:
👉 https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/editor

Cole e execute o script:
📄 **[scripts/setup-ai-agents.sql](../scripts/setup-ai-agents.sql)**

Isso vai criar **3 agentes prontos para usar**:
- 🤖 **Atendente Virtual** (Atendimento geral)
- 💰 **Consultor de Vendas** (Qualificação e vendas)
- 🛠️ **Suporte Técnico** (Troubleshooting)

### **2. Verifique a Instalação**

Acesse a interface:
👉 http://localhost:8080/agents

Você deve ver os 3 agentes criados na aba **"Meus Agentes"**.

---

## 🤖 Agentes Pré-Configurados

### **1. Atendente Virtual** 💬

**Tipo**: Atendimento
**Status**: Ativo
**Modelo**: Google Gemini 2.5 Flash
**Temperature**: 0.7

**Função**:
- Responder perguntas frequentes
- Fornecer informações sobre produtos/serviços
- Orientar sobre horários e procedimentos
- Transferir para humano quando necessário

**Quando Usar**:
- Primeira linha de atendimento
- Dúvidas gerais e informações básicas
- Fora do horário comercial
- Alto volume de atendimentos simultâneos

**Exemplo de Prompts**:
```
- "Qual é o horário de funcionamento?"
- "Como faço para entrar em contato?"
- "Preciso de ajuda com meu pedido"
```

---

### **2. Consultor de Vendas** 💰

**Tipo**: Vendas
**Status**: Ativo
**Modelo**: Google Gemini 2.5 Flash
**Temperature**: 0.8

**Função**:
- Qualificar leads usando metodologia BANT
- Apresentar soluções de forma consultiva
- Agendar reuniões e demonstrações
- Conduzir cliente pela jornada de compra

**Quando Usar**:
- Leads vindos de campanhas
- Primeiros contatos com potenciais clientes
- Qualificação automática de leads
- Follow-up de propostas

**Exemplo de Prompts**:
```
- "Gostaria de saber mais sobre seus produtos"
- "Quanto custa o plano empresarial?"
- "Vocês oferecem período de teste gratuito?"
```

---

### **3. Suporte Técnico** 🛠️

**Tipo**: Suporte
**Status**: Ativo
**Modelo**: Google Gemini 2.5 Flash
**Temperature**: 0.6

**Função**:
- Resolver problemas técnicos
- Fornecer instruções passo a passo
- Diagnosticar erros
- Educar usuário sobre uso correto

**Quando Usar**:
- Problemas técnicos comuns
- Dúvidas sobre uso da plataforma
- Troubleshooting de integrações
- Primeiras tentativas de resolução

**Exemplo de Prompts**:
```
- "Não consigo fazer login na minha conta"
- "A mensagem não está sendo enviada"
- "Como faço para conectar meu WhatsApp?"
```

---

## 🧪 Como Testar

### **1. Via Interface (Recomendado)**

1. Acesse: http://localhost:8080/agents
2. Clique na aba **"Testar Agentes"**
3. Clique em **"Carregar Agentes"**
4. Selecione um agente
5. Digite uma mensagem ou use um exemplo
6. Clique em **"Testar Agente"**
7. Veja a resposta gerada em tempo real!

### **2. Via API (Programático)**

```typescript
import { supabase } from "@/integrations/supabase/client";

const testAgent = async () => {
  const { data, error } = await supabase.functions.invoke('ai-agent-chat', {
    body: {
      agentId: 'ID_DO_AGENTE',
      message: 'Olá, preciso de ajuda!',
      conversationId: 'opcional-id-da-conversa'
    }
  });

  if (error) {
    console.error('Erro:', error);
    return;
  }

  console.log('Resposta:', data.response);
  console.log('Agente:', data.agentName);
};
```

### **3. Via cURL (Teste Direto)**

```bash
curl -X POST 'https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/ai-agent-chat' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "agentId": "ID_DO_AGENTE",
    "message": "Olá! Como posso começar?"
  }'
```

---

## 🎨 Personalização

### **Editar Agentes Existentes**

1. Vá em **Meus Agentes**
2. Clique no ícone de **Editar** (lápis)
3. Modifique:
   - **Nome** e **Descrição**
   - **System Prompt** (comportamento do agente)
   - **Temperature** (0.0 = mais preciso, 1.0 = mais criativo)
   - **Max Tokens** (tamanho máximo da resposta)
4. Clique em **"Atualizar Agente"**

### **Criar Novos Agentes**

1. Clique em **"+ Criar Agente"**
2. Preencha:
   - **Nome**: Nome descritivo
   - **Tipo**: vendas | suporte | sdr | atendimento | outros
   - **Status**: ativo | inativo | treinamento
   - **System Prompt**: Instruções detalhadas de comportamento
3. Ajuste parâmetros:
   - **Model**: `google/gemini-2.5-flash` (recomendado)
   - **Temperature**: 0.6-0.8 (padrão: 0.7)
   - **Max Tokens**: 800-1500 (padrão: 1000)
4. Clique em **"Criar Agente"**

### **Dicas para System Prompts Eficazes**

✅ **Seja específico** sobre o papel e responsabilidades
✅ **Defina diretrizes claras** de comunicação
✅ **Especifique quando escalar** para humanos
✅ **Forneça exemplos** de boas respostas
✅ **Defina tom** (formal, casual, técnico, etc.)
✅ **Estabeleça limites** do que o agente pode/não pode fazer

**Exemplo de Estrutura**:
```
Você é um [PAPEL] chamado [NOME].

SEU OBJETIVO:
- [objetivo 1]
- [objetivo 2]

DIRETRIZES:
- [diretriz 1]
- [diretriz 2]

QUANDO TRANSFERIR PARA HUMANO:
- [situação 1]
- [situação 2]

FORMATO DE RESPOSTA:
- [formato esperado]
```

---

## 🔄 Integração com Conversas

### **Roteamento Automático** (Em Desenvolvimento)

O sistema pode rotear conversas automaticamente para o agente certo baseado em:

1. **Palavras-chave** na mensagem
2. **Tipo de canal** (WhatsApp, Instagram, etc.)
3. **Histórico** do cliente
4. **Horário** (fora do expediente = bot)
5. **Carga** de atendentes humanos

### **Configurar Roteamento**

```typescript
// Exemplo de configuração de roteamento
const routeToAgent = async (message: string, channel: string) => {
  // Palavras-chave para vendas
  if (/preço|quanto custa|plano|comprar/i.test(message)) {
    return 'CONSULTOR_DE_VENDAS_ID';
  }

  // Palavras-chave para suporte
  if (/erro|problema|bug|não funciona/i.test(message)) {
    return 'SUPORTE_TECNICO_ID';
  }

  // Padrão: atendente virtual
  return 'ATENDENTE_VIRTUAL_ID';
};
```

### **Fallback para Humanos**

Configure quando transferir para atendente humano:

```typescript
const shouldEscalateToHuman = (
  attempts: number,
  sentiment: string,
  userRequest: string
) => {
  // Após 3 tentativas sem resolver
  if (attempts >= 3) return true;

  // Sentimento muito negativo
  if (sentiment === 'very_negative') return true;

  // Cliente solicita explicitamente
  if (/falar com atendente|humano|pessoa/i.test(userRequest)) return true;

  return false;
};
```

---

## 📊 Monitoramento e Métricas

### **Métricas Importantes**

- ✅ **Taxa de Resolução** - % de conversas resolvidas pelo bot
- ✅ **Tempo Médio** de resposta
- ✅ **Satisfação** do cliente (CSAT)
- ✅ **Taxa de Escalação** para humanos
- ✅ **Economia de Tempo** da equipe

### **Consultas SQL Úteis**

```sql
-- Total de conversas por agente
SELECT
  a.name,
  COUNT(ac.id) as total_conversations
FROM ai_agents a
LEFT JOIN agent_conversations ac ON a.id = ac.agent_id
GROUP BY a.name
ORDER BY total_conversations DESC;

-- Agentes mais ativos
SELECT
  name,
  type,
  status,
  created_at
FROM ai_agents
WHERE status = 'ativo'
ORDER BY created_at DESC;
```

---

## 🛠️ Troubleshooting

### **Agente não responde**

1. ✅ Verifique se o agente está **ativo**
2. ✅ Confirme que `LOVABLE_API_KEY` está configurada no Supabase
3. ✅ Verifique os logs da Edge Function: `ai-agent-chat`
4. ✅ Teste com mensagem simples primeiro

### **Resposta muito genérica**

1. ✅ Aumente o **System Prompt** com mais contexto
2. ✅ Reduza a **temperature** (para mais precisão)
3. ✅ Adicione exemplos de boas respostas no prompt

### **Resposta muito longa**

1. ✅ Reduza **max_tokens**
2. ✅ Especifique no prompt: "Seja conciso (máximo 3 parágrafos)"
3. ✅ Adicione limite explícito de palavras

### **Agente não transfere para humano**

1. ✅ Revise as condições de escalação no System Prompt
2. ✅ Implemente lógica de detecção de palavras-chave
3. ✅ Adicione contador de tentativas

---

## 🚀 Próximos Passos

Depois de configurar os agentes:

1. ✅ **Teste extensivamente** com cenários reais
2. ✅ **Ajuste os prompts** baseado nos resultados
3. ✅ **Configure roteamento** automático
4. ✅ **Implemente métricas** de performance
5. ✅ **Treine a equipe** sobre quando/como usar
6. ✅ **Monitore feedback** dos clientes
7. ✅ **Itere e melhore** continuamente

---

## 📚 Recursos Adicionais

- **Edge Functions**: [supabase/functions/ai-agent-chat/index.ts](../supabase/functions/ai-agent-chat/index.ts)
- **Componente de Teste**: [src/components/AIAgentTester.tsx](../src/components/AIAgentTester.tsx)
- **Página de Agentes**: [src/pages/AgentsIA.tsx](../src/pages/AgentsIA.tsx)
- **Documentação Lovable AI**: https://docs.lovable.dev/

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do Supabase
2. Consulte este documento
3. Teste com mensagens simples primeiro
4. Verifique se todas as variáveis de ambiente estão configuradas

---

**Última atualização**: 15 de outubro de 2024
**Versão**: 1.0.0
**Autor**: Connect IA Team
