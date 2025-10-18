# ⚡ COMANDOS RÁPIDOS - Connect IA

## 🚀 Desenvolvimento

```bash
# Iniciar servidor
npm run dev

# Build de produção
npm run build

# Visualizar build
npm run preview

# Build limpa
./BUILD_LIMPA.sh
```

## 🗄️ Banco de Dados

```bash
# Ver resumo dos dados
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "SELECT 'Contatos:', COUNT(*) FROM public.contacts UNION ALL SELECT 'Conversas:', COUNT(*) FROM public.conversations UNION ALL SELECT 'Mensagens:', COUNT(*) FROM public.messages UNION ALL SELECT 'Campanhas:', COUNT(*) FROM public.campaigns UNION ALL SELECT 'Prospects:', COUNT(*) FROM public.prospects;"

# Adicionar mais dados de teste
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < adicionar_mais_dados.sql

# Resetar banco (CUIDADO!)
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < LIMPAR_SUPABASE_COMPLETO.sql

# Inserir dados iniciais
docker exec -i supabase_db_Connect_IA psql -U postgres -d postgres < dados_exemplo.sql
```

## 🐛 Troubleshooting

```bash
# Limpar cache do Vite
rm -rf node_modules/.vite && npm run dev

# Verificar se npm está no PATH
which npm

# Adicionar npm ao PATH (permanente)
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

## 📊 Consultas Úteis

```bash
# Ver todos os contatos
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "SELECT full_name, email, status FROM public.contacts;"

# Ver prospects por estágio
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "SELECT pipeline_stage, COUNT(*), SUM(value) FROM public.prospects GROUP BY pipeline_stage;"

# Ver conversas recentes
docker exec supabase_db_Connect_IA psql -U postgres -d postgres -c "SELECT c.status, co.full_name, c.last_message_at FROM public.conversations c LEFT JOIN public.contacts co ON c.contact_id = co.id ORDER BY c.last_message_at DESC LIMIT 5;"
```

## 📖 Documentação

- `SISTEMA_ATUAL.md` - Estado atual do sistema
- `COMANDOS_DATABASE.md` - Comandos SQL completos
- `GUIA_RAPIDO_DESENVOLVIMENTO.md` - Guia de desenvolvimento
- `RESUMO_SESSAO.md` - Resumo da última sessão
- `CLAUDE.md` - Documentação completa do projeto

## 🌐 URLs

- Dev: http://localhost:8082
- Login: http://localhost:8082/autenticacao
- Dashboard: http://localhost:8082/painel
- Produção: https://connectia.agenciapixel.digital

## 💾 Dados Atuais

- Contatos: 15
- Conversas: 8
- Mensagens: 19
- Campanhas: 8
- Prospects: 10

---

**Última atualização:** 18/10/2025
