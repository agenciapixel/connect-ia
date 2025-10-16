# 🗺️ Configuração do Google Places API

Este guia explica como configurar a integração com Google Places API para o módulo de prospecção.

## 📋 Pré-requisitos

- Conta Google (Gmail)
- Projeto no Google Cloud Console
- Cartão de crédito (Google oferece $200 de crédito gratuito por mês)
- Acesso ao Supabase CLI (opcional, mas recomendado)

## 💰 Custos

O Google Places API tem um modelo de preços pay-as-you-go:

- **Crédito Mensal Gratuito**: $200 USD/mês
- **Text Search**: $32 por 1000 requisições
- **Place Details**: $17 por 1000 requisições
- **Nearby Search**: $32 por 1000 requisições

Com o crédito gratuito, você pode fazer aproximadamente:
- ~6.250 buscas de texto por mês GRÁTIS
- ~11.760 detalhes de lugares por mês GRÁTIS

**Estimativa para uso real**:
- Para 100 buscas/dia (3000/mês): ~$96 USD/mês (coberto pelo crédito gratuito)
- Para 500 buscas/dia (15000/mês): ~$480 USD/mês ($280 após crédito)

## 🚀 Passo a Passo

### 1. Criar Projeto no Google Cloud

1. Acesse: [Google Cloud Console](https://console.cloud.google.com/)
2. Clique no menu de projetos (topo da página)
3. Clique em "Novo Projeto"
4. Nome do projeto: `omnichat-ia` (ou o nome que preferir)
5. Clique em "Criar"

### 2. Ativar APIs Necessárias

1. Acesse: [API Library](https://console.cloud.google.com/apis/library)
2. Busque e ative as seguintes APIs:
   - **Places API (New)** - Para busca de lugares
   - **Geocoding API** - Para conversão de endereços em coordenadas
   - **Maps JavaScript API** (opcional) - Para exibir mapas interativos

Para ativar cada API:
1. Clique no nome da API
2. Clique em "Ativar"
3. Aguarde a ativação (geralmente instantânea)

### 3. Habilitar Faturamento

⚠️ **IMPORTANTE**: Mesmo usando o crédito gratuito, o Google exige um cartão de crédito.

1. Acesse: [Faturamento](https://console.cloud.google.com/billing)
2. Clique em "Adicionar conta de faturamento"
3. Preencha os dados do cartão
4. Vincule a conta de faturamento ao seu projeto

### 4. Criar API Key

1. Acesse: [Credenciais](https://console.cloud.google.com/apis/credentials)
2. Clique em "Criar Credenciais" → "Chave de API"
3. Uma chave será gerada automaticamente
4. **COPIE A CHAVE** e guarde em local seguro

A chave terá o formato: `AIzaSyD...` (39 caracteres)

### 5. Configurar Restrições (Segurança)

É **altamente recomendado** restringir o uso da API Key:

#### Restrição de Aplicação:

**Opção A: Restrição por IP** (Mais seguro, mas mais complexo)
1. Clique na API Key criada
2. Em "Restrições da aplicação", selecione "Endereços IP"
3. Adicione os IPs do Supabase Edge Functions:
   ```
   # Você pode deixar sem restrição por enquanto
   # e configurar depois se preferir
   ```

**Opção B: Sem restrição** (Para desenvolvimento)
1. Selecione "Nenhuma" (não recomendado para produção)

#### Restrição de API:

1. Em "Restrições de API", selecione "Restringir chave"
2. Marque apenas:
   - ✅ Places API (New)
   - ✅ Geocoding API
   - ✅ Maps JavaScript API (se ativou)
3. Clique em "Salvar"

### 6. Configurar no Supabase

#### Opção A: Via Script Automatizado (Recomendado)

```bash
# No terminal, execute:
./scripts/setup-google-places-env.sh AIzaSyD...SUA_API_KEY_AQUI...
```

O script irá:
1. Configurar o secret no Supabase
2. Fazer redeploy da Edge Function
3. Verificar se tudo está funcionando

#### Opção B: Configuração Manual

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/settings/functions)
2. Vá para a seção "Secrets"
3. Clique em "Add new secret"
4. Preencha:
   - **Name**: `GOOGLE_PLACES_API_KEY`
   - **Value**: Sua API Key (cole aqui)
5. Clique em "Save"

6. Faça redeploy da Edge Function:
```bash
supabase functions deploy google-places-search
```

### 7. Testar a Configuração

#### Via Interface Web:

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse: http://localhost:8080/prospects

3. Clique na tab "Buscar"

4. Faça uma busca teste:
   - Busca: "restaurantes"
   - Localização: "São Paulo, SP"
   - Raio: 5 km

5. Clique em "Buscar Prospects"

6. Se configurado corretamente, você verá:
   - Toast de sucesso: "X lugares encontrados! Y novos prospects criados."
   - Descrição: "Fonte: Google Places API"

#### Via Logs:

```bash
# Ver logs da Edge Function
supabase functions logs google-places-search --tail
```

Você deve ver:
```
Tentando busca com Google Places API oficial...
Calling Google Places API: https://maps.googleapis.com/maps/api/place/...
Encontrados X lugares via API oficial
```

## 🔧 Solução de Problemas

### Erro: "API key not valid"

**Causa**: API Key inválida ou não tem permissões

**Solução**:
1. Verifique se a API Key está correta
2. Certifique-se que Places API está ativada
3. Verifique as restrições da chave
4. Aguarde alguns minutos após criar (pode levar até 5 min para propagar)

### Erro: "This API project is not authorized"

**Causa**: Places API não foi ativada no projeto

**Solução**:
1. Acesse [API Library](https://console.cloud.google.com/apis/library)
2. Ative "Places API (New)"

### Erro: "OVER_QUERY_LIMIT"

**Causa**: Excedeu o limite de requisições

**Solução**:
1. Verifique seu [uso no console](https://console.cloud.google.com/apis/dashboard)
2. Considere aumentar a cota ou implementar cache

### Fallback para Scraping

Se a API Key não estiver configurada ou falhar, o sistema automaticamente usa scraping como fallback:

```
Toast: "Fonte: scraping"
```

Isso garante que o sistema funcione mesmo sem API Key, mas:
- ❌ Menos confiável (pode quebrar com mudanças do Google)
- ❌ Pode ser mais lento
- ❌ Limites de rate-limit mais restritos

## 📊 Monitoramento de Uso

### Via Google Cloud Console:

1. Acesse: [APIs Dashboard](https://console.cloud.google.com/apis/dashboard)
2. Selecione "Places API (New)"
3. Veja métricas de:
   - Requisições por dia
   - Erros
   - Latência
   - Custos estimados

### Configurar Alertas de Custo:

1. Acesse: [Orçamentos](https://console.cloud.google.com/billing/budget)
2. Clique em "Criar orçamento"
3. Configure alerta para, por exemplo:
   - 50% do crédito gratuito ($100 USD)
   - 80% do crédito gratuito ($160 USD)
   - 100% do crédito gratuito ($200 USD)

## 🔐 Segurança

### Boas Práticas:

1. **Nunca commite** a API Key no Git
2. **Use restrições** de IP e API
3. **Monitore o uso** regularmente
4. **Rotacione** a chave periodicamente
5. **Configure alertas** de custo

### Se a API Key Vazar:

1. Acesse [Credenciais](https://console.cloud.google.com/apis/credentials)
2. Clique na chave comprometida
3. Clique em "Regenerar chave" ou "Deletar"
4. Crie uma nova chave
5. Atualize no Supabase

## 📚 Recursos Adicionais

- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Preços do Google Maps Platform](https://cloud.google.com/maps-platform/pricing)
- [Quotas e Limites](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)

## 🆘 Suporte

Se precisar de ajuda:

1. Verifique os logs da Edge Function:
   ```bash
   supabase functions logs google-places-search
   ```

2. Teste localmente:
   ```bash
   supabase functions serve google-places-search
   ```

3. Entre em contato com o suporte do Google Cloud se os problemas persistirem.
