#!/bin/bash

echo "🚀 BUILDING CONNECT IA FOR PRODUCTION"
echo "======================================"

# Configurar PATH para Node.js
export PATH="./node-v20.11.0-darwin-x64/bin:$PATH"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se há erros de linting
echo "🔍 Verificando código..."
npm run lint

# Build para produção
echo "🏗️  Fazendo build para produção..."
npm run build

# Verificar se o build foi bem-sucedido
if [ -d "dist" ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Arquivos gerados em: ./dist/"
    echo ""
    echo "📊 Tamanho dos arquivos:"
    du -sh dist/*
    echo ""
    echo "🎯 Próximos passos:"
    echo "1. Upload dos arquivos da pasta 'dist' para o servidor"
    echo "2. Configurar SSL/HTTPS"
    echo "3. Configurar URLs no Meta for Developers"
    echo "4. Configurar variáveis de ambiente no Supabase"
    echo ""
    echo "🌐 URLs configuradas para: connectia.agenciapixel.digital"
else
    echo "❌ Erro no build. Verifique os logs acima."
    exit 1
fi

echo "🎉 BUILD CONCLUÍDO!"
