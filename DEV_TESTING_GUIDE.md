# 🧪 Guia de Testes - Branch dev-auth-cache-v1.1

## 📋 Objetivo
Testar o novo sistema de cache de autenticação em ambiente local antes de fazer deploy para produção.

## 🔀 Branches

- **`main`** → Produção (código estável v1.0.0)
- **`dev-auth-cache-v1.1`** → Desenvolvimento (código com cache v1.1.0-beta)

## 🚀 Como Testar Localmente

### 1. Verificar Branch Atual
```bash
git branch
# Deve mostrar: * main
```

### 2. Mudar para Branch de Desenvolvimento
```bash
git checkout dev-auth-cache-v1.1
```

### 3. Limpar Build Anterior (Importante!)
```bash
rm -rf dist/
rm -rf node_modules/.vite
```

### 4. Instalar Dependências (se necessário)
```bash
npm install
```

### 5. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:8080

### 6. Executar Testes

#### ✅ Teste 1: Login Normal
1. Abra http://localhost:8080
2. Faça login com `dasilva6r@gmail.com`
3. Abra Console (F12)
4. Verifique logs:
   - ✅ `🔍 checkUserAuthorization: Iniciando`
   - ✅ `✅ checkUserAuthorization: Resultado: true`
   - ✅ `✅ getUserRole: Role encontrado: admin`

#### ✅ Teste 2: Hard Refresh (CRÍTICO)
1. Após login bem-sucedido
2. Pressione **Cmd+Shift+R** (Mac) ou **Ctrl+Shift+R** (Windows)
3. **Repita 5 vezes seguidas**
4. Verifique Console:
   - ✅ Deve mostrar: `✅ checkUserAuthorization: Usando cache: true`
   - ✅ Deve mostrar: `✅ getUserRole: Usando cache: admin`
   - ❌ **NÃO** deve travar por mais de 1 segundo
   - ❌ **NÃO** deve mostrar timeouts

#### ✅ Teste 3: Performance do Cache
1. Login normal
2. Navegue entre páginas (Dashboard → Contatos → CRM)
3. Observe Console:
   - ✅ Primeiras validações: ~2-5s (consulta Supabase)
   - ✅ Validações seguintes: ~0ms (cache instantâneo)

#### ✅ Teste 4: Expiração do Cache (5 minutos)
1. Login normal
2. **Aguarde 5 minutos** sem interagir
3. Faça refresh (F5)
4. Verifique Console:
   - ✅ Deve consultar Supabase novamente (cache expirou)
   - ✅ Deve atualizar cache com novos dados

#### ✅ Teste 5: Validações Duplicadas
1. Login normal
2. Abra Network tab (F12 → Network)
3. Faça hard refresh 3 vezes rápido
4. Verifique:
   - ✅ Deve ver apenas 1 ou 2 requisições ao Supabase
   - ❌ **NÃO** deve ver múltiplas requisições simultâneas

#### ✅ Teste 6: Logout e Re-login
1. Faça login
2. Clique em Logout
3. Verifique Console:
   - ✅ Cache deve ser limpo
4. Faça login novamente
5. Verifique:
   - ✅ Nova consulta ao Supabase (cache limpo)

#### ✅ Teste 7: Usuário Não Autorizado
1. Crie um usuário de teste no Supabase Auth (sem adicionar em `authorized_users`)
2. Tente fazer login
3. Verifique:
   - ✅ Deve mostrar mensagem: "Usuário não autorizado"
   - ✅ Deve fazer logout automático
   - ❌ **NÃO** deve permitir acesso ao sistema

---

## 📊 Resultados Esperados

### ✅ Sucesso - Sistema Aprovado
- Hard refresh instantâneo (cache funcionando)
- Performance 90% melhor em re-validações
- Sem loops infinitos
- Sem timeouts falsos
- Validações duplicadas bloqueadas
- Logout limpa cache corretamente

### ❌ Falha - Reverter para Main
- Hard refresh trava
- Timeouts frequentes
- Loops infinitos de validação
- Cache não funciona
- Erros de sintaxe JavaScript

---

## 🔄 Como Reverter para Main (Se Necessário)

### Se encontrar problemas:
```bash
# 1. Parar servidor dev (Ctrl+C)

# 2. Voltar para main
git checkout main

# 3. Limpar cache
rm -rf dist/
rm -rf node_modules/.vite

# 4. Reiniciar dev
npm run dev
```

---

## ✅ Se Tudo Funcionar - Aprovar para Produção

### Após todos os testes passarem:

```bash
# 1. Parar servidor dev (Ctrl+C)

# 2. Fazer merge da branch dev para main
git checkout main
git merge dev-auth-cache-v1.1

# 3. Fazer build de produção
npm run build

# 4. Testar build localmente
npm run preview
# Acesse http://localhost:4173 e teste novamente

# 5. Se tudo OK, fazer push (deploy automático)
git push origin main
```

---

## 📝 Checklist de Aprovação

Marque todos antes de fazer deploy:

- [ ] Teste 1: Login normal funcionando
- [ ] Teste 2: Hard refresh não trava (5x)
- [ ] Teste 3: Cache acelerando validações
- [ ] Teste 4: Cache expira após 5 minutos
- [ ] Teste 5: Sem validações duplicadas
- [ ] Teste 6: Logout limpa cache
- [ ] Teste 7: Usuário não autorizado bloqueado
- [ ] Build de produção sem erros
- [ ] Preview local funcionando
- [ ] Console sem erros de sintaxe

**Só faça push se TODOS os itens estiverem marcados!**

---

## 🆘 Suporte

### Problemas Comuns

**1. "npm: command not found"**
```bash
# Instalar Node.js primeiro
brew install node  # Mac
```

**2. "Port 8080 already in use"**
```bash
# Matar processo na porta
lsof -ti:8080 | xargs kill -9
```

**3. "Build failed"**
```bash
# Limpar tudo e reinstalar
rm -rf node_modules dist
npm install
npm run dev
```

**4. Cache não funcionando**
- Verifique Console (F12)
- Procure por `✅ checkUserAuthorization: Usando cache`
- Se não aparecer, cache não está ativo

**5. Erro "missing ) after argument list"**
- Build corrompido
- Solução: `rm -rf dist && npm run build`

---

## 📞 Contato

Se tiver dúvidas ou problemas durante os testes, documente:
- Console logs (F12 → Console → copiar tudo)
- Network requests (F12 → Network → exportar HAR)
- Passos para reproduzir o erro

---

**Versão do Guia:** 1.0
**Última atualização:** 17/10/2025
**Responsável:** Claude Code Assistant
