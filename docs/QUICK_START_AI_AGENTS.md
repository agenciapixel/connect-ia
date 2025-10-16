# 🚀 Quick Start - Agentes de IA

## ⚡ 3 Passos para Começar

### **1️⃣ Execute o Script SQL (2 minutos)**

1. Abra o Supabase SQL Editor:
   👉 https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/editor

2. Abra o arquivo: **[scripts/setup-ai-agents.sql](../scripts/setup-ai-agents.sql)**

3. **Copie TODO o conteúdo** e cole no editor

4. Clique em **"Run"** (ou pressione Ctrl+Enter)

5. ✅ Você deve ver: **3 linhas inseridas com sucesso**

---

### **2️⃣ Acesse a Interface (1 minuto)**

1. Abra o Connect IA:
   👉 http://localhost:8080/agents

2. Você verá 3 agentes criados:
   - 🤖 **Atendente Virtual**
   - 💰 **Consultor de Vendas**
   - 🛠️ **Suporte Técnico**

---

### **3️⃣ Teste um Agente (1 minuto)**

1. Clique na aba **"Testar Agentes"**

2. Clique em **"Carregar Agentes"**

3. Selecione: **Atendente Virtual**

4. Digite: `"Qual é o horário de funcionamento?"`

5. Clique em **"Testar Agente"**

6. 🎉 **Veja a resposta gerada pela IA!**

---

## 🎯 Exemplos de Teste

### **Atendente Virtual**
```
"Olá! Qual é o horário de funcionamento?"
"Como faço para entrar em contato?"
"Preciso de ajuda com meu pedido"
```

### **Consultor de Vendas**
```
"Gostaria de saber mais sobre seus produtos"
"Quanto custa o plano empresarial?"
"Vocês oferecem período de teste gratuito?"
```

### **Suporte Técnico**
```
"Não consigo fazer login na minha conta"
"A mensagem não está sendo enviada"
"Como faço para conectar meu WhatsApp?"
```

---

## 📚 Próximos Passos

✅ **Testou e funcionou?** Ótimo!

Agora você pode:

1. **Personalizar os agentes** - Edite os prompts conforme sua necessidade
2. **Criar novos agentes** - Clique em "+ Criar Agente"
3. **Integrar com conversas** - Use os agentes em atendimentos reais
4. **Ler a documentação completa** - [AI_AGENTS_SETUP.md](AI_AGENTS_SETUP.md)

---

## ❓ Deu Erro?

### **Erro: "LOVABLE_API_KEY não configurada"**

**Solução**:
1. Verifique se a variável está no Supabase:
   ```bash
   supabase secrets list --project-ref bjsuujkbrhjhuyzydxbr | grep LOVABLE
   ```
2. Se não estiver, você precisa configurá-la primeiro

### **Erro: "Agente não encontrado"**

**Solução**:
1. Execute o script SQL novamente
2. Verifique se há erros no console do SQL Editor
3. Confirme que os agentes foram criados:
   ```sql
   SELECT * FROM ai_agents;
   ```

### **Nenhuma resposta aparece**

**Solução**:
1. Abra o DevTools do navegador (F12)
2. Veja se há erros no Console
3. Verifique os logs do Supabase:
   👉 https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/logs/edge-functions?s=ai-agent-chat

---

## 🎉 Pronto!

Seus agentes de IA estão configurados e prontos para usar!

🤖 **Bons atendimentos automáticos!**

---

**Tempo total**: ~5 minutos
**Dificuldade**: Fácil ⭐
**Documentação completa**: [AI_AGENTS_SETUP.md](AI_AGENTS_SETUP.md)
