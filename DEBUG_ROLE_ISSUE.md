# 🐛 Debug: Role Mudando de Admin para User

## 📋 Problema Reportado

**Comportamento:**
- ✅ Login inicial mostra role "admin" corretamente
- ❌ Hard refresh (Cmd+Shift+R) muda para "user"

## 🔍 Análise do Problema

### Possíveis Causas

1. **Timing Issue**: `OrganizationContext` demora para carregar no hard refresh
2. **Dados Incorretos**: Tabela `members` tem role errado
3. **Cache do OrganizationContext**: localStorage com dados antigos
4. **Fallback Ativado**: `usePermissions` usando fallback "viewer"

## 🧪 Como Testar e Ver Logs de Debug

### Passo 1: Build com Logs de Debug
```bash
# Limpar cache
rm -rf dist/ node_modules/.vite

# Build de desenvolvimento
npm run build

# Iniciar preview
npm run preview
```

### Passo 2: Abrir DevTools
1. Acesse http://localhost:4173
2. Abra DevTools (F12 ou Cmd+Option+I)
3. Vá para a aba **Console**

### Passo 3: Fazer Login
1. Faça login normalmente
2. **Observe os logs no console**

**Procure por:**
```
✅ fetchOrganizations: Usuário encontrado: seu-email@exemplo.com
📊 fetchOrganizations: Memberships retornadas: [...]
🏢 fetchOrganizations: Organizações processadas: [...]
🔐 usePermissions: { currentOrg: {...}, userRole: "admin", ... }
```

**Role deve ser "admin"** ✅

### Passo 4: Hard Refresh
1. Pressione **Cmd+Shift+R** (Mac) ou **Ctrl+Shift+R** (Windows)
2. **MANTENHA O CONSOLE ABERTO** para ver os logs
3. Observe a sequência de logs

**Procure por:**
```
🔐 usePermissions: { currentOrg: null, userRole: "viewer", fallbackUsed: true }
```

**OU:**
```
🔐 usePermissions: { currentOrg: {...}, userRole: "user", ... }
```

## 📊 Interpretação dos Logs

### Cenário 1: currentOrg é NULL
```javascript
🔐 usePermissions: {
  currentOrg: null,
  userRole: "viewer",
  fallbackUsed: true
}
```

**Problema**: `OrganizationContext` ainda não carregou
**Solução**: Adicionar loading state no `usePermissions`

### Cenário 2: currentOrg.role é "user" ou "member"
```javascript
🔐 usePermissions: {
  currentOrg: { id: "...", name: "...", role: "member" },
  userRole: "member",  // ou "user"
  fallbackUsed: false
}
```

**Problema**: Dados incorretos na tabela `members`
**Solução**: Atualizar role na tabela `members` no Supabase

### Cenário 3: currentOrg.role é undefined
```javascript
🔐 usePermissions: {
  currentOrg: { id: "...", name: "...", role: undefined },
  userRole: "viewer",
  fallbackUsed: true
}
```

**Problema**: Query do `OrganizationContext` não está retornando o campo `role`
**Solução**: Verificar query SQL no OrganizationContext

## 🔧 Soluções Baseadas no Log

### Se o log mostrar: currentOrg = null (Timing Issue)

**Problema**: O `OrganizationContext` demora para carregar no hard refresh.

**Solução Temporária** (adicionar ao usePermissions):
```typescript
export function usePermissions() {
  const { currentOrg, isLoading } = useOrganization();

  // Retornar loading state enquanto organização não carrega
  if (isLoading) {
    return {
      userRole: "viewer" as UserRole,
      permissions: ROLE_PERMISSIONS.viewer,
      isLoading: true,
      // ... resto
    };
  }

  // ... resto do código
}
```

### Se o log mostrar: role = "member" ou "user"

**Problema**: Tabela `members` tem role incorreto.

**Solução** (atualizar no Supabase):
1. Acesse Supabase Dashboard
2. Vá para Table Editor → members
3. Encontre seu usuário
4. Mude `role` de "member" ou "user" para "admin"

**OU via SQL:**
```sql
UPDATE members
SET role = 'admin'
WHERE user_id = 'seu-user-id-aqui';
```

### Se o log mostrar: role = undefined

**Problema**: Query do `OrganizationContext` não retorna role.

**Verificar** em `src/contexts/OrganizationContext.tsx` linha 60-71:
```typescript
const { data: memberships, error } = await supabase
  .from("members")
  .select(`
    role,          // ← DEVE ESTAR AQUI
    orgs (
      id,
      name,
      slug,
      plan
    )
  `)
  .eq("user_id", user.id);
```

## 📋 Checklist de Verificação

Antes de testar, verifique:

- [ ] Você está na branch `dev-auth-cache-v1.1`
- [ ] Limpou cache (`rm -rf dist/ node_modules/.vite`)
- [ ] Fez build (`npm run build`)
- [ ] DevTools está aberto na aba Console
- [ ] Console limpo (clique no ícone 🚫 para limpar)

Durante o teste:

- [ ] Fez login e viu role "admin" ✅
- [ ] Copiou os logs do console (primeiro login)
- [ ] Fez hard refresh (Cmd+Shift+R)
- [ ] Viu role mudar para "user" ❌
- [ ] Copiou os logs do console (após refresh)

## 🎯 Próximos Passos

Após coletar os logs:

1. **Cole os logs aqui** (ou mande para mim)
2. **Identifique qual cenário** (1, 2 ou 3)
3. **Aplique a solução correspondente**
4. **Teste novamente**

## 📝 Template para Reportar Logs

```
# Login Inicial (Admin ✅)
[Cole aqui os logs do console após login]

# Hard Refresh (User ❌)
[Cole aqui os logs do console após hard refresh]

# Tabela members
[Cole aqui os dados da sua linha na tabela members no Supabase]
user_id: ...
org_id: ...
role: ...
created_at: ...
```

---

**Versão**: v1.1.0-beta com debug logs
**Data**: 17 de Outubro de 2025
**Status**: Aguardando logs de debug
