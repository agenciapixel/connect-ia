# 👥 Guia Completo de Gestão de Acessos

## 📋 Visão Geral

Este guia explica como gerenciar usuários e permissões no sistema Omnichat IA, permitindo controle total sobre quem pode acessar quais funcionalidades.

## 🎯 Acessando a Gestão de Usuários

### **Como Acessar:**
1. **Login como Administrador** - Apenas admins podem gerenciar usuários
2. **Menu Lateral** - Clique em "Usuários" (ícone de engrenagem com usuário)
3. **URL Direta** - `/users` (redirecionado se não for admin)

### **Pré-requisitos:**
- ✅ Ser **Administrador** da organização
- ✅ Ter permissão `canManageUsers`
- ✅ Estar logado na organização correta

## 👑 Página de Gestão de Usuários

### **📊 Dashboard de Estatísticas**
- **Total de Usuários**: Quantidade total de membros
- **Administradores**: Usuários com acesso total
- **Gerentes**: Usuários com gestão operacional
- **Atendentes**: Usuários focados no atendimento

### **🔍 Funcionalidades Principais:**

#### **1. Listagem de Membros**
- **Filtros Disponíveis:**
  - 🔍 **Busca**: Por nome ou email
  - 🏷️ **Role**: Filtrar por tipo de usuário
  - 📅 **Data**: Membro desde
  - 🔄 **Status**: Online/Offline

- **Informações Exibidas:**
  - 👤 **Avatar e Nome** do usuário
  - 📧 **Email** de contato
  - 🏷️ **Badge do Role** com cor específica
  - 📞 **Telefone** (se informado)
  - 📅 **Data de entrada** na organização
  - 🕐 **Último login** (se disponível)

#### **2. Ações Disponíveis:**
- **✏️ Editar Role**: Alterar nível de acesso
- **🗑️ Remover**: Excluir da organização
- **👁️ Visualizar**: Ver detalhes completos

## 🔄 Como Alterar Roles de Usuários

### **Passo a Passo:**

1. **Acesse a Lista de Membros**
   - Vá para a aba "Membros"
   - Localize o usuário desejado

2. **Abra o Menu de Ações**
   - Clique nos "..." ao lado do usuário
   - Selecione "Editar Role"

3. **Escolha o Novo Role**
   - **Administrador**: Acesso total ao sistema
   - **Gerente**: Gestão operacional
   - **Atendente**: Foco no atendimento
   - **Visualizador**: Apenas leitura

4. **Confirme a Alteração**
   - Clique em "Salvar Alterações"
   - A alteração é aplicada imediatamente

### **⚠️ Importante:**
- **Alterações são Imediatas**: Aplicadas em tempo real
- **Backup Automático**: Configurações anteriores são salvas
- **Log de Auditoria**: Todas as alterações são registradas

## 📧 Sistema de Convites

### **Como Convidar Novos Usuários:**

1. **Clique em "Convidar Usuário"**
   - Botão azul no canto superior direito

2. **Preencha os Dados:**
   - 📧 **Email**: Email do novo usuário
   - 🏷️ **Role**: Nível de acesso inicial

3. **Roles Disponíveis para Convite:**
   - **Visualizador**: Recomendado para novos usuários
   - **Atendente**: Para equipe de atendimento
   - **Gerente**: Para supervisores
   - **Administrador**: Use com cuidado!

4. **Envie o Convite**
   - O usuário receberá email com link de acesso
   - Convite expira em 7 dias
   - Pode ser reenviado se necessário

### **Gerenciando Convites Pendentes:**
- **Visualizar**: Aba "Convites"
- **Reenviar**: Para convites próximos do vencimento
- **Cancelar**: Para convites não mais necessários

## 📝 Logs de Atividade

### **O que é Registrado:**
- ✅ **Alterações de Roles**
- ✅ **Convites Enviados**
- ✅ **Remoções de Usuários**
- ✅ **Logins no Sistema**
- ✅ **Acessos a Funcionalidades**

### **Informações dos Logs:**
- 👤 **Usuário**: Quem fez a ação
- ⏰ **Timestamp**: Quando aconteceu
- 🔄 **Ação**: O que foi feito
- 📋 **Detalhes**: Informações específicas

## ⚙️ Configurações Avançadas de Permissões

### **Acessando as Configurações:**
1. **Na página de Usuários**, clique em "Configurar Permissões"
2. **Ou acesse diretamente** `/permissions`

### **Funcionalidades Disponíveis:**

#### **1. Matriz de Permissões**
- **Visualização por Role**: Admin, Manager, Agent, Viewer
- **Permissões por Categoria**: Gestão, Marketing, Vendas, etc.
- **Configuração Granular**: Ativar/desativar permissões específicas

#### **2. Permissões Personalizadas**
- **Permissões Extras**: Além das configurações padrão
- **Exemplos**:
  - Gerentes podem excluir atendentes
  - Atendentes podem exportar dados
  - Visualizadores podem ver faturamento

#### **3. Log de Auditoria**
- **Histórico Completo**: Todas as alterações de permissões
- **Rastreabilidade**: Quem alterou o quê e quando
- **Compliance**: Para auditorias e conformidade

## 🎯 Melhores Práticas

### **👑 Para Administradores:**
1. **Princípio do Menor Privilégio**: Dê apenas as permissões necessárias
2. **Revisão Regular**: Verifique permissões periodicamente
3. **Documentação**: Mantenha registro das alterações
4. **Backup**: Sempre tenha um admin secundário

### **🛡️ Para Gerentes:**
1. **Delegação Cuidadosa**: Atribua roles apropriados
2. **Treinamento**: Oriente usuários sobre suas permissões
3. **Monitoramento**: Acompanhe uso das funcionalidades

### **👤 Para Atendentes:**
1. **Conhecimento das Limitações**: Entenda o que pode/não pode fazer
2. **Solicitação de Acesso**: Peça permissões quando necessário
3. **Uso Responsável**: Use apenas funcionalidades permitidas

## 🚨 Situações Especiais

### **Usuário Sem Permissões Adequadas:**
1. **Identifique o Problema**: Qual funcionalidade está bloqueada
2. **Verifique o Role**: Confirme o nível de acesso atual
3. **Altere se Necessário**: Use a interface de gestão
4. **Teste**: Confirme que o acesso foi liberado

### **Usuário Removido por Engano:**
1. **Acesse Logs**: Verifique quando foi removido
2. **Reenvie Convite**: Com o role correto
3. **Comunique**: Informe o usuário sobre o novo acesso

### **Múltiplos Administradores:**
1. **Distribua Responsabilidades**: Cada admin com foco específico
2. **Comunicação**: Mantenha alinhamento sobre mudanças
3. **Backup**: Sempre tenha pelo menos 2 admins ativos

## 📊 Relatórios e Monitoramento

### **Métricas Importantes:**
- **Usuários Ativos**: Quantos fazem login regularmente
- **Distribuição de Roles**: Balanceamento da equipe
- **Tentativas de Acesso Negado**: Possíveis problemas de permissão
- **Uso de Funcionalidades**: Quais são mais utilizadas

### **Alertas Recomendados:**
- 🔔 **Novo Admin Criado**: Notificação imediata
- 🔔 **Muitos Acessos Negados**: Possível problema de configuração
- 🔔 **Convite Expirado**: Reenviar se necessário
- 🔔 **Usuário Inativo**: Verificar se ainda é necessário

## 🔧 Solução de Problemas

### **Problema: Usuário não consegue acessar funcionalidade**
**Solução:**
1. Verifique o role do usuário
2. Confirme se a permissão está habilitada
3. Teste com outro usuário do mesmo role
4. Verifique logs de erro

### **Problema: Alterações não estão sendo aplicadas**
**Solução:**
1. Confirme que é administrador
2. Verifique se tem permissão `canManageUsers`
3. Recarregue a página
4. Limpe cache do navegador

### **Problema: Convite não chegou**
**Solução:**
1. Verifique spam/lixo eletrônico
2. Confirme email correto
3. Reenvie o convite
4. Verifique se não expirou

## 📞 Suporte e Contato

### **Quando Buscar Ajuda:**
- ❌ **Erros de Permissão**: Sistema não reconhece admin
- ❌ **Perda de Acesso**: Admin principal bloqueado
- ❌ **Problemas de Convite**: Emails não chegam
- ❌ **Configurações Complexas**: Permissões personalizadas

### **Informações para Suporte:**
- 👤 **Seu Role**: Admin/Manager/etc
- 🏢 **Organização**: Nome da organização
- 🔄 **Ação Tentada**: O que estava fazendo
- 📱 **Navegador**: Chrome/Firefox/Safari
- 📅 **Quando Aconteceu**: Data e hora

---

## 🎉 Conclusão

Com este sistema de gestão de acessos, você tem controle total sobre quem pode acessar quais funcionalidades do sistema. Use essas ferramentas com responsabilidade e sempre siga as melhores práticas de segurança.

**Lembre-se**: É melhor começar com permissões restritivas e liberar conforme necessário, do que dar acesso total e depois restringir.





