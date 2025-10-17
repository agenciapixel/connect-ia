# 🧹 Limpar Tabelas do Supabase - Criar Usuário Administrativo

## 🎯 **Objetivo**
Limpar todas as tabelas do Supabase para permitir a criação de um usuário administrativo limpo.

## ⚠️ **ATENÇÃO: AÇÃO IRREVERSÍVEL**
- **TODOS os dados serão removidos**
- **Não é possível recuperar após execução**
- **Execute apenas se tiver certeza**

## 🔧 **Passo a Passo**

### 1. Acesse o Supabase Dashboard
- URL: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr
- Vá para **SQL Editor**

### 2. Execute o Script de Limpeza
- Cole o conteúdo de `limpar_tabelas_supabase.sql`
- Clique em **Run**
- Aguarde a execução completa

### 3. Verificar Resultado
- Verifique se todas as tabelas estão vazias
- Confirme que RLS está reabilitado
- Verifique se não há erros

## 📋 **O que o Script Faz**

### **1. Desabilita RLS Temporariamente**
- Remove Row Level Security de todas as tabelas
- Permite limpeza sem restrições de permissão

### **2. Limpa Dados (Ordem Correta)**
- **Tabelas dependentes primeiro:**
  - `agent_conversations`
  - `attendant_*` (todas as tabelas de atendentes)
  - `campaign_messages`
  - `conversation_assignments`
  - `messages`
  - `prospect_activities`
  - `usage_tracking`
  - `user_roles`

- **Tabelas principais:**
  - `ai_agents`
  - `attendants`
  - `campaigns`
  - `channel_accounts`
  - `consents`
  - `conversations`
  - `contacts`
  - `members`
  - `places`
  - `prospects`
  - `templates`

- **Tabelas de organizações:**
  - `organizations`
  - `orgs`

- **Perfis:**
  - `profiles` (estrutura mantida)

### **3. Reabilita RLS**
- Restaura Row Level Security em todas as tabelas
- Mantém segurança do sistema

### **4. Verificações Finais**
- Confirma que todas as tabelas estão vazias
- Verifica estatísticas de cada tabela
- Confirma que RLS está ativo

## ✅ **Resultado Esperado**

Após a execução:
- ✅ **Todas as tabelas vazias** - 0 registros em cada tabela
- ✅ **RLS reabilitado** - Segurança restaurada
- ✅ **Estrutura mantida** - Tabelas e colunas preservadas
- ✅ **Pronto para usuário admin** - Sistema limpo para configuração

## 🚀 **Próximos Passos**

Após a limpeza:
1. **Criar usuário administrativo** no sistema
2. **Configurar organização principal**
3. **Definir permissões e roles**
4. **Testar funcionalidades básicas**

## 🔍 **Verificações de Segurança**

O script inclui verificações que mostram:
- Contagem de registros em cada tabela (deve ser 0)
- Status do RLS (deve estar ativo)
- Estatísticas de inserção/atualização/exclusão

---

**Arquivo principal**: `limpar_tabelas_supabase.sql`
**Status**: ✅ Pronto para execução
**Prioridade**: 🔴 Alta (Ação irreversível)
**Impacto**: 🧹 Limpeza completa do banco de dados
