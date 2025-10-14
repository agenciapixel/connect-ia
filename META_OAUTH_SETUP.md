# Configuração do Meta OAuth (Facebook Login)

Este guia explica como configurar o OAuth do Meta para conectar WhatsApp, Instagram e Messenger de forma simplificada.

## 🚀 Visão Geral

Com o novo fluxo OAuth, os usuários podem conectar seus canais com **apenas um clique**:
1. Clicar em "Conectar com Facebook"
2. Fazer login (se necessário)
3. Selecionar a página desejada
4. Pronto! ✅

Não é mais necessário copiar Phone Number ID, Access Token, etc.

---

## 📋 Pré-requisitos

- Conta no Facebook
- Acesso ao [Meta for Developers](https://developers.facebook.com/)
- Páginas do Facebook configuradas com WhatsApp Business ou Instagram Business

---

## 🔧 Passo a Passo

### 1. Criar um App no Meta for Developers

1. Acesse: https://developers.facebook.com/apps/
2. Clique em **"Create App"** (Criar aplicativo)
3. Escolha o tipo: **"Business"** ou **"Consumer"**
4. Preencha:
   - **App Name**: Nome do seu app (ex: "Omnichat IA")
   - **App Contact Email**: Seu email
5. Clique em **"Create App"**

### 2. Adicionar Produtos ao App

No dashboard do seu app, adicione os seguintes produtos:

#### Para WhatsApp:
1. Clique em **"Add Product"**
2. Selecione **"WhatsApp"**
3. Configure seguindo as instruções

#### Para Instagram:
1. Clique em **"Add Product"**
2. Selecione **"Instagram"**
3. Configure seguindo as instruções

#### Para Messenger:
1. Clique em **"Add Product"**
2. Selecione **"Messenger"**
3. Configure seguindo as instruções

### 3. Configurar OAuth

1. No menu lateral, vá em **"Settings" → "Basic"**
2. Copie o **"App ID"** (você vai precisar dele)
3. Role até **"Add Platform"**
4. Selecione **"Website"**
5. Em **"Site URL"**, adicione:
   - Desenvolvimento: `http://localhost:8080`
   - Produção: `https://seu-dominio.com`

### 4. Configurar Redirect URIs

1. No menu lateral, vá em **"Products" → "Facebook Login" → "Settings"**
2. Em **"Valid OAuth Redirect URIs"**, adicione:
   ```
   http://localhost:8080/integrations
   https://seu-dominio.com/integrations
   ```
3. Clique em **"Save Changes"**

### 5. Configurar Permissões

1. No menu lateral, vá em **"App Review" → "Permissions and Features"**
2. Solicite as seguintes permissões:

**Para WhatsApp:**
- `pages_show_list`
- `pages_messaging`
- `whatsapp_business_management`
- `whatsapp_business_messaging`

**Para Instagram:**
- `pages_show_list`
- `pages_messaging`
- `instagram_basic`
- `instagram_manage_messages`

**Para Messenger:**
- `pages_show_list`
- `pages_messaging`

### 6. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e adicione seu App ID:
   ```env
   VITE_META_APP_ID=seu_app_id_aqui
   ```

3. Salve o arquivo

### 7. Testar o App

1. **Modo de Desenvolvimento**: Seu app começa em modo de desenvolvimento. Você pode testar com sua própria conta.

2. **Adicionar Testadores** (opcional):
   - Vá em **"Roles" → "Test Users"**
   - Adicione contas de teste

3. **Publicar o App** (quando estiver pronto):
   - Vá em **"App Review"**
   - Submeta seu app para revisão
   - Aguarde aprovação do Meta

---

## 🎯 Como Funciona

### Fluxo Simplificado:

1. **Usuário clica em "Conectar com Facebook"**
2. **Popup do Facebook abre** pedindo permissões
3. **Usuário faz login** e autoriza o app
4. **Sistema busca automaticamente**:
   - Páginas do usuário
   - Contas do WhatsApp Business vinculadas
   - Contas do Instagram Business vinculadas
5. **Usuário seleciona** qual página/conta conectar
6. **Sistema salva** automaticamente todas as credenciais necessárias

### Vantagens:

✅ **Mais simples** - Apenas login com Facebook
✅ **Mais seguro** - Não precisa copiar tokens manualmente
✅ **Mais rápido** - Processo em 3 cliques
✅ **Melhor UX** - Experiência profissional
✅ **Tokens de longa duração** - Não expira rapidamente

---

## 🔍 Troubleshooting

### Erro: "App Not Setup"
**Solução**: Configure os produtos (WhatsApp/Instagram/Messenger) no dashboard do app.

### Erro: "Invalid OAuth Redirect URI"
**Solução**: Verifique se adicionou a URI correta nas configurações do Facebook Login.

### Erro: "Esta página não tem WhatsApp/Instagram conectado"
**Solução**:
1. Acesse o [Business Manager](https://business.facebook.com/)
2. Conecte sua página ao WhatsApp Business ou Instagram Business
3. Tente novamente

### Erro: "Permissions Not Granted"
**Solução**: Solicite as permissões necessárias em "App Review → Permissions and Features"

---

## 📚 Recursos

- [Meta for Developers](https://developers.facebook.com/)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [Messenger Platform Docs](https://developers.facebook.com/docs/messenger-platform)

---

## 🆘 Suporte

Se precisar de ajuda:
1. Verifique os logs no Console do navegador (F12)
2. Verifique os logs das Edge Functions no Supabase
3. Consulte a documentação do Meta

---

**Última atualização**: Outubro 2025
