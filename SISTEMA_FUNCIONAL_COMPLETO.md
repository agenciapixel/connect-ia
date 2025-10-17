# 🚀 Guia Completo - Sistema Connect IA Funcional

## 📋 Status Atual
✅ **Sistema carregando com estilos**  
✅ **Tailwind CSS processado corretamente**  
✅ **Arquivos de configuração criados**  
⏳ **Aguardando configuração do banco de dados**

---

## 🗄️ Configuração do Banco de Dados

### 1. **Acesse o Supabase Dashboard**
- Vá para [supabase.com](https://supabase.com)
- Acesse seu projeto Connect IA
- Vá para **SQL Editor**

### 2. **Execute os Scripts em Ordem**

#### **Passo 1: Configuração Inicial**
```sql
-- Cole o conteúdo do arquivo: setup_initial_data.sql
```
Este script:
- ✅ Cria a organização principal
- ✅ Configura você como administrador
- ✅ Cria atendente automático padrão

#### **Passo 2: Verificar Estado**
```sql
-- Cole o conteúdo do arquivo: check_database.sql
```
Este script verifica:
- 📊 Quantidade de registros em cada tabela
- 👥 Usuários e permissões
- 🔗 Integrações ativas
- 📈 Estatísticas gerais

#### **Passo 3: Testar Integrações**
```sql
-- Cole o conteúdo do arquivo: test_integrations.sql
```
Este script:
- 🧪 Testa criação de canais WhatsApp/Instagram
- 🧪 Testa criação de atendentes
- ✅ Verifica se tudo está funcionando

#### **Passo 4: Limpeza (se necessário)**
```sql
-- Cole o conteúdo do arquivo: cleanup_database.sql
```
Este script:
- 🧹 Remove dados de teste antigos
- 🔄 Reset contadores
- ⚡ Otimiza performance

---

## 🔗 Configuração das Integrações

### **WhatsApp Business API**
1. **No Supabase:** Execute `test_integrations.sql`
2. **No Sistema:** Vá para Integrações → WhatsApp
3. **Configure:**
   - Phone Number ID
   - Access Token
   - Webhook URL: `https://connectia.agenciapixel.digital/api/webhook`

### **Instagram Basic Display**
1. **No Supabase:** Execute `test_integrations.sql`
2. **No Sistema:** Vá para Integrações → Instagram
3. **Configure:**
   - Instagram Account ID
   - Access Token
   - Webhook URL: `https://connectia.agenciapixel.digital/api/webhook`

---

## 🧪 Testando o Sistema

### **1. Teste Local**
```bash
# Acesse: http://localhost:3000
# Verifique se:
✅ Login funciona
✅ Dashboard carrega
✅ Sidebar com estilos
✅ Navegação entre páginas
```

### **2. Teste Produção**
```bash
# Acesse: https://connectia.agenciapixel.digital
# Verifique se:
✅ Site carrega com estilos
✅ Login funciona
✅ Todas as funcionalidades
```

### **3. Teste Integrações**
- **WhatsApp:** Envie mensagem para o número configurado
- **Instagram:** Teste recebimento de mensagens
- **Webhook:** Verifique logs no Supabase

---

## 📊 Monitoramento

### **Supabase Dashboard**
- **Database:** Verifique tabelas e dados
- **Logs:** Monitore erros e atividades
- **API:** Teste endpoints

### **Sistema Connect IA**
- **Dashboard:** Métricas em tempo real
- **Inbox:** Mensagens recebidas
- **Atendentes:** Status e performance
- **Relatórios:** Analytics detalhados

---

## 🚨 Solução de Problemas

### **Problema: Sistema sem estilos**
```bash
# Solução: Rebuild com Tailwind
npm run build
```

### **Problema: Erro de autenticação**
```bash
# Solução: Verificar configuração Supabase
# Execute: setup_initial_data.sql
```

### **Problema: Integrações não funcionam**
```bash
# Solução: Verificar webhooks e tokens
# Execute: test_integrations.sql
```

### **Problema: Banco de dados lento**
```bash
# Solução: Limpeza e otimização
# Execute: cleanup_database.sql
```

---

## 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `setup_initial_data.sql` | Configuração inicial do sistema |
| `check_database.sql` | Verificação do estado atual |
| `test_integrations.sql` | Teste das integrações |
| `cleanup_database.sql` | Limpeza e otimização |
| `limpar-banco-dados.sh` | Script de limpeza |
| `verificar-sistema.sh` | Script de verificação |

---

## 🎯 Próximos Passos

1. **✅ Execute `setup_initial_data.sql` no Supabase**
2. **✅ Execute `check_database.sql` para verificar**
3. **✅ Execute `test_integrations.sql` para testar**
4. **✅ Configure WhatsApp e Instagram**
5. **✅ Teste o sistema completo**
6. **✅ Monitore performance**

---

## 🎉 Sistema Pronto!

Após executar todos os scripts, o sistema Connect IA estará:

- ✅ **Totalmente funcional**
- ✅ **Com estilos aplicados**
- ✅ **Banco de dados limpo**
- ✅ **Integrações configuradas**
- ✅ **Pronto para produção**

**🚀 Acesse: https://connectia.agenciapixel.digital**
