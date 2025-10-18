# ⚡ GUIA RÁPIDO: Aplicar Migração AGORA

**Tempo:** 5 minutos

---

## 🎯 OPÇÃO 1: SQL Editor (RECOMENDADO)

### Passo 1: Acessar SQL Editor
**Link direto:** https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/sql

### Passo 2: Copiar Script
Abra o arquivo: `APLICAR_MIGRACOES_SUPABASE_REMOTO.sql`

**Copie TODO o conteúdo** (Cmd+A, Cmd+C)

### Passo 3: Executar
1. No SQL Editor, clique em **New Query**
2. Cole o script (Cmd+V)
3. Clique em **Run** (ou Ctrl+Enter)
4. Aguarde 10-30 segundos

### Passo 4: Verificar
Você deve ver no final:
```
✅ Migrações aplicadas com sucesso!
```

**Se aparecer erro:**
- Leia a mensagem de erro
- Me mostre o erro (selecione e copie)
- Vou corrigir rapidamente

---

## 🎯 OPÇÃO 2: Supabase CLI (Se SQL Editor falhar)

### Passo 1: Fazer Reset das Migrações Remotas
```bash
# CUIDADO: Isso reseta o histórico de migrações
# Não deleta dados, apenas o histórico
supabase migration repair --status reverted --linked
```

### Passo 2: Aplicar Apenas a Nova Migração
```bash
# Aplicar só a migração de sync
supabase db push --linked --include-all
```

**Quando perguntar "Do you want to push?" → Digite `Y` e Enter**

---

## ✅ CHECKLIST

- [ ] Acessei o SQL Editor
- [ ] Copiei o script APLICAR_MIGRACOES_SUPABASE_REMOTO.sql
- [ ] Executei no SQL Editor
- [ ] Vi mensagem de sucesso
- [ ] Testei criar usuário na aplicação
- [ ] Organização foi criada automaticamente

---

## 🆘 ERROS COMUNS

### "column already exists"
**Solução:** O script já trata isso. Pode ignorar.

### "type already exists"
**Solução:** O script já trata isso. Pode ignorar.

### "timeout" ou "connection error"
**Solução:**
1. Aguarde 1 minuto
2. Tente novamente
3. Verifique se Supabase está online

---

## 📞 PRÓXIMO PASSO

**Depois de aplicar com sucesso:**

1. Teste criar um usuário em: https://connectia.agenciapixel.digital/autenticacao
2. Verifique se organização foi criada automaticamente
3. Continue configurando o App Meta seguindo: `PASSO_A_PASSO_APP_META.md`

---

**Use a OPÇÃO 1 primeiro. Só use OPÇÃO 2 se der erro.**

**Última atualização:** 18 de Outubro de 2025, 14:05
