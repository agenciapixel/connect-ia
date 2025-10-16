# 🔐 Sistema de Controle de Acesso por Roles

## 📋 Visão Geral

O sistema implementa um controle de acesso granular baseado em **4 níveis de usuário**, cada um com permissões específicas para diferentes funcionalidades do sistema.

## 👥 Níveis de Usuário

### 🔴 **Administrador (Admin)**
- **Acesso Total**: Todas as funcionalidades do sistema
- **Responsabilidades**: 
  - Configuração geral do sistema
  - Gestão de usuários e organizações
  - Configurações de faturamento
  - Acesso completo a todas as funcionalidades

### 🔵 **Gerente (Manager)**
- **Acesso Gerencial**: Gestão operacional sem configurações críticas
- **Responsabilidades**:
  - Gestão de atendentes (exceto exclusão)
  - Gestão completa de campanhas e CRM
  - Acesso a relatórios e analytics
  - Configuração de integrações (exceto webhooks)
  - **NÃO PODE**: Excluir atendentes, gerenciar configurações do sistema, gerenciar usuários

### 🟢 **Atendente (Agent)**
- **Acesso Operacional**: Foco no atendimento ao cliente
- **Responsabilidades**:
  - Painel pessoal de atendimento
  - Visualização de suas próprias métricas
  - Criação de contatos e prospects
  - Edição de contatos e prospects
  - Acesso ao inbox
  - Visualização de relatórios básicos
  - **NÃO PODE**: Gestão de atendentes, campanhas, CRM, integrações, configurações

### 👁️ **Visualizador (Viewer)**
- **Acesso Somente Leitura**: Apenas visualização de dados
- **Responsabilidades**:
  - Visualização de relatórios e analytics
  - Visualização de métricas de atendentes
  - Visualização de campanhas e CRM
  - Acesso ao inbox (somente leitura)
  - **NÃO PODE**: Criar, editar ou excluir qualquer conteúdo

## 🛡️ Sistema de Permissões

### **Estrutura de Permissões**

Cada funcionalidade tem permissões específicas:

```typescript
interface Permissions {
  // Gestão de Atendentes
  canManageAttendants: boolean;
  canCreateAttendants: boolean;
  canEditAttendants: boolean;
  canDeleteAttendants: boolean;
  canViewAttendantMetrics: boolean;
  
  // Gestão de Campanhas
  canManageCampaigns: boolean;
  canCreateCampaigns: boolean;
  canEditCampaigns: boolean;
  canDeleteCampaigns: boolean;
  canViewCampaignAnalytics: boolean;
  
  // CRM e Prospects
  canManageCRM: boolean;
  canCreateProspects: boolean;
  canEditProspects: boolean;
  canDeleteProspects: boolean;
  canViewCRMAnalytics: boolean;
  
  // Contatos
  canManageContacts: boolean;
  canCreateContacts: boolean;
  canEditContacts: boolean;
  canDeleteContacts: boolean;
  
  // Integrações
  canManageIntegrations: boolean;
  canConnectChannels: boolean;
  canConfigureWebhooks: boolean;
  
  // Configurações
  canManageSettings: boolean;
  canManageUsers: boolean;
  canManageBilling: boolean;
  
  // Relatórios e Analytics
  canViewReports: boolean;
  canExportData: boolean;
  canViewAdvancedAnalytics: boolean;
  
  // Inbox e Conversas
  canAccessInbox: boolean;
  canManageConversations: boolean;
  canAssignConversations: boolean;
  
  // AI Agents
  canManageAIAgents: boolean;
  canCreateAIAgents: boolean;
  canConfigureAIAgents: boolean;
}
```

## 🎯 Matriz de Permissões

| Funcionalidade | Admin | Manager | Agent | Viewer |
|---|---|---|---|---|
| **Gestão de Atendentes** | ✅ Total | ✅ Parcial* | ❌ | 👁️ Visualizar |
| **Gestão de Campanhas** | ✅ Total | ✅ Total | ❌ | 👁️ Visualizar |
| **Gestão de CRM** | ✅ Total | ✅ Total | ✅ Parcial** | 👁️ Visualizar |
| **Gestão de Contatos** | ✅ Total | ✅ Total | ✅ Parcial** | 👁️ Visualizar |
| **Gestão de Integrações** | ✅ Total | ✅ Parcial*** | ❌ | ❌ |
| **Configurações do Sistema** | ✅ Total | ❌ | ❌ | ❌ |
| **Relatórios e Analytics** | ✅ Total | ✅ Total | ✅ Básicos | 👁️ Visualizar |
| **Inbox e Conversas** | ✅ Total | ✅ Total | ✅ Próprias | 👁️ Somente Leitura |
| **Agentes IA** | ✅ Total | ✅ Total | ❌ | 👁️ Visualizar |

*Manager: Pode criar/editar atendentes, mas não pode excluir  
**Agent: Pode criar/editar contatos e prospects, mas não pode excluir  
***Manager: Pode conectar canais, mas não pode configurar webhooks

## 🔧 Implementação Técnica

### **1. Hook de Permissões**
```typescript
const { userRole, permissions, canAccess } = usePermissions();
```

### **2. Proteção de Rotas**
```typescript
<SmartRoute permission="canManageAttendants">
  <Attendants />
</SmartRoute>
```

### **3. Proteção de Componentes**
```typescript
<PermissionGuard permission="canCreateAttendants">
  <Button>Criar Atendente</Button>
</PermissionGuard>
```

### **4. Ocultação de Elementos**
```typescript
<HiddenUnless permission="canDeleteAttendants">
  <Button variant="destructive">Excluir</Button>
</HiddenUnless>
```

## 🎨 Interface do Usuário

### **Badge de Role**
- **Admin**: 🔴 Badge vermelho com ícone de coroa
- **Manager**: 🔵 Badge azul com ícone de escudo  
- **Agent**: 🟢 Badge verde com ícone de usuário
- **Viewer**: ⚪ Badge cinza com ícone de olho

### **Sidebar Inteligente**
- Mostra apenas itens de menu baseados nas permissões do usuário
- Atualiza dinamicamente conforme o role

### **Páginas Protegidas**
- Redirecionamento automático para página de acesso negado
- Mensagens explicativas sobre permissões necessárias
- Painel personalizado para atendentes

## 🚀 Funcionalidades Especiais

### **Redirecionamento Inteligente**
- **Atendentes** que acessam `/attendants` são redirecionados para o **Painel Pessoal**
- **Outros roles** com permissão acessam a **Página de Gestão**

### **Painel do Atendente**
- Métricas pessoais das últimas 24h
- Conversas atribuídas
- Status online/ausente
- Histórico de performance

### **Mensagens de Acesso Negado**
- Explicação clara da permissão necessária
- Sugestão de contato com administrador
- Botão para voltar à página anterior

## 📊 Monitoramento e Auditoria

### **Logs de Acesso**
- Registro de tentativas de acesso negado
- Histórico de mudanças de permissões
- Rastreamento de ações por role

### **Métricas de Uso**
- Tempo de sessão por role
- Funcionalidades mais utilizadas
- Padrões de acesso

## 🔄 Atualizações Futuras

### **Permissões Granulares**
- Permissões por funcionalidade específica
- Permissões por período (horário de trabalho)
- Permissões por localização/região

### **Workflows de Aprovação**
- Aprovação para ações críticas
- Notificações para supervisores
- Logs de auditoria detalhados

### **Integração com SSO**
- Autenticação via Active Directory
- Sincronização automática de roles
- Mapeamento de grupos organizacionais

---

## 📝 Conclusão

O sistema de permissões garante que cada usuário tenha acesso apenas às funcionalidades necessárias para seu papel, mantendo a segurança e organização do sistema. A implementação é flexível e permite futuras expansões conforme necessário.

