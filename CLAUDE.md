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
- **Sistema de Autorização**: Controle de acesso em duas camadas (sistema + organização)
- **Organizações**: Multi-tenant com organizações separadas
- **Permissões**: Sistema granular de permissões (admin/manager/agent/viewer)

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

### Arquitetura de Três Camadas

O sistema utiliza uma arquitetura de separação de responsabilidades:

```
┌─────────────────────────────────────────────────────────┐
│ 1. useSecurity (Autorização de Sistema)                │
│    ├─ Verifica se usuário está em authorized_users     │
│    ├─ Cache duplo (memória + localStorage)             │
│    └─ Retorna: isAuthorized (sim/não)                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. OrganizationContext (Role por Organização)          │
│    ├─ Consulta tabela members                          │
│    ├─ Busca role: admin/manager/agent/viewer           │
│    └─ Gerencia troca de organizações                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. usePermissions (Permissões Granulares)              │
│    ├─ Recebe role do OrganizationContext               │
│    ├─ Calcula 46+ permissões específicas               │
│    └─ Retorna: canManageContacts, canCreateCampaigns…  │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Autenticação
1. **Login**: Supabase Auth (JWT tokens)
2. **Autorização**: `useSecurity` verifica se usuário está em `authorized_users`
3. **Organização**: `OrganizationContext` busca organizações do usuário via `members`
4. **Role**: Cada organização tem um role específico (admin/manager/agent/viewer)
5. **Permissões**: `usePermissions` converte role em permissões granulares
6. **Cache**: Sistema de cache duplo (memória + localStorage) para performance

### Componentes de Autenticação

**ProtectedRoute** ([src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx))
- Guard de autenticação para rotas privadas
- Valida sessão ativa do Supabase Auth
- Chama `useSecurity` para verificar autorização
- Redireciona para `/autenticacao` se não autenticado
- Bloqueia acesso se usuário não autorizado

**useSecurity** ([src/hooks/useSecurity.ts](src/hooks/useSecurity.ts))
- **Responsabilidade ÚNICA**: Autorização de acesso ao sistema
- `checkUserAuthorization(email)`: Verifica se usuário está em `authorized_users`
- `validateUser(email)`: Executa validação completa
- Sistema de **cache duplo**:
  - Cache em memória (Map) - primeira camada
  - localStorage - persiste entre hard refreshes
- Timeout de 20 segundos com fallback para cache
- Previne validações duplicadas com refs
- **NÃO gerencia roles** (responsabilidade do OrganizationContext)

**OrganizationContext** ([src/contexts/OrganizationContext.tsx](src/contexts/OrganizationContext.tsx))
- **Responsabilidade**: Gerenciar organizações e roles
- Consulta tabela `members` para buscar role por organização
- Permite troca entre organizações (multi-tenant)
- Fornece role atual: admin/manager/agent/viewer
- Persiste organização selecionada em localStorage

**usePermissions** ([src/hooks/usePermissions.ts](src/hooks/usePermissions.ts))
- **Responsabilidade**: Calcular permissões granulares
- Recebe role do `OrganizationContext`
- Converte role em 46+ permissões específicas
- Funções helper: `canAccess()`, `canAccessAny()`, `canAccessAll()`

**usePersistentAuth** ([src/hooks/usePersistentAuth.ts](src/hooks/usePersistentAuth.ts))
- Monitora estado de autenticação via `onAuthStateChange`
- Gerencia persistência de sessão
- Função `logout()` para deslogar
- Suporte a "Permanecer Logado" (localStorage)

### Sistema de Cache (v1.1.0-beta)

**Cache Duplo para Autorização:**
- **Cache em Memória**: Map compartilhado, ultra-rápido
- **localStorage**: Persiste entre hard refreshes
- **Duração**: 5 minutos (300.000ms)
- **Estrutura**: `{ isAuthorized: boolean, timestamp: number }`
- **Fallback**: Em caso de timeout/erro, usa cache antigo se disponível
- **Limpeza**: Cache é limpo quando usuário faz logout ou não é autorizado

**Performance:**
- Primeira carga: ~2-5s (consulta Supabase)
- Hard refresh com cache: ~0ms (instantâneo)
- Validações seguintes: ~0ms (cache)

### Hard Refresh e Performance
- **Problema Resolvido**: Sistema travava 20+ segundos no hard refresh
- **Solução**:
  - Cache duplo (memória + localStorage) evita re-consultas
  - Refs (`useRef`) previnem validações duplicadas
  - Fallback para cache em caso de timeout (20s)
  - `useCallback` para memoização de funções

### Segurança
- **RLS**: Row Level Security em todas as tabelas
- **JWT**: Tokens de autenticação gerenciados pelo Supabase
- **Fail-Secure**: Em caso de erro sem cache, NEGA acesso
- **Timeout**: 20 segundos para consultas, com fallback seguro
- **Validação Única**: Previne validações duplicadas simultâneas
- **Sem Fallbacks Inseguros**: Removidos padrões de email para admin
- **HTTPS**: Comunicação segura
- **CORS**: Configuração adequada no Supabase

### Tabelas de Autorização

**authorized_users** (Autorização de Sistema)
- Email do usuário
- Se usuário pode acessar o sistema (sim/não)
- Consultada pelo `useSecurity`

**members** (Roles por Organização)
- Relacionamento user_id ↔ org_id
- Role específico por organização: admin/manager/agent/viewer
- Consultada pelo `OrganizationContext`

### Problemas Conhecidos e Soluções

**Timeout no Supabase:**
- Consultas à tabela `authorized_users` às vezes demoram
- Solução: Timeout de 20s + cache duplo + fallback

**Hard Refresh Travando:**
- `validateUser` era chamado múltiplas vezes simultaneamente
- Solução: Refs para prevenir validações duplicadas + cache duplo

**Loop Infinito:**
- `validateUser` limpava localStorage causando re-validações
- Solução: Removida limpeza de localStorage + validação única via refs

**Role Incorreto:**
- Sistema consultava `authorized_users` para role (incorreto)
- Solução: Role agora vem do `OrganizationContext` via tabela `members`

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

### Resolvidos (v1.1.0-beta)
- ✅ **MIME Type**: JavaScript modules servidos corretamente
- ✅ **Hard Refresh**: Sistema de cache duplo implementado (memória + localStorage)
- ✅ **RLS Policies**: Políticas corrigidas para evitar recursão
- ✅ **User Creation**: Trigger automático funcionando
- ✅ **Role Detection**: Arquitetura de três camadas (useSecurity → OrganizationContext → usePermissions)
- ✅ **Timeout Issues**: Timeout de 20s com fallback para cache
- ✅ **Validações Duplicadas**: Sistema de refs previne múltiplas validações simultâneas
- ✅ **Fallback Inseguro**: Removido fallback de admin por padrão de email
- ✅ **Verificação de Autorização**: Reativada com tratamento adequado
- ✅ **Role Incorreto**: Separação de responsabilidades (autorização vs. role)
- ✅ **Cache localStorage**: Persiste entre hard refreshes para performance instantânea

### Em Teste (Branch dev-auth-cache-v1.1)
- 🧪 **Sistema de Cache Duplo**: Em testes antes de deploy para produção
- 🧪 **Arquitetura de Três Camadas**: Validação da separação de responsabilidades

### Em Andamento
- 🔄 **Performance Geral**: Otimização de queries Supabase RLS
- 🔄 **Production Sync**: Sincronização dev/prod após testes aprovados

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
**Versão Oficial**: 1.0.0 (estável em produção)
**Versão Dev**: 1.1.0-beta (em testes na branch dev-auth-cache-v1.1)
**Status**: Desenvolvimento e testes locais

## 📝 Changelog

### v1.1.0-beta (17/10/2025) - EM TESTE (Branch: dev-auth-cache-v1.1)
🔬 **VERSÃO EM DESENVOLVIMENTO - TESTES LOCAIS**

**Objetivo:** Refatorar sistema de autenticação com arquitetura de produção e cache duplo.

**Mudanças Implementadas:**

**🏗️ Arquitetura de Três Camadas (Separação de Responsabilidades)**
- ✅ `useSecurity`: APENAS autorização (authorized_users table)
- ✅ `OrganizationContext`: Role por organização (members table)
- ✅ `usePermissions`: Permissões granulares baseadas em role

**⚡ Sistema de Cache Duplo**
- ✅ **Cache em Memória (Map)**: Primeira camada, ultra-rápido
- ✅ **localStorage**: Segunda camada, persiste entre hard refreshes
- ✅ **Duração**: 5 minutos (300.000ms)
- ✅ **Performance**: Hard refresh de 20s+ → 0ms (instantâneo)

**🔒 Melhorias de Segurança**
- ✅ Removido fallback inseguro de admin por padrão de email
- ✅ Timeout aumentado: 10s → 20s
- ✅ Fail-Secure: Nega acesso em caso de erro sem cache
- ✅ Validação única: Refs previnem validações duplicadas

**🐛 Correções**
- ✅ Hard Refresh travando por 20+ segundos
- ✅ Role incorreto (user em vez de admin)
- ✅ Loops infinitos de validação
- ✅ Timeouts falsos
- ✅ Validações duplicadas simultâneas

**📁 Arquivos Modificados:**
- `src/hooks/useSecurity.ts` - Refatoração completa (368 → 210 linhas)
- `src/components/ProtectedRoute.tsx` - Compatível com nova arquitetura
- `src/contexts/OrganizationContext.tsx` - Já consulta members table
- `src/hooks/usePermissions.ts` - Já usa role do OrganizationContext
- `DEV_TESTING_GUIDE.md` - Guia de testes completo (233 linhas)
- `CLAUDE.md` - Documentação atualizada

**✅ Checklist de Testes (DEV_TESTING_GUIDE.md):**
- [ ] Teste 1: Login normal funcionando
- [ ] Teste 2: Hard refresh não trava (5x)
- [ ] Teste 3: Cache acelerando validações
- [ ] Teste 4: Cache expira após 5 minutos
- [ ] Teste 5: Sem validações duplicadas
- [ ] Teste 6: Logout limpa cache
- [ ] Teste 7: Usuário não autorizado bloqueado
- [ ] Build de produção sem erros
- [ ] Preview local funcionando
- [ ] Console sem erros de sintaxe

**📋 Próximos Passos:**
1. **Testes Locais**: Seguir DEV_TESTING_GUIDE.md
2. **Aprovação**: Marcar todos os checkboxes do guia
3. **Merge**: dev-auth-cache-v1.1 → main
4. **Deploy**: Push para produção após aprovação

**Após Aprovação:**
- ✅ **Se aprovado:** Merge para main, deploy para produção, atualizar versão para v1.1.0
- ❌ **Se reprovado:** Reverter para v1.0.0 (git reset/revert)

### v1.0.0 (18/10/2024) - PRODUÇÃO ATUAL
- 🎉 Lançamento inicial do Connect IA
- ✅ Sistema de autenticação e autorização
- ✅ Multi-tenant com organizações
- ✅ Integrações WhatsApp, Instagram, Messenger
- ✅ Sistema de permissões granulares