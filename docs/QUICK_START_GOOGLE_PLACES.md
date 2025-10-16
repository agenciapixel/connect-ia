# ⚡ Quick Start - Google Places API

## 🎯 Resumo de 3 Minutos

### 1️⃣ Obter API Key (5 minutos)

```
https://console.cloud.google.com/
  ↓
Criar Projeto → Ativar "Places API" → Criar API Key
  ↓
Copiar a chave: AIzaSyD...
```

### 2️⃣ Configurar no Supabase (1 minuto)

**Opção Rápida** (via script):
```bash
./scripts/setup-google-places-env.sh AIzaSyD...SUA_API_KEY_AQUI
```

**Opção Manual**:
```bash
# 1. Configurar secret
supabase secrets set GOOGLE_PLACES_API_KEY="AIzaSyD...SUA_API_KEY_AQUI"

# 2. Redeploy
supabase functions deploy google-places-search
```

### 3️⃣ Testar (1 minuto)

```bash
npm run dev
```

Acesse: http://localhost:8080/prospects

Busque por: "restaurantes em São Paulo, SP"

✅ **Sucesso**: Toast mostra "Fonte: Google Places API"

---

## 🔗 Links Úteis

| Ação | Link Direto |
|------|-------------|
| 🗝️ Obter API Key | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| 🔌 Ativar Places API | [API Library](https://console.cloud.google.com/apis/library/places-backend.googleapis.com) |
| ⚙️ Configurar Supabase | [Edge Functions Settings](https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/settings/functions) |
| 📊 Ver Uso | [APIs Dashboard](https://console.cloud.google.com/apis/dashboard) |
| 📖 Docs Completos | [GOOGLE_PLACES_SETUP.md](./GOOGLE_PLACES_SETUP.md) |

---

## 💡 Dicas Rápidas

### ✅ Fazer:
- Use o crédito gratuito de $200/mês
- Configure alertas de custo
- Restrinja a API Key por API (não por IP, inicialmente)

### ❌ Evitar:
- Commitar a API Key no Git
- Deixar sem restrições em produção
- Ignorar alertas de custo

---

## 🆘 Problemas Comuns

### "API key not valid"
→ Aguarde 5 minutos após criar a chave

### "This API project is not authorized"
→ Ative a "Places API (New)" no projeto

### "OVER_QUERY_LIMIT"
→ Verifique o uso em: https://console.cloud.google.com/apis/dashboard

---

## 📞 Suporte

**Logs da Edge Function**:
```bash
supabase functions logs google-places-search
```

**Documentação Completa**: [GOOGLE_PLACES_SETUP.md](./GOOGLE_PLACES_SETUP.md)
