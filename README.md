# 🚀 Connect IA - Sistema de Marketing Digital com IA

[![Deploy to Hostinger](https://github.com/seu-usuario/connect-ia/actions/workflows/deploy.yml/badge.svg)](https://github.com/seu-usuario/connect-ia/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Sistema completo de marketing digital com inteligência artificial, integração com redes sociais e CRM avançado.**

🌐 **Site**: https://connectia.agenciapixel.digital

---

## ✨ **Funcionalidades Principais**

### 🤖 **Inteligência Artificial**
- **Agentes de IA** especializados (vendas, suporte, SDR)
- **Geração automática** de mensagens
- **Resumo inteligente** de textos
- **Otimização de campanhas** com IA

### 📱 **Integrações Sociais**
- **WhatsApp Business API** - Envio e recebimento de mensagens
- **Instagram Business** - Gestão de conversas
- **Meta OAuth** - Conexão segura com Facebook/Instagram

### 👥 **CRM Avançado**
- **Pipeline Kanban** visual
- **Gestão de contatos** completa
- **Sistema de atendentes** com métricas
- **Conversas em tempo real**

### 📊 **Prospecção Inteligente**
- **Busca via Google Places** - Encontre leads automaticamente
- **Validação de dados** - Qualifique prospects
- **Exportação em massa** - Exporte para CSV/Excel

### 📈 **Campanhas de Marketing**
- **Editor visual de fluxos** - Crie campanhas complexas
- **Segmentação avançada** - Defina públicos específicos
- **Métricas em tempo real** - Acompanhe performance

---

## 🛠️ **Tecnologias**

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **IA**: Google Gemini 2.5 Flash via Lovable AI Gateway
- **Deploy**: GitHub Actions + Hostinger

---

## 🚀 **Deploy Automático**

### **Configuração Inicial:**

1. **Fork este repositório** ou crie um novo
2. **Configure os secrets** no GitHub:
   - `HOSTINGER_USERNAME` - Seu usuário FTP da Hostinger
   - `HOSTINGER_PASSWORD` - Sua senha FTP da Hostinger

3. **Configure as variáveis de ambiente** no Supabase:
   - `META_APP_ID` - App ID do Meta for Developers
   - `META_APP_SECRET` - App Secret do Meta
   - `WHATSAPP_ACCESS_TOKEN` - Token do WhatsApp Business
   - `INSTAGRAM_ACCESS_TOKEN` - Token do Instagram Business
   - `GOOGLE_PLACES_API_KEY` - Chave da API Google Places
   - `LOVABLE_API_KEY` - Chave da Lovable AI

### **Deploy:**
- **Automático**: A cada push na branch `main`
- **Manual**: Vá em Actions → Deploy Connect IA → Run workflow

---

## 📋 **Configuração do Meta for Developers**

### **URLs de Redirecionamento:**
- **Redirect URI**: `https://connectia.agenciapixel.digital/integrations`
- **Success Redirect**: `https://connectia.agenciapixel.digital/integrations?success=true`
- **Error Redirect**: `https://connectia.agenciapixel.digital/integrations?error=true`

### **Webhooks:**
- **WhatsApp**: `https://connectia.agenciapixel.digital/api/webhooks/whatsapp`
- **Instagram**: `https://connectia.agenciapixel.digital/api/webhooks/instagram`

---

## 🔧 **Desenvolvimento Local**

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

---

## 📁 **Estrutura do Projeto**

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes UI (shadcn/ui)
│   ├── AppSidebar.tsx  # Sidebar principal
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Contacts.tsx    # Gestão de contatos
│   ├── Inbox.tsx       # Caixa de entrada
│   ├── Prospects.tsx   # Prospecção
│   ├── AgentsIA.tsx    # Agentes de IA
│   ├── Campaigns.tsx   # Campanhas
│   └── Integrations.tsx # Integrações
├── hooks/              # Custom hooks
├── lib/                # Utilitários
└── integrations/       # Integrações externas
    └── supabase/       # Cliente Supabase
```

---

## 🎯 **Funcionalidades por Página**

### **Dashboard**
- Métricas em tempo real
- Gráficos de performance
- Resumo de atividades

### **Contatos**
- Lista de contatos com filtros
- Pipeline CRM Kanban
- Importação/exportação
- Histórico de interações

### **Inbox**
- Conversas lado a lado
- Atribuição de agentes
- Upload de arquivos
- Status em tempo real

### **Prospecção**
- Busca via Google Places
- Validação de leads
- Exportação em massa
- Importação para contatos

### **Agentes IA**
- Criação de agentes especializados
- Teste de agentes
- Ferramentas de IA
- Configuração de prompts

### **Campanhas**
- Editor visual de fluxos
- Segmentação de público
- Métricas de performance
- A/B testing

### **Integrações**
- WhatsApp Business
- Instagram Business
- Google Places
- Meta OAuth

---

## 🔒 **Segurança**

- **Autenticação**: Supabase Auth com JWT
- **Autorização**: Sistema de roles e permissões
- **CORS**: Configurado para domínio específico
- **HTTPS**: Obrigatório em produção
- **Secrets**: Armazenados no GitHub Secrets

---

## 📊 **Performance**

- **Build otimizado**: ~1.7MB total
- **Code splitting**: Chunks otimizados
- **Lazy loading**: Componentes carregados sob demanda
- **Cache**: Headers de cache configurados
- **Gzip**: Compressão ativada

---

## 🐛 **Troubleshooting**

### **Deploy falha:**
1. Verifique as credenciais FTP no GitHub Secrets
2. Confirme se o domínio está configurado na Hostinger
3. Verifique os logs em Actions → Deploy

### **Integrações não funcionam:**
1. Configure as variáveis no Supabase Dashboard
2. Verifique as URLs de redirecionamento no Meta
3. Confirme se os webhooks estão configurados

### **Site não carrega:**
1. Verifique se o SSL está ativo na Hostinger
2. Confirme se os arquivos foram enviados para `/public_html/`
3. Teste o acesso direto: `https://connectia.agenciapixel.digital`

---

## 📞 **Suporte**

- **GitHub Issues**: [Criar issue](https://github.com/seu-usuario/connect-ia/issues)
- **Hostinger**: [Suporte Hostinger](https://support.hostinger.com)
- **Supabase**: [Documentação Supabase](https://supabase.com/docs)

---

## 📄 **Licença**

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 **Agradecimentos**

- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Supabase](https://supabase.com/) - Backend e banco de dados
- [Lovable AI](https://lovable.dev/) - Gateway de IA
- [Hostinger](https://hostinger.com/) - Hospedagem

---

**Desenvolvido com ❤️ para revolucionar o marketing digital!**