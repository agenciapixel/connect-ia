# 🚀 **DEPLOY MANUAL PARA HOSTINGER**

## 📋 **SITUAÇÃO ATUAL**

✅ **Git Deploy funcionando** - Hostinger detecta mudanças  
❌ **Build não executado** - npm não disponível no servidor  
❌ **Arquivos não copiados** - Site mostra página padrão  

## 🔧 **SOLUÇÃO: DEPLOY MANUAL**

### **Opção 1: Deploy Manual Local**

#### **Passo 1: Fazer Build Local**
```bash
# No seu computador
cd "/Users/ricardodasilva/Documents/Connect IA"
export PATH="./node-v20.11.0-darwin-x64/bin:$PATH"
npm run build
```

#### **Passo 2: Upload via FTP**
1. **Acesse o hPanel da Hostinger**
2. Vá em **"File Manager"**
3. Navegue até **`public_html`**
4. **Delete todos os arquivos** existentes
5. **Upload da pasta `dist`** completa
6. **Upload do arquivo** `public/.htaccess`

#### **Passo 3: Verificar**
- Acesse: https://connectia.agenciapixel.digital
- Deve mostrar o Connect IA funcionando

---

### **Opção 2: Script Automatizado**

#### **Passo 1: Configurar Credenciais**
Edite o arquivo `deploy-manual.sh`:
```bash
FTP_USER="seu_usuario_ftp"
FTP_PASS="sua_senha_ftp"
```

#### **Passo 2: Executar Script**
```bash
chmod +x deploy-manual.sh
./deploy-manual.sh
```

---

## 📁 **ARQUIVOS NECESSÁRIOS**

### **Da pasta `dist/`:**
- `index.html` (arquivo principal)
- `assets/` (CSS, JS, imagens)
- Todos os arquivos gerados pelo Vite

### **Arquivo `.htaccess`:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 🔍 **VERIFICAÇÃO**

### **URLs que devem funcionar:**
- ✅ Site principal: `https://connectia.agenciapixel.digital`
- ✅ Privacy Policy: `https://connectia.agenciapixel.digital/privacy-policy`
- ✅ Terms: `https://connectia.agenciapixel.digital/terms`
- ✅ Integrations: `https://connectia.agenciapixel.digital/integrations`

### **Teste de funcionamento:**
```bash
curl -I https://connectia.agenciapixel.digital
# Deve retornar HTTP/2 200
```

---

## ⚠️ **PROBLEMA ATUAL**

O Git Deploy da Hostinger está funcionando, mas:
- **npm não está disponível** no servidor
- **Script não executa** o build
- **Arquivos não são copiados** para `public_html`

## 🎯 **SOLUÇÃO RECOMENDADA**

**Deploy manual** é a solução mais rápida e confiável:

1. **Build local** (já feito ✅)
2. **Upload via File Manager** (5 minutos)
3. **Site funcionando** imediatamente

---

## 📞 **PRÓXIMOS PASSOS**

1. **Faça o deploy manual** agora
2. **Teste o site** funcionando
3. **Configure o Meta for Developers** (usar o guia)
4. **Sistema 100% funcional** em produção

**🎉 Com deploy manual, você terá o site funcionando em 5 minutos!**
