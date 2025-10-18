# 🏗️ Guia de Build - Desenvolvimento e Produção

## 📋 Visão Geral

Este guia mostra como criar builds limpas para:
1. **Desenvolvimento (dev)**: Branch `dev-auth-cache-v1.1` - Testar nova arquitetura
2. **Produção (main)**: Branch `main` - Deploy no Hostinger

---

## 🧪 PARTE 1: Build de Desenvolvimento (Testar Localmente)

### Passo 1: Mudar para Branch de Desenvolvimento
```bash
git checkout dev-auth-cache-v1.1
git status  # Verificar que está na branch correta
```

### Passo 2: Limpar Cache e Build Anterior
```bash
rm -rf dist/
rm -rf node_modules/.vite
```

### Passo 3: Build de Desenvolvimento
```bash
npm run build
```

**Saída Esperada:**
```
vite v5.x.x building for production...
✓ xxxx modules transformed.
dist/index.html                   x.xx kB │ gzip: x.xx kB
dist/assets/index-xxxxxxxx.js     xxx.xx kB │ gzip: xxx.xx kB
✓ built in xxxms
```

### Passo 4: Testar Build Localmente
```bash
npm run preview
```

**Acesse:** http://localhost:4173

### Passo 5: Testes a Realizar (IMPORTANTE!)

Execute os 7 testes do [DEV_TESTING_GUIDE.md](DEV_TESTING_GUIDE.md):

- [ ] **Teste 1**: Login normal funcionando
- [ ] **Teste 2**: Hard refresh 5x (Cmd+Shift+R) - CRÍTICO!
- [ ] **Teste 3**: Cache funcionando (instantâneo após primeira carga)
- [ ] **Teste 4**: Cache expira após 5 minutos
- [ ] **Teste 5**: Sem validações duplicadas no console
- [ ] **Teste 6**: Logout e re-login funcionando
- [ ] **Teste 7**: Usuário não autorizado bloqueado

**⚠️ IMPORTANTE: SÓ PROSSIGA PARA PRODUÇÃO SE TODOS OS TESTES PASSAREM!**

---

## 🚀 PARTE 2: Build de Produção (Deploy no Hostinger)

**⚠️ SÓ EXECUTE ESTA PARTE APÓS APROVAR OS TESTES DA PARTE 1!**

### Passo 1: Voltar para Branch Main
```bash
# Parar o preview se estiver rodando (Ctrl+C)
git checkout main
git status  # Verificar que está na branch main
```

### Passo 2: Fazer Merge da Branch Dev
```bash
git merge dev-auth-cache-v1.1
```

**Saída Esperada:**
```
Updating xxxxxxx..yyyyyyy
Fast-forward
 CLAUDE.md                      | xxx ++++++++++++++++++----------
 DEV_TESTING_GUIDE.md           | xxx ++++++++++++++++++
 RESUMO_MUDANCAS_v1.1.0.md      | xxx ++++++++++++++++++
 src/hooks/useSecurity.ts       | xxx ++++++++++-----------
 4 files changed, 743 insertions(+), 250 deletions(-)
```

### Passo 3: Limpar Cache
```bash
rm -rf dist/
rm -rf node_modules/.vite
```

### Passo 4: Build de Produção
```bash
npm run build
```

### Passo 5: Testar Build de Produção Localmente
```bash
npm run preview
```

**Acesse:** http://localhost:4173

**Testes Finais:**
- [ ] Login funcionando
- [ ] Hard refresh 3x funcionando
- [ ] Console sem erros
- [ ] Performance boa

### Passo 6: Fazer Push para Hostinger (Deploy Automático)
```bash
# Se tudo estiver OK:
git push origin main
```

**⚠️ ATENÇÃO:** O push para `main` dispara deploy automático no Hostinger!

---

## 🔄 PARTE 3: Se Precisar Reverter

### Se Encontrou Problemas na Produção

```bash
# 1. Voltar para commit anterior (v1.0.0)
git log --oneline -5  # Ver últimos commits
git reset --hard <commit-hash-v1.0.0>

# 2. Forçar push para produção
git push origin main --force

# 3. Limpar e rebuild
rm -rf dist/ node_modules/.vite
npm run build

# 4. Voltar para branch dev para investigar
git checkout dev-auth-cache-v1.1
```

### Se Quiser Testar Dev de Novo

```bash
git checkout dev-auth-cache-v1.1
rm -rf dist/ node_modules/.vite
npm run build
npm run preview
```

---

## 📊 Comparação: Dev vs. Produção

| Aspecto | Branch Dev | Branch Main |
|---------|-----------|-------------|
| **Branch Git** | dev-auth-cache-v1.1 | main |
| **Versão** | v1.1.0-beta | v1.0.0 → v1.1.0 (após merge) |
| **Arquitetura Auth** | 3 camadas (nova) | Antiga (ou nova após merge) |
| **Cache** | Duplo (memória + localStorage) | Só memória (ou duplo após merge) |
| **Onde Testar** | localhost:4173 (preview) | localhost:4173 OU Hostinger |
| **Deploy Automático** | ❌ Não | ✅ Sim (ao fazer push) |
| **Pode Reverter** | ✅ Fácil (git checkout main) | ⚠️ Difícil (precisa force push) |

---

## 🎯 Checklist Completo

### Antes de Começar
- [ ] Você limpou os arquivos do Hostinger
- [ ] Você leu este guia completo
- [ ] Você tem backup da versão atual (v1.0.0)

### Build de Desenvolvimento
- [ ] Mudou para branch dev-auth-cache-v1.1
- [ ] Limpou cache (dist/ e node_modules/.vite)
- [ ] Executou `npm run build` sem erros
- [ ] Executou `npm run preview`
- [ ] Executou todos os 7 testes do DEV_TESTING_GUIDE.md
- [ ] Todos os testes passaram ✅

### Build de Produção
- [ ] Voltou para branch main
- [ ] Fez merge da branch dev
- [ ] Limpou cache novamente
- [ ] Executou `npm run build` sem erros
- [ ] Testou preview local
- [ ] Testes finais passaram
- [ ] Fez push para main (deploy automático)

### Após Deploy
- [ ] Acessou https://connectia.agenciapixel.digital
- [ ] Testou login na produção
- [ ] Testou hard refresh 3x
- [ ] Verificou que role está correto (admin)
- [ ] Performance boa (instantânea)

---

## 🛠️ Comandos Rápidos

### Desenvolvimento (Dev Branch)
```bash
git checkout dev-auth-cache-v1.1
rm -rf dist/ node_modules/.vite
npm run build
npm run preview
# Testar em http://localhost:4173
```

### Produção (Main Branch)
```bash
git checkout main
git merge dev-auth-cache-v1.1
rm -rf dist/ node_modules/.vite
npm run build
npm run preview
# Se OK:
git push origin main
```

### Reverter para Versão Anterior
```bash
git checkout main
git log --oneline -10
git reset --hard <commit-hash-anterior>
git push origin main --force
```

---

## 📞 Problemas Comuns

### "npm: command not found"
**Solução:** Instale o Node.js: https://nodejs.org/

### "Error: Cannot find module"
**Solução:**
```bash
rm -rf node_modules/
npm install
npm run build
```

### "Build failed: Syntax error"
**Solução:**
```bash
# Verificar se há erros de sintaxe no código
npm run lint
# Corrigir erros apontados
npm run build
```

### "Push rejected: Updates were rejected"
**Solução:**
```bash
# Fazer pull primeiro
git pull origin main
# Resolver conflitos se houver
git push origin main
```

### "Preview não abre"
**Solução:**
```bash
# Verificar se build existe
ls dist/

# Se não existir:
npm run build

# Tentar preview novamente
npm run preview
```

---

## 📝 Notas Importantes

1. **SEMPRE teste localmente antes de fazer push para main**
2. **NUNCA force push para main sem backup**
3. **Siga a ordem: Dev → Testes → Main → Deploy**
4. **Se tiver dúvida, NÃO faça push para main**
5. **Mantenha a branch dev para testes futuros**

---

**Versão**: v1.1.0-beta
**Data**: 17 de Outubro de 2025
**Status**: Pronto para build e testes
**Responsável**: Ricardo da Silva
