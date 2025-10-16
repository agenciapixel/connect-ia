#!/bin/bash

# Script de deploy para Hostinger Git Deploy
echo "🚀 CONNECT IA - DEPLOY SCRIPT"
echo "============================="

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🏗️ Fazendo build..."
npm run build

# Copiar arquivos para public_html
echo "📁 Copiando arquivos..."
cp -r dist/* public_html/

# Copiar .htaccess se existir
if [ -f "public/.htaccess" ]; then
    echo "📄 Copiando .htaccess..."
    cp public/.htaccess public_html/
fi

echo "✅ Deploy concluído!"
echo "🌐 Site: https://connectia.agenciapixel.digital"
