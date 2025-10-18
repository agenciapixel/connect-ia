# 🎯 Sistema Comercial de Leads - Guia Completo

## 📋 Visão Geral

Sistema profissional para **SaaS comercial** com controle de acesso:

1. ✅ Visitante solicita acesso (formulário)
2. ✅ Você recebe notificação
3. ✅ Você aprova/rejeita no painel admin
4. ✅ Sistema envia convite por email
5. ✅ Usuário cria conta e acessa

---

## 🚀 Aplicar no Supabase

### 1. Abrir Supabase Studio
http://127.0.0.1:54323

### 2. Aplicar Migration

**SQL Editor** → **New Query** → Cole o conteúdo de:
`supabase/migrations/20251018040000_sistema_comercial_leads.sql`

**Ou via CLI:**
```bash
supabase db push
```

### 3. Verificar Tabelas Criadas

**Table Editor** → Verificar:
- ✅ `access_requests` - Solicitações de acesso
- ✅ `invitations` - Convites enviados
- ✅ `authorized_users` - Emails aprovados

---

## 📊 Fluxo Completo

### Para Visitantes (Público)

**1. Página de Solicitação** (`/solicitar-acesso`)
```
Formulário com:
- Nome completo
- Email
- Empresa
- Telefone
- Cargo
- Tamanho da empresa
- Plano de interesse (Free/Pro/Enterprise)
- Mensagem
```

**2. Mensagem após envio:**
```
✅ Solicitação enviada com sucesso!
Entraremos em contato em breve.
```

### Para Você (Admin)

**1. Painel de Leads** (`/admin/leads`)
```
Visualizar:
- Solicitações pendentes
- Dados do lead
- Data da solicitação

Ações:
- ✅ Aprovar (envia convite)
- ❌ Rejeitar (com motivo)
```

**2. Aprovar Lead:**
```
1. Clique em "Aprovar"
2. Sistema adiciona email na whitelist
3. Cria convite com link único
4. Envia email (TODO: integrar)
```

### Para Lead Aprovado

**1. Recebe Email:**
```
Assunto: Seu acesso ao Connect IA foi aprovado!

Olá [Nome],

Seu acesso foi aprovado!

Clique aqui para criar sua conta:
https://connectia.app/convite/[TOKEN]

Link válido por 7 dias.
```

**2. Cria Conta:**
- Clica no link do convite
- Define senha
- Conta criada automaticamente
- Organização criada como admin

---

## 🔧 Funções Disponíveis (RPC)

### 1. `request_access()` - Solicitar Acesso (Público)

```typescript
const { data, error } = await supabase.rpc('request_access', {
  p_email: 'cliente@empresa.com',
  p_full_name: 'João Silva',
  p_company: 'Empresa XYZ',
  p_phone: '(11) 99999-9999',
  p_job_title: 'CEO',
  p_company_size: '11-50',
  p_plan_interest: 'pro',
  p_message: 'Gostaria de testar o sistema'
});
```

**Retorno:**
```json
{
  "success": true,
  "message": "Solicitação enviada com sucesso!",
  "request_id": "uuid..."
}
```

### 2. `approve_access_request()` - Aprovar (Admin)

```typescript
const { data } = await supabase.rpc('approve_access_request', {
  p_request_id: 'uuid...',
  p_send_invitation: true
});
```

**Retorno:**
```json
{
  "success": true,
  "message": "Acesso aprovado com sucesso",
  "invitation_token": "abc123..."
}
```

### 3. `reject_access_request()` - Rejeitar (Admin)

```typescript
const { data } = await supabase.rpc('reject_access_request', {
  p_request_id: 'uuid...',
  p_reason: 'Email corporativo necessário'
});
```

### 4. `validate_invitation()` - Validar Convite (Público)

```typescript
const { data } = await supabase.rpc('validate_invitation', {
  p_token: 'token-do-convite'
});
```

**Retorno:**
```json
{
  "valid": true,
  "email": "cliente@empresa.com",
  "plan": "pro"
}
```

---

## 📋 Próximos Passos

### 1. Criar Páginas (Frontend)

- [ ] `/solicitar-acesso` - Formulário público
- [ ] `/admin/leads` - Painel de aprovação (admin)
- [ ] `/convite/:token` - Página de ativação de convite

### 2. Integrar Email (Recomendado)

Usar Supabase Edge Functions ou serviço de email:
- SendGrid
- Mailgun
- AWS SES
- Resend

### 3. Automações

- Notificar você por email quando novo lead chega
- Enviar email de boas-vindas ao aprovar
- Email de follow-up se não ativar em 3 dias

---

## 🎯 Vantagens deste Sistema

✅ **Profissional**: Qualificação de leads antes de dar acesso
✅ **Controle**: Você decide quem entra
✅ **Dados**: Coleta informações valiosas (empresa, cargo, etc.)
✅ **Seguro**: Apenas emails aprovados podem criar conta
✅ **Rastreável**: Sabe de onde veio o lead (UTM)
✅ **Escalável**: Pode automatizar aprovação depois (ex: após pagamento)

---

## 💰 Monetização Futura

### Aprovar Automaticamente Após Pagamento

```sql
-- Adicionar campo payment_id
ALTER TABLE access_requests ADD COLUMN payment_id TEXT;

-- Aprovar automaticamente se pagou
CREATE TRIGGER auto_approve_paid
  AFTER UPDATE ON access_requests
  FOR EACH ROW
  WHEN (NEW.payment_id IS NOT NULL AND OLD.payment_id IS NULL)
  EXECUTE FUNCTION auto_approve_request();
```

### Integrar com Stripe/Paddle

```typescript
// Webhook do Stripe
if (payment_success) {
  await supabase.rpc('approve_access_request', {
    p_request_id: metadata.request_id
  });
}
```

---

## 🧪 Testar Agora

### 1. Aplicar SQL no Supabase Studio

### 2. Testar via SQL Editor:

```sql
-- Simular solicitação de acesso
SELECT public.request_access(
  'teste@empresa.com',
  'João Teste',
  'Empresa Teste LTDA',
  '(11) 99999-9999',
  'CEO',
  '11-50',
  'pro',
  'Quero testar o sistema'
);

-- Ver solicitações
SELECT * FROM access_requests;

-- Aprovar (substitua o ID)
SELECT public.approve_access_request('ID-DA-SOLICITACAO', true);

-- Ver authorized_users
SELECT * FROM authorized_users;
```

### 3. Testar Cadastro

Agora o email `teste@empresa.com` está autorizado!

---

**Este é um sistema profissional e escalável!** 🚀

**Próximo passo:** Quer que eu crie as páginas de frontend também?
