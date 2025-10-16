# Changelog - Connect IA

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [2.0.0] - 2024-10-26

### 🎯 Adicionado
- **Sistema de Campanhas Melhorado**
  - Sugestões de IA focadas em tipo de campanha
  - Configuração de público no editor de fluxo
  - Sugestões inteligentes por categoria (marketing, sales, support, etc.)
  - Performance histórica baseada em analytics

- **Editor de Fluxo Expandido**
  - Seção "Configuração de Público" com 5 tipos diferentes
  - Sugestões de IA específicas por tipo de público
  - Tamanho estimado dinâmico de contatos
  - Critérios de segmentação automáticos

- **Página de Contatos Expandida**
  - Tab "Prospects" com funcionalidades completas
  - Busca e filtros por nome, notas e estágio
  - Seleção múltipla de prospects
  - Exportação em lote
  - Integração com modal de oportunidades

### 🔄 Modificado
- **CRM Reorganizado**
  - Pipeline focado apenas no visual (Kanban)
  - Removida lista de prospects (movida para Contatos)
  - Layout mais limpo com cards elegantes
  - Analytics mantidos e otimizados

- **Sugestões de IA Otimizadas**
  - Removido timing, público e métricas da criação
  - Foco em conteúdo e tipo de campanha
  - Sugestões contextuais por categoria
  - Visibilidade controlada (apenas quando solicitada)

- **Sistema de Campanhas**
  - Campo `target_audience` removido da criação
  - Seleção de público movida para editor de fluxo
  - Foco em campanhas orgânicas (removido budget/conversão)
  - IA assistente focada em relacionamento

### 🐛 Corrigido
- **Pipeline Duplicado no CRM**
  - Removida seção duplicada de estágios
  - Layout único e limpo
  - Visual elegante mantido

- **Visibilidade das Sugestões de IA**
  - Sugestões aparecem apenas quando solicitadas
  - useEffect para limpar sugestões ao abrir dialog
  - Comportamento consistente

- **Erros TypeScript**
  - Referências ao `target_audience` corrigidas
  - Estados de formulário completos
  - Tipos de dados consistentes

### 🗑️ Removido
- **Campo de Público-Alvo** da criação de campanhas
- **Tab "Lista de Prospects"** do CRM
- **Seção Overview duplicada** do pipeline
- **Campos de Budget e Meta de Conversão** das campanhas
- **Sugestões de timing/público** da criação de campanhas

---

## [1.0.0] - 2024-10-25

### 🎯 Adicionado
- **Sistema de Atendentes Completo**
  - Gestão de atendentes (CRUD)
  - Dashboard em tempo real
  - Sessões de atendimento
  - Métricas de performance
  - Sistema de notas e feedback

- **Sistema de CRM Básico**
  - Pipeline de vendas
  - Gestão de prospects
  - Analytics básicos
  - Integração com Google Places

- **Sistema de Campanhas**
  - Criação de campanhas
  - Editor de fluxo básico
  - Templates pré-definidos
  - Analytics de campanhas

- **Integrações**
  - WhatsApp (Evolution API)
  - Instagram (Meta OAuth)
  - Google Places API
  - Supabase (Backend)

- **Interface Principal**
  - Dashboard principal
  - Sistema de navegação
  - Gestão de organizações
  - Autenticação e autorização

### 🔄 Modificado
- **Estrutura do Projeto**
  - Migração para TypeScript
  - Implementação de React Query
  - Sistema de roteamento
  - Componentes UI padronizados

### 🐛 Corrigido
- **Problemas de Autenticação**
- **Erros de Navegação**
- **Problemas de Performance**

---

## Notas de Versão

### Versionamento
- **Major** (X.0.0): Mudanças incompatíveis na API
- **Minor** (X.Y.0): Funcionalidades adicionadas de forma compatível
- **Patch** (X.Y.Z): Correções de bugs compatíveis

### Convenções
- 🎯 **Adicionado**: Novas funcionalidades
- 🔄 **Modificado**: Mudanças em funcionalidades existentes
- 🐛 **Corrigido**: Correções de bugs
- 🗑️ **Removido**: Funcionalidades removidas
- 🔒 **Segurança**: Melhorias de segurança
- 📚 **Documentação**: Atualizações na documentação

---

**Última atualização:** 2024-10-26  
**Próxima versão planejada:** 2.1.0 (Melhorias no Editor de Fluxo)

