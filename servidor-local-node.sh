#!/bin/bash

# Script para executar o Connect IA localmente com Node.js
# Autor: Agência Pixel
# Data: $(date)

echo "🚀 Connect IA - Servidor Local (Node.js)"
echo "========================================"
echo ""

# Verificar se estamos na pasta correta
if [ ! -f "dist/index.html" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto"
    echo "   Pasta atual: $(pwd)"
    echo "   Arquivo esperado: dist/index.html"
    exit 1
fi

# Verificar se o build existe
if [ ! -d "dist" ]; then
    echo "❌ Erro: Pasta 'dist' não encontrada"
    echo "   Execute primeiro: npm run build"
    exit 1
fi

# Configurar Node.js local se necessário
if ! command -v node &> /dev/null; then
    echo "🔧 Configurando Node.js local..."
    export PATH="$(pwd)/node-v20.11.0-darwin-x64/bin:$PATH"
    
    if [ ! -f "node-v20.11.0-darwin-x64/bin/node" ]; then
        echo "❌ Erro: Node.js local não encontrado"
        echo "   Execute primeiro: ./baixar-nodejs.sh"
        exit 1
    fi
fi

echo "✅ Node.js encontrado: $(node --version)"
echo "✅ Build encontrado em: dist/"
echo ""

echo "🌐 Iniciando servidor local..."
echo "   URL: http://localhost:3000"
echo "   Pasta: $(pwd)/dist"
echo ""
echo "📋 Para parar o servidor: Ctrl+C"
echo "========================================"
echo ""

# Entrar na pasta dist e iniciar servidor
cd dist
npx serve -p 3000
