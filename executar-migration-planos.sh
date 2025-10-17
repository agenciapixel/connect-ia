#!/bin/bash

# Script para executar a migration de planos e controle de uso
# Data: 2024-12-01

echo "🚀 Executando migration de planos e controle de uso..."

# Verificar se estamos no diretório correto
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Erro: Supabase CLI não encontrado"
    echo "📦 Instale com: npm install -g supabase"
    exit 1
fi

echo "📊 Verificando status do Supabase..."

# Verificar se o projeto está linkado
if ! supabase status &> /dev/null; then
    echo "❌ Erro: Projeto Supabase não está linkado"
    echo "🔗 Execute: supabase link --project-ref SEU_PROJECT_REF"
    exit 1
fi

echo "✅ Projeto Supabase linkado"

# Executar a migration
echo "🔄 Executando migration..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration executada com sucesso!"
    echo ""
    echo "📋 O que foi criado:"
    echo "   • Tabela 'plans' com 4 planos comerciais"
    echo "   • Tabela 'usage_tracking' para controle de uso"
    echo "   • Colunas adicionais na tabela 'orgs'"
    echo "   • Funções para verificação de limites"
    echo "   • Políticas RLS para segurança"
    echo ""
    echo "🎯 Próximos passos:"
    echo "   1. Teste os componentes no frontend"
    echo "   2. Configure integração de pagamento"
    echo "   3. Implemente notificações de limite"
    echo ""
    echo "🔍 Para verificar os dados:"
    echo "   • Plans: SELECT * FROM plans;"
    echo "   • Usage: SELECT * FROM usage_tracking;"
    echo "   • Orgs: SELECT id, name, plan_id, subscription_status FROM orgs;"
else
    echo "❌ Erro ao executar migration"
    echo "🔍 Verifique os logs acima para mais detalhes"
    exit 1
fi
