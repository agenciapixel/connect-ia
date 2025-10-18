# 🚀 GUIA COMPLETO: PUBLICAR APP META COM LINKS REAIS

**Data:** 18 de Outubro de 2025
**Objetivo:** Configurar o App Meta (Facebook/WhatsApp/Instagram) com URLs reais do sistema

---

## 📋 PRÉ-REQUISITOS

### Informações Necessárias

✅ **App Meta ID:** `670209849105494` (já configurado)
✅ **URL de Produção:** `https://connectia.agenciapixel.digital`
✅ **URL de Desenvolvimento:** `http://localhost:8082`

### Acessos Necessários

- [ ] Acesso ao Meta for Developers (https://developers.facebook.com)
- [ ] Credenciais de administrador do App
- [ ] Acesso ao Hostinger (para configurar domínio)

---

## 🎯 PASSO A PASSO COMPLETO

### ETAPA 1: Acessar Meta for Developers

1. **Acesse:** https://developers.facebook.com
2. **Login:** Entre com sua conta Meta
3. **Navegue:** Apps → Seu App (`670209849105494`)

---

### ETAPA 2: Configurações Básicas do App

#### 2.1 - Settings → Basic

1. Clique em **Settings** (menu lateral esquerdo)
2. Clique em **Basic**
3. Configure os seguintes campos:

**App Domains (Domínios do Aplicativo):**
```
connectia.agenciapixel.digital
localhost
```

**App URL:**
```
https://connectia.agenciapixel.digital
```

**Privacy Policy URL (URL da Política de Privacidade):**
```
https://connectia.agenciapixel.digital/politica-privacidade
```

**Terms of Service URL (URL dos Termos de Serviço):**
```
https://connectia.agenciapixel.digital/termos-de-servico
```

**Data Deletion Instructions URL:**
```
https://connectia.agenciapixel.digital/exclusao-dados
```

4. Clique em **Save Changes** (canto inferior direito)

---

### ETAPA 3: Configurar Facebook Login

#### 3.1 - Adicionar Produto (se ainda não adicionado)

1. No menu lateral, clique em **Add Products**
2. Encontre **Facebook Login** → Clique em **Set Up**
3. Selecione **Web** como plataforma

#### 3.2 - Configurar OAuth Redirect URIs

1. Menu lateral: **Facebook Login** → **Settings**
2. Em **Valid OAuth Redirect URIs**, adicione:

```
https://connectia.agenciapixel.digital/autenticacao
https://connectia.agenciapixel.digital/
http://localhost:8082/autenticacao
http://localhost:8082/
```

3. Em **Deauthorize Callback URL**:
```
https://connectia.agenciapixel.digital/api/auth/deauthorize
```

4. Em **Data Deletion Request Callback URL**:
```
https://connectia.agenciapixel.digital/api/auth/delete-data
```

5. **Client OAuth Login:** Ative (ON)
6. **Web OAuth Login:** Ative (ON)
7. **Enforce HTTPS:** Ative (ON)

8. Clique em **Save Changes**

---

### ETAPA 4: Configurar WhatsApp Business

#### 4.1 - Adicionar Produto WhatsApp

1. Menu lateral: **Add Products**
2. Encontre **WhatsApp** → Clique em **Set Up**

#### 4.2 - Configurar Webhook

1. Menu lateral: **WhatsApp** → **Configuration**
2. Clique em **Configure Webhooks** (ou **Edit** se já existir)

**Callback URL:**
```
https://connectia.agenciapixel.digital/api/webhooks/whatsapp
```

**Verify Token:** (crie um token secreto, ex: `connect_ia_webhook_2025`)
```
connect_ia_webhook_2025
```

3. Marque todos os campos de **Webhook Fields**:
   - [x] messages
   - [x] message_status
   - [x] message_echoes
   - [x] message_template_status_update
   - [x] messaging_handovers
   - [x] messaging_referrals

4. Clique em **Verify and Save**

#### 4.3 - Obter Access Token

1. Na mesma página **WhatsApp** → **API Setup**
2. Em **Temporary access token**, copie o token
3. **IMPORTANTE:** Este token é temporário (24h). Para produção, você precisará gerar um token permanente.

Para token permanente:
- Vá em **Settings** → **Basic**
- Copie o **App Secret**
- Use a API do Meta para gerar token permanente (ou siga o wizard do WhatsApp)

---

### ETAPA 5: Configurar Instagram Business

#### 5.1 - Adicionar Produto Instagram

1. Menu lateral: **Add Products**
2. Encontre **Instagram** → Clique em **Set Up**
3. Selecione **Instagram Basic Display** ou **Instagram Graph API**

#### 5.2 - Configurar OAuth Redirect URIs

1. Menu lateral: **Instagram** → **Basic Display** → **Settings**
2. Em **Valid OAuth Redirect URIs**:

```
https://connectia.agenciapixel.digital/integracoes/instagram/callback
http://localhost:8082/integracoes/instagram/callback
```

3. Em **Deauthorize Callback URL**:
```
https://connectia.agenciapixel.digital/api/instagram/deauthorize
```

4. Em **Data Deletion Request URL**:
```
https://connectia.agenciapixel.digital/api/instagram/delete-data
```

5. Clique em **Save Changes**

---

### ETAPA 6: Configurar Messenger

#### 6.1 - Adicionar Produto Messenger

1. Menu lateral: **Add Products**
2. Encontre **Messenger** → Clique em **Set Up**

#### 6.2 - Configurar Webhook

1. Menu lateral: **Messenger** → **Settings**
2. Em **Webhooks**, clique em **Add Callback URL**

**Callback URL:**
```
https://connectia.agenciapixel.digital/api/webhooks/messenger
```

**Verify Token:**
```
connect_ia_webhook_2025
```

3. Marque os campos:
   - [x] messages
   - [x] messaging_postbacks
   - [x] messaging_optins
   - [x] messaging_referrals
   - [x] message_deliveries
   - [x] message_reads

4. Clique em **Verify and Save**

---

### ETAPA 7: Atualizar Variáveis de Ambiente

#### 7.1 - Editar .env.production

Abra o arquivo `.env.production` e atualize:

```bash
# META (FACEBOOK) CONFIGURATION
VITE_META_APP_ID=670209849105494
META_APP_SECRET=SEU_APP_SECRET_AQUI

# WHATSAPP BUSINESS API
WHATSAPP_ACCESS_TOKEN=SEU_TOKEN_WHATSAPP_AQUI
WHATSAPP_PHONE_NUMBER_ID=SEU_PHONE_NUMBER_ID_AQUI
WHATSAPP_VERIFY_TOKEN=connect_ia_webhook_2025

# INSTAGRAM BUSINESS API
INSTAGRAM_ACCESS_TOKEN=SEU_TOKEN_INSTAGRAM_AQUI
INSTAGRAM_PAGE_ID=SEU_PAGE_ID_AQUI
INSTAGRAM_VERIFY_TOKEN=connect_ia_webhook_2025

# URLs DE PRODUÇÃO
VITE_APP_URL=https://connectia.agenciapixel.digital
VITE_API_URL=https://connectia.agenciapixel.digital/api
```

#### 7.2 - Como Obter os Valores

**App Secret:**
1. Meta for Developers → Seu App
2. Settings → Basic
3. App Secret → Clique em "Show" → Copie

**WhatsApp Access Token:**
1. WhatsApp → API Setup
2. Temporary access token (copie)
3. Para permanente: siga wizard de produção

**WhatsApp Phone Number ID:**
1. WhatsApp → API Setup
2. Phone Number ID (aparece ao lado do número)

**Instagram Access Token:**
1. Instagram → Basic Display → User Token Generator
2. Ou use OAuth Flow para obter token de usuário

---

### ETAPA 8: Criar Páginas Obrigatórias

O Meta exige que você tenha estas páginas públicas:

#### 8.1 - Política de Privacidade

Crie o arquivo: `src/pages/PrivacyPolicy.tsx`

```typescript
export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">1. Introdução</h2>
        <p className="text-gray-700">
          O Connect IA respeita sua privacidade e está comprometido em proteger
          seus dados pessoais. Esta política descreve como coletamos, usamos e
          protegemos suas informações.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">2. Dados Coletados</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Nome e informações de contato</li>
          <li>Dados de login (email, senha criptografada)</li>
          <li>Mensagens trocadas via WhatsApp/Instagram/Messenger</li>
          <li>Informações de uso da plataforma</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">3. Uso dos Dados</h2>
        <p className="text-gray-700">
          Seus dados são utilizados exclusivamente para:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Fornecer os serviços de CRM</li>
          <li>Gerenciar conversas com seus clientes</li>
          <li>Melhorar a experiência do usuário</li>
          <li>Cumprir obrigações legais</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">4. Compartilhamento</h2>
        <p className="text-gray-700">
          Não compartilhamos seus dados com terceiros, exceto:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Quando exigido por lei</li>
          <li>Com provedores de serviço essenciais (Supabase, Meta)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">5. Seus Direitos</h2>
        <p className="text-gray-700">Você tem direito a:</p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Acessar seus dados pessoais</li>
          <li>Corrigir dados incorretos</li>
          <li>Solicitar exclusão de dados</li>
          <li>Revogar consentimentos</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">6. Contato</h2>
        <p className="text-gray-700">
          Para exercer seus direitos ou esclarecer dúvidas:
        </p>
        <p className="text-gray-700 mt-2">
          Email: <a href="mailto:ricardo@agenciapixel.digital" className="text-blue-600">ricardo@agenciapixel.digital</a>
        </p>
      </section>

      <p className="text-sm text-gray-500 mt-8">
        Última atualização: 18 de Outubro de 2025
      </p>
    </div>
  );
}
```

#### 8.2 - Termos de Serviço

Crie o arquivo: `src/pages/TermsOfService.tsx`

```typescript
export default function TermsOfService() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">1. Aceitação dos Termos</h2>
        <p className="text-gray-700">
          Ao usar o Connect IA, você concorda com estes termos de serviço.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">2. Descrição do Serviço</h2>
        <p className="text-gray-700">
          O Connect IA é uma plataforma de CRM que integra WhatsApp, Instagram,
          Messenger e outros canais de comunicação.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">3. Responsabilidades do Usuário</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Manter credenciais de acesso seguras</li>
          <li>Usar o serviço de forma legal e ética</li>
          <li>Não enviar spam ou conteúdo ilegal</li>
          <li>Respeitar limites de uso da API</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">4. Limitações</h2>
        <p className="text-gray-700">
          O serviço é fornecido "como está". Não garantimos:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Disponibilidade ininterrupta</li>
          <li>Ausência de erros</li>
          <li>Resultados específicos</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">5. Cancelamento</h2>
        <p className="text-gray-700">
          Você pode cancelar sua conta a qualquer momento através das
          configurações ou entrando em contato conosco.
        </p>
      </section>

      <p className="text-sm text-gray-500 mt-8">
        Última atualização: 18 de Outubro de 2025
      </p>
    </div>
  );
}
```

#### 8.3 - Política de Exclusão de Dados

Crie o arquivo: `src/pages/DataDeletion.tsx`

```typescript
export default function DataDeletion() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Exclusão de Dados</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Como Excluir Seus Dados</h2>
        <p className="text-gray-700 mb-4">
          Você pode solicitar a exclusão de todos os seus dados do Connect IA
          a qualquer momento.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Processo de Exclusão</h2>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2">
          <li>Entre em contato conosco por email: ricardo@agenciapixel.digital</li>
          <li>Inclua no assunto: "Solicitação de Exclusão de Dados"</li>
          <li>Informe o email da sua conta</li>
          <li>Aguarde confirmação (até 48 horas úteis)</li>
          <li>Seus dados serão permanentemente excluídos em até 30 dias</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">O Que Será Excluído</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Sua conta e credenciais</li>
          <li>Todos os contatos cadastrados</li>
          <li>Histórico de conversas</li>
          <li>Campanhas criadas</li>
          <li>Configurações e preferências</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Dados que Podem Ser Mantidos</h2>
        <p className="text-gray-700">
          Por obrigações legais, podemos manter:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Logs de auditoria (por até 5 anos)</li>
          <li>Dados fiscais (conforme legislação)</li>
          <li>Informações necessárias para processos legais</li>
        </ul>
      </section>

      <p className="text-sm text-gray-500 mt-8">
        Última atualização: 18 de Outubro de 2025
      </p>
    </div>
  );
}
```

#### 8.4 - Adicionar Rotas

Edite `src/main.tsx` e adicione as rotas:

```typescript
// Adicione os imports
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import DataDeletion from "@/pages/DataDeletion";

// Adicione as rotas (FORA do ProtectedRoute)
<Route path="/politica-privacidade" element={<PrivacyPolicy />} />
<Route path="/termos-de-servico" element={<TermsOfService />} />
<Route path="/exclusao-dados" element={<DataDeletion />} />
```

---

### ETAPA 9: Criar Endpoints de Webhook (Supabase Edge Functions)

#### 9.1 - WhatsApp Webhook

Crie: `supabase/functions/whatsapp-webhook/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'connect_ia_webhook_2025'

serve(async (req) => {
  // Verificação do webhook (GET)
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully')
      return new Response(challenge, { status: 200 })
    }

    return new Response('Forbidden', { status: 403 })
  }

  // Recebimento de mensagens (POST)
  if (req.method === 'POST') {
    const body = await req.json()
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2))

    // TODO: Processar mensagem e salvar no banco de dados

    return new Response('OK', { status: 200 })
  }

  return new Response('Method not allowed', { status: 405 })
})
```

#### 9.2 - Deploy Edge Function

```bash
# Deploy para Supabase
npx supabase functions deploy whatsapp-webhook

# Configurar variáveis de ambiente no Supabase Dashboard
# Settings → Edge Functions → whatsapp-webhook → Environment Variables
# WHATSAPP_VERIFY_TOKEN=connect_ia_webhook_2025
```

---

### ETAPA 10: Testar a Configuração

#### 10.1 - Teste Local

```bash
# 1. Iniciar servidor
npm run dev

# 2. Testar páginas
# http://localhost:8082/politica-privacidade
# http://localhost:8082/termos-de-servico
# http://localhost:8082/exclusao-dados
```

#### 10.2 - Teste de Produção

```bash
# 1. Build
npm run build

# 2. Deploy (Hostinger Git Deploy automático)
git add .
git commit -m "feat: Configurar App Meta com URLs reais"
git push origin main

# 3. Testar páginas em produção
# https://connectia.agenciapixel.digital/politica-privacidade
# https://connectia.agenciapixel.digital/termos-de-servico
# https://connectia.agenciapixel.digital/exclusao-dados
```

#### 10.3 - Testar Webhook

No Meta for Developers:
1. WhatsApp → Configuration → Webhooks
2. Clique em "Test" ao lado do callback URL
3. Selecione "messages" e clique em "Test"
4. Deve retornar "200 OK"

---

### ETAPA 11: Solicitar Permissões Avançadas (Produção)

Para usar em produção, você precisa submeter o app para revisão do Meta:

#### 11.1 - App Review

1. Menu lateral: **App Review** → **Permissions and Features**
2. Solicite as seguintes permissões:

**WhatsApp:**
- `whatsapp_business_messaging` - Enviar e receber mensagens
- `whatsapp_business_management` - Gerenciar conta business

**Instagram:**
- `instagram_basic` - Acesso básico
- `instagram_manage_messages` - Gerenciar mensagens

**Facebook:**
- `pages_messaging` - Messenger
- `pages_read_engagement` - Ler engajamento

3. Para cada permissão:
   - Clique em "Request"
   - Preencha o formulário explicando o uso
   - Envie vídeo demonstrando a funcionalidade
   - Aguarde aprovação (5-7 dias úteis)

---

### ETAPA 12: Modo Produção (Publicar App)

#### 12.1 - Pré-requisitos

Antes de publicar, verifique:
- [ ] Todas as páginas obrigatórias criadas e públicas
- [ ] Webhooks configurados e testados
- [ ] Variáveis de ambiente corretas
- [ ] Permissões aprovadas pelo Meta
- [ ] Ícone do app configurado (1024x1024px)

#### 12.2 - Publicar

1. Settings → Basic
2. Role para baixo até **App Mode**
3. Clique no switch de **Development** para **Live**
4. Leia e aceite os termos
5. Clique em **Switch to Live Mode**

---

## ✅ CHECKLIST FINAL

### Configuração do App Meta
- [ ] App Domains configurados
- [ ] Privacy Policy URL adicionada
- [ ] Terms of Service URL adicionada
- [ ] Data Deletion URL adicionada
- [ ] Facebook Login OAuth URIs configurados
- [ ] WhatsApp Webhook configurado e verificado
- [ ] Instagram OAuth configurado
- [ ] Messenger Webhook configurado

### Código
- [ ] Página de Política de Privacidade criada
- [ ] Página de Termos de Serviço criada
- [ ] Página de Exclusão de Dados criada
- [ ] Rotas adicionadas no main.tsx
- [ ] Edge Function de webhook criada e deployada
- [ ] Variáveis de ambiente atualizadas

### Deploy
- [ ] Build de produção funcionando
- [ ] Páginas acessíveis em produção
- [ ] Webhooks respondendo corretamente
- [ ] Integração testada end-to-end

### Produção
- [ ] Permissões solicitadas e aprovadas
- [ ] App publicado (Live Mode)
- [ ] Monitoramento configurado

---

## 🐛 TROUBLESHOOTING

### Erro: "Invalid Redirect URI"
**Solução:** Verifique se a URL está EXATAMENTE igual no código e no Meta for Developers (sem / no final)

### Erro: "Webhook Verification Failed"
**Solução:**
1. Verifique se o VERIFY_TOKEN está correto
2. Certifique-se que a Edge Function está deployada
3. Teste localmente com ngrok

### Erro: "App Not Found"
**Solução:** Verifique se o APP_ID no .env está correto

### Erro: "Permission Denied"
**Solução:** Solicite as permissões necessárias no App Review

---

## 📞 SUPORTE

**Desenvolvedor:** Ricardo da Silva
**Email:** ricardo@agenciapixel.digital
**Meta App ID:** 670209849105494

---

**Última atualização:** 18 de Outubro de 2025
