# 🚀 CONFIGURAÇÃO DE DEPLOY - CONNECT IA
# Domínio: connectia.agenciapixel.digital

## 📋 CHECKLIST DE DEPLOY

### ✅ **1. BUILD DE PRODUÇÃO**
```bash
# Instalar dependências
npm install

# Build para produção
npm run build

# Testar build localmente
npm run preview
```

### ✅ **2. CONFIGURAÇÕES DE DOMÍNIO**

#### **URLs Principais:**
- **Site Principal**: https://connectia.agenciapixel.digital
- **Integrações**: https://connectia.agenciapixel.digital/integrations
- **API Webhooks**: https://connectia.agenciapixel.digital/api/webhooks/

#### **URLs de Redirecionamento OAuth (Meta):**
- **Redirect URI**: https://connectia.agenciapixel.digital/integrations
- **Success Redirect**: https://connectia.agenciapixel.digital/integrations?success=true
- **Error Redirect**: https://connectia.agenciapixel.digital/integrations?error=true

### ✅ **3. CONFIGURAÇÕES NO META FOR DEVELOPERS**

#### **App Settings → Basic:**
- **App Domains**: `connectia.agenciapixel.digital`
- **Privacy Policy URL**: `https://connectia.agenciapixel.digital/privacy`
- **Terms of Service URL**: `https://connectia.agenciapixel.digital/terms`

#### **App Settings → Advanced:**
- **Valid OAuth Redirect URIs**:
  - `https://connectia.agenciapixel.digital/integrations`
  - `https://connectia.agenciapixel.digital/integrations?success=true`
  - `https://connectia.agenciapixel.digital/integrations?error=true`

#### **WhatsApp → Configuration:**
- **Webhook URL**: `https://connectia.agenciapixel.digital/api/webhooks/whatsapp`
- **Verify Token**: (use o mesmo do .env)

#### **Instagram → Basic Display:**
- **Valid OAuth Redirect URIs**: `https://connectia.agenciapixel.digital/integrations`
- **Deauthorize Callback URL**: `https://connectia.agenciapixel.digital/integrations?deauth=true`

### ✅ **4. CONFIGURAÇÕES NO SUPABASE**

#### **Authentication → URL Configuration:**
- **Site URL**: `https://connectia.agenciapixel.digital`
- **Redirect URLs**:
  - `https://connectia.agenciapixel.digital/**`
  - `https://connectia.agenciapixel.digital/auth/callback`

#### **Edge Functions → Environment Variables:**
```bash
# Configurar no Supabase Dashboard
META_APP_ID=670209849105494
META_APP_SECRET=your_meta_app_secret_here
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
INSTAGRAM_PAGE_ID=your_instagram_page_id_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
LOVABLE_API_KEY=your_lovable_api_key_here
```

### ✅ **5. CONFIGURAÇÕES DE SERVIDOR**

#### **Nginx Configuration:**
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name connectia.agenciapixel.digital;
    
    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Static Files
    location / {
        root /var/www/connectia.agenciapixel.digital/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API Routes (if using server-side rendering)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### **Apache Configuration (.htaccess):**
```apache
RewriteEngine On

# Handle Angular and React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security Headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

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

### ✅ **6. COMANDOS DE DEPLOY**

#### **Build e Deploy:**
```bash
# 1. Build para produção
npm run build

# 2. Upload para servidor (exemplo com rsync)
rsync -avz --delete dist/ user@connectia.agenciapixel.digital:/var/www/connectia.agenciapixel.digital/

# 3. Restart do servidor web
ssh user@connectia.agenciapixel.digital "sudo systemctl reload nginx"
```

#### **Deploy com PM2 (se usando Node.js):**
```bash
# 1. Instalar PM2
npm install -g pm2

# 2. Criar ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'connect-ia',
    script: 'npm',
    args: 'run preview',
    cwd: '/var/www/connectia.agenciapixel.digital',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# 3. Deploy
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### ✅ **7. MONITORAMENTO E LOGS**

#### **Health Check:**
```bash
# Verificar se o site está funcionando
curl -I https://connectia.agenciapixel.digital

# Verificar SSL
openssl s_client -connect connectia.agenciapixel.digital:443 -servername connectia.agenciapixel.digital
```

#### **Logs:**
```bash
# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PM2 logs (se usando)
pm2 logs connect-ia
```

### ✅ **8. BACKUP E SEGURANÇA**

#### **Backup Automático:**
```bash
# Criar script de backup
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/connectia"
mkdir -p $BACKUP_DIR

# Backup do código
tar -czf $BACKUP_DIR/connectia_code_$DATE.tar.gz /var/www/connectia.agenciapixel.digital/

# Backup do banco (Supabase já faz backup automático)
# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "connectia_code_*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Adicionar ao crontab (backup diário às 2h)
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

### ✅ **9. TESTES PÓS-DEPLOY**

#### **Checklist de Testes:**
- [ ] Site carrega corretamente
- [ ] SSL funcionando
- [ ] Login/registro funcionando
- [ ] Todas as páginas carregam
- [ ] Integrações funcionando
- [ ] Webhooks respondendo
- [ ] Performance adequada
- [ ] Mobile responsivo

#### **Comandos de Teste:**
```bash
# Teste de performance
curl -w "@curl-format.txt" -o /dev/null -s https://connectia.agenciapixel.digital

# Teste de SSL
curl -I https://connectia.agenciapixel.digital

# Teste de todas as rotas principais
curl -I https://connectia.agenciapixel.digital/dashboard
curl -I https://connectia.agenciapixel.digital/contacts
curl -I https://connectia.agenciapixel.digital/inbox
curl -I https://connectia.agenciapixel.digital/prospects
curl -I https://connectia.agenciapixel.digital/agents
curl -I https://connectia.agenciapixel.digital/campaigns
curl -I https://connectia.agenciapixel.digital/integrations
```

---

## 🎯 RESUMO FINAL

### **URLs Configuradas:**
- **Site**: https://connectia.agenciapixel.digital
- **Integrações**: https://connectia.agenciapixel.digital/integrations
- **Webhooks**: https://connectia.agenciapixel.digital/api/webhooks/

### **Próximos Passos:**
1. ✅ Configurar SSL/HTTPS
2. ✅ Fazer upload dos arquivos buildados
3. ✅ Configurar URLs no Meta for Developers
4. ✅ Configurar variáveis de ambiente no Supabase
5. ✅ Testar todas as funcionalidades
6. ✅ Configurar monitoramento

**O Connect IA está pronto para produção! 🚀**
