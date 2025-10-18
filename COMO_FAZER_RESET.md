# ⚡ RESET COMPLETO DO SUPABASE - GUIA RÁPIDO

**Tempo:** 2 minutos
**Objetivo:** Limpar tudo e recriar do zero (sem erros!)

---

## 🎯 PASSO A PASSO

### 1️⃣ Acessar SQL Editor do Supabase

**Link direto:** https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/sql

Ou:
1. Acesse https://supabase.com/dashboard
2. Projeto: **Sistema de Chat**
3. Menu lateral → **SQL Editor**

---

### 2️⃣ Abrir e Copiar o Script

1. Abra o arquivo: `RESET_SUPABASE_COMPLETO.sql`
2. Selecione TUDO: **Cmd+A** (Mac) ou **Ctrl+A** (Windows)
3. Copie: **Cmd+C** ou **Ctrl+C**

---

### 3️⃣ Executar o Script

1. No SQL Editor, clique em **New Query**
2. Cole o script: **Cmd+V** ou **Ctrl+V**
3. Clique em **RUN** (ou pressione Ctrl+Enter)
4. Aguarde 10-30 segundos

---

### 4️⃣ Verificar Sucesso

Você deve ver no final das mensagens:

```
✅ RESET COMPLETO EXECUTADO COM SUCESSO!
✅ Todas as tabelas foram recriadas
✅ RLS policies aplicadas
✅ Triggers configurados

🎯 PRÓXIMO PASSO:
1. Teste criar um usuário em: https://connectia.agenciapixel.digital/autenticacao
2. Verifique se a organização foi criada automaticamente
3. Continue configurando o App Meta
```

---

## ⚠️ O QUE ESSE SCRIPT FAZ?

### ETAPA 1: Limpar Tudo
- ❌ Deleta todas as policies RLS
- ❌ Deleta todos os triggers
- ❌ Deleta todas as functions
- ❌ Deleta todas as tabelas
- ❌ **CUIDADO: Deleta todos os dados!**

### ETAPA 2: Recriar do Zero
- ✅ Cria 7 tabelas: orgs, members, contacts, conversations, messages, campaigns, prospects
- ✅ Cria 15+ índices para performance
- ✅ Aplica RLS em todas as tabelas
- ✅ Cria 13 policies de segurança
- ✅ Cria trigger de auto-criação de organização
- ✅ Cria triggers de updated_at

---

## ✅ CHECKLIST

- [ ] Acessei o SQL Editor
- [ ] Copiei o script RESET_SUPABASE_COMPLETO.sql
- [ ] Executei no SQL Editor
- [ ] Vi mensagem de sucesso ✅
- [ ] Testei criar usuário
- [ ] Organização criada automaticamente

---

## 🆘 SE DER ERRO

### Erro: "permission denied"
**Solução:** Você precisa ser owner do projeto. Verifique se está logado com a conta correta.

### Erro: "timeout"
**Solução:**
1. Aguarde 1 minuto
2. Execute novamente
3. O script é idempotente (pode rodar múltiplas vezes)

### Erro: "could not serialize access"
**Solução:**
1. Aguarde 30 segundos
2. Execute novamente

---

## 🎯 PRÓXIMO PASSO

**Após reset bem-sucedido:**

1. **Teste o sistema:**
   - Acesse: https://connectia.agenciapixel.digital/autenticacao
   - Crie um novo usuário
   - Verifique se organização foi criada automaticamente
   - Faça login e teste o dashboard

2. **Configure o App Meta:**
   - Siga: `PASSO_A_PASSO_APP_META.md`
   - URLs de Privacy Policy, Terms of Service, Data Deletion
   - Configure webhooks do WhatsApp

3. **Dados de exemplo (opcional):**
   - Se quiser, posso criar um script para adicionar dados de teste

---

## 📊 ESTRUTURA CRIADA

```
auth.users (Supabase Auth - já existe)
    ↓
public.orgs (Organizações)
    ├─ owner_id → auth.users
    └─ Trigger: Auto-criado ao criar usuário
    ↓
public.members (Usuários nas Orgs)
    ├─ user_id → auth.users
    ├─ org_id → orgs
    └─ role: admin/manager/agent/viewer
    ↓
public.contacts (Contatos do CRM)
    └─ org_id → orgs
    ↓
public.conversations (Conversas)
    ├─ org_id → orgs
    └─ contact_id → contacts
    ↓
public.messages (Mensagens)
    └─ conversation_id → conversations
    ↓
public.campaigns (Campanhas de Marketing)
    └─ org_id → orgs
    ↓
public.prospects (Pipeline de Vendas)
    ├─ org_id → orgs
    └─ contact_id → contacts
```

---

**⚠️ IMPORTANTE:** Este script DELETA todos os dados. Se você tem dados importantes no banco remoto, faça backup antes!

**Última atualização:** 18 de Outubro de 2025, 14:15
