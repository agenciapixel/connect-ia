#!/bin/bash

# 🚀 Script de Build de Produção
# Build da branch main para deploy no Hostinger

echo "🚀 BUILD DE PRODUÇÃO - v1.1.0"
echo "============================="
echo ""

# Verificar se está na branch dev
current_branch=$(git branch --show-current)
if [ "$current_branch" = "dev-auth-cache-v1.1" ]; then
  echo "⚠️  Você está na branch de desenvolvimento."
  echo "📋 Vou fazer o merge para main agora."
  echo ""
  echo "❓ Você TESTOU a versão dev e todos os testes PASSARAM? (s/n)"
  read -r response
  if [ "$response" != "s" ] && [ "$response" != "S" ]; then
    echo "❌ Build de produção cancelado."
    echo "💡 Execute ./build-dev.sh e teste antes de continuar."
    exit 1
  fi

  echo "🔄 Mudando para branch main..."
  git checkout main

  echo "🔄 Fazendo merge da branch dev-auth-cache-v1.1..."
  git merge dev-auth-cache-v1.1

  if [ $? -ne 0 ]; then
    echo "❌ ERRO no merge! Resolva os conflitos primeiro."
    exit 1
  fi

  echo "✅ Merge concluído"
  echo ""
fi

# Verificar se está na main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
  echo "⚠️  ATENÇÃO: Você está na branch '$current_branch'"
  echo "❓ Deseja mudar para main? (s/n)"
  read -r response
  if [ "$response" = "s" ] || [ "$response" = "S" ]; then
    echo "🔄 Mudando para branch main..."
    git checkout main
  else
    echo "❌ Build cancelado."
    exit 1
  fi
fi

echo "✅ Branch: main"
echo ""

# Limpar cache
echo "🧹 Limpando cache e build anterior..."
rm -rf dist/
rm -rf node_modules/.vite
echo "✅ Cache limpo"
echo ""

# Build
echo "🏗️  Executando build de PRODUÇÃO..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ BUILD DE PRODUÇÃO CONCLUÍDO COM SUCESSO!"
  echo ""
  echo "📋 Próximos Passos:"
  echo "1. Execute: npm run preview"
  echo "2. Acesse: http://localhost:4173"
  echo "3. Faça testes finais (login, hard refresh 3x, role correto)"
  echo ""
  echo "⚠️  IMPORTANTE: Só faça o próximo passo se tudo estiver OK!"
  echo ""
  echo "❓ Deseja fazer PUSH para produção (deploy automático)? (s/n)"
  read -r response
  if [ "$response" = "s" ] || [ "$response" = "S" ]; then
    echo "🚀 Fazendo push para origin main..."
    git push origin main

    if [ $? -eq 0 ]; then
      echo ""
      echo "✅ DEPLOY REALIZADO COM SUCESSO!"
      echo ""
      echo "🌐 Acesse: https://connectia.agenciapixel.digital"
      echo ""
      echo "📋 Verificações Finais:"
      echo "1. Login funcionando"
      echo "2. Hard refresh rápido"
      echo "3. Role correto (admin)"
      echo "4. Performance boa"
    else
      echo "❌ ERRO no push! Verifique sua conexão e permissões."
      exit 1
    fi
  else
    echo "⏸️  Push cancelado."
    echo "💡 Você pode fazer push manualmente depois: git push origin main"
  fi
else
  echo ""
  echo "❌ BUILD FALHOU!"
  echo ""
  echo "🔍 Verifique os erros acima e corrija antes de continuar."
  exit 1
fi
