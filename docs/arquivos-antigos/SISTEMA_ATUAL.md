# 📊 Sistema Connect IA - Documentação Atual

**Data:** 18 de Outubro de 2025
**Versão:** 1.0.0 - CRM Simplificado
**Status:** ✅ Funcionando

---

## 🎯 O Que Foi Implementado

### ✅ Sistema de Autenticação Ultra-Simples
- **Removido:** Sistema complexo de autorização, planos, trials, cache duplo
- **Implementado:** Cadastro simples com 4 campos:
  - Nome completo
  - Nome da empresa
  - Email
  - Senha

**Como funciona:**
1. Usuário se cadastra → `auth.users` (Supabase Auth)
2. Trigger automático cria organização → `public.orgs`
3. Usuário é adicionado como admin → `public.members`
4. Login automático após cadastro

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **orgs** (Organizações)
```sql
id           UUID (PK)
name         TEXT (nome da empresa)
slug         TEXT (identificador único)
owner_id     UUID → auth.users
created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
```

#### 2. **members** (Membros da Organização)
```sql
id           UUID (PK)
user_id      UUID → auth.users
org_id       UUID → orgs
role         TEXT (admin, manager, agent, viewer)
created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
```

#### 3. **contacts** (Contatos CRM)
```sql
id              UUID (PK)
org_id          UUID → orgs
full_name       TEXT
email           TEXT
phone_e164      TEXT (formato internacional: +5511999999999)
phone_display   TEXT (formato visual: (11) 99999-9999)
status          TEXT (active, inactive, blocked)
tags            TEXT[] (array de tags: ['cliente', 'vip', 'lead'])
notes           TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

**Dados Exemplo:**
- João Silva (cliente, vip)
- Maria Santos (lead)
- Pedro Costa (prospect)
- Ana Paula (cliente)
- Carlos Oliveira (lead, interessado)

#### 4. **conversations** (Conversas)
```sql
id                UUID (PK)
org_id            UUID → orgs
contact_id        UUID → contacts
channel           TEXT (whatsapp, instagram, messenger, email)
status            TEXT (open, closed, pending)
last_message_at   TIMESTAMPTZ
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ
```

**Dados Exemplo:** 5 conversas criadas, mix de abertas e fechadas

#### 5. **messages** (Mensagens)
```sql
id                UUID (PK)
conversation_id   UUID → conversations
content           TEXT
direction         TEXT (inbound, outbound)
sender_type       TEXT (contact, agent, bot)
status            TEXT (sent, delivered, read, failed)
created_at        TIMESTAMPTZ
```

**Dados Exemplo:** 10 mensagens de exemplo (ida e volta)

#### 6. **campaigns** (Campanhas)
```sql
id                UUID (PK)
org_id            UUID → orgs
name              TEXT
description       TEXT
status            TEXT (draft, active, paused, completed)
channel           TEXT (whatsapp, instagram, messenger, email)
total_contacts    INTEGER
sent_count        INTEGER
delivered_count   INTEGER
read_count        INTEGER
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ
```

**Dados Exemplo:**
- Campanha de Boas-Vindas (100 contatos, 85 enviados)
- Promoção Black Friday (50 contatos, completa)
- Follow-up Vendas (30 contatos, ativa)

#### 7. **prospects** (Pipeline de Vendas)
```sql
id                    UUID (PK)
org_id                UUID → orgs
contact_id            UUID → contacts
title                 TEXT
description           TEXT
value                 DECIMAL(10,2)
pipeline_stage        TEXT (lead, qualified, proposal, negotiation, won, lost)
probability           INTEGER (0-100)
expected_close_date   DATE
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

**Dados Exemplo:** 5 prospects em diferentes estágios do funil

---

## 🔒 Segurança (RLS - Row Level Security)

Todas as tabelas têm políticas RLS que garantem:
- Usuário só vê dados da SUA organização
- Isolamento total entre organizações (multi-tenant)
- Verificação via tabela `members`

**Exemplo de Política:**
```sql
CREATE POLICY "Users can view contacts of their org"
  ON public.contacts FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.members WHERE user_id = auth.uid()
    )
  );
```

---

## 📊 Dashboard

### Métricas Exibidas

**Principais Cards:**
1. **Total de Mensagens** - Com variação percentual
2. **Taxa de Abertura** - Com variação percentual
3. **Taxa de Conversão** - Com variação percentual
4. **Receita Gerada** - Com variação percentual

**Métricas em Tempo Real:**
1. **Conversas Ativas** - Quantas conversas abertas agora
2. **Tempo de Resposta** - Média em minutos
3. **Atendentes Online** - Online / Ocupados
4. **Status do Sistema** - Normal / Pico de atividade

**Filtros de Período:**
- Últimas 24 horas
- Últimos 7 dias (padrão)
- Últimos 30 dias
- Últimos 90 dias

### Abas do Dashboard

1. **Visão Geral**
   - Gráfico de evolução temporal (mensagens, conversas, receita)
   - Distribuição por canal (WhatsApp, Instagram, Facebook, Email)

2. **Analytics**
   - Satisfação dos clientes
   - Performance por hora do dia

3. **Insights**
   - Alertas inteligentes (performance, melhorias, picos)
   - Recomendações de IA (otimização, automação)

4. **Atividade**
   - Conversas e mensagens mais recentes
   - Timeline de atividades

---

## 🔄 Hooks Customizados

### useDynamicMetrics(timeRange)
Busca métricas agregadas do período:
- Total de mensagens, conversas, contatos
- Taxas de abertura, conversão, resposta
- Comparação com período anterior
- Atualiza a cada 30 segundos

### useRealtimeMetrics()
Métricas da última hora:
- Conversas ativas
- Mensagens recentes
- Tempo médio de resposta
- Atualiza a cada 10 segundos

### useCampaignMetrics(timeRange)
Estatísticas de campanhas:
- Total, ativas, completas, pausadas
- Variações percentuais
- Atualiza a cada minuto

### useContactMetrics(timeRange)
Estatísticas de contatos:
- Total, ativos, inativos, bloqueados
- Variações percentuais
- Atualiza a cada minuto

---

## 🚀 Como Usar

### 1. Cadastro
```
http://localhost:8082/autenticacao
```
- Preencher: Nome, Empresa, Email, Senha
- Clicar em "Criar Conta"
- Login automático após cadastro

### 2. Dashboard
```
http://localhost:8082/
http://localhost:8082/painel
```
- Visualizar todas as métricas
- Trocar período (24h, 7d, 30d, 90d)
- Explorar abas (Visão Geral, Analytics, Insights, Atividade)

### 3. Outras Páginas
- **/contatos** - Gestão de contatos
- **/campanhas** - Gestão de campanhas
- **/prospeccao** - Pipeline de vendas
- **/caixa-entrada** - Inbox de mensagens
- **/agentes-ia** - Configuração de agentes IA
- **/integracoes** - Integrações (WhatsApp, Instagram, etc)
- **/configuracoes** - Configurações do sistema

---

## 📝 Arquivos Importantes

### Migrações SQL
- `supabase/migrations/20251018110000_tabelas_basicas_crm.sql` - Criação das tabelas CRM
- `LIMPAR_SUPABASE_COMPLETO.sql` - Reset completo do banco

### Dados de Exemplo
- `dados_exemplo.sql` - Insere contatos, conversas, mensagens, campanhas, prospects

### Scripts de Desenvolvimento
- `BUILD_LIMPA.sh` - Build limpa com cache zerado
- `REINICIAR_SERVIDOR.md` - Guia de reinicialização

### Documentação
- `CLAUDE.md` - Documentação completa do projeto
- `SISTEMA_ATUAL.md` - Este arquivo (estado atual)

---

## ⚙️ Comandos Úteis

### Desenvolvimento
```bash
npm run dev              # Iniciar servidor (porta 8080, 8081 ou 8082)
npm run build            # Build de produção
npm run preview          # Visualizar build localmente
```

### Supabase (Docker)
```bash
# Executar SQL direto no container
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "SELECT * FROM public.orgs;"

# Inserir dados de exemplo
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < dados_exemplo.sql

# Ver logs do container
docker logs supabase_db_Connect_IA
```

### Limpeza de Cache
```bash
# Deletar cache do Vite
rm -rf node_modules/.vite

# Build limpa completa
./BUILD_LIMPA.sh
```

---

## 🐛 Problemas Resolvidos

### ✅ npm command not found
**Solução:** Adicionar Homebrew ao PATH
```bash
export PATH="/opt/homebrew/bin:$PATH"
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
```

### ✅ Column 'plan' does not exist
**Solução:** Remover referências a colunas de planos do código

### ✅ useSecurity import error
**Solução:** Remover imports do hook deletado

### ✅ messages.status missing
**Solução:** Adicionar coluna status
```sql
ALTER TABLE public.messages ADD COLUMN status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed'));
```

### ✅ Cache servindo código antigo
**Solução:** Reiniciar servidor dev (Ctrl+C → npm run dev)

---

## 📊 Próximos Passos Sugeridos

### Funcionalidades CRM
- [ ] Tela de Contatos (CRUD completo)
- [ ] Tela de Campanhas (criar, editar, pausar)
- [ ] Inbox de Mensagens (visualizar conversas)
- [ ] Pipeline de Vendas (Kanban de prospects)
- [ ] Relatórios Avançados (exportar PDF/Excel)

### Integrações
- [ ] WhatsApp Business API
- [ ] Instagram Direct API
- [ ] Facebook Messenger API
- [ ] Integração com Email (SMTP)

### Automação
- [ ] Respostas Automáticas
- [ ] Workflows de Automação
- [ ] Agendamento de Mensagens
- [ ] Gatilhos Baseados em Eventos

### IA e Machine Learning
- [ ] Agentes de IA (GPT-4, Claude)
- [ ] Análise de Sentimento
- [ ] Sugestões Inteligentes
- [ ] Previsão de Conversão

---

## 📞 Suporte

**Desenvolvedor:** Ricardo da Silva
**Empresa:** Agência Pixel
**Email:** ricardo@agenciapixel.digital

---

**Última atualização:** 18 de Outubro de 2025, 08:00 BRT
