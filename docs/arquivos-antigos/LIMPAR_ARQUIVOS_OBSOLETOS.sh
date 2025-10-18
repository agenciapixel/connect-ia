#!/bin/bash

# =====================================================
# SCRIPT DE LIMPEZA DE ARQUIVOS OBSOLETOS
# Data: 18/10/2025
#
# Este script remove arquivos de documentação obsoletos
# que não afetam o funcionamento do sistema
# =====================================================

echo "=========================================="
echo "🧹 LIMPEZA DE ARQUIVOS OBSOLETOS"
echo "=========================================="
echo ""

# Contador
DELETED_COUNT=0

# Função para deletar arquivo
delete_file() {
  if [ -f "$1" ]; then
    echo "🗑️  Deletando: $1"
    rm "$1"
    ((DELETED_COUNT++))
  fi
}

echo "📋 ARQUIVOS QUE SERÃO DELETADOS:"
echo ""
echo "Documentação Obsoleta:"
echo "  - APLICAR_AGORA.md (substituído por LEIA_PRIMEIRO.md)"
echo "  - BUILD_GUIDE.md (substituído por COMANDOS_RAPIDOS.md)"
echo "  - COMANDOS_BUILD.md (substituído por COMANDOS_RAPIDOS.md)"
echo "  - COMO_FAZER_BUILD.md (substituído por COMANDOS_RAPIDOS.md)"
echo "  - CORRIGIR_ERRO_500.md (problema resolvido)"
echo "  - DEBUG_ROLE_ISSUE.md (problema resolvido)"
echo "  - DEV_TESTING_GUIDE.md (cache removido, não mais necessário)"
echo "  - FLUXO_CRIACAO_AUTOMATICA.md (sistema de demo removido)"
echo "  - GUIA_DEMO_AUTOMATICA.md (sistema de demo removido)"
echo "  - REINICIAR_SERVIDOR.md (incluído em COMANDOS_RAPIDOS.md)"
echo "  - RESET_AUTH_GUIDE.md (sistema antigo removido)"
echo "  - RESUMO_DEMO_AUTOMATICA.md (sistema de demo removido)"
echo "  - RESUMO_MUDANCAS_v1.1.0.md (incluído em RESUMO_SESSAO.md)"
echo "  - SISTEMA_COMERCIAL_GUIDE.md (não implementado)"
echo "  - TESTE_CORRECAO_ROLE.md (testes antigos)"
echo "  - TESTE_SISTEMA_SIMPLES.md (testes antigos)"
echo "  - VER_LOGS_TRIGGER.md (incluído em COMANDOS_DATABASE.md)"
echo ""
echo "Scripts Obsoletos:"
echo "  - build-dev.sh (substituído por BUILD_LIMPA.sh)"
echo "  - build-prod.sh (substituído por npm run build)"
echo ""
echo "SQL Obsoleto:"
echo "  - DIAGNOSTICO_SISTEMA.sql (diagnóstico antigo)"
echo "  - verificar_usuario_criado.sql (verificação antiga)"
echo ""
echo "=========================================="
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  echo "❌ Operação cancelada pelo usuário"
  exit 1
fi

echo ""
echo "🗑️  Deletando arquivos..."
echo ""

# Documentação Obsoleta
delete_file "APLICAR_AGORA.md"
delete_file "BUILD_GUIDE.md"
delete_file "COMANDOS_BUILD.md"
delete_file "COMO_FAZER_BUILD.md"
delete_file "CORRIGIR_ERRO_500.md"
delete_file "DEBUG_ROLE_ISSUE.md"
delete_file "DEV_TESTING_GUIDE.md"
delete_file "FLUXO_CRIACAO_AUTOMATICA.md"
delete_file "GUIA_DEMO_AUTOMATICA.md"
delete_file "REINICIAR_SERVIDOR.md"
delete_file "RESET_AUTH_GUIDE.md"
delete_file "RESUMO_DEMO_AUTOMATICA.md"
delete_file "RESUMO_MUDANCAS_v1.1.0.md"
delete_file "SISTEMA_COMERCIAL_GUIDE.md"
delete_file "TESTE_CORRECAO_ROLE.md"
delete_file "TESTE_SISTEMA_SIMPLES.md"
delete_file "VER_LOGS_TRIGGER.md"

# Scripts Obsoletos
delete_file "build-dev.sh"
delete_file "build-prod.sh"

# SQL Obsoleto
delete_file "DIAGNOSTICO_SISTEMA.sql"
delete_file "verificar_usuario_criado.sql"

echo ""
echo "=========================================="
echo "✅ LIMPEZA CONCLUÍDA!"
echo "=========================================="
echo ""
echo "📊 Arquivos deletados: $DELETED_COUNT"
echo ""
echo "📚 ARQUIVOS MANTIDOS (Úteis):"
echo ""
echo "Documentação Essencial:"
echo "  ✅ LEIA_PRIMEIRO.md - Índice geral"
echo "  ✅ COMANDOS_RAPIDOS.md - Comandos copy-paste"
echo "  ✅ SISTEMA_ATUAL.md - Estado atual do sistema"
echo "  ✅ GUIA_RAPIDO_DESENVOLVIMENTO.md - Guia de desenvolvimento"
echo "  ✅ COMANDOS_DATABASE.md - Queries SQL completas"
echo "  ✅ RESUMO_SESSAO.md - Resumo da última sessão"
echo "  ✅ CLAUDE.md - Documentação completa do projeto"
echo "  ✅ README.md - Documentação inicial"
echo ""
echo "Scripts Úteis:"
echo "  ✅ BUILD_LIMPA.sh - Build limpa com cache zerado"
echo ""
echo "SQL Útil:"
echo "  ✅ LIMPAR_SUPABASE_COMPLETO.sql - Reset do banco"
echo "  ✅ dados_exemplo.sql - Dados iniciais"
echo "  ✅ adicionar_mais_dados.sql - Mais dados de teste"
echo ""
echo "=========================================="
echo "✅ Sistema limpo e organizado!"
echo "=========================================="
