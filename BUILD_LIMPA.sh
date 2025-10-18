#!/bin/bash

echo "🧹 LIMPEZA TOTAL DO PROJETO"
echo "=============================="

# 1. Deletar caches
echo "📦 Deletando caches..."
rm -rf node_modules/.vite
rm -rf dist
rm -rf .next
rm -rf out
rm -rf build

echo "✅ Caches deletados!"

# 2. Verificar se npm está disponível
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado! Certifique-se de que Node.js está instalado."
    exit 1
fi

# 3. Reinstalar dependências (opcional, mas recomendado)
echo ""
echo "📦 Reinstalando dependências..."
npm install

echo ""
echo "🔨 Fazendo build de produção..."
npm run build

echo ""
echo "✅ BUILD COMPLETA!"
echo ""
echo "Agora execute:"
echo "  npm run dev"
echo ""
