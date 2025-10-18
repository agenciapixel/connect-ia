# ✅ Teste da Correção: Role no Hard Refresh

## 🎯 Problema Corrigido

**Antes:**
- Login inicial: "admin" ✅
- Hard refresh: "viewer" ❌

**Causa Identificada:**
```javascript
// OrganizationContext ainda carregando
{
  currentOrg: null,
  userRole: 'viewer',  // ← Fallback incorreto
  fallbackUsed: true
}
```

**Solução Aplicada:**
- `usePermissions` agora espera `isLoading = false` antes de definir role
- `UserRoleBadge` mostra "Carregando..." enquanto carrega
- Previne flash de "viewer" durante carregamento

---

## 🧪 Como Testar a Correção

### Passo 1: Build Nova Versão
```bash
# Limpar cache completamente
rm -rf dist/
rm -rf node_modules/.vite
rm -rf .vite

# Build
npm run build

# Preview
npm run preview
```

### Passo 2: Abrir no Navegador
1. Acesse http://localhost:4173
2. Abra DevTools (F12)
3. Vá para aba **Console**
4. Limpe o console

### Passo 3: Login e Observar
1. Faça login
2. **Observe o badge no sidebar** (canto superior)
3. Deve mostrar: "Carregando..." → "Administrador" ✅

**No console deve aparecer:**
```javascript
🔐 usePermissions: {
  isLoading: true,
  currentOrg: null,
  userRole: 'viewer',
  fallbackUsed: true
}

// Depois:
🔐 usePermissions: {
  isLoading: false,
  currentOrg: { id: '...', name: '...', role: 'admin' },
  userRole: 'admin',
  fallbackUsed: false
}
```

### Passo 4: Hard Refresh (CRÍTICO!)
1. Pressione **Cmd+Shift+R** (Mac) ou **Ctrl+Shift+R** (Windows)
2. **Mantenha console aberto!**
3. **Observe o badge**:
   - Deve mostrar "Carregando..." brevemente
   - Depois "Administrador"
   - **NUNCA** "Visualizador" ❌

4. **Repita 5 vezes seguidas** (Cmd+Shift+R, Cmd+Shift+R, Cmd+Shift+R...)

### Passo 5: Verificar Console
**Procure por:**
```javascript
🔐 usePermissions: {
  isLoading: false,
  currentOrg: { ..., role: 'admin' },
  userRole: 'admin',
  fallbackUsed: false
}
```

**Se aparecer isso, está CORRETO! ✅**

**Se aparecer isso, ainda tem problema: ❌**
```javascript
🔐 usePermissions: {
  isLoading: false,
  currentOrg: null,
  userRole: 'viewer',
  fallbackUsed: true
}
```

---

## ✅ Checklist de Testes

### Badge Visual
- [ ] Login inicial mostra "Administrador" (vermelho com ícone de coroa)
- [ ] Hard refresh mostra "Carregando..." brevemente
- [ ] Após loading, mostra "Administrador" (vermelho)
- [ ] **NUNCA** mostra "Visualizador" (cinza) ❌
- [ ] Repetir hard refresh 5x - sempre "Administrador"

### Console Logs
- [ ] `isLoading: true` → `isLoading: false`
- [ ] `currentOrg: null` → `currentOrg: { role: 'admin' }`
- [ ] `userRole: 'viewer'` → `userRole: 'admin'`
- [ ] `fallbackUsed: true` → `fallbackUsed: false`

### Permissões
- [ ] Sidebar mostra todos os menus (Dashboard, Campanhas, Contatos, etc.)
- [ ] Pode acessar página de Configurações
- [ ] Pode acessar página de Usuários
- [ ] **NÃO** vê mensagem de "Acesso Negado"

---

## 🎯 Resultado Esperado

### Comportamento Correto
```
1. Login
   ↓
2. "Carregando..." (0.5-2 segundos)
   ↓
3. "Administrador" (vermelho) ✅
   ↓
4. Hard Refresh (Cmd+Shift+R)
   ↓
5. "Carregando..." (0-1 segundo)
   ↓
6. "Administrador" (vermelho) ✅
   ↓
7. Repetir passo 4-6 = sempre "Administrador" ✅
```

### Logs Corretos
```javascript
// Primeiro log (durante loading)
🔐 usePermissions: {
  isLoading: true,
  currentOrg: null,
  userRole: 'viewer',
  fallbackUsed: true
}

// Segundo log (após carregar)
🔐 usePermissions: {
  isLoading: false,
  currentOrg: { id: '22d80...', name: '...', role: 'admin' },
  userRole: 'admin',
  fallbackUsed: false
}
```

---

## 🐛 Se Ainda Tiver Problema

### Se continuar mostrando "Visualizador" após loading:

**1. Verificar tabela members no Supabase:**
```sql
SELECT user_id, org_id, role, created_at
FROM members
WHERE user_id = 'seu-user-id';
```

Deve mostrar `role = 'admin'`

**2. Limpar localStorage:**
```javascript
// No console do navegador:
localStorage.clear();
location.reload();
```

**3. Verificar se há múltiplas organizações:**
```javascript
// No console após login:
const { data } = await supabase.from('members').select('*, orgs(*)').eq('user_id', 'seu-id');
console.log(data);
```

Se tiver múltiplas orgs, pode estar selecionando a errada.

---

## 📊 Comparação: Antes vs. Depois

| Situação | Antes | Depois |
|----------|-------|--------|
| **Login inicial** | "Administrador" ✅ | "Administrador" ✅ |
| **Hard refresh (badge)** | "Visualizador" ❌ | "Carregando..." → "Administrador" ✅ |
| **Hard refresh (permissões)** | Limitadas ❌ | Completas ✅ |
| **Console log** | `currentOrg: null` | `isLoading: true` → `false` |
| **Flash de viewer** | Sim ❌ | Não ✅ |
| **Menus sidebar** | Limitados ❌ | Todos ✅ |

---

## 📝 Template de Reporte

Se ainda tiver problemas, cole aqui:

```
# Teste realizado em: [data/hora]

## Badge Visual:
- Login inicial: [Carregando/Admin/Manager/Viewer]
- Após login completo: [Admin/Manager/Viewer]
- Hard refresh 1x: [Carregando/Admin/Manager/Viewer]
- Hard refresh 5x: [sempre Admin? sim/não]

## Console Logs (cole aqui):
[Logs do console após hard refresh]

## Tabela members (Supabase):
user_id: ...
org_id: ...
role: ...

## Problema persiste? [sim/não]
```

---

**Versão**: v1.1.0-beta (correção timing issue)
**Data**: 18 de Outubro de 2025
**Commit**: ebb06e7
**Status**: Pronto para testes
