#!/bin/bash

# Script para executar o Connect IA localmente
# Autor: Agência Pixel
# Data: $(date)

echo "🚀 Connect IA - Servidor Local"
echo "================================"
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

echo "✅ Build encontrado em: dist/"
echo ""

# Verificar se Python está disponível
if ! command -v python3 &> /dev/null; then
    echo "❌ Erro: Python3 não encontrado"
    echo "   Instale Python3 ou use outro servidor HTTP"
    exit 1
fi

echo "🌐 Iniciando servidor local..."
echo "   URL: http://localhost:8080"
echo "   Pasta: $(pwd)/dist"
echo ""
echo "📋 Para parar o servidor: Ctrl+C"
echo "================================"
echo ""

# Entrar na pasta dist e iniciar servidor
cd dist
python3 -m http.server 8080
