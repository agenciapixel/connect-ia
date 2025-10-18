# 🚀 Como Fazer Build - Guia Rápido

## 📋 Você tem 2 opções:

### Opção 1: Scripts Automatizados (RECOMENDADO) ⚡

#### Para Desenvolvimento (Testar):
```bash
./build-dev.sh
```

Isso vai:
1. ✅ Mudar para branch dev-auth-cache-v1.1
2. ✅ Limpar cache
3. ✅ Fazer build
4. ✅ Avisar para testar

**Depois execute:**
```bash
npm run preview
```

**E acesse:** http://localhost:4173

---

#### Para Produção (Deploy):
```bash
./build-prod.sh
```

Isso vai:
1. ✅ Fazer merge de dev para main
2. ✅ Limpar cache
3. ✅ Fazer build de produção
4. ✅ Perguntar se quer fazer push (deploy automático)

**⚠️ SÓ EXECUTE APÓS TESTAR A VERSÃO DEV!**

---

### Opção 2: Comandos Manuais

#### Desenvolvimento:
```bash
git checkout dev-auth-cache-v1.1
rm -rf dist/ node_modules/.vite
npm run build
npm run preview
```

#### Produção:
```bash
git checkout main
git merge dev-auth-cache-v1.1
rm -rf dist/ node_modules/.vite
npm run build
npm run preview
# Se OK:
git push origin main
```

---

## 🎯 Fluxo Completo Recomendado

```bash
# 1. Build de DEV
./build-dev.sh

# 2. Testar preview
npm run preview
# Acesse http://localhost:4173
# Execute os 7 testes do DEV_TESTING_GUIDE.md

# 3. Se tudo OK, build de PRODUÇÃO
./build-prod.sh
# O script vai perguntar se quer fazer push

# 4. Verificar produção
# Acesse https://connectia.agenciapixel.digital
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- **[BUILD_GUIDE.md](BUILD_GUIDE.md)** - Guia completo passo a passo
- **[DEV_TESTING_GUIDE.md](DEV_TESTING_GUIDE.md)** - Testes detalhados
- **[RESUMO_MUDANCAS_v1.1.0.md](RESUMO_MUDANCAS_v1.1.0.md)** - O que mudou

---

## ⚠️ Importante

- ✅ **SEMPRE** teste dev antes de produção
- ✅ **SEMPRE** use `npm run preview` para testar build local
- ✅ **NUNCA** faça push para main sem testar
- ✅ Se tiver dúvida, **NÃO** faça push

---

## 🆘 Problemas?

### Script não executa
```bash
# Dar permissão de execução:
chmod +x build-dev.sh build-prod.sh
```

### Build falha
```bash
# Reinstalar dependências:
rm -rf node_modules/
npm install
npm run build
```

### Quer reverter
```bash
git checkout main
git log --oneline -10
git reset --hard <commit-anterior>
git push origin main --force
```

---

**Versão**: v1.1.0-beta
**Data**: 17 de Outubro de 2025
**Pronto para build!** 🚀
