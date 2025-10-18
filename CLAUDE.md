# Connect IA - Sistema de CRM com IA

## 📋 Resumo do Projeto

O Connect IA é uma plataforma completa de CRM (Customer Relationship Management) integrada com Inteligência Artificial, focada em automação de atendimento via WhatsApp Business e outros canais de comunicação.

## 🛠️ Comandos de Desenvolvimento

### Configuração Inicial
```bash
npm install              # Instalar dependências
npm run dev             # Iniciar servidor de desenvolvimento (porta 8080)
```

### Build e Deploy
```bash
npm run build           # Build para produção (dist/)
npm run build:dev       # Build com sourcemaps (desenvolvimento)
npm run preview         # Visualizar build de produção localmente
npm run lint           # Executar ESLint
```

### Deploy Automático
O projeto usa Git Deploy no Hostinger. Cada push para a branch `main` dispara um deploy automático através do hook `postinstall` que executa o build.

## 🎯 Funcionalidades Principais

### 🤖 Agentes de IA
- **Criação e Configuração**: Interface intuitiva para criar agentes personalizados
- **Ferramentas de IA**: Geração de mensagens, resumo de conversas, otimização de respostas
- **Integração Supabase**: Edge Functions para processamento de IA

### 📱 Integrações de Canais
- **WhatsApp Business**: Conexão via API oficial
- **Instagram**: Integração com Meta Business
- **Messenger**: Chat do Facebook
- **Email**: Sistema de email marketing

### 👥 Gestão de Usuários
- **Sistema de Autorização**: Controle de acesso baseado em roles
- **Organizações**: Multi-tenant com organizações separadas
- **Permissões**: Sistema granular de permissões (admin/user)

### 📊 Dashboard e Analytics
- **Métricas em Tempo Real**: Conversas, leads, conversões
- **Relatórios**: Análise de performance dos agentes
- **Monitoramento**: Status das integrações

## 🛠️ Stack Tecnológica

### Frontend
- **React 18**: Framework principal
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e dev server
- **Tailwind CSS**: Styling
- **Shadcn/ui**: Componentes UI
- **React Router**: Navegação
- **TanStack Query**: Gerenciamento de estado

### Backend
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Banco de dados
- **Edge Functions**: Serverless functions
- **RLS**: Row Level Security
- **Triggers**: Automação de dados

### Integrações
- **Meta Business API**: WhatsApp, Instagram, Messenger
- **Google Places API**: Localização e mapas
- **Facebook SDK**: Login social

## 🏗️ Arquitetura

### Estrutura de Pastas
```
src/
├── components/          # 75+ componentes reutilizáveis
│   ├── ui/             # 45+ componentes Shadcn/ui (primitivos Radix)
│   ├── ProtectedRoute.tsx      # Guard de autenticação
│   ├── SmartRoute.tsx          # Guard de permissões
│   ├── Layout.tsx              # Layout principal com sidebar
│   └── [Feature Components]    # Componentes específicos por funcionalidade
├── pages/              # 22 páginas da aplicação
├── hooks/              # 9 custom hooks principais
│   ├── useSecurity.ts          # Validação e autorização de usuários
│   ├── usePermissions.ts       # Sistema de permissões granulares
│   ├── usePersistentAuth.ts    # Gerenciamento de sessão persistente
│   ├── usePlanLimits.ts        # Controle de limites por plano
│   ├── useAuthControl.ts       # Gerenciamento de usuários autorizados
│   ├── useDynamicMetrics.ts    # Métricas em tempo real
│   ├── useRealtimeMessages.ts  # Mensagens em tempo real
│   └── useAttendants.ts        # Gerenciamento de atendentes
├── contexts/           # Context providers
│   └── OrganizationContext.tsx # Multi-tenant (troca de organizações)
├── integrations/       # Integrações externas
│   └── supabase/       # Cliente Supabase + tipos auto-gerados
├── lib/               # Utilitários e helpers
│   ├── planLimits.ts           # Validação de limites de planos
│   ├── whatsapp.ts             # Integração WhatsApp Business
│   ├── instagram.ts            # Integração Instagram Business
│   └── googlePlaces.ts         # API Google Places
└── main.tsx           # Entry point React

vite.config.ts          # Configuração Vite (chunks, porta 8080, aliases)
```

### Rotas da Aplicação

Todas as rotas são protegidas com autenticação (`ProtectedRoute`) e permissões (`SmartRoute`):

| Rota | Componente | Permissão | Descrição |
|------|------------|-----------|-----------|
| `/autenticacao` | Auth | Pública | Login/Cadastro |
| `/` | Dashboard | - | Dashboard principal |
| `/painel` | Dashboard | - | Alias do dashboard |
| `/caixa-entrada` | Inbox | - | Caixa de entrada de mensagens |
| `/contatos` | Contacts | canManageContacts | Gestão de contatos |
| `/campanhas` | Campaigns | canManageCampaigns | Gestão de campanhas |
| `/prospeccao` | Prospects | canCreateProspects | Prospecção de leads |
| `/atendentes` | Attendants | canManageAttendants | Gestão de atendentes |
| `/crm` | CRM | canManageCRM | Pipeline de vendas |
| `/agentes-ia` | AgentsIA | canManageAIAgents | Configuração de agentes IA |
| `/integracoes` | Integrations | canManageIntegrations | Integrações de canais |
| `/configuracoes` | Settings | canManageSettings | Configurações do sistema |
| `/planos` | Pricing | Pública | Planos de assinatura |
| `/politica-privacidade` | PrivacyPolicy | Pública | Política de privacidade |

### Banco de Dados (Supabase)

**Principais Tabelas:**
- **auth.users**: Usuários do Supabase Auth (autenticação)
- **public.authorized_users**: Lista de usuários autorizados (autorização) com roles
- **public.orgs**: Organizações (multi-tenant)
- **public.members**: Relacionamento usuário-organização com roles específicos
- **public.plans**: Planos de assinatura com limites de features
- **public.usage_tracking**: Rastreamento de uso por métrica/mês
- **public.contacts**: Contatos dos clientes
- **public.conversations**: Conversas dos canais
- **public.messages**: Mensagens das conversas
- **public.attendants**: Atendentes humanos do sistema
- **public.attendant_availability**: Disponibilidade dos atendentes
- **public.attendant_metrics**: Métricas de performance
- **public.ai_agents**: Agentes de IA configurados
- **public.channel_accounts**: Contas de canais (WhatsApp, Instagram, etc.)
- **public.channel_settings**: Configurações dos canais
- **public.campaigns**: Campanhas de marketing
- **public.prospects**: Leads prospectados
- **public.custom_fields**: Campos customizáveis

**RPC Functions (Backend Logic):**
- `get_authorized_users()` - Listar usuários autorizados
- `add_authorized_user(email, role)` - Adicionar usuário autorizado
- `remove_authorized_user(user_id)` - Remover autorização
- `is_user_authorized(email)` - Verificar autorização
- `check_plan_limit(org_id, metric_type)` - Verificar limite do plano
- `record_usage(org_id, metric_type)` - Registrar uso de feature
- `is_trial_valid(org_id)` - Validar período de trial

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação
1. **Login**: Supabase Auth
2. **Autorização**: Verificação em `authorized_users`
3. **Role**: Determinação de permissões (admin/user)
4. **Organização**: Associação com org específica

### Segurança
- **RLS**: Row Level Security em todas as tabelas
- **JWT**: Tokens de autenticação
- **HTTPS**: Comunicação segura
- **CORS**: Configuração adequada

## 🚀 Deploy e Produção

### Ambiente de Produção
- **URL**: https://connectia.agenciapixel.digital
- **Hostinger**: Hospedagem com Git Deploy
- **Domínio**: Agência Pixel

### Deploy Automático
- **GitHub**: Repositório principal
- **Hostinger Git Deploy**: Deploy automático
- **Build**: Vite para produção

## 📈 Roadmap

### Funcionalidades Futuras
- [ ] **IA Avançada**: GPT-4, Claude, Gemini
- [ ] **Analytics Avançado**: BI e relatórios
- [ ] **Mobile App**: React Native
- [ ] **API Pública**: Para integrações
- [ ] **Webhooks**: Notificações em tempo real

### Melhorias Técnicas
- [ ] **Testes**: Unit e E2E
- [ ] **CI/CD**: Pipeline automatizado
- [ ] **Monitoramento**: Logs e métricas
- [ ] **Performance**: Otimizações
- [ ] **SEO**: Otimização para busca

## 🐛 Problemas Conhecidos

### Resolvidos
- ✅ **MIME Type**: JavaScript modules servidos corretamente
- ✅ **Hard Refresh**: Sistema anti-travamento implementado
- ✅ **RLS Policies**: Políticas corrigidas para evitar recursão
- ✅ **User Creation**: Trigger automático funcionando
- ✅ **Role Detection**: Sistema robusto de detecção de roles

### Em Andamento
- 🔄 **Timeout Issues**: Consultas às vezes travam
- 🔄 **Cache Management**: localStorage às vezes inconsistente
- 🔄 **Production Sync**: Sincronização dev/prod

## 📞 Suporte

### Contato
- **Desenvolvedor**: Ricardo da Silva
- **Empresa**: Agência Pixel
- **Email**: ricardo@agenciapixel.digital

### Documentação
- **README.md**: Instruções de instalação
- **Supabase**: Documentação do backend
- **Meta Business**: Documentação das APIs

---

**Última atualização**: 18 de Outubro de 2024
**Versão**: 1.0.0
**Status**: Em produção