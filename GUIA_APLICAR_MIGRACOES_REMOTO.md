# 🔄 GUIA: Aplicar Migrações no Supabase Remoto

**Objetivo:** Sincronizar o banco de dados remoto (produção) com o local

---

## 🎯 PASSO A PASSO

### 1️⃣ Acessar Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Login com sua conta
3. Selecione o projeto: **bjsuujkbrhjhuyzydxbr**
4. No menu lateral, clique em **SQL Editor**

---

### 2️⃣ Abrir o Script de Migração

1. Abra o arquivo: `APLICAR_MIGRACOES_SUPABASE_REMOTO.sql`
2. Copie TODO o conteúdo do arquivo

---

### 3️⃣ Executar no SQL Editor

1. No SQL Editor do Supabase, clique em **New Query**
2. Cole todo o script
3. Clique em **Run** (ou pressione Ctrl+Enter)

⏱️ **Aguarde:** 10-30 segundos para processar

---

### 4️⃣ Verificar Resultados

Você deve ver no final:

```
✅ Migrações aplicadas com sucesso!
Próximo passo: Inserir dados de exemplo (se necessário)
```

---

### 5️⃣ Inserir Dados de Exemplo (Opcional)

Se quiser dados de teste em produção:

1. Abra o arquivo: `dados_exemplo.sql`
2. Copie o conteúdo
3. Cole em uma **New Query** no SQL Editor
4. Clique em **Run**

---

## ✅ O QUE O SCRIPT FAZ

### Cria Tabelas:
- ✅ `orgs` - Organizações
- ✅ `members` - Membros das organizações
- ✅ `contacts` - Contatos CRM
- ✅ `conversations` - Conversas
- ✅ `messages` - Mensagens
- ✅ `campaigns` - Campanhas
- ✅ `prospects` - Pipeline de vendas

### Cria Índices:
- ✅ Índices para melhor performance
- ✅ Índices em campos mais consultados

### Configura Segurança:
- ✅ RLS (Row Level Security) ativado
- ✅ Policies para isolamento de dados
- ✅ Multi-tenant funcional

### Cria Automações:
- ✅ Trigger de auto-criação de organização
- ✅ Trigger de atualização de timestamps

---

## 🔍 VERIFICAR SE FUNCIONOU

Após executar, teste:

### Teste 1: Ver Tabelas Criadas
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Deve retornar:
- campaigns
- contacts
- conversations
- members
- messages
- orgs
- prospects

### Teste 2: Ver Policies RLS
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

Deve mostrar várias policies de segurança.

### Teste 3: Criar Usuário de Teste

1. Acesse sua aplicação: https://connectia.agenciapixel.digital/autenticacao
2. Crie uma conta de teste
3. Verifique se a organização foi criada automaticamente:

```sql
SELECT
  u.email,
  o.name as organizacao,
  m.role
FROM auth.users u
LEFT JOIN public.members m ON u.id = m.user_id
LEFT JOIN public.orgs o ON m.org_id = o.id
ORDER BY u.created_at DESC
LIMIT 5;
```

---

## ⚠️ ATENÇÃO

### NÃO Execute se:
- ❌ Já tem dados importantes em produção
- ❌ Não tem backup dos dados atuais
- ❌ Não testou localmente antes

### Execute se:
- ✅ É um ambiente novo/vazio
- ✅ Já fez backup dos dados
- ✅ Testou localmente e funcionou

---

## 🔙 REVERTER (Se Necessário)

Se algo der errado, você pode reverter:

```sql
-- CUIDADO: Isso deleta TUDO!
DROP TABLE IF EXISTS public.prospects CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.orgs CASCADE;
```

Depois execute o script de migração novamente.

---

## 📞 LINKS ÚTEIS

- **Supabase Dashboard:** https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr
- **SQL Editor:** https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/sql
- **Table Editor:** https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/editor

---

## ✅ CHECKLIST

Marque conforme completar:

- [ ] Acessei o Supabase Dashboard
- [ ] Copiei o script `APLICAR_MIGRACOES_SUPABASE_REMOTO.sql`
- [ ] Executei no SQL Editor
- [ ] Vi a mensagem de sucesso
- [ ] Verifiquei que as tabelas foram criadas
- [ ] Testei criar um usuário na aplicação
- [ ] Verifiquei que a organização foi criada automaticamente

---

**Última atualização:** 18 de Outubro de 2025
**Próximo passo:** Testar a aplicação em produção!
