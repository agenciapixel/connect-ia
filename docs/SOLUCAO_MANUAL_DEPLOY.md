# 🔧 **SOLUÇÃO MANUAL PARA DEPLOY DOS ARQUIVOS**

## **⚠️ PROBLEMA IDENTIFICADO**

O erro `main.tsx:1 Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/plain"` indica que:

1. **Arquivo JavaScript não encontrado** (404)
2. **Deploy automático** não está funcionando corretamente
3. **Arquivos não estão** no servidor

## **🔍 DIAGNÓSTICO**

### **Status Atual:**
- ✅ **Página principal:** Funcionando (200 OK)
- ❌ **Arquivos JavaScript:** Não encontrados (404)
- ❌ **Arquivos CSS:** Não encontrados (404)
- ✅ **GitHub Actions:** Funcionando (build completo)

### **Causa Raiz:**
O **Hostinger Git Deploy** não está copiando os arquivos da pasta `dist/` para o servidor corretamente.

---

## **🚀 SOLUÇÃO MANUAL - DEPLOY DIRETO**

### **OPÇÃO 1: Upload via File Manager (Recomendado)**

**1. Acessar Hostinger File Manager:**
1. **Login** no painel da Hostinger
2. **Vá em:** File Manager
3. **Navegue para:** `public_html/connectia/`

**2. Fazer Backup (Segurança):**
```bash
# Renomear pasta atual
mv public_html/connectia public_html/connectia_backup_$(date +%Y%m%d_%H%M%S)
```

**3. Criar Nova Pasta:**
```bash
mkdir public_html/connectia
```

**4. Upload dos Arquivos:**
- **Baixar** os arquivos da pasta `dist/` do repositório
- **Upload** todos os arquivos para `public_html/connectia/`

**Arquivos Necessários:**
```
public_html/connectia/
├── index.html
├── assets/
│   ├── index-AY6h670N.js
│   └── index-BE4tGbRk.css
├── favicon.ico
├── .htaccess
└── placeholder.svg
```

### **OPÇÃO 2: Download e Upload via ZIP**

**1. Download do Repositório:**
```bash
# Download do ZIP do GitHub
https://github.com/agenciapixel/connect-ia/archive/refs/heads/main.zip
```

**2. Extrair e Upload:**
1. **Extrair** o arquivo ZIP
2. **Copiar** conteúdo da pasta `dist/`
3. **Upload** para `public_html/connectia/`

---

## **📋 CHECKLIST DE DEPLOY MANUAL**

### **Antes do Upload:**
- [ ] Fazer backup da pasta atual
- [ ] Verificar se todos os arquivos estão na pasta `dist/`
- [ ] Confirmar que o arquivo `.htaccess` está incluído

### **Arquivos Obrigatórios:**
- [ ] `index.html` (página principal)
- [ ] `assets/index-AY6h670N.js` (JavaScript corrigido)
- [ ] `assets/index-BE4tGbRk.css` (CSS)
- [ ] `favicon.ico` (ícone)
- [ ] `.htaccess` (configurações Apache)
- [ ] `placeholder.svg` (imagem placeholder)

### **Após o Upload:**
- [ ] Testar página principal: `https://connectia.agenciapixel.digital/`
- [ ] Testar arquivo JavaScript: `https://connectia.agenciapixel.digital/assets/index-AY6h670N.js`
- [ ] Testar arquivo CSS: `https://connectia.agenciapixel.digital/assets/index-BE4tGbRk.css`
- [ ] Verificar se não há erros no console do navegador

---

## **🧪 TESTES APÓS DEPLOY**

### **1. Teste da Página Principal:**
```bash
curl -I https://connectia.agenciapixel.digital/
# Deve retornar: HTTP/2 200
```

### **2. Teste do JavaScript:**
```bash
curl -I https://connectia.agenciapixel.digital/assets/index-AY6h670N.js
# Deve retornar: HTTP/2 200
# Content-Type: application/javascript
```

### **3. Teste do CSS:**
```bash
curl -I https://connectia.agenciapixel.digital/assets/index-BE4tGbRk.css
# Deve retornar: HTTP/2 200
# Content-Type: text/css
```

### **4. Teste no Navegador:**
1. **Acessar:** https://connectia.agenciapixel.digital/
2. **Abrir** Developer Tools (F12)
3. **Verificar** se não há erros no Console
4. **Confirmar** que a página carrega corretamente

---

## **🔧 CONFIGURAÇÃO DO HOSTINGER GIT DEPLOY**

### **Se Quiser Corrigir o Deploy Automático:**

**1. Verificar Configurações:**
- **Build Command:** `npm install && npm run build`
- **Deploy Command:** `cp -r dist/* .`
- **Deploy Directory:** `public_html/connectia`

**2. Testar Deploy:**
1. **Fazer** um pequeno commit
2. **Verificar** se os arquivos são copiados
3. **Testar** se funcionam no servidor

---

## **⚠️ IMPORTANTE**

### **Por que Deploy Manual é Necessário:**
- **Hostinger Git Deploy** pode ter limitações
- **Arquivos não estão** sendo copiados automaticamente
- **Deploy manual** garante que tudo funcione
- **Mais controle** sobre o que é deployado

### **Vantagens do Deploy Manual:**
- ✅ **Controle total** sobre os arquivos
- ✅ **Deploy imediato** sem esperar automação
- ✅ **Verificação** de cada arquivo
- ✅ **Backup** automático antes do deploy

---

## **🎯 RESULTADO ESPERADO**

Após o deploy manual:
- ✅ **Página principal** carrega sem erros
- ✅ **JavaScript** é servido com MIME type correto
- ✅ **CSS** é carregado corretamente
- ✅ **Site funciona** completamente
- ✅ **Erro de MIME type** é resolvido

---

**🚀 Esta solução manual vai resolver definitivamente o problema do MIME type e fazer o site funcionar corretamente.**
