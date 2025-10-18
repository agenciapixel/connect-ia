# 🚀 GUIA RÁPIDO DE DESENVOLVIMENTO - Connect IA

**Sistema:** CRM Simplificado com Dashboard em Tempo Real
**Última Atualização:** 18 de Outubro de 2025

---

## 📋 Índice
1. [Início Rápido](#início-rápido)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Trabalhando com Dados](#trabalhando-com-dados)
4. [Desenvolvimento Frontend](#desenvolvimento-frontend)
5. [Troubleshooting](#troubleshooting)
6. [Próximos Passos](#próximos-passos)

---

## 🎯 Início Rápido

### 1️⃣ Levantar o Servidor
```bash
npm run dev
```
O servidor irá abrir em uma das portas disponíveis: 8080, 8081 ou 8082

### 2️⃣ Acessar a Aplicação
```
http://localhost:8082/autenticacao
```

### 3️⃣ Criar Conta
- Nome: Seu Nome
- Empresa: Nome da Empresa
- Email: seu@email.com
- Senha: senha123

### 4️⃣ Ver Dashboard
```
http://localhost:8082/
```

---

## 📁 Estrutura do Projeto

### Arquivos Principais

```
Connect IA/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx         ⭐ Dashboard principal
│   │   ├── Auth.tsx              ⭐ Login/Cadastro
│   │   ├── Contacts.tsx          📇 Gestão de contatos
│   │   ├── Campaigns.tsx         📢 Gestão de campanhas
│   │   └── Prospects.tsx         💰 Pipeline de vendas
│   │
│   ├── hooks/
│   │   ├── useDynamicMetrics.ts  📊 Métricas do dashboard
│   │   ├── usePermissions.ts     🔐 Sistema de permissões
│   │   └── usePersistentAuth.ts  🔑 Autenticação persistente
│   │
│   ├── contexts/
│   │   └── OrganizationContext.tsx 🏢 Multi-tenant
│   │
│   └── components/
│       ├── ProtectedRoute.tsx     🛡️ Guard de autenticação
│       ├── MetricCard.tsx         📈 Cards de métricas
│       └── ui/                    🎨 Componentes Shadcn/ui
│
├── supabase/
│   └── migrations/
│       └── 20251018110000_tabelas_basicas_crm.sql  🗄️ Schema do DB
│
├── dados_exemplo.sql              📝 Dados iniciais
├── adicionar_mais_dados.sql       📝 Mais dados para testes
├── LIMPAR_SUPABASE_COMPLETO.sql   🧹 Reset do banco
│
├── SISTEMA_ATUAL.md               📖 Documentação do sistema
├── COMANDOS_DATABASE.md           📖 Comandos úteis de SQL
└── GUIA_RAPIDO_DESENVOLVIMENTO.md 📖 Este arquivo
```

### Páginas Disponíveis

| Rota | Componente | Status | Descrição |
|------|-----------|--------|-----------|
| `/autenticacao` | Auth | ✅ Pronto | Login e cadastro |
| `/` | Dashboard | ✅ Pronto | Dashboard principal |
| `/painel` | Dashboard | ✅ Pronto | Alias do dashboard |
| `/contatos` | Contacts | 🔨 Em dev | Lista de contatos |
| `/campanhas` | Campaigns | 🔨 Em dev | Gestão de campanhas |
| `/prospeccao` | Prospects | 🔨 Em dev | Pipeline de vendas |
| `/caixa-entrada` | Inbox | 🔨 Em dev | Inbox de mensagens |
| `/agentes-ia` | AgentsIA | 🔨 Em dev | Config de agentes IA |
| `/integracoes` | Integrations | 🔨 Em dev | Integrações de canais |
| `/configuracoes` | Settings | 🔨 Em dev | Configurações |

---

## 🗄️ Trabalhando com Dados

### Ver Dados Atuais

```bash
# Dashboard rápido
docker exec supabase_db_Connect_IA psql -U postgres -d postgres << 'EOF'
SELECT 'Contatos' as tipo, COUNT(*) FROM public.contacts
UNION ALL SELECT 'Conversas', COUNT(*) FROM public.conversations
UNION ALL SELECT 'Mensagens', COUNT(*) FROM public.messages
UNION ALL SELECT 'Campanhas', COUNT(*) FROM public.campaigns
UNION ALL SELECT 'Prospects', COUNT(*) FROM public.prospects;
EOF
```

### Adicionar Dados de Teste

```bash
# Adicionar mais 10 contatos, 3 conversas, 5 campanhas, 5 prospects
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < adicionar_mais_dados.sql
```

### Ver Contatos

```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT full_name, email, status, tags FROM public.contacts LIMIT 10;
"
```

### Ver Prospects por Estágio

```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "
SELECT
  pipeline_stage,
  COUNT(*) as quantidade,
  SUM(value) as valor_total
FROM public.prospects
GROUP BY pipeline_stage
ORDER BY
  CASE pipeline_stage
    WHEN 'won' THEN 1
    WHEN 'negotiation' THEN 2
    WHEN 'proposal' THEN 3
    WHEN 'qualified' THEN 4
    WHEN 'lead' THEN 5
  END;
"
```

### Resetar Banco de Dados

```bash
# ⚠️ CUIDADO: Isso deleta TODOS os dados!
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < LIMPAR_SUPABASE_COMPLETO.sql
```

Depois de resetar, você precisa:
1. Criar nova conta em `/autenticacao`
2. Inserir dados de exemplo novamente

### Mais Comandos SQL

Veja o arquivo `COMANDOS_DATABASE.md` para dezenas de comandos úteis!

---

## 💻 Desenvolvimento Frontend

### Estrutura de um Hook de Métricas

```typescript
// src/hooks/useMinhaMetrica.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export function useMinhaMetrica() {
  const { currentOrg } = useOrganization();

  return useQuery({
    queryKey: ['minha-metrica', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;

      // Buscar dados do Supabase
      const { data, error } = await supabase
        .from('minha_tabela')
        .select('*')
        .eq('org_id', currentOrg.id);

      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
    refetchInterval: 30000, // Atualizar a cada 30s
  });
}
```

### Usar Hook no Componente

```typescript
// src/pages/MinhaPagina.tsx
import { useMinhaMetrica } from '@/hooks/useMinhaMetrica';

export default function MinhaPagina() {
  const { data, isLoading } = useMinhaMetrica();

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Criar Novo Card de Métrica

```typescript
import { MetricCard } from '@/components/MetricCard';
import { Users } from 'lucide-react';

<MetricCard
  title="Total de Usuários"
  value={data?.length || 0}
  change={15} // +15%
  icon={<Users className="h-5 w-5 text-blue-600" />}
  className="border-blue-200"
/>
```

### Adicionar Rota Protegida

```typescript
// src/main.tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';
import MinhaPagina from '@/pages/MinhaPagina';

<Route
  path="/minha-pagina"
  element={
    <ProtectedRoute>
      <Layout>
        <MinhaPagina />
      </Layout>
    </ProtectedRoute>
  }
/>
```

---

## 🐛 Troubleshooting

### Problema: npm command not found

**Solução:**
```bash
export PATH="/opt/homebrew/bin:$PATH"
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Problema: Código antigo sendo servido (cache)

**Solução:**
```bash
# Parar servidor (Ctrl+C)
rm -rf node_modules/.vite
npm run dev
```

### Problema: Console mostrando erros 404 para tabelas

**Solução:** Aplicar a migration que cria as tabelas
```bash
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < supabase/migrations/20251018110000_tabelas_basicas_crm.sql
```

### Problema: "Column does not exist"

**Solução:** Verificar se a coluna existe no banco
```bash
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "\d public.nome_tabela"
```

Se não existir, adicionar:
```sql
ALTER TABLE public.nome_tabela ADD COLUMN nome_coluna TEXT;
```

### Problema: Dashboard vazio (sem dados)

**Solução:** Inserir dados de exemplo
```bash
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < dados_exemplo.sql
```

### Problema: Build falhando com erros de import

**Solução:** Build limpa
```bash
./BUILD_LIMPA.sh
```

---

## 🚀 Próximos Passos

### Funcionalidades Prioritárias

#### 1. Página de Contatos (CRUD Completo)
**Arquivo:** `src/pages/Contacts.tsx`

**Features:**
- [ ] Tabela com todos os contatos
- [ ] Filtros por status e tags
- [ ] Busca por nome/email
- [ ] Modal para criar/editar
- [ ] Deletar contato (com confirmação)
- [ ] Importar CSV
- [ ] Exportar para Excel

**Queries necessárias:**
```typescript
// Listar contatos
const { data } = await supabase
  .from('contacts')
  .select('*')
  .eq('org_id', currentOrg.id)
  .order('created_at', { ascending: false });

// Criar contato
const { data, error } = await supabase
  .from('contacts')
  .insert({
    org_id: currentOrg.id,
    full_name: 'Nome',
    email: 'email@exemplo.com',
    status: 'active',
    tags: ['lead']
  });

// Atualizar contato
const { error } = await supabase
  .from('contacts')
  .update({ status: 'inactive' })
  .eq('id', contactId);

// Deletar contato
const { error } = await supabase
  .from('contacts')
  .delete()
  .eq('id', contactId);
```

#### 2. Inbox de Mensagens
**Arquivo:** `src/pages/Inbox.tsx`

**Features:**
- [ ] Lista de conversas (sidebar)
- [ ] Visualizar mensagens da conversa
- [ ] Enviar mensagem
- [ ] Marcar como lida
- [ ] Filtrar por canal
- [ ] Busca por contato

**Queries necessárias:**
```typescript
// Listar conversas
const { data } = await supabase
  .from('conversations')
  .select(`
    *,
    contacts (
      full_name,
      email,
      phone_display
    )
  `)
  .eq('org_id', currentOrg.id)
  .order('last_message_at', { ascending: false });

// Listar mensagens de uma conversa
const { data } = await supabase
  .from('messages')
  .select('*')
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: true });
```

#### 3. Pipeline de Vendas (Kanban)
**Arquivo:** `src/pages/Prospects.tsx`

**Features:**
- [ ] Kanban com estágios (lead → qualified → proposal → negotiation → won/lost)
- [ ] Drag & drop entre estágios
- [ ] Modal com detalhes do prospect
- [ ] Editar valor e probabilidade
- [ ] Ver histórico de movimentações

**Bibliotecas recomendadas:**
- `@dnd-kit/core` - Drag and drop
- `react-beautiful-dnd` - Alternativa

#### 4. Gestão de Campanhas
**Arquivo:** `src/pages/Campaigns.tsx`

**Features:**
- [ ] Criar campanha
- [ ] Selecionar contatos (filtros, tags)
- [ ] Configurar canal (WhatsApp, Email, etc)
- [ ] Agendar envio
- [ ] Ver relatório (enviadas, entregues, lidas)
- [ ] Pausar/retomar campanha

#### 5. Configuração de Agentes IA
**Arquivo:** `src/pages/AgentsIA.tsx`

**Features:**
- [ ] Criar agente de IA
- [ ] Configurar prompt e temperatura
- [ ] Selecionar modelo (GPT-4, Claude, etc)
- [ ] Testar agente
- [ ] Ativar/desativar
- [ ] Ver histórico de uso

---

## 🎨 Design System

### Componentes Shadcn/ui Disponíveis

- `Button` - Botões com variantes
- `Card` - Cards com header/content
- `Badge` - Badges e tags
- `Input` - Campos de entrada
- `Select` - Dropdowns
- `Dialog` - Modais
- `Table` - Tabelas
- `Tabs` - Abas
- `Skeleton` - Loading states
- `Progress` - Barras de progresso
- `Toast` (via Sonner) - Notificações

### Ícones (Lucide React)

```typescript
import {
  Users,         // Usuários
  MessageSquare, // Mensagens
  Send,          // Enviar
  Calendar,      // Calendário
  TrendingUp,    // Gráfico subindo
  Settings,      // Configurações
  // ... 100+ ícones disponíveis
} from 'lucide-react';
```

---

## 📚 Recursos Úteis

### Documentação

- **Supabase:** https://supabase.com/docs
- **React Query:** https://tanstack.com/query/latest
- **Shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev

### Arquivos de Referência

- `CLAUDE.md` - Documentação completa do projeto
- `SISTEMA_ATUAL.md` - Estado atual do sistema
- `COMANDOS_DATABASE.md` - Comandos SQL úteis
- `REINICIAR_SERVIDOR.md` - Como reiniciar o servidor
- `BUILD_LIMPA.sh` - Script de build limpa

---

## ✅ Checklist de Desenvolvimento

### Antes de Começar
- [ ] Servidor dev rodando (`npm run dev`)
- [ ] Supabase Docker rodando
- [ ] Dados de exemplo inseridos
- [ ] Dashboard abrindo sem erros

### Durante Desenvolvimento
- [ ] Criar branch para feature (`git checkout -b feature/nome`)
- [ ] Testar queries SQL no Docker antes de usar no código
- [ ] Verificar console do navegador para erros
- [ ] Usar React Query DevTools para debug
- [ ] Adicionar tipos TypeScript corretos

### Antes de Commit
- [ ] Código sem erros TypeScript (`npm run build`)
- [ ] Testar funcionalidade manualmente
- [ ] Verificar se não quebrou outras páginas
- [ ] Console limpo (sem errors/warnings)
- [ ] Commit message descritivo

---

## 💡 Dicas de Produtividade

### 1. Atalhos do Terminal
```bash
# Criar alias no ~/.zshrc
alias dev="npm run dev"
alias dblog="docker logs supabase_db_Connect_IA"
alias dbexec="docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres"
```

### 2. VSCode Extensions Recomendadas
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostgreSQL (para syntax highlight SQL)
- GitLens

### 3. Hot Reload do Dashboard
O Dashboard atualiza automaticamente a cada:
- 10s - Métricas em tempo real
- 30s - Métricas principais
- 60s - Métricas de campanhas/contatos

Não precisa recarregar a página!

### 4. Debugging de Queries
```typescript
const { data, error } = await supabase.from('table').select('*');
console.log('Data:', data);
console.log('Error:', error);
```

---

## 🎯 Meta de Desenvolvimento

### Versão 1.1.0 (Próxima Release)
**Objetivo:** CRM Funcional Completo

**Features:**
- ✅ Dashboard em tempo real (FEITO)
- ✅ Sistema de autenticação simplificado (FEITO)
- ✅ Banco de dados com RLS (FEITO)
- 🔨 Gestão de contatos (CRUD completo)
- 🔨 Inbox de mensagens (visualizar conversas)
- 🔨 Pipeline de vendas (Kanban)
- 🔨 Gestão de campanhas (criar e monitorar)

**Prazo Estimado:** 2-3 semanas

---

**Bom desenvolvimento! 🚀**

Se tiver dúvidas, consulte:
1. `SISTEMA_ATUAL.md` - O que já está pronto
2. `COMANDOS_DATABASE.md` - Como trabalhar com dados
3. `CLAUDE.md` - Documentação completa do projeto
