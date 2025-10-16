# Documentação Completa - Connect IA

## 📋 Visão Geral do Projeto

**Connect IA** é uma aplicação web de marketing digital com inteligência artificial, desenvolvida com React, TypeScript e Supabase. A aplicação oferece funcionalidades de automação de marketing, chat com agentes IA, geração de conteúdo, otimização de campanhas, integração com redes sociais e sistema de CRM interno.

## 🆕 Últimas Atualizações (v2.0 - 2024-10-26)

### 🎯 Principais Melhorias Implementadas:
- **CRM Reorganizado**: Pipeline focado no visual, lista de prospects movida para Contatos
- **Sugestões de IA Otimizadas**: Foco em tipo de campanha na criação, sugestões avançadas no editor de fluxo
- **Seleção de Público**: Movida da criação para o editor de fluxo
- **Pipeline Duplicado**: Corrigido no CRM
- **Layout Melhorado**: Interface mais limpa e intuitiva

📖 **Documentação detalhada**: [docs/ALTERACOES_CRM_E_CAMPANHAS.md](./docs/ALTERACOES_CRM_E_CAMPANHAS.md)

---

## 🏗️ Arquitetura do Sistema

### Frontend
- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 3.4.17
- **Routing**: React Router DOM 6.30.1
- **State Management**: React Query (TanStack) 5.83.0
- **Port**: 8080 (configurado no vite.config.ts)

### Backend
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Serverless Functions**: Supabase Edge Functions (Deno)
- **AI Integration**: Lovable AI Gateway + Google Gemini 2.5 Flash
- **External APIs**: Meta/Facebook OAuth, Google Places API, WhatsApp Business API

---

## 📁 Estrutura de Arquivos

```
/Connect IA/
├── public/                    # Arquivos estáticos
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── ui/              # Componentes UI (shadcn/ui)
│   │   ├── AppSidebar.tsx   # Sidebar principal
│   │   ├── Layout.tsx       # Layout base
│   │   ├── ProtectedRoute.tsx # Rota protegida
│   │   ├── WhatsAppQRConnect.tsx # Conexão WhatsApp QR
│   │   ├── MetaOAuthConnect.tsx # Conexão Meta OAuth
│   │   ├── ChannelSettingsModal.tsx # Modal configurações
│   │   ├── GooglePlacesSearch.tsx # Busca Google Places
│   │   ├── GooglePlacesResults.tsx # Resultados Google Places
│   │   ├── CRMPipeline.tsx # Pipeline CRM Kanban
│   │   └── BulkExportProspects.tsx # Exportação em massa
│   ├── pages/               # Páginas da aplicação
│   │   ├── Dashboard.tsx    # Dashboard principal
│   │   ├── AgentsIA.tsx    # Gestão de agentes IA
│   │   ├── Campaigns.tsx   # Campanhas de marketing
│   │   ├── Contacts.tsx    # Gestão de contatos
│   │   ├── Inbox.tsx       # Caixa de entrada (conversas)
│   │   ├── Prospects.tsx   # Prospecção via Google Maps
│   │   ├── Integrations.tsx # Integrações com redes sociais
│   │   ├── Settings.tsx    # Configurações do usuário
│   │   ├── Auth.tsx        # Autenticação
│   │   ├── Index.tsx       # Página inicial
│   │   ├── NotFound.tsx    # Página 404
│   │   └── PrivacyPolicy.tsx # Política de privacidade
│   ├── hooks/               # Custom hooks
│   │   ├── use-mobile.tsx  # Hook para detectar mobile
│   │   ├── use-toast.ts    # Hook para notificações
│   │   ├── usePersistentAuth.ts # Hook de autenticação persistente
│   │   └── useRealtimeMessages.ts # Hook para mensagens em tempo real
│   ├── integrations/        # Integrações externas
│   │   └── supabase/        # Cliente Supabase
│   └── lib/                 # Utilitários
│       ├── utils.ts         # Funções utilitárias
│       ├── instagram.ts     # Integração Instagram
│       ├── whatsapp.ts      # Integração WhatsApp
│       └── googlePlaces.ts  # Integração Google Places
├── supabase/
│   ├── functions/           # Funções serverless
│   │   ├── ai-agent-chat/   # Chat com agentes IA
│   │   ├── ai-generate-message/ # Geração de mensagens
│   │   ├── ai-optimize-campaign/ # Otimização de campanhas
│   │   ├── ai-summarize/    # Resumo de textos
│   │   ├── channel-connect/ # Conexão de canais
│   │   ├── disconnect-channel/ # Desconexão de canais
│   │   ├── get-channels/    # Buscar canais conectados
│   │   ├── whatsapp-qr-connect/ # Conexão WhatsApp QR
│   │   ├── whatsapp-send-message/ # Envio WhatsApp
│   │   ├── whatsapp-webhook/ # Webhook WhatsApp
│   │   ├── instagram-send-message/ # Envio Instagram
│   │   ├── instagram-webhook/ # Webhook Instagram
│   │   ├── google-places-search/ # Busca Google Places
│   │   └── meta-oauth-exchange/ # Troca OAuth Meta
│   └── migrations/          # Migrações do banco
└── configurações de build
```

---

## 🤖 Funcionalidades de IA

### 1. Chat com Agentes IA (`ai-agent-chat`)
**Arquivo**: `supabase/functions/ai-agent-chat/index.ts`

**Funcionalidades**:
- Chat interativo com agentes especializados
- Suporte a diferentes tipos: vendas, suporte, SDR, atendimento
- Configuração personalizada por agente:
  - Modelo de IA
  - Temperature (criatividade)
  - Max tokens (limite de resposta)
  - System prompt personalizado
- Status: ativo, inativo, treinamento
- Integração com Lovable AI Gateway

**Fluxo**:
1. Recebe `agentId`, `message`, `conversationId`
2. Valida agente no banco de dados
3. Chama API da Lovable AI com configurações do agente
4. Retorna resposta formatada

### 2. Geração de Mensagens (`ai-generate-message`)
**Arquivo**: `supabase/functions/ai-generate-message/index.ts`

**Funcionalidades**:
- Geração automática de mensagens de marketing
- Personalização por:
  - Contexto da mensagem
  - Tom (profissional, amigável, etc.)
  - Objetivo específico
- Modelo: Google Gemini 2.5 Flash
- Temperature: 0.8 (criatividade alta)

### 3. Resumo de Textos (`ai-summarize`)
**Arquivo**: `supabase/functions/ai-summarize/index.ts`

**Funcionalidades**:
- Resumos automáticos de textos longos
- Formatos disponíveis: bullet points, parágrafos, lista
- Análise inteligente de conteúdo
- Temperature: 0.5 (precisão alta)

### 4. Otimização de Campanhas (`ai-optimize-campaign`)
**Arquivo**: `supabase/functions/ai-optimize-campaign/index.ts`

**Funcionalidades**:
- Análise de performance de campanhas
- Recomendações de melhoria
- Métricas analisadas:
  - Taxa de entrega e abertura
  - Horário de envio
  - Segmentação de audiência
  - Otimização de mensagens
  - A/B testing

---

## 🌐 Integrações com Redes Sociais

### 1. WhatsApp Business (`whatsapp-qr-connect`)
**Arquivo**: `supabase/functions/whatsapp-qr-connect/index.ts`

**Funcionalidades**:
- Conexão via QR Code
- Suporte a conexões manuais e QR Code
- Geração automática de QR Code simulado
- Polling de status de conexão
- Salvamento de credenciais no banco

**Fluxo QR Code**:
1. Usuário clica "Conectar WhatsApp"
2. Sistema gera QR Code automaticamente
3. Usuário escaneia com WhatsApp
4. Sistema detecta conexão via polling
5. Salva credenciais automaticamente

### 2. Instagram Business (`meta-oauth-exchange`)
**Arquivo**: `supabase/functions/meta-oauth-exchange/index.ts`

**Funcionalidades**:
- OAuth real com Meta/Facebook
- Troca segura de código por token
- Descoberta automática de páginas
- Filtro para páginas com Instagram Business
- Conexão automática à primeira página

**Fluxo OAuth**:
1. Usuário clica "Conectar Instagram"
2. Abre popup do Facebook
3. Usuário autoriza permissões
4. Sistema troca código por token
5. Busca páginas do usuário
6. Conecta automaticamente

### 3. Webhooks de Mensagens
**Arquivos**: `whatsapp-webhook/index.ts`, `instagram-webhook/index.ts`

**Funcionalidades**:
- Recebimento de mensagens em tempo real
- Criação automática de contatos e conversas
- Suporte a diferentes tipos de mídia
- Atualização de status de conversas
- Integração com sistema de Inbox

---

## 🗺️ Sistema de Prospecção

### Google Places Integration (`google-places-search`)
**Arquivo**: `supabase/functions/google-places-search/index.ts`

**Funcionalidades**:
- Busca de negócios via Google Places API
- Fallback para dados mock quando API não configurada
- Filtros por tipo de negócio e localização
- Salvamento de resultados no banco
- Integração com sistema de CRM

### CRM Pipeline (`CRMPipeline.tsx`)
**Funcionalidades**:
- Visualização Kanban de prospects
- Estágios: Lead, Qualificado, Proposta, Fechado
- Drag & drop entre estágios
- Estatísticas por estágio
- Integração com sistema de contatos

### Exportação em Massa (`BulkExportProspects.tsx`)
**Funcionalidades**:
- Seleção múltipla de prospects
- Exportação para CSV
- Filtros por estágio e critérios
- Download automático de arquivos

---

## 📱 Sistema de Inbox

### Conversas Unificadas (`Inbox.tsx`)
**Funcionalidades**:
- Visualização de conversas de WhatsApp e Instagram
- Sistema de agentes humanos e IA
- Atribuição automática de conversas
- Filtros avançados por canal, status, agente
- Busca em tempo real
- Suporte a diferentes tipos de mídia

### Recursos Avançados:
- **Upload de Arquivos**: Drag & drop, preview de imagens
- **Player de Áudio**: Reprodução direta no chat
- **Download de Arquivos**: Botão para baixar anexos
- **Perfil de Contato**: Modal com informações detalhadas
- **Sugestões de IA**: Respostas automáticas baseadas no contexto
- **Sistema Multi-Agente**: Gestão de múltiplos atendentes

### Funcionalidades em Tempo Real:
1. **Lista de Conversas em Tempo Real**:
   - Visualização multi-canal (WhatsApp, Instagram, Telegram, Messenger)
   - Filtros por status (aberto, atribuído, resolvido, fechado)
   - Filtros por prioridade e tags
   - Busca por nome, email ou telefone do contato
   - Indicadores de mensagens não lidas
   - Preview da última mensagem com timestamp

2. **Visualização Detalhada da Conversa**:
   - Histórico completo de mensagens com indicadores de direção (entrada/saída)
   - Exibição rica de mensagens (texto, mídia, reações)
   - Sidebar com informações do contato
   - Metadados da conversa (tags, prioridade, agente atribuído)
   - Ações rápidas (atribuir, marcar, arquivar, fechar)

3. **Editor de Mensagens**:
   - Editor de texto rico
   - Suporte para anexos de mídia
   - Seleção de templates
   - Sugestões de mensagens por IA
   - Atalhos de teclado (Enter para enviar, Shift+Enter para nova linha)

4. **Atribuição de Agentes**:
   - Atribuição manual para atendentes humanos
   - Atribuição para agentes de IA
   - Toggle de atribuição automática
   - Balanceamento de carga baseado na capacidade do agente

5. **Atualizações em Tempo Real**:
   - Notificações de novas mensagens
   - Mudanças de status da conversa
   - Indicadores de digitação
   - Atualizações de status de presença

---

## 👥 Sistema de Atendentes

O sistema de atendentes humanos permite gerenciar equipes de suporte, vendas e atendimento com recursos avançados de monitoramento e métricas em tempo real.

### Componentes Principais

#### **AttendantDashboard** (`src/components/AttendantDashboard.tsx`)
Dashboard em tempo real para monitoramento de atendentes e conversas:

**Recursos**:
- Monitoramento de atendentes online com badges de status
- Fila de conversas não atribuídas (auto-refresh a cada 15s)
- Rastreamento de atribuições ativas (auto-refresh a cada 10s)
- Gestão de sessões ativas de trabalho
- Atribuição manual de conversas com notas
- Controles de início/fim de sessão
- Interface multi-abas (Visão Geral, Atendentes, Conversas, Sessões)

#### **AttendantsUnified** (`src/pages/AttendantsUnified.tsx`)
Página unificada de gestão de atendentes:

**Recursos**:
- Operações CRUD completas para atendentes
- Filtros avançados (busca, status, departamento)
- Dashboard de estatísticas em tempo real
- Toggle de atribuição automática
- Interface de gestão de sessões
- Visualização de métricas de performance
- Suporte para operações em massa

### Hooks Customizados

#### **useAttendants** (`src/hooks/useAttendants.ts`)
Hook abrangente para gestão de atendentes:

**Queries**:
- `attendants`: Todos os atendentes da organização
- `onlineAttendants`: Atendentes online (refetch a cada 30s)
- `unassignedConversations`: Conversas não atribuídas (refetch a cada 15s)
- `activeAssignments`: Atribuições ativas (refetch a cada 10s)
- `activeSessions`: Sessões ativas (refetch a cada 30s)

**Mutations**:
- `createAttendant`: Criar novo atendente
- `updateAttendant`: Atualizar dados do atendente
- `updateAttendantStatus`: Alterar status (online, busy, away, offline, break, training)
- `assignConversation`: Atribuir conversa manualmente
- `autoAssignConversation`: Atribuir conversa automaticamente
- `startSession`: Iniciar sessão de trabalho
- `endSession`: Finalizar sessão de trabalho

**Funções Auxiliares**:
- `findBestAttendant`: Algoritmo inteligente de seleção de atendente
  - Prioriza atendentes com menos conversas ativas
  - Considera capacidade máxima (max_concurrent_chats)
  - Ordena por melhor tempo de resposta em caso de empate

#### **useAttendantMetrics** (`src/hooks/useAttendants.ts`)
Hook para análise de performance:

**Métricas Disponíveis**:
- Agregação diária/semanal/mensal
- Métricas consolidadas de todos atendentes
- Rastreamento de tempo de resposta e resolução
- Scores de satisfação do cliente
- First Contact Resolution (FCR)
- Tempo total de trabalho
- Taxa de resolução

#### **useAttendantAvailability** (`src/hooks/useAttendants.ts`)
Hook para gestão de horários:

**Recursos**:
- Rastreamento de disponibilidade por data
- Suporte para agendamento futuro de turnos
- Gestão de horários de trabalho

### Edge Functions para Atendentes

#### **auto-assign-conversation**
Atribui conversas automaticamente para atendentes disponíveis:
- Verifica disponibilidade de atendentes
- Considera capacidade máxima de conversas simultâneas
- Balanceamento de carga inteligente
- Retorna ID do atendente atribuído ou null

#### **manage-attendant-session**
Gerencia login/logout e mudanças de status:
- Controla início e fim de sessões
- Atualiza status de presença
- Registra métricas de tempo de trabalho

#### **update-attendant-metrics**
Atualiza métricas de performance em tempo real:
- Calcula tempo médio de resposta
- Atualiza tempo de resolução
- Registra satisfação do cliente
- Consolida estatísticas diárias/semanais/mensais

### Estrutura de Dados dos Atendentes

#### Status Disponíveis:
- `online`: Disponível para atendimento
- `busy`: Ocupado mas pode receber conversas
- `away`: Ausente temporariamente
- `offline`: Desconectado
- `break`: Em pausa/intervalo
- `training`: Em treinamento

#### Configurações do Atendente:
```typescript
{
  max_concurrent_chats: number,    // Máximo de conversas simultâneas
  auto_accept: boolean,             // Aceitar conversas automaticamente
  working_hours: {                  // Horários de trabalho
    monday: { start: "09:00", end: "18:00" },
    // ... outros dias
  },
  skills: string[],                 // Habilidades do atendente
  languages: string[],              // Idiomas falados
  specializations: string[]         // Especializações
}
```

#### Métricas Rastreadas:
- Total de conversas atendidas
- Tempo médio de resposta (segundos)
- Tempo médio de resolução (minutos)
- Score de satisfação (0-5)
- Taxa de resolução no primeiro contato (%)
- Total de mensagens enviadas
- Conversas transferidas
- Conversas abandonadas

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `ai_agents`
```sql
- id: UUID (PK)
- name: VARCHAR - Nome do agente
- type: VARCHAR - Tipo (vendas, suporte, sdr, atendimento, outros)
- status: VARCHAR - Status (ativo, inativo, treinamento)
- model: VARCHAR - Modelo de IA
- system_prompt: TEXT - Prompt do sistema
- temperature: FLOAT - Criatividade (0-1)
- max_tokens: INTEGER - Limite de tokens
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `channel_accounts`
```sql
- id: UUID (PK)
- org_id: UUID - ID da organização
- channel_type: VARCHAR - Tipo (whatsapp, instagram, messenger)
- name: VARCHAR - Nome da conta
- status: VARCHAR - Status (active, inactive)
- credentials_json: JSONB - Credenciais de acesso
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `conversations`
```sql
- id: UUID (PK)
- contact_id: UUID - ID do contato
- channel_type: VARCHAR - Canal da conversa
- status: VARCHAR - Status (active, closed, archived)
- assigned_agent_id: UUID - Agente atribuído
- priority: VARCHAR - Prioridade
- tags: TEXT[] - Tags da conversa
- last_message_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `messages`
```sql
- id: UUID (PK)
- conversation_id: UUID - ID da conversa
- sender_type: VARCHAR - Tipo do remetente (user, contact, system)
- content: TEXT - Conteúdo da mensagem
- message_type: VARCHAR - Tipo (text, image, audio, video, document)
- media_url: TEXT - URL da mídia
- metadata: JSONB - Metadados adicionais
- created_at: TIMESTAMP
```

#### `contacts`
```sql
- id: UUID (PK)
- org_id: UUID - ID da organização
- full_name: VARCHAR - Nome completo
- email: VARCHAR - Email
- phone_e164: VARCHAR - Telefone no formato E164
- external_id: VARCHAR - ID externo (WhatsApp, Instagram)
- channel_type: VARCHAR - Canal de origem
- metadata: JSONB - Dados adicionais
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `prospects`
```sql
- id: UUID (PK)
- org_id: UUID - ID da organização
- place_id: VARCHAR - ID do Google Place
- name: VARCHAR - Nome do negócio
- address: TEXT - Endereço
- phone: VARCHAR - Telefone
- website: VARCHAR - Website
- rating: FLOAT - Avaliação
- user_ratings_total: INTEGER - Total de avaliações
- business_status: VARCHAR - Status do negócio
- types: TEXT[] - Tipos de negócio
- stage: VARCHAR - Estágio no CRM (lead, qualified, proposal, closed)
- notes: TEXT - Notas do usuário
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `places`
```sql
- id: UUID (PK)
- org_id: UUID - ID da organização
- google_place_id: VARCHAR - ID do Google Place
- name: VARCHAR - Nome do lugar
- address: TEXT - Endereço
- phone: VARCHAR - Telefone
- website: VARCHAR - Website
- rating: FLOAT - Avaliação
- user_ratings_total: INTEGER - Total de avaliações
- business_status: VARCHAR - Status do negócio
- types: TEXT[] - Tipos de negócio
- geometry: JSONB - Coordenadas geográficas
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `organizations`
```sql
- id: UUID (PK)
- name: VARCHAR - Nome da organização
- description: TEXT - Descrição
- settings: JSONB - Configurações
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `profiles`
```sql
- id: UUID (PK) - Referência ao auth.users
- full_name: VARCHAR - Nome completo
- avatar_url: TEXT - URL do avatar
- bio: TEXT - Biografia
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `members`
```sql
- id: UUID (PK)
- org_id: UUID - ID da organização
- user_id: UUID - ID do usuário
- role: VARCHAR - Função (admin, member, viewer)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `attendants`
```sql
- id: UUID (PK)
- user_id: UUID - ID do usuário (referência a profiles)
- org_id: UUID - ID da organização
- full_name: VARCHAR - Nome completo
- email: VARCHAR - Email
- phone: VARCHAR - Telefone
- avatar_url: TEXT - URL do avatar
- employee_id: VARCHAR - ID do funcionário
- department: VARCHAR - Departamento
- position: VARCHAR - Cargo/posição
- status: VARCHAR - Status (online, busy, away, offline, break, training)
- working_hours: JSONB - Horários de trabalho
- max_concurrent_chats: INTEGER - Máximo de conversas simultâneas (padrão: 5)
- auto_accept: BOOLEAN - Aceitar conversas automaticamente (padrão: true)
- skills: TEXT[] - Array de habilidades
- languages: TEXT[] - Array de idiomas
- specializations: TEXT[] - Array de especializações
- total_chats: INTEGER - Total de conversas atendidas
- avg_response_time: INTEGER - Tempo médio de resposta (segundos)
- satisfaction_score: FLOAT - Score de satisfação (0-5)
- last_activity_at: TIMESTAMP - Última atividade
- notifications: JSONB - Configurações de notificações
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- created_by: UUID - Criado por
```

#### `attendant_sessions`
```sql
- id: UUID (PK)
- attendant_id: UUID - ID do atendente
- org_id: UUID - ID da organização
- started_at: TIMESTAMP - Início da sessão
- ended_at: TIMESTAMP - Fim da sessão
- duration_minutes: INTEGER - Duração em minutos
- chats_handled: INTEGER - Conversas atendidas
- messages_sent: INTEGER - Mensagens enviadas
- avg_response_time: INTEGER - Tempo médio de resposta (segundos)
- status: VARCHAR - Status (active, ended, paused)
- notes: TEXT - Notas da sessão
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `attendant_metrics`
```sql
- id: UUID (PK)
- attendant_id: UUID - ID do atendente
- org_id: UUID - ID da organização
- period_start: DATE - Início do período
- period_end: DATE - Fim do período
- period_type: VARCHAR - Tipo (daily, weekly, monthly)
- total_chats: INTEGER - Total de conversas
- resolved_chats: INTEGER - Conversas resolvidas
- transferred_chats: INTEGER - Conversas transferidas
- abandoned_chats: INTEGER - Conversas abandonadas
- avg_response_time: INTEGER - Tempo médio de resposta (segundos)
- avg_resolution_time: INTEGER - Tempo médio de resolução (minutos)
- total_work_time: INTEGER - Tempo total de trabalho (minutos)
- satisfaction_avg: FLOAT - Média de satisfação
- satisfaction_count: INTEGER - Total de avaliações
- messages_sent: INTEGER - Mensagens enviadas
- first_contact_resolution: INTEGER - Resoluções no primeiro contato
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `conversation_assignments`
```sql
- id: UUID (PK)
- conversation_id: UUID - ID da conversa
- attendant_id: UUID - ID do atendente
- org_id: UUID - ID da organização
- assigned_at: TIMESTAMP - Data de atribuição
- unassigned_at: TIMESTAMP - Data de desatribuição
- assigned_by: UUID - Atribuído por
- response_time: INTEGER - Tempo de resposta (segundos)
- resolution_time: INTEGER - Tempo de resolução (minutos)
- satisfaction_rating: INTEGER - Avaliação de satisfação (1-5)
- status: VARCHAR - Status (assigned, active, transferred, resolved, abandoned)
- notes: TEXT - Notas
- transfer_reason: TEXT - Motivo da transferência
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `attendant_availability`
```sql
- id: UUID (PK)
- attendant_id: UUID - ID do atendente
- org_id: UUID - ID da organização
- date: DATE - Data
- day_of_week: INTEGER - Dia da semana (0-6)
- start_time: TIME - Horário de início
- end_time: TIME - Horário de fim
- is_available: BOOLEAN - Está disponível
- reason: VARCHAR - Motivo (trabalho, folga, feriado, etc.)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

## 🎨 Interface do Usuário

### Componentes Principais

#### `AppSidebar.tsx`
- Navegação principal da aplicação
- Menu com ícones para cada seção
- Opção de minimizar sidebar
- Integração com React Router
- SidebarTrigger posicionado corretamente

#### `Layout.tsx`
- Layout base da aplicação
- Integra sidebar e conteúdo principal
- Responsivo para diferentes tamanhos de tela
- Removido título "Omnichat IA" redundante

#### `Inbox.tsx`
- Interface principal para conversas
- Layout simplificado e otimizado
- Filtros integrados na lista de conversas
- Estatísticas consolidadas
- Sistema de agentes humanos e IA
- Suporte completo a mídia (imagens, áudio, arquivos)

#### `Integrations.tsx`
- Gestão de integrações com redes sociais
- Conexão direta sem modais desnecessários
- Persistência local com localStorage
- Status de conexão em tempo real
- Configurações de canais conectados

#### `Prospects.tsx`
- Sistema de prospecção via Google Maps
- Pipeline CRM com visualização Kanban
- Exportação em massa de prospects
- Estatísticas de conversão
- Integração com sistema de contatos

### Design System
- **Cores**: Sistema de cores baseado em Tailwind
- **Componentes**: shadcn/ui para consistência
- **Tipografia**: Sistema de tipografia responsivo
- **Espaçamento**: Grid system do Tailwind
- **Interações**: Animações suaves com tailwindcss-animate
- **Layout**: Otimizado para evitar scrollbars desnecessários

---

## 🔧 Configurações Técnicas

### Variáveis de Ambiente

#### Frontend (.env)
```env
# Supabase
VITE_SUPABASE_URL=https://bjsuujkbrhjhuyzydxbr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Meta/Facebook OAuth
VITE_META_APP_ID=670209849105494

# Google Places API
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key

# WhatsApp
VITE_WHATSAPP_VERIFY_TOKEN=your_verify_token
```

#### Backend (Supabase Edge Functions)
```env
# Supabase
SUPABASE_URL=https://bjsuujkbrhjhuyzydxbr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=*** (para funções serverless)

# Meta/Facebook OAuth
META_APP_ID=670209849105494
META_APP_SECRET=04561b815f483b9169cd2f08cc0375a6

# AI Integration
LOVABLE_API_KEY=*** (para integração com IA)

# Google Places API
GOOGLE_PLACES_API_KEY=*** (para busca de negócios)

# WhatsApp
WHATSAPP_VERIFY_TOKEN=*** (para webhooks)
```

### Scripts Disponíveis
```json
{
  "dev": "vite",                    // Servidor de desenvolvimento (porta 8080)
  "build": "vite build",            // Build de produção
  "build:dev": "vite build --mode development",
  "lint": "eslint .",               // Linting do código
  "preview": "vite preview"         // Preview do build
}
```

### Dependências Principais
```json
{
  "react": "^18.3.1",
  "typescript": "^5.8.3",
  "vite": "^5.4.19",
  "@supabase/supabase-js": "^2.75.0",
  "@tanstack/react-query": "^5.83.0",
  "react-router-dom": "^6.30.1",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.462.0",
  "date-fns": "^3.6.0"
}
```

---

## 🚀 Deploy e Execução

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:8080
```

### Build de Produção
```bash
# Build otimizado
npm run build

# Preview do build
npm run preview
```

### Deploy das Edge Functions
```bash
# Deploy de todas as funções
supabase functions deploy

# Deploy de função específica
supabase functions deploy ai-agent-chat
supabase functions deploy meta-oauth-exchange
supabase functions deploy whatsapp-qr-connect
```

### Configuração de Variáveis de Ambiente
```bash
# Configurar secrets do Supabase
supabase secrets set META_APP_ID=670209849105494
supabase secrets set META_APP_SECRET=04561b815f483b9169cd2f08cc0375a6
supabase secrets set GOOGLE_PLACES_API_KEY=your_api_key
supabase secrets set LOVABLE_API_KEY=your_api_key
```

---

## 🔐 Segurança

### Autenticação
- **Provider**: Supabase Auth
- **Métodos**: Email/senha, OAuth
- **Proteção**: Rotas protegidas via `ProtectedRoute.tsx`
- **Sessões**: Persistência automática com `usePersistentAuth`

### API Security
- **CORS**: Configurado nas funções serverless
- **Rate Limiting**: Implementado na Lovable AI
- **API Keys**: Gerenciadas via variáveis de ambiente
- **Validação**: Input validation em todas as funções
- **RLS**: Row Level Security no Supabase (com workarounds temporários)

### OAuth Security
- **Meta OAuth**: Implementado com Edge Function segura
- **App Secret**: Nunca exposto no frontend
- **Token Exchange**: Processado no servidor
- **Redirect URIs**: Configurados corretamente

---

## 📊 Monitoramento e Logs

### Logs Disponíveis
- **Frontend**: Console logs do navegador
- **Backend**: Logs das funções Supabase
- **AI**: Logs da Lovable AI Gateway
- **Erros**: Tratamento centralizado com toast notifications

### Métricas
- Performance das campanhas
- Uso dos agentes IA
- Taxa de entrega de mensagens
- Conversões e engajamento
- Estatísticas de conversas no Inbox
- Pipeline de prospects no CRM

---

## 🔄 Fluxos Principais

### 1. Conexão WhatsApp QR Code
1. Usuário clica "Conectar WhatsApp"
2. Sistema gera QR Code automaticamente
3. Usuário escaneia com WhatsApp
4. Sistema detecta conexão via polling
5. Salva credenciais no banco de dados
6. WhatsApp aparece como conectado

### 2. Conexão Instagram OAuth
1. Usuário clica "Conectar Instagram"
2. Abre popup do Facebook
3. Usuário autoriza permissões
4. Sistema troca código por token via Edge Function
5. Busca páginas do usuário
6. Conecta automaticamente à primeira página
7. Instagram aparece como conectado

### 3. Prospecção via Google Maps
1. Usuário busca negócios na página Prospects
2. Sistema chama Google Places API
3. Retorna resultados com informações detalhadas
4. Usuário pode importar para CRM
5. Prospects aparecem no pipeline Kanban

### 4. Chat no Inbox
1. Mensagem chega via webhook (WhatsApp/Instagram)
2. Sistema cria contato e conversa automaticamente
3. Atribui conversa a agente disponível
4. Agente responde via interface
5. Mensagem é enviada via API do canal
6. Status da conversa é atualizado

### 5. Gestão de Agentes IA
1. Usuário cria novo agente na página Agents IA
2. Configura tipo, modelo e parâmetros
3. Agente fica disponível para chat
4. Usuário pode testar conversas
5. Sistema aprende com interações

---

## 🛠️ Manutenção e Extensibilidade

### Adicionar Novo Canal de Comunicação
1. Criar Edge Function para webhook
2. Implementar função de envio de mensagens
3. Adicionar interface de conexão
4. Configurar credenciais no banco
5. Integrar com sistema de Inbox

### Nova Ferramenta de IA
1. Criar nova função em `supabase/functions/`
2. Implementar lógica de IA
3. Adicionar interface na página `AgentsIA.tsx`
4. Integrar com sistema de toast para feedback

### Customização de UI
- **Tema**: Modificar `tailwind.config.ts`
- **Componentes**: Usar shadcn/ui como base
- **Layout**: Editar `Layout.tsx` e `AppSidebar.tsx`

### Adicionar Novo Tipo de Agente
1. Atualizar enum `AgentType` em `AgentsIA.tsx`
2. Adicionar cor correspondente em `getTypeColor()`
3. Atualizar validação no backend se necessário

---

## 📞 Suporte e Recursos

### Documentação
- **Lovable**: https://docs.lovable.dev
- **Supabase**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Meta for Developers**: https://developers.facebook.com/docs
- **Google Places API**: https://developers.google.com/maps/documentation/places

### Repositório
- **GitHub**: https://github.com/agenciapixel/connect-ia.git
- **Branch**: main
- **Último commit**: Implementações de integrações e CRM

### URLs Importantes
- **Dashboard Supabase**: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr
- **Edge Functions**: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/functions
- **Meta App**: https://developers.facebook.com/apps/670209849105494

---

## 🎯 Próximos Passos Sugeridos

### Funcionalidades Pendentes
1. **Implementar modal de seleção de páginas** para Instagram
2. **Integrar com serviços reais** como WAHA ou WPPConnect para WhatsApp
3. **Configurar permissões corretas** no App do Meta
4. **Implementar sistema de templates** de mensagens
5. **Adicionar relatórios automatizados** de performance

### Melhorias Futuras
1. **Analytics avançados** com métricas detalhadas
2. **Sistema de notificações** push
3. **A/B testing nativo** para campanhas
4. **Integração com CRM externo** (HubSpot, Pipedrive)
5. **Sistema de automação** de workflows
6. **API pública** para integrações externas
7. **App mobile** para atendimento em campo

### Otimizações Técnicas
1. **Implementar RLS completo** no Supabase
2. **Otimizar queries** do banco de dados
3. **Implementar cache** para APIs externas
4. **Adicionar testes automatizados**
5. **Implementar CI/CD** completo

---

## 🔧 Troubleshooting

### Problemas Comuns

#### WhatsApp QR Code não conecta
- Verificar se o QR Code está sendo gerado
- Confirmar se o polling está funcionando
- Verificar logs da Edge Function

#### Instagram OAuth falha
- Verificar se `META_APP_SECRET` está configurado
- Confirmar URLs de redirect no Meta App
- Verificar permissões solicitadas

#### Google Places não retorna resultados
- Verificar se `GOOGLE_PLACES_API_KEY` está configurado
- Confirmar se a API está habilitada no Google Cloud
- Verificar limites de quota da API

#### Inbox não carrega conversas
- Verificar se webhooks estão configurados
- Confirmar se mensagens estão sendo salvas no banco
- Verificar RLS policies do Supabase

### Logs Úteis
```bash
# Ver logs das Edge Functions
supabase functions logs ai-agent-chat
supabase functions logs meta-oauth-exchange
supabase functions logs whatsapp-qr-connect

# Verificar secrets configurados
supabase secrets list

# Verificar status do projeto
supabase status
```

---

## 📊 Dashboard & Analytics

O Dashboard (`src/pages/Dashboard.tsx`) fornece análises abrangentes em tempo real:

### Métricas Principais

#### Cards de Visão Geral:
- **Total de Mensagens**: Com indicadores de tendência (↑/↓)
- **Contatos Ativos**: Total de contatos na organização
- **Campanhas Ativas**: Campanhas em execução
- **Taxa de Resposta**: Percentual de conversas respondidas

#### Gráficos e Visualizações (Recharts):
- **Gráfico de Linhas**: Mensagens ao longo do tempo (últimos 7 dias)
- **Gráfico de Área**: Tendências de volume de conversas
- **Gráfico de Barras**: Distribuição por canal (WhatsApp, Instagram, etc.)
- **Gráfico de Pizza**: Breakdown de status das conversas

#### Feed de Atividade Recente:
- Últimas conversas com timestamps
- Informações do contato
- Badges de status
- Navegação rápida para conversa

### Otimização de Performance:
- Busca de dados em paralelo com `Promise.all()`
- Queries eficientes de contagem com `{ count: "exact", head: true }`
- Filtros de intervalo de data com utilitários `date-fns`
- Renderização responsiva de gráficos com `ResponsiveContainer`
- Estados de loading com Skeleton para UX suave

---

## 🐛 Debugging e Ferramentas de Desenvolvimento

### Integração com DevTools do Navegador

#### React Query Devtools:
Habilitado em modo de desenvolvimento:
- Visualizar todas as queries, status e dados em cache
- Disparar refetches manualmente
- Inspecionar dependências de queries
- Acessível via ícone flutuante no canto inferior esquerdo

#### Inspetor Realtime do Supabase:
- Monitorar assinaturas realtime no console do navegador
- Verificar status de conexão: `supabase.realtime.connection.state`
- Visualizar canais e assinaturas ativas

#### Padrões de Debug no Console:
```typescript
// Debug de contexto de organização
console.log('Organização Atual:', currentOrg);

// Debug de queries
console.log('Dados da Query:', data);
console.log('Erro da Query:', error);
console.log('Está Carregando:', isLoading);

// Debug de mutations
console.log('Status da Mutation:', mutation.status);
console.log('Variáveis da Mutation:', mutation.variables);
```

### Debug de Edge Functions

#### Debug Local:
```bash
# Servir com inspector para Chrome DevTools
supabase functions serve --inspect

# Ver logs em tempo real
supabase functions logs <nome-funcao> --follow

# Testar com curl
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/<nome-funcao>' \
  --header 'Authorization: Bearer SUA_CHAVE_ANON' \
  --header 'Content-Type: application/json' \
  --data '{"chave":"valor"}'
```

#### Debug em Produção:
```bash
# Ver logs recentes
supabase functions logs <nome-funcao> --limit 100

# Filtrar por tempo
supabase functions logs <nome-funcao> --since 1h

# Buscar em logs
supabase functions logs <nome-funcao> | grep "ERRO"
```

#### Problemas Comuns em Edge Functions:
1. **Erros de CORS**:
   - Garantir que a função retorna headers CORS corretos
   - Verificar se `Access-Control-Allow-Origin` está configurado

2. **Problemas de Timeout**:
   - Funções têm limite de 60s de timeout
   - Quebrar operações longas em chunks menores
   - Considerar usar jobs em background para tarefas longas

3. **Variáveis de Ambiente Não Encontradas**:
   - Verificar vars no Dashboard do Supabase
   - Checar capitalização e ortografia
   - Usar `Deno.env.get('NOME_VAR')` não `process.env`

### Debug de Banco de Dados

#### Performance de Queries:
```sql
-- Habilitar timing de query no SQL Editor do Supabase Studio
EXPLAIN ANALYZE
SELECT * FROM conversations WHERE org_id = 'xxx';
```

#### Debug de Políticas RLS:
```sql
-- Verificar políticas ativas
SELECT * FROM pg_policies WHERE tablename = 'conversations';

-- Testar como usuário específico
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub = 'id-usuario-aqui';
SELECT * FROM conversations;
```

#### Problemas Comuns de Banco de Dados:
1. **Resultados Vazios Apesar de Dados Existirem**:
   - Verificar políticas RLS configuradas corretamente
   - Confirmar que filtro `org_id` corresponde à organização atual
   - Garantir que usuário tem papel adequado na tabela `members`

2. **Queries Lentas**:
   - Adicionar índices em colunas filtradas frequentemente (`org_id`, `created_at`)
   - Usar `select('colunas,especificas')` ao invés de `select('*')`
   - Limitar resultados com `.limit()` e paginação

3. **Violações de Chave Estrangeira**:
   - Verificar se registros referenciados existem antes de insert
   - Checar configurações de cascade delete
   - Usar transações para inserts relacionados

### Debug de Assinaturas Realtime

#### Verificar Status de Assinatura:
```typescript
const channel = supabase
  .channel('canal-customizado')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log('Mudança recebida!', payload);
  })
  .subscribe((status) => {
    console.log('Status da assinatura:', status);
  });

// Verificar estado do canal
console.log('Estado do canal:', channel.state);
```

#### Problemas Comuns de Realtime:
1. **Assinaturas Não Disparam**:
   - Verificar políticas RLS permitem usuário ver mudanças
   - Confirmar que tabela tem `REPLICA IDENTITY FULL` para updates
   - Confirmar que Realtime está habilitado para a tabela no Supabase

2. **Muitas Conexões**:
   - Cancelar assinatura quando componentes desmontam
   - Reutilizar canais ao invés de criar muitos
   - Usar canal único com múltiplos listeners

### Debug de Rede

#### Inspeção de Chamadas de API:
```typescript
// Adicionar interceptor de request para debug
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Request Fetch:', args);
  const response = await originalFetch(...args);
  console.log('Response Fetch:', response.status);
  return response;
};
```

#### Teste de Webhooks:
- Usar [ngrok](https://ngrok.com) para teste local de webhooks
- Encaminhar porta local: `ngrok http 54321`
- Atualizar URL de webhook no app Meta para URL do ngrok
- Monitorar requests de webhook no dashboard do ngrok

### Profiling de Performance

#### Performance do React:
```typescript
// Envolver operações caras
import { Profiler } from 'react';

<Profiler id="ListaDeConversas" onRender={(id, phase, actualDuration) => {
  console.log(`${id} ${phase} levou ${actualDuration}ms`);
}}>
  <ListaDeConversas />
</Profiler>
```

#### Análise de Tamanho de Bundle:
```bash
# Analisar build de produção
npm run build
npx vite-bundle-visualizer
```

---

## 🚀 Guia Rápido: Tarefas Comuns de Desenvolvimento

### Criar Nova Funcionalidade com Escopo de Organização

```typescript
// 1. Importar contexto de organização
import { useOrganization } from "@/contexts/OrganizationContext";

// 2. Obter organização atual
const { currentOrg } = useOrganization();

// 3. Criar query com filtro de org
const { data, isLoading } = useQuery({
  queryKey: ['minha-funcionalidade', currentOrg?.id],
  queryFn: async () => {
    if (!currentOrg?.id) return [];

    const { data, error } = await supabase
      .from('minha_tabela')
      .select('*')
      .eq('org_id', currentOrg.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
  enabled: !!currentOrg?.id, // Prevenir query sem org
  refetchInterval: 30000 // Opcional: atualizações em tempo real
});

// 4. Criar mutation para insert
const createMutation = useMutation({
  mutationFn: async (novosDados: MeuTipo) => {
    const { error } = await supabase
      .from('minha_tabela')
      .insert({
        ...novosDados,
        org_id: currentOrg?.id // Sempre incluir org_id
      });

    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['minha-funcionalidade', currentOrg?.id] });
    toast.success("Item criado com sucesso!");
  }
});
```

### Enviar Mensagem WhatsApp

```typescript
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// Enviar mensagem
await sendWhatsAppMessage({
  to: "+5511999999999", // Formato E.164
  message: "Olá! Como posso ajudar?",
  channelId: "uuid-do-canal",
  orgId: currentOrg.id
});
```

### Atribuir Conversa a um Atendente

```typescript
import { useAttendants } from "@/hooks/useAttendants";

const { assignConversation, findBestAttendant } = useAttendants(currentOrg?.id);

// Atribuição manual
assignConversation({
  conversationId: "uuid-conversa",
  attendantId: "uuid-atendente",
  notes: "Cliente VIP - alta prioridade"
});

// Atribuição automática (algoritmo inteligente)
const melhorAtendente = findBestAttendant(conversa);
if (melhorAtendente) {
  assignConversation({
    conversationId: conversa.id,
    attendantId: melhorAtendente.id
  });
}
```

### Criar Assinatura Realtime

```typescript
import { useEffect } from 'react';

useEffect(() => {
  if (!currentOrg?.id) return;

  const canal = supabase
    .channel(`org-${currentOrg.id}-mensagens`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `org_id=eq.${currentOrg.id}`
    }, (payload) => {
      console.log('Nova mensagem:', payload.new);
      // Atualizar UI com nova mensagem
      queryClient.invalidateQueries({ queryKey: ['mensagens'] });
    })
    .subscribe();

  // Cleanup ao desmontar
  return () => {
    canal.unsubscribe();
  };
}, [currentOrg?.id]);
```

### Testar Agente de IA

```typescript
const testarAgente = async (agentId: string, mensagem: string) => {
  const { data, error } = await supabase.functions.invoke('ai-agent-chat', {
    body: {
      agentId,
      message: mensagem,
      conversationId: 'id-conversa-opcional',
      contactId: 'id-contato-opcional'
    }
  });

  if (error) throw error;

  console.log('Resposta da IA:', data.response);
  console.log('Contexto Usado:', data.contextUsed);
  console.log('Mensagens do Histórico:', data.historyMessages);

  return data.response;
};
```

### Formatar Números de Telefone

```typescript
import { formatWhatsAppNumber, isValidWhatsAppNumber } from "@/lib/whatsapp";

const telefone = "(11) 99999-9999";

// Verificar validade
if (isValidWhatsAppNumber(telefone)) {
  // Formatar para E.164
  const formatado = formatWhatsAppNumber(telefone); // +5511999999999

  // Enviar mensagem
  await sendWhatsAppMessage({
    to: formatado,
    message: "Olá!",
    channelId: canalId,
    orgId: currentOrg.id
  });
}
```

### Gerenciar Sessões de Atendente

```typescript
import { useAttendants } from "@/hooks/useAttendants";

const { startSession, endSession, activeSessions } = useAttendants(currentOrg?.id);

// Iniciar sessão de trabalho
startSession(atendenteId);

// Finalizar sessão
endSession(sessaoId);

// Ver todas as sessões ativas
console.log('Sessões Ativas:', activeSessions);
```

### Validação de Formulários com Zod

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const esquemaFormulario = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  departamento: z.enum(["atendimento", "vendas", "suporte"])
});

const form = useForm({
  resolver: zodResolver(esquemaFormulario),
  defaultValues: {
    nome: "",
    email: "",
    telefone: "",
    departamento: "atendimento"
  }
});

const aoEnviar = async (valores: z.infer<typeof esquemaFormulario>) => {
  // Formulário é validado automaticamente
  console.log(valores);
};
```

---

## 🎨 Referência de Componentes UI

### Componentes shadcn/ui Mais Utilizados

- **Formulários**: `Form`, `FormField`, `FormControl`, `FormLabel`, `FormMessage`
- **Inputs**: `Input`, `Textarea`, `Select`, `Switch`, `Checkbox`, `Slider`
- **Diálogos**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
- **Layout**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Separator`
- **Navegação**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Feedback**: `Badge`, `Alert`, `Skeleton`, `Progress`
- **Overlays**: `DropdownMenu`, `Popover`, `Tooltip`, `Sheet`
- **Exibição de Dados**: `Table`, `Avatar`, `ScrollArea`

### Padrões de Estilo

```typescript
// Usar cn() para classes condicionais
import { cn } from "@/lib/utils";

<div className={cn(
  "classes-base",
  isAtivo && "classes-ativo",
  temErro && "classes-erro"
)} />

// Padrões comuns
<Card className="hover:shadow-lg transition-shadow">
<Button variant="outline" size="sm" className="gap-2">
<Badge variant="destructive">Erro</Badge>
```

### Intervalos de Refetch para Dados em Tempo Real

A plataforma usa intervalos agressivos de refetch para funcionalidades em tempo real:
- **Dados Críticos** (conversas não atribuídas): 10-15s
- **Prioridade Moderada** (atendentes online, sessões ativas): 30s
- **Baixa Prioridade** (métricas, dados históricos): 60s ou sob demanda

---

*Documentação atualizada - Connect IA v2.0*
*Última atualização: Janeiro 2025*
*Inclui: Integrações OAuth, Sistema CRM, Inbox Unificado, Prospecção Google Maps, Sistema de Atendentes, Dashboard Analytics*