# 🎯 CRM Interno - Guia Completo

## 📋 Visão Geral

Sistema de CRM (Customer Relationship Management) integrado ao módulo de Prospecção, permitindo gerenciar todo o funil de vendas desde a identificação do prospect até a conversão em cliente.

---

## 🏗️ Arquitetura

### **Banco de Dados**

#### Tabela `prospects` (atualizada):
```sql
- pipeline_stage: Estágio atual (lead, contacted, qualified, proposal, negotiation, won, lost)
- pipeline_position: Posição dentro do estágio
- expected_revenue: Receita esperada (R$)
- probability: Probabilidade de conversão (0-100%)
- deal_value: Valor do negócio
- last_activity: Última atividade registrada
- next_followup: Próximo follow-up agendado
- source: Origem (google_places, manual, etc.)
```

#### Tabela `prospect_activities` (nova):
```sql
- prospect_id: FK para prospects
- activity_type: note | call | email | meeting | task | status_change
- title: Título da atividade
- description: Descrição detalhada
- completed: Se a atividade foi concluída
- due_date: Data de vencimento
- created_by: Usuário que criou
```

---

## 🎨 Interface

### **4 Abas Principais**:

#### 1. **Buscar**
- Formulário de busca no Google Maps
- Filtros por categoria, localização, raio
- Busca por GPS

#### 2. **Resultados**
- Cards visuais dos lugares encontrados
- Informações: nome, endereço, telefone, website, rating
- Salvamento automático no banco

#### 3. **CRM Pipeline** ⭐ (NOVO)
- Visualização Kanban do funil de vendas
- 6 Estágios do pipeline:
  - 🏢 **Lead**: Prospects recém-descobertos
  - 📞 **Contactados**: Primeiro contato realizado
  - ✅ **Qualificados**: Prospects com potencial confirmado
  - 📧 **Proposta**: Proposta comercial enviada
  - 💰 **Negociação**: Em negociação de valores/termos
  - 🎉 **Ganhos**: Negócio fechado

- **Recursos**:
  - Mover prospects entre estágios com um clique
  - Contadores de prospects por estágio
  - Soma de valores esperados por estágio
  - Cards com informações resumidas

#### 4. **Lista Completa**
- Tabela com todos os prospects
- **Seleção múltipla** com checkboxes
- **Exportação em massa** para Contatos
- Filtro por busca
- Importação individual

---

## 🚀 Funcionalidades

### **Pipeline Visual (Kanban)**

**Como funciona:**
1. Todos os prospects novos entram no estágio "Lead"
2. Use o botão "→ Próximo Estágio" para avançar
3. Prospects no estágio "Ganhos" podem ser exportados para Contatos

**Informações exibidas em cada card:**
- Nome do estabelecimento
- Categoria/tipo
- Endereço
- Valor esperado (se configurado)
- Botões de ação

**Estatísticas por estágio:**
- Contador de prospects
- Soma total de receita esperada

---

### **Exportação em Massa**

**Como usar:**
1. Vá para a aba "Lista Completa"
2. Selecione os prospects desejados (checkbox)
3. Clique em "Exportar para Contatos (X)"
4. Confirme a exportação no modal

**O que acontece:**
- ✅ Cada prospect vira um contato
- ✅ Informações copiadas: nome, telefone, tags
- ✅ Status do prospect muda para "imported"
- ✅ Aparece na aba Contatos do sistema
- ✅ Duplicatas são evitadas (verifica telefone)

---

### **Seleção Múltipla**

**Atalhos:**
- Checkbox no cabeçalho: Seleciona/deseleciona TODOS
- Checkbox individual: Seleciona prospect específico
- Contador no botão mostra quantos selecionados

---

## 📊 Fluxo de Trabalho Recomendado

### **1. Prospecção**
```
Buscar → Encontrar prospects no Google Maps
        → Salvar automaticamente como "Lead"
```

### **2. Qualificação**
```
CRM Pipeline → Revisar leads
              → Mover para "Contactados" (após ligar/enviar email)
              → Qualificar (mover para "Qualificados")
```

### **3. Vendas**
```
CRM Pipeline → Enviar proposta (mover para "Proposta")
              → Negociar valores (mover para "Negociação")
              → Fechar negócio (mover para "Ganhos")
```

### **4. Conversão**
```
CRM Pipeline → Estágio "Ganhos"
              → Clicar em "Exportar"
              → Prospect vira Cliente na aba Contatos
```

---

## 🎯 Casos de Uso

### **Caso 1: Prospecção de Restaurantes**

```
1. Buscar: "restaurantes em Pinheiros, SP"
   → 20 resultados salvos como "Lead"

2. CRM Pipeline:
   → Ligar para 5 restaurantes
   → Mover para "Contactados"
   → 3 demonstraram interesse
   → Mover para "Qualificados"

3. Enviar propostas para os 3
   → Mover para "Proposta"

4. 2 aceitaram negociar
   → Mover para "Negociação"

5. 1 fechou contrato
   → Mover para "Ganhos"
   → Exportar para Contatos
```

### **Caso 2: Exportação em Massa**

```
1. Buscar: "academias em São Paulo"
   → 50 resultados

2. Qualificar rapidamente:
   → Ligar para todas
   → Selecionar as 15 interessadas

3. Exportar em massa:
   → Marcar checkboxes das 15
   → Clicar "Exportar para Contatos (15)"
   → Confirmar
   → Todas viram contatos instantaneamente
```

---

## 💡 Melhores Práticas

### **Organização do Pipeline**

✅ **Fazer:**
- Mover prospects regularmente entre estágios
- Adicionar valores esperados (expected_revenue)
- Registrar atividades importantes
- Fazer follow-ups programados

❌ **Evitar:**
- Deixar prospects parados em um estágio
- Pular estágios sem justificativa
- Esquecer de atualizar valores
- Perder o histórico de interações

---

### **Exportação para Contatos**

✅ **Quando exportar:**
- Prospect fechou negócio (estágio "Ganhos")
- Precisa criar campanha específica
- Quer usar recursos da aba Contatos
- Cliente precisa estar no CRM de longo prazo

❌ **Não exportar:**
- Prospects ainda em prospecção
- Leads frios que não responderam
- Duplicatas (sistema já previne)
- Prospects no estágio "lost"

---

## 📈 Métricas Disponíveis

### **Por Estágio:**
- Quantidade de prospects
- Valor total esperado
- Taxa de conversão entre estágios

### **Globais:**
- Total de prospects
- Prospects qualificados
- Prospects contactados
- Taxa de fechamento

---

## 🔧 Configuração Avançada

### **Personalizar Valores Esperados**

Você pode editar manualmente o valor esperado de cada prospect:

```sql
UPDATE prospects
SET expected_revenue = 5000.00,
    probability = 75
WHERE id = 'prospect_id';
```

### **Adicionar Atividades**

```sql
INSERT INTO prospect_activities (prospect_id, activity_type, title, description)
VALUES (
  'prospect_id',
  'call',
  'Ligação de follow-up',
  'Cliente demonstrou interesse no plano premium'
);
```

---

## 🚧 Próximas Melhorias (Roadmap)

### **Curto Prazo**:
- [ ] Drag & drop entre estágios
- [ ] Edição inline de valores
- [ ] Filtros avançados na lista

### **Médio Prazo**:
- [ ] Relatórios de performance
- [ ] Gráficos de funil
- [ ] Automações (ex: email automático ao mudar estágio)

### **Longo Prazo**:
- [ ] Integração com AI para scoring automático
- [ ] Sugestões de próximas ações
- [ ] Previsão de fechamento

---

## 📞 Suporte

Para dúvidas ou sugestões sobre o CRM interno:
1. Verifique este guia primeiro
2. Consulte o [CLAUDE.md](../CLAUDE.md) para detalhes técnicos
3. Reporte issues no repositório

---

## ✅ Checklist de Implementação

- [x] Migration do banco com campos de CRM
- [x] Tabela de atividades
- [x] Componente visual de pipeline
- [x] Integração com página Prospects
- [x] Seleção múltipla
- [x] Exportação em massa
- [x] Prevenção de duplicatas
- [x] RLS policies configuradas
- [x] Documentação completa

**Status**: 100% Implementado e Funcional! 🎉
