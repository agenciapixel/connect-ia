#!/bin/bash

# Script de deploy para Hostinger Git Deploy
echo "🚀 CONNECT IA - DEPLOY SCRIPT"
echo "============================="

# Verificar se npm está disponível
if command -v npm &> /dev/null; then
    echo "📦 npm encontrado, instalando dependências..."
    npm install
    
    echo "🏗️ Fazendo build..."
    npm run build
else
    echo "⚠️ npm não encontrado, tentando usar Node.js diretamente..."
    
    # Tentar encontrar Node.js
    if command -v node &> /dev/null; then
        echo "📦 Node.js encontrado, tentando build manual..."
        
        # Criar diretório dist se não existir
        mkdir -p dist
        
        # Copiar arquivos estáticos básicos
        if [ -f "index.html" ]; then
            cp index.html dist/
        fi
        
        # Se não conseguir fazer build, pelo menos copiar arquivos básicos
        echo "⚠️ Build manual limitado, copiando arquivos básicos..."
    else
        echo "❌ Node.js não encontrado, copiando arquivos estáticos..."
        
        # Criar estrutura básica
        mkdir -p dist
        mkdir -p public_html
        
        # Copiar arquivos HTML básicos se existirem
        if [ -f "index.html" ]; then
            cp index.html dist/
        fi
    fi
fi

# Criar diretório public_html se não existir
mkdir -p public_html

# Copiar arquivos para public_html
echo "📁 Copiando arquivos para public_html..."
if [ -d "dist" ]; then
    cp -r dist/* public_html/ 2>/dev/null || echo "⚠️ Erro ao copiar dist/, tentando arquivos individuais..."
    
    # Tentar copiar arquivos individuais se a cópia em massa falhar
    if [ ! -f "public_html/index.html" ]; then
        echo "📄 Copiando arquivos individuais..."
        find dist -type f -exec cp {} public_html/ \; 2>/dev/null || true
    fi
else
    echo "⚠️ Diretório dist não encontrado, copiando arquivos do projeto..."
    cp -r src public_html/ 2>/dev/null || true
    cp index.html public_html/ 2>/dev/null || true
fi

# Copiar .htaccess se existir
if [ -f "public/.htaccess" ]; then
    echo "📄 Copiando .htaccess..."
    cp public/.htaccess public_html/
elif [ -f ".htaccess" ]; then
    echo "📄 Copiando .htaccess da raiz..."
    cp .htaccess public_html/
fi

# Criar .htaccess básico se não existir
if [ ! -f "public_html/.htaccess" ]; then
    echo "📄 Criando .htaccess básico..."
    cat > public_html/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOF
fi

echo "✅ Deploy concluído!"
echo "🌐 Site: https://connectia.agenciapixel.digital"
echo "📁 Arquivos em: public_html/"