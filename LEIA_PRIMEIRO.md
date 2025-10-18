# 👋 BEM-VINDO AO CONNECT IA

**Sistema de CRM com IA e Dashboard em Tempo Real**

---

## 🎯 Início Rápido (3 passos)

### 1️⃣ Iniciar o Servidor
```bash
npm run dev
```
Servidor abrirá em: http://localhost:8082

### 2️⃣ Criar sua Conta
Acesse: http://localhost:8082/autenticacao

Preencha:
- Nome
- Empresa
- Email
- Senha

### 3️⃣ Ver o Dashboard
Você será redirecionado automaticamente!

---

## 📚 Documentação Disponível

### 🔥 INTEGRAÇÃO META (WhatsApp/Instagram/Messenger)
- **[GUIA_COMPLETO_INTEGRACAO_META.md](GUIA_COMPLETO_INTEGRACAO_META.md)** ⭐ **PRINCIPAL!**
  - WhatsApp via QR Code (5 min - Recomendado)
  - WhatsApp via API Oficial do Meta (30 min)
  - Instagram Business
  - Messenger
  - TUDO EM UM SÓ ARQUIVO!

### Para Começar
- **[COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md)** ⚡
  - Comandos de terminal copy-paste
  - Consultas SQL úteis
  - URLs do sistema
  - Troubleshooting básico

### Para Entender o Sistema
- **[SISTEMA_ATUAL.md](SISTEMA_ATUAL.md)** 📊
  - O que está implementado
  - Estrutura do banco de dados
  - Como funciona o Dashboard
  - Hooks e componentes

### Para Desenvolver
- **[GUIA_RAPIDO_DESENVOLVIMENTO.md](GUIA_RAPIDO_DESENVOLVIMENTO.md)** 💻
  - Como criar novas features
  - Exemplos de código
  - Próximos passos sugeridos
  - Design system

### Para Trabalhar com Dados
- **[COMANDOS_DATABASE.md](COMANDOS_DATABASE.md)** 🗄️
  - Consultas SQL completas
  - Inserir/atualizar/deletar dados
  - Estatísticas e relatórios
  - Manutenção do banco

### Histórico
- **[RESUMO_SESSAO.md](RESUMO_SESSAO.md)** 📝
  - Resumo da última sessão
  - O que foi implementado
  - Bugs corrigidos
  - Checklist de verificação

### Referência Completa
- **[CLAUDE.md](CLAUDE.md)** 📖
  - Documentação completa do projeto
  - Arquitetura técnica
  - Stack tecnológica
  - Roadmap

---

## 📊 Estado Atual do Sistema

### ✅ Funcionando
- Sistema de autenticação simplificado
- Dashboard em tempo real
- Banco de dados com RLS
- Multi-tenant (organizações)
- Sistema de permissões

### 📊 Dados de Teste
```
Contatos:  15
Conversas:  8
Mensagens: 19
Campanhas:  8
Prospects: 10
```

### 🔨 Em Desenvolvimento
- Gestão de Contatos (CRUD)
- Inbox de Mensagens
- Pipeline de Vendas (Kanban)
- Gestão de Campanhas

---

## 🛠️ Comandos Mais Usados

### Desenvolvimento
```bash
npm run dev                # Servidor de dev
npm run build              # Build produção
./BUILD_LIMPA.sh           # Build limpa
```

### Dados
```bash
# Ver resumo
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "SELECT 'Contatos:', COUNT(*) FROM public.contacts;"

# Adicionar dados de teste
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < adicionar_mais_dados.sql
```

---

## 🐛 Problemas Comuns

### npm command not found
```bash
export PATH="/opt/homebrew/bin:$PATH"
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Cache antigo sendo servido
```bash
rm -rf node_modules/.vite
npm run dev
```

### Dashboard sem dados
```bash
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < dados_exemplo.sql
```

---

## 🎯 Próximos Passos Recomendados

1. **Página de Contatos** - CRUD completo de contatos
2. **Inbox de Mensagens** - Visualizar e responder conversas
3. **Pipeline de Vendas** - Kanban de prospects
4. **Gestão de Campanhas** - Criar e monitorar campanhas

Veja detalhes em [GUIA_RAPIDO_DESENVOLVIMENTO.md](GUIA_RAPIDO_DESENVOLVIMENTO.md)

---

## 📞 Suporte

**Desenvolvedor:** Ricardo da Silva
**Email:** ricardo@agenciapixel.digital
**Empresa:** Agência Pixel

---

## 🚀 Vamos Começar?

1. Leia [COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md) para comandos essenciais
2. Execute `npm run dev` para iniciar
3. Crie sua conta em http://localhost:8082/autenticacao
4. Explore o Dashboard!

**Boa sorte no desenvolvimento! 🎉**
