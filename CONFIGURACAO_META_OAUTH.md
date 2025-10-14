# 🚀 Guia de Configuração - Meta OAuth (Facebook SDK)

## ✅ O que foi implementado:

1. **Facebook SDK integrado** ao `index.html`
2. **Componente MetaOAuthConnect** já existente e funcional
3. **Tipos TypeScript** para o Facebook SDK
4. **Arquivo de exemplo** para variáveis de ambiente

## 🔧 Próximos passos para resolver o erro "Função de desenvolvedor é insuficiente":

### 1. **Configure o arquivo .env**

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env e substitua:
VITE_META_APP_ID=seu_app_id_real_aqui
```

### 2. **Obtenha seu Meta App ID**

1. **Acesse**: https://developers.facebook.com/apps/
2. **Selecione seu app** (ou crie um novo)
3. **Vá em "Settings" → "Basic"**
4. **Copie o "App ID"**
5. **Cole no arquivo .env**

### 3. **Configure as permissões do app**

No Meta for Developers, vá em **"App Review" → "Permissions and Features"** e solicite:

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

### 4. **Configure OAuth Redirect URIs**

1. **Vá em "Products" → "Facebook Login" → "Settings"**
2. **Adicione as URIs válidas**:
   ```
   http://localhost:5173/integrations
   https://seu-dominio.com/integrations
   ```

### 5. **Verifique o modo do app**

- **Modo de Desenvolvimento**: Você pode testar apenas com sua conta
- **Modo de Produção**: Requer aprovação do Meta

### 6. **Configure sua página do Facebook**

1. **Acesse**: https://business.facebook.com/
2. **Conecte sua página ao WhatsApp Business** (se necessário)
3. **Conecte sua página ao Instagram Business** (se necessário)

## 🧪 Como testar:

1. **Inicie o servidor**:
   ```bash
   npm run dev
   ```

2. **Acesse**: http://localhost:5173/integrations

3. **Clique em "Conectar"** no WhatsApp, Instagram ou Messenger

4. **Faça login** com sua conta do Facebook

5. **Selecione sua página** para conectar

## 🚨 Soluções para erros comuns:

### "Função de desenvolvedor é insuficiente"
- ✅ Verifique se você tem acesso de **Administrator** ou **Developer** ao app
- ✅ Verifique se o app está em **modo de desenvolvimento**
- ✅ Verifique se você tem as **permissões necessárias**

### "App Not Setup"
- ✅ Configure os produtos (WhatsApp/Instagram/Messenger) no dashboard do app

### "Invalid OAuth Redirect URI"
- ✅ Verifique se adicionou a URI correta nas configurações do Facebook Login

### "Esta página não tem WhatsApp/Instagram conectado"
- ✅ Acesse o Business Manager e conecte sua página ao WhatsApp Business ou Instagram Business

## 📁 Arquivos modificados:

- ✅ `index.html` - Facebook SDK adicionado
- ✅ `src/vite-env.d.ts` - Tipos TypeScript adicionados
- ✅ `src/components/MetaOAuthConnect.tsx` - Melhorado para usar Facebook SDK
- ✅ `env.example` - Arquivo de exemplo criado

## 🎯 Próximo passo:

**Configure seu Meta App ID no arquivo .env e teste a conexão!**

Se ainda encontrar o erro "Função de desenvolvedor é insuficiente", verifique:
1. Se você tem acesso de administrador ao app
2. Se o app está em modo de desenvolvimento
3. Se você tem as permissões necessárias configuradas
