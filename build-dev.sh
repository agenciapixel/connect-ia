#!/bin/bash

# 🧪 Script de Build de Desenvolvimento
# Build da branch dev-auth-cache-v1.1 para testes locais

echo "🧪 BUILD DE DESENVOLVIMENTO - v1.1.0-beta"
echo "=========================================="
echo ""

# Verificar branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "dev-auth-cache-v1.1" ]; then
  echo "⚠️  ATENÇÃO: Você está na branch '$current_branch'"
  echo "❓ Deseja mudar para dev-auth-cache-v1.1? (s/n)"
  read -r response
  if [ "$response" = "s" ] || [ "$response" = "S" ]; then
    echo "🔄 Mudando para branch dev-auth-cache-v1.1..."
    git checkout dev-auth-cache-v1.1
  else
    echo "❌ Build cancelado."
    exit 1
  fi
fi

echo "✅ Branch: dev-auth-cache-v1.1"
echo ""

# Limpar cache
echo "🧹 Limpando cache e build anterior..."
rm -rf dist/
rm -rf node_modules/.vite
echo "✅ Cache limpo"
echo ""

# Build
echo "🏗️  Executando build de desenvolvimento..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ BUILD CONCLUÍDO COM SUCESSO!"
  echo ""
  echo "📋 Próximos Passos:"
  echo "1. Execute: npm run preview"
  echo "2. Acesse: http://localhost:4173"
  echo "3. Siga os testes do DEV_TESTING_GUIDE.md"
  echo ""
  echo "💡 Dica: Se todos os testes passarem, execute ./build-prod.sh"
else
  echo ""
  echo "❌ BUILD FALHOU!"
  echo ""
  echo "🔍 Verifique os erros acima e corrija antes de continuar."
  exit 1
fi
