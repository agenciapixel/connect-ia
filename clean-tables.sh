#!/bin/bash

# Script para limpeza forçada das tabelas Supabase
# Sempre executa após alterações

echo "🧹 FORÇANDO LIMPEZA COMPLETA DAS TABELAS..."

# 1. Parar Supabase
echo "⏹️ Parando Supabase..."
supabase stop

# 2. Remover volumes Docker
echo "🗑️ Removendo volumes Docker..."
docker volume rm supabase_db_Connect_IA supabase_storage_Connect_IA supabase_edge_runtime_Connect_IA 2>/dev/null || true

# 3. Iniciar Supabase (vai aplicar todas as migrações)
echo "🚀 Iniciando Supabase com limpeza..."
supabase start

# 4. Verificar status
echo "✅ Verificando status..."
supabase status

echo "🎉 LIMPEZA COMPLETA FINALIZADA!"
echo "📊 Sistema pronto para teste"
