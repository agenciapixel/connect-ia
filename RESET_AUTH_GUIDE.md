# 🔄 Guia Completo: Reset do Sistema de Autenticação

## 📋 Problema Atual

- `getUser()` e `getSession()` travando
- Sistema complexo com múltiplas verificações
- Docker/Supabase local lento
- Não consegue entrar no sistema

## ✅ Solução: Sistema Simplificado

Vamos **resetar completamente** o sistema de autenticação para algo simples, robusto e que funciona.

---

## 🚀 Passo a Passo

### 1️⃣ Resetar Banco de Dados Supabase (LOCAL)

```bash
# Parar Supabase
supabase stop

# Resetar completamente (CUIDADO: Apaga tudo!)
supabase db reset

# Ou aplicar apenas a nova migration
supabase db push
```

**O que isso faz:**
- ✅ Dropa todas as tabelas antigas
- ✅ Dropa todas as policies antigas
- ✅ Dropa todos os triggers antigos
- ✅ Cria sistema simples e limpo

### 2️⃣ Aplicar Nova Migration

A migration `20251018030000_reset_auth_system_simple.sql` vai criar:

**Tabelas:**
- `authorized_users` - Lista simples de emails autorizados
- `orgs` - Organizações
- `members` - Relacionamento user ↔ org com role

**Trigger:**
- Quando usuário faz signup → cria org → cria member como admin

**Seu email já está na whitelist:**
- `dasilva6r@gmail.com` ✅

### 3️⃣ Substituir OrganizationContext

```bash
# Backup do antigo
mv src/contexts/OrganizationContext.tsx src/contexts/OrganizationContext.old.tsx

# Usar o simplificado
mv src/contexts/OrganizationContext.simple.tsx src/contexts/OrganizationContext.tsx
```

### 4️⃣ Build e Teste

```bash
# Limpar tudo
rm -rf dist/
rm -rf node_modules/.vite

# Build
npm run build

# Preview
npm run preview
```

---

## 🧪 Como Testar

### Teste 1: Criar Novo Usuário

1. Acesse http://localhost:4173
2. Clique em "Criar conta"
3. Email: `dasilva6r@gmail.com`
4. Senha: qualquer senha segura
5. **Deve criar conta e entrar automaticamente**

**Console deve mostrar:**
```
✅ [SIMPLE] Usuário: dasilva6r@gmail.com
📊 [SIMPLE] Memberships: [...]
🏢 [SIMPLE] Organizações: [...]
✅ [SIMPLE] Organização selecionada: ... Role: admin
```

### Teste 2: Login

1. Faça logout
2. Faça login novamente
3. **Deve entrar instantaneamente**

### Teste 3: Hard Refresh

1. Pressione Cmd+Shift+R 5x
2. **Deve permanecer logado sempre**

---

## 📊 Diferenças: Antigo vs. Novo

| Aspecto | Sistema Antigo | Sistema Novo |
|---------|---------------|--------------|
| **Verificações** | getUser() + getSession() + verificar IDs | Apenas getUser() |
| **Tabelas** | 3 tabelas complexas | 3 tabelas simples |
| **Triggers** | Múltiplos triggers complexos | 1 trigger simples |
| **Policies** | 10+ policies | 6 policies simples |
| **Performance** | Lento (travava) | Rápido |
| **Código** | 200+ linhas | 150 linhas |
| **Logs** | Confusos | Claros [SIMPLE] |

---

## 🔧 Troubleshooting

### Problema: Migration falha

```bash
# Ver logs
supabase db diff

# Resetar completamente
supabase db reset

# Aplicar novamente
supabase migration up
```

### Problema: Ainda trava

```bash
# Verificar se Supabase está rodando
supabase status

# Reiniciar
supabase stop
supabase start
```

### Problema: Não autorizado

```sql
-- Adicionar seu email manualmente
INSERT INTO public.authorized_users (email)
VALUES ('dasilva6r@gmail.com')
ON CONFLICT DO NOTHING;
```

---

## 📁 Arquivos Criados/Modificados

1. **supabase/migrations/20251018030000_reset_auth_system_simple.sql**
   - Migration que reseta tudo
   - Cria sistema simples

2. **src/contexts/OrganizationContext.simple.tsx**
   - Versão simplificada sem verificações complexas
   - Logs claros com prefixo [SIMPLE]

3. **RESET_AUTH_GUIDE.md** (este arquivo)
   - Guia completo passo a passo

---

## ⚡ Comandos Rápidos

### Reset Completo
```bash
supabase stop
supabase db reset
supabase start
rm -rf dist/ node_modules/.vite
npm run build
npm run preview
```

### Apenas Aplicar Migration
```bash
supabase db push
npm run build
npm run preview
```

### Ver Tabelas no Supabase
```bash
supabase db shell

# No shell:
\dt public.*
SELECT * FROM public.authorized_users;
SELECT * FROM public.orgs;
SELECT * FROM public.members;
```

---

## 🎯 Próximos Passos Após Reset

1. ✅ Aplicar migration
2. ✅ Substituir OrganizationContext
3. ✅ Testar signup/login
4. ✅ Verificar hard refresh
5. ✅ Testar logout
6. ✅ Deploy para produção (se tudo OK)

---

## 📞 Notas Importantes

- **BACKUP**: Faça backup do banco antes de resetar!
- **LOCAL**: Este reset é apenas para desenvolvimento local
- **PRODUÇÃO**: Para produção, criar migration separada
- **EMAIL**: `dasilva6r@gmail.com` já está autorizado

---

**Versão**: v2.0.0-reset
**Data**: 18 de Outubro de 2025
**Status**: Pronto para aplicar
