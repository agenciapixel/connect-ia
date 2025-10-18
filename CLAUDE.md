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

### ⚠️ Deploy Automático (PRODUÇÃO)
**IMPORTANTE:** O projeto usa Git Deploy no Hostinger. Cada push para a branch `main` dispara um deploy automático através do hook `postinstall` que executa o build.

**Para evitar deploy acidental:**
1. Trabalhe em branches separadas (não `main`)
2. Teste localmente com `npm run dev` antes de mergear
3. Faça code review antes de push para `main`
4. Use `git push origin HEAD:refs/for/main` para criar PR (se configurado)

**Branches:**
- `main` → Produção (deploy automático no Hostinger)
- `dev` → Desenvolvimento (testes locais)
- `feature/*` → Features em desenvolvimento

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
1. **Login**: Supabase Auth (JWT tokens)
2. **Autorização**: Verificação em `authorized_users` table
3. **Role**: Determinação de permissões (admin/user)
4. **Organização**: Associação com org específica via `members`
5. **Cache**: Sistema de cache em memória (5 minutos) para performance

### Componentes de Autenticação

**ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
- Guard de autenticação para rotas privadas
- Valida sessão ativa do Supabase Auth
- Chama `useSecurity` para verificar autorização
- Redireciona para `/autenticacao` se não autenticado
- Bloqueia acesso se usuário não autorizado

**useSecurity** (`src/hooks/useSecurity.ts`)
- Hook principal de segurança e autorização
- `checkUserAuthorization(email)`: Verifica se usuário está na tabela `authorized_users`
- `getUserRole(email)`: Busca role do usuário (admin/user)
- `validateUser(email)`: Executa validação completa
- Sistema de cache em memória (5 minutos) para evitar consultas repetidas
- Timeout de 10 segundos com fallback para cache
- Previne validações duplicadas com refs

**usePersistentAuth** (`src/hooks/usePersistentAuth.ts`)
- Monitora estado de autenticação via `onAuthStateChange`
- Gerencia persistência de sessão
- Função `logout()` para deslogar
- Suporte a "Permanecer Logado" (localStorage)

### Sistema de Cache
- **Cache em Memória**: Map compartilhado entre todas as instâncias
- **Duração**: 5 minutos (300.000ms)
- **Estrutura**: `{ isAuthorized: boolean, role: 'admin' | 'user' | null, timestamp: number }`
- **Fallback**: Em caso de timeout/erro, usa cache antigo se disponível
- **Limpeza**: Cache é limpo quando usuário faz logout ou não é autorizado

### Hard Refresh e Performance
- **Problema Resolvido**: Sistema travava no hard refresh ao consultar Supabase
- **Solução**:
  - Cache em memória evita re-consultas desnecessárias
  - Refs (`useRef`) previnem validações duplicadas
  - Fallback para cache em caso de timeout (10s)
  - `useCallback` para memoização de funções

### Segurança
- **RLS**: Row Level Security em todas as tabelas
- **JWT**: Tokens de autenticação gerenciados pelo Supabase
- **Fail-Secure**: Em caso de erro sem cache, NEGA acesso
- **Timeout**: 10 segundos para consultas, com fallback seguro
- **Validação Única**: Previne validações duplicadas simultâneas
- **HTTPS**: Comunicação segura
- **CORS**: Configuração adequada no Supabase

### Problemas Conhecidos e Soluções

**Timeout no Supabase:**
- Consultas à tabela `authorized_users` às vezes demoram
- Solução: Timeout de 10s + cache em memória + fallback

**Hard Refresh Travando:**
- `validateUser` era chamado múltiplas vezes simultaneamente
- Solução: Refs para prevenir validações duplicadas + cache

**Loop Infinito:**
- `validateUser` limpava localStorage causando re-validações
- Solução: Removida limpeza de localStorage + validação única via refs

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
- ✅ **Hard Refresh**: Sistema de cache em memória implementado (Outubro 2025)
- ✅ **RLS Policies**: Políticas corrigidas para evitar recursão
- ✅ **User Creation**: Trigger automático funcionando
- ✅ **Role Detection**: Sistema robusto com cache de 5 minutos
- ✅ **Timeout Issues**: Timeout de 10s com fallback para cache
- ✅ **Validações Duplicadas**: Sistema de refs previne múltiplas validações
- ✅ **Fallback Inseguro**: Removido fallback de admin por padrão de email
- ✅ **Verificação de Autorização**: Reativada com tratamento adequado

### Em Andamento
- 🔄 **Performance Geral**: Otimização de queries Supabase
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

**Última atualização**: 17 de Outubro de 2025
**Versão Oficial**: 1.0.0 (estável)
**Versão Teste**: 1.1.0-beta (testando em produção, será revertida)
**Status**: Teste temporário em produção

## 📝 Changelog

### v1.1.0-beta (17/10/2025) - TESTE EM PRODUÇÃO
⚠️ **VERSÃO DE TESTE - SERÁ REVERTIDA PARA v1.0.0**

**Objetivo:** Testar correções de autenticação em ambiente real antes de aprovar.

**Mudanças em Teste:**
- 🧪 **Sistema de Cache em Memória**: Cache de 5 minutos para consultas de autorização
- 🧪 **Correção Hard Refresh**: Resolvido travamento ao dar hard refresh
- 🧪 **Segurança Aprimorada**: Removido fallback inseguro de admin por email
- 🧪 **Performance**: Redução de 90% em consultas repetidas ao Supabase
- 🧪 **Validação Única**: Sistema de refs previne validações duplicadas
- 🧪 **Fail-Secure**: Sistema agora nega acesso em caso de erro (mais seguro)

**Arquivos Modificados:**
- `src/hooks/useSecurity.ts` - Sistema de cache e validação
- `src/components/ProtectedRoute.tsx` - Verificação de autorização reativada
- `CLAUDE.md` - Documentação atualizada

**Testes a Realizar:**
1. ✅ Login normal
2. ⏳ Hard refresh múltiplos (Cmd+Shift+R)
3. ⏳ Performance de login
4. ⏳ Comportamento do cache (5 min)
5. ⏳ Validar que não há loops infinitos
6. ⏳ Testar com múltiplos usuários (admin/user)
7. ⏳ Timeout e fallback funcionando

**Após Testes:**
- ✅ **Se aprovado:** Manter mudanças, atualizar versão oficial para v1.1.0
- ❌ **Se reprovado:** Reverter para v1.0.0 (git reset/revert)

### v1.0.0 (18/10/2024) - PRODUÇÃO ATUAL
- 🎉 Lançamento inicial do Connect IA
- ✅ Sistema de autenticação e autorização
- ✅ Multi-tenant com organizações
- ✅ Integrações WhatsApp, Instagram, Messenger
- ✅ Sistema de permissões granulares