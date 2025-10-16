# 🚀 CONFIGURAÇÃO HOSTINGER - CONNECT IA
# Domínio: connectia.agenciapixel.digital

## 📋 **OPÇÕES DE DEPLOY AUTOMÁTICO**

### **1. 🎯 MÉTODO RECOMENDADO: SCRIPT AUTOMÁTICO**

#### **Como usar:**
```bash
# 1. Editar as credenciais no script
nano deploy-hostinger.sh

# 2. Alterar estas linhas:
FTP_USER="seu_usuario_ftp"        # Seu usuário FTP da Hostinger
FTP_PASS="sua_senha_ftp"          # Sua senha FTP da Hostinger

# 3. Executar o script
./deploy-hostinger.sh
```

#### **O que o script faz:**
- ✅ Build automático do projeto
- ✅ Backup do servidor antes do deploy
- ✅ Upload via FTP seguro
- ✅ Verificação se o site está funcionando
- ✅ Limpeza de arquivos antigos
- ✅ Logs coloridos e informativos

---

### **2. 🔄 GITHUB ACTIONS (DEPLOY CONTÍNUO)**

#### **Criar arquivo `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build project
      run: npm run build
      
    - name: Deploy to Hostinger
      uses: SamKirkland/FTP-Deploy-Action@4.3.3
      with:
        server: ftp.connectia.agenciapixel.digital
        username: ${{ secrets.HOSTINGER_USERNAME }}
        password: ${{ secrets.HOSTINGER_PASSWORD }}
        local-dir: ./dist/
        server-dir: /public_html/
        
    - name: Notify deployment
      run: echo "✅ Deploy concluído para https://connectia.agenciapixel.digital"
```

#### **Configurar no GitHub:**
1. Vá em: Repository → Settings → Secrets and variables → Actions
2. Adicione:
   - `HOSTINGER_USERNAME`: Seu usuário FTP
   - `HOSTINGER_PASSWORD`: Sua senha FTP

---

### **3. 📱 HOSTINGER FILE MANAGER (MANUAL)**

#### **Via hPanel:**
1. Acesse: hPanel → File Manager
2. Navegue até `public_html/`
3. Faça upload da pasta `dist/`
4. Mova os arquivos para a raiz de `public_html/`

#### **Via App Mobile:**
1. Baixe o app "Hostinger" na Play Store/App Store
2. Conecte sua conta
3. Use "File Manager" para upload
4. Faça upload da pasta `dist/`

---

## 🔧 **CONFIGURAÇÕES ESPECÍFICAS DA HOSTINGER**

### **1. 📁 ESTRUTURA DE ARQUIVOS**
```
public_html/
├── index.html
├── favicon.ico
├── robots.txt
├── placeholder.svg
└── assets/
    ├── index-4UT7fDzW.css
    ├── ui-CDRV4mmj.js
    ├── vendor-BNoTEEtH.js
    ├── supabase-wbh-WGy_.js
    └── index-CylTHggT.js
```

### **2. 🔒 CONFIGURAÇÃO SSL**
1. Acesse: hPanel → SSL
2. Ative "Let's Encrypt SSL"
3. Configure redirecionamento HTTP → HTTPS
4. Teste: `https://connectia.agenciapixel.digital`

### **3. ⚙️ CONFIGURAÇÃO PHP (se necessário)**
Criar arquivo `.htaccess`:
```apache
RewriteEngine On

# Handle React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security Headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"

# Cache Control
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>

# Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### **4. 🗄️ CONFIGURAÇÃO DO BANCO DE DADOS**
1. Acesse: hPanel → MySQL Databases
2. Crie um banco para o Connect IA (opcional, pois usa Supabase)
3. Configure as credenciais se necessário

---

## 🎯 **MÉTODO MAIS RÁPIDO**

### **Para deploy imediato:**
```bash
# 1. Executar o script automático
./deploy-hostinger.sh

# 2. Aguardar o upload (2-5 minutos)

# 3. Testar o site
curl -I https://connectia.agenciapixel.digital
```

### **Para deploy contínuo:**
1. **Criar repositório no GitHub**
2. **Fazer push do código**
3. **Configurar GitHub Actions**
4. **Deploy automático a cada push!**

---

## 📊 **VANTAGENS DE CADA MÉTODO**

| Método | Velocidade | Automação | Complexidade | Recomendado |
|--------|------------|-----------|--------------|-------------|
| Script Local | ⚡ Rápido | ❌ Manual | 🟢 Simples | ✅ Sim |
| GitHub Actions | ⚡ Rápido | ✅ Automático | 🟡 Médio | ✅ Sim |
| File Manager | 🐌 Lento | ❌ Manual | 🟢 Simples | ❌ Não |
| App Mobile | 🐌 Lento | ❌ Manual | 🟢 Simples | ❌ Não |

---

## 🚀 **PRÓXIMOS PASSOS**

### **1. Deploy Imediato:**
```bash
# Executar agora
./deploy-hostinger.sh
```

### **2. Deploy Contínuo:**
1. Criar repositório GitHub
2. Configurar GitHub Actions
3. Push do código
4. Deploy automático!

### **3. Configurações Pós-Deploy:**
1. Ativar SSL no hPanel
2. Configurar URLs no Meta for Developers
3. Configurar variáveis no Supabase
4. Testar todas as funcionalidades

---

## 🎉 **RESUMO**

**O Connect IA está pronto para deploy na Hostinger!**

- ✅ **Script automático** criado
- ✅ **GitHub Actions** configurado
- ✅ **Instruções detalhadas** fornecidas
- ✅ **Configurações específicas** da Hostinger

**Escolha seu método preferido e faça o deploy!** 🚀
