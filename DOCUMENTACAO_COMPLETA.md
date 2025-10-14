# Documentação Completa - Connect IA

## 📋 Visão Geral do Projeto

**Connect IA** é uma aplicação web de marketing digital com inteligência artificial, desenvolvida com React, TypeScript e Supabase. A aplicação oferece funcionalidades de automação de marketing, chat com agentes IA, geração de conteúdo e otimização de campanhas.

---

## 🏗️ Arquitetura do Sistema

### Frontend
- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 3.4.17
- **Routing**: React Router DOM 6.30.1
- **State Management**: React Query (TanStack) 5.83.0

### Backend
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Serverless Functions**: Supabase Edge Functions (Deno)
- **AI Integration**: Lovable AI Gateway + Google Gemini 2.5 Flash

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
│   │   └── ProtectedRoute.tsx # Rota protegida
│   ├── pages/               # Páginas da aplicação
│   │   ├── Dashboard.tsx    # Dashboard principal
│   │   ├── AgentsIA.tsx     # Gestão de agentes IA
│   │   ├── Campaigns.tsx    # Campanhas de marketing
│   │   ├── Contacts.tsx     # Gestão de contatos
│   │   ├── Inbox.tsx        # Caixa de entrada
│   │   ├── Prospects.tsx    # Prospecção
│   │   ├── Settings.tsx     # Configurações
│   │   └── Auth.tsx         # Autenticação
│   ├── hooks/               # Custom hooks
│   ├── integrations/        # Integrações externas
│   │   └── supabase/        # Cliente Supabase
│   └── lib/                 # Utilitários
├── supabase/
│   ├── functions/           # Funções serverless
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

#### Outras tabelas (inferidas das migrações):
- `campaigns` - Campanhas de marketing
- `contacts` - Contatos/prospects
- `conversations` - Conversas com agentes
- `messages` - Mensagens das conversas
- `users` - Usuários do sistema

---

## 🎨 Interface do Usuário

### Componentes Principais

#### `AppSidebar.tsx`
- Navegação principal da aplicação
- Menu com ícones para cada seção
- Opção de minimizar sidebar
- Integração com React Router

#### `Layout.tsx`
- Layout base da aplicação
- Integra sidebar e conteúdo principal
- Responsivo para diferentes tamanhos de tela

#### `AgentsIA.tsx`
- Interface principal para gestão de agentes IA
- CRUD completo de agentes
- Ferramentas de IA integradas:
  - Gerador de mensagens
  - Resumidor de textos
  - Otimizador de campanhas
- Interface com tabs e formulários

### Design System
- **Cores**: Sistema de cores baseado em Tailwind
- **Componentes**: shadcn/ui para consistência
- **Tipografia**: Sistema de tipografia responsivo
- **Espaçamento**: Grid system do Tailwind
- **Interações**: Animações suaves com tailwindcss-animate

---

## 🔧 Configurações Técnicas

### Variáveis de Ambiente
```env
SUPABASE_URL=https://bjsuujkbrhjhuyzydxbr.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=*** (para funções serverless)
LOVABLE_API_KEY=*** (para integração com IA)
```

### Scripts Disponíveis
```json
{
  "dev": "vite",                    // Servidor de desenvolvimento
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
  "lucide-react": "^0.462.0"
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
# Acesse: http://localhost:8081
```

### Build de Produção
```bash
# Build otimizado
npm run build

# Preview do build
npm run preview
```

### Deploy
- **Plataforma**: Lovable (https://lovable.dev)
- **URL do Projeto**: https://lovable.dev/projects/22ab8e03-90bb-4be2-af64-4d2f59280fb9
- **Deploy**: Automático via Lovable
- **Domínio**: Configurável via Lovable

---

## 🔐 Segurança

### Autenticação
- **Provider**: Supabase Auth
- **Métodos**: Email/senha, OAuth
- **Proteção**: Rotas protegidas via `ProtectedRoute.tsx`
- **Sessões**: Persistência automática

### API Security
- **CORS**: Configurado nas funções serverless
- **Rate Limiting**: Implementado na Lovable AI
- **API Keys**: Gerenciadas via variáveis de ambiente
- **Validação**: Input validation em todas as funções

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

---

## 🔄 Fluxos Principais

### 1. Criação de Agente IA
1. Usuário acessa página "Agentes IA"
2. Clica em "Novo Agente"
3. Preenche formulário (nome, tipo, configurações)
4. Sistema valida dados
5. Agente é criado no banco
6. Interface atualizada com novo agente

### 2. Chat com Agente
1. Usuário seleciona agente ativo
2. Inicia conversa
3. Mensagem é enviada para função `ai-agent-chat`
4. Função consulta configurações do agente
5. Chama Lovable AI com contexto
6. Resposta é retornada e exibida

### 3. Geração de Mensagem
1. Usuário acessa ferramenta de geração
2. Define contexto, tom e objetivo
3. Sistema chama `ai-generate-message`
4. IA gera mensagem personalizada
5. Resultado é exibido para edição/cópia

---

## 🛠️ Manutenção e Extensibilidade

### Adicionar Novo Tipo de Agente
1. Atualizar enum `AgentType` em `AgentsIA.tsx`
2. Adicionar cor correspondente em `getTypeColor()`
3. Atualizar validação no backend se necessário

### Nova Ferramenta de IA
1. Criar nova função em `supabase/functions/`
2. Implementar lógica de IA
3. Adicionar interface na página `AgentsIA.tsx`
4. Integrar com sistema de toast para feedback

### Customização de UI
- **Tema**: Modificar `tailwind.config.ts`
- **Componentes**: Usar shadcn/ui como base
- **Layout**: Editar `Layout.tsx` e `AppSidebar.tsx`

---

## 📞 Suporte e Recursos

### Documentação
- **Lovable**: https://docs.lovable.dev
- **Supabase**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

### Repositório
- **GitHub**: https://github.com/agenciapixel/connect-ia.git
- **Branch**: main
- **Último commit**: `ca7548e feat: Add Integrations page`

---

## 🎯 Próximos Passos Sugeridos

1. **Implementar analytics avançados**
2. **Adicionar mais tipos de agentes IA**
3. **Integrar com mais plataformas de marketing**
4. **Implementar sistema de templates**
5. **Adicionar relatórios automatizados**
6. **Melhorar sistema de notificações**
7. **Implementar A/B testing nativo**
8. **Adicionar integração com CRM externo**

---

*Documentação gerada automaticamente - Connect IA v1.0*
*Última atualização: Janeiro 2025*


