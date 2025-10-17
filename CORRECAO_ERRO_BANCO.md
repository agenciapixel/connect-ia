# 🔧 Correção do Erro de Banco de Dados

## ❌ **Problema Identificado:**
```
ERROR: 42703: column "org_id" does not exist
LINE 21: WHERE org_id = '00000000-0000-0000-0000-000000000000'
```

## 🔍 **Causa do Erro:**
A tabela `messages` não possui coluna `org_id` diretamente. Ela está relacionada através de `conversation_id`.

## ✅ **Solução:**

### **1. Execute Primeiro - Verificação da Estrutura:**
```sql
-- Cole o conteúdo do arquivo: verificar_estrutura_tabelas.sql
```
Este script mostra:
- 📊 Tabelas existentes
- 🔗 Colunas de cada tabela
- 🔄 Relacionamentos (foreign keys)
- 📈 Dados existentes
- 🛡️ Políticas RLS

### **2. Execute Depois - Limpeza Corrigida:**
```sql
-- Cole o conteúdo do arquivo: cleanup_database_corrigido.sql
```
Este script corrigido:
- ✅ Cria tabelas faltantes (`conversations`, `contacts`)
- ✅ Usa relacionamentos corretos
- ✅ Limpa dados através de `conversation_id`
- ✅ Configura estrutura completa

### **3. Ou Use o Script Original Corrigido:**
```sql
-- Cole o conteúdo do arquivo: cleanup_database.sql (já corrigido)
```

---

## 📋 **Estrutura Correta das Tabelas:**

### **messages** (sem org_id direto)
```sql
- id (UUID)
- conversation_id (UUID) → conversations.id
- sender_type (TEXT)
- direction (TEXT)
- content (TEXT)
- message_type (TEXT)
- channel_type (TEXT)
- created_at (TIMESTAMP)
```

### **conversations** (com org_id)
```sql
- id (UUID)
- org_id (UUID) → organizations.id
- contact_id (UUID) → contacts.id
- channel_type (TEXT)
- status (TEXT)
- created_at (TIMESTAMP)
```

### **Relacionamento:**
```
messages.conversation_id → conversations.id
conversations.org_id → organizations.id
```

---

## 🚀 **Passos Corretos:**

1. **✅ Execute:** `verificar_estrutura_tabelas.sql`
2. **✅ Execute:** `cleanup_database_corrigido.sql`
3. **✅ Execute:** `setup_initial_data.sql`
4. **✅ Execute:** `test_integrations.sql`

---

## 🎯 **Resultado Esperado:**
- ✅ Todas as tabelas criadas
- ✅ Relacionamentos corretos
- ✅ Dados de teste removidos
- ✅ Sistema funcionando

**🎉 Problema resolvido! Execute os scripts na ordem correta.**
