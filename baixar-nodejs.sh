#!/bin/bash

# Script para baixar e configurar Node.js localmente
# Autor: Agência Pixel

echo "📦 Baixando Node.js v20.11.0..."
echo "================================="

# Verificar se já existe
if [ -d "node-v20.11.0-darwin-x64" ]; then
    echo "✅ Node.js já está instalado localmente"
    echo "   Pasta: $(pwd)/node-v20.11.0-darwin-x64"
    exit 0
fi

# Baixar Node.js
echo "⬇️  Baixando Node.js v20.11.0..."
curl -o node.tar.gz https://nodejs.org/dist/v20.11.0/node-v20.11.0-darwin-x64.tar.gz

if [ $? -ne 0 ]; then
    echo "❌ Erro ao baixar Node.js"
    exit 1
fi

# Extrair
echo "📂 Extraindo arquivos..."
tar -xzf node.tar.gz

if [ $? -ne 0 ]; then
    echo "❌ Erro ao extrair Node.js"
    exit 1
fi

# Limpar arquivo temporário
rm node.tar.gz

echo "✅ Node.js instalado com sucesso!"
echo "   Versão: $(./node-v20.11.0-darwin-x64/bin/node --version)"
echo "   Pasta: $(pwd)/node-v20.11.0-darwin-x64"
echo ""
echo "🚀 Para usar: export PATH=\"$(pwd)/node-v20.11.0-darwin-x64/bin:\$PATH\""
