# 🚀 DEPLOY AUTOMÁTICO COM GIT - CONNECT IA

## ✅ **CONFIGURAÇÃO COMPLETA!**

Seu projeto está **100% configurado** para deploy automático com Git + GitHub Actions + Hostinger!

---

## 🎯 **PASSOS FINAIS PARA ATIVAR O DEPLOY**

### **1. 📁 Criar Repositório no GitHub**

1. Acesse: https://github.com/new
2. Nome do repositório: `connect-ia` (ou o nome que preferir)
3. **NÃO** marque "Add a README file" (já temos um)
4. Clique em "Create repository"

### **2. 🔗 Conectar Repositório Local**

Execute estes comandos no terminal:

```bash
# Conectar ao repositório GitHub (substitua SEU_USUARIO)
git remote add origin https://github.com/agenciapixel/connect-ia.git

# Renomear branch para main
git branch -M main

# Fazer push inicial
git push -u origin main
```

### **3. 🔐 Configurar Secrets no GitHub**

1. Vá em: **Repository → Settings → Secrets and variables → Actions**
2. Clique em **"New repository secret"**
3. Adicione estes secrets:

| Nome | Valor | Onde encontrar |
|------|-------|----------------|
| `HOSTINGER_USERNAME` | Seu usuário FTP | hPanel → Advanced → FTP Accounts |
| `HOSTINGER_PASSWORD` | Sua senha FTP | hPanel → Advanced → FTP Accounts |

### **4. 🚀 Deploy Automático Ativado!**

- **A cada push** na branch `main` → Deploy automático
- **Deploy manual** → Actions → Deploy Connect IA → Run workflow
- **Status** → Badge verde no README quando funcionando

---

## 📊 **O QUE ACONTECE NO DEPLOY**

### **GitHub Actions Executa:**
1. ✅ **Checkout** do código
2. ✅ **Setup** Node.js 20
3. ✅ **Install** dependências
4. ✅ **Lint** verificação de código
5. ✅ **Build** para produção
6. ✅ **Deploy** via FTP para Hostinger
7. ✅ **Notificação** de sucesso/erro

### **Arquivos Enviados:**
- `dist/` → `public_html/` na Hostinger
- **Excluídos**: `.git`, `node_modules`, `.env`, etc.

---

## 🌐 **URLs CONFIGURADAS**

- **Site**: https://connectia.agenciapixel.digital
- **Deploy Status**: Badge no README
- **Actions**: Repository → Actions

---

## 🔧 **COMANDOS ÚTEIS**

### **Desenvolvimento:**
```bash
# Executar localmente
npm run dev

# Build local
npm run build

# Preview build
npm run preview
```

### **Git:**
```bash
# Ver status
git status

# Adicionar mudanças
git add .

# Commit
git commit -m "Descrição da mudança"

# Push (deploy automático)
git push origin main
```

### **Deploy Manual:**
```bash
# Deploy imediato
git push origin main

# Ou via GitHub Actions
# Repository → Actions → Deploy Connect IA → Run workflow
```

---

## 🎯 **VANTAGENS DO DEPLOY AUTOMÁTICO**

### **✅ Automático:**
- Deploy a cada push
- Build na nuvem
- Sem necessidade do seu computador

### **✅ Confiável:**
- Histórico de deploys
- Rollback fácil
- Notificações de status

### **✅ Seguro:**
- Secrets protegidos
- Build isolado
- Verificação de código

### **✅ Rápido:**
- ~2-3 minutos por deploy
- Cache de dependências
- Upload otimizado

---

## 🐛 **TROUBLESHOOTING**

### **Deploy falha:**
1. Verifique os secrets no GitHub
2. Confirme credenciais FTP na Hostinger
3. Veja logs em: Actions → Deploy Connect IA

### **Site não carrega:**
1. Verifique se SSL está ativo
2. Confirme arquivos em `/public_html/`
3. Teste: https://connectia.agenciapixel.digital

### **Build falha:**
1. Execute `npm run lint` localmente
2. Corrija erros de código
3. Faça commit das correções

---

## 📱 **PRÓXIMOS PASSOS**

### **Após Deploy:**
1. **Teste o site**: https://connectia.agenciapixel.digital
2. **Configure SSL** na Hostinger (se necessário)
3. **Configure URLs** no Meta for Developers
4. **Configure variáveis** no Supabase
5. **Teste integrações** (WhatsApp, Instagram, etc.)

### **Desenvolvimento Contínuo:**
1. **Faça mudanças** no código
2. **Commit e push**: `git add . && git commit -m "Mudança" && git push`
3. **Deploy automático** acontece
4. **Teste** no site em produção

---

## 🎉 **PARABÉNS!**

Seu sistema Connect IA está **100% configurado** para:

- ✅ **Deploy automático** com Git
- ✅ **Build otimizado** para produção
- ✅ **Integração completa** com Hostinger
- ✅ **Monitoramento** via GitHub Actions
- ✅ **Rollback fácil** se necessário

**Agora é só desenvolver e fazer push! 🚀**

---

## 📞 **SUPORTE**

- **GitHub Issues**: [Criar issue](https://github.com/SEU_USUARIO/connect-ia/issues)
- **Hostinger**: [Suporte](https://support.hostinger.com)
- **GitHub Actions**: [Documentação](https://docs.github.com/en/actions)

---

**Desenvolvido com ❤️ para revolucionar o marketing digital!**