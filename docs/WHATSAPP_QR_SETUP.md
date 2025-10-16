# 📱 Como Conectar WhatsApp via QR Code - Guia Passo a Passo

## 🎯 Situação Atual

**O que você tem agora:**
- ✅ Interface bonita (botão, modal, animações)
- ✅ Código que salva no banco de dados
- ✅ Multi-tenancy funcionando
- ❌ **MAS: O QR Code não conecta de verdade** (é só uma simulação visual)

---

## 🚀 Como Fazer Funcionar - 3 Etapas Simples

### **ETAPA 1: Escolher o Que Fazer**

Você tem 2 caminhos:

**🔹 Opção A: Implementar WhatsApp REAL Agora** ⏱️ 30-60 min
- Usar Evolution API (grátis e open source)
- WhatsApp funciona 100%
- Pode enviar/receber mensagens de verdade

**🔹 Opção B: Deixar Assim por Enquanto**
- Continue desenvolvendo outras features
- Implemente WhatsApp real no futuro
- Use a simulação para demonstrar

---

### **ETAPA 2: Se Escolheu Implementar REAL**

Siga estes 5 passos:

#### **📍 Passo 1: Instalar Evolution API**

**No seu computador (para testes):**

```bash
# 1. Certifique-se que tem Docker instalado
# Download: https://www.docker.com/products/docker-desktop

# 2. Rode este comando no terminal:
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=minha-chave-123 \
  atendai/evolution-api:latest

# 3. Teste se funcionou:
curl http://localhost:8080
# Deve retornar algo como: {"status": "ok"}
```

**Resultado esperado:** Evolution API rodando em `http://localhost:8080`

---

#### **📍 Passo 2: Configurar Variáveis no Supabase**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Edge Functions** → **Environment Variables**
4. Adicione estas 2 variáveis:

```
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=minha-chave-123
```

5. Clique em "Save"

---

#### **📍 Passo 3: Atualizar Edge Function**

Abra o arquivo: `supabase/functions/whatsapp-qr-connect/index.ts`

**Adicione no início (depois dos imports):**

```typescript
const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL')!;
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY')!;
```

**Substitua TODA a função `saveQRConnection` por esta:**

```typescript
async function saveQRConnection(credentials: any, orgId: string, name: string, sessionId: string, supabase: any) {
  try {
    // 1. Criar instância no Evolution API
    const createResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'apikey': EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: sessionId,
        qrcode: true
      })
    });

    if (!createResponse.ok) {
      throw new Error('Erro ao criar instância');
    }

    // 2. Conectar e pegar QR Code
    const connectResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${sessionId}`, {
      method: 'GET',
      headers: { 'apikey': EVOLUTION_API_KEY }
    });

    const qrData = await connectResponse.json();

    // 3. Salvar no banco
    const { data, error } = await supabase
      .from('channel_accounts')
      .insert({
        org_id: orgId,
        channel_type: 'whatsapp',
        name: name,
        credentials: {
          session_id: sessionId,
          connection_type: 'evolution_api'
        },
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // 4. Retornar QR Code REAL
    return new Response(JSON.stringify({
      success: true,
      qrCode: qrData.base64,    // Imagem do QR Code
      qrCodeText: qrData.code    // Texto do QR Code
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: 'Erro ao gerar QR Code',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
```

**Fazer deploy:**

```bash
supabase functions deploy whatsapp-qr-connect
```

---

#### **📍 Passo 4: Atualizar Componente React**

Abra o arquivo: `src/components/WhatsAppQRConnect.tsx`

**Encontre a função `generateQRCodeNow` e SUBSTITUA por:**

```typescript
const generateQRCodeNow = async () => {
  setLoading(true);

  try {
    if (!currentOrg) {
      throw new Error('Nenhuma organização selecionada');
    }

    const newSessionId = `wa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);

    // Chamar Edge Function que usa Evolution API
    const { data, error } = await supabase.functions.invoke("whatsapp-qr-connect", {
      body: {
        action: 'save_qr_connection',
        orgId: currentOrg.id,
        sessionId: newSessionId,
        name: instanceName || `WhatsApp`,
        credentials: {
          phone_number: phoneNumber || 'pending',
        }
      },
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Erro ao gerar QR Code');

    // QR Code REAL da Evolution API!
    setQrCodeData(data.qrCodeText);
    setQrCodeUrl(`data:image/png;base64,${data.qrCode}`);
    setConnectionStatus('waiting');

    toast({
      title: "QR Code Gerado!",
      description: "Escaneie com seu WhatsApp"
    });

    // Verificar status REAL
    startPollingStatusReal(newSessionId);

  } catch (error: any) {
    console.error("Error:", error);
    toast({
      title: "Erro",
      description: error.message
    });
    setConnectionStatus('failed');
  } finally {
    setLoading(false);
  }
};
```

**Adicione esta NOVA função (depois da `generateQRCodeNow`):**

```typescript
const startPollingStatusReal = (sessionId: string) => {
  const EVOLUTION_API_URL = 'http://localhost:8080'; // TEMPORÁRIO - depois mover para env
  const EVOLUTION_API_KEY = 'minha-chave-123';       // TEMPORÁRIO - depois mover para env

  const interval = setInterval(async () => {
    try {
      const response = await fetch(
        `${EVOLUTION_API_URL}/instance/connectionState/${sessionId}`,
        { headers: { 'apikey': EVOLUTION_API_KEY } }
      );

      const data = await response.json();

      if (data.state === 'open') {
        // CONECTADO DE VERDADE!
        clearInterval(interval);
        setConnectionStatus('connected');

        // Atualizar status no banco
        await supabase
          .from('channel_accounts')
          .update({ status: 'active' })
          .eq('credentials->>session_id', sessionId);

        setStep('success');
        toast({
          title: "Conectado!",
          description: "WhatsApp conectado com sucesso"
        });

        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }, 3000); // Verifica a cada 3 segundos

  setPollingInterval(interval);

  // Timeout após 5 minutos
  setTimeout(() => {
    clearInterval(interval);
    if (connectionStatus === 'waiting') {
      setConnectionStatus('failed');
      toast({
        title: "Timeout",
        description: "Tempo limite excedido"
      });
    }
  }, 300000);
};
```

**No JSX, substitua o canvas por imagem:**

Encontre o `<canvas>` e substitua por:

```tsx
{qrCodeUrl ? (
  <img
    src={qrCodeUrl}
    alt="QR Code WhatsApp"
    className="border-2 border-gray-200 rounded-lg shadow-lg w-64 h-64"
  />
) : (
  <div className="w-64 h-64 border-2 border-gray-200 rounded-lg flex items-center justify-center">
    <p className="text-sm text-gray-400">QR Code aparecerá aqui</p>
  </div>
)}
```

---

#### **📍 Passo 5: Testar!**

```bash
# 1. Inicie o projeto
npm run dev

# 2. Acesse no navegador
http://localhost:8080

# 3. Vá em: Integrações → Conectar WhatsApp

# 4. Clique em "Gerar QR Code"

# 5. Abra WhatsApp no celular:
#    Menu → Dispositivos Conectados → Conectar Dispositivo

# 6. Escaneie o QR Code que apareceu

# 7. Aguarde... Status muda para "Conectado!"

# 8. PRONTO! Agora funciona de verdade 🎉
```

---

## ✅ Checklist de Sucesso

Marque conforme for fazendo:

- [ ] Docker instalado e rodando
- [ ] Evolution API rodando (`docker ps` mostra container)
- [ ] Variáveis configuradas no Supabase
- [ ] Edge Function atualizada e deployed
- [ ] Componente React atualizado
- [ ] Projeto rodando (`npm run dev`)
- [ ] Modal abre quando clica em "Conectar WhatsApp"
- [ ] QR Code aparece (diferente do mock anterior)
- [ ] WhatsApp conectou após escanear
- [ ] Status mudou para "Conectado"

---

## 🆘 Problemas Comuns

### **QR Code não aparece**
- Verifique se Evolution API está rodando: `docker ps`
- Teste a API: `curl http://localhost:8080`
- Veja os logs: `docker logs evolution-api`

### **Erro de CORS**
- Adicione no Evolution API: `-e CORS_ALLOWED_ORIGIN=*`

### **"Nenhuma organização selecionada"**
- Certifique-se que fez login
- Verifique se há organização criada no banco
- Veja console do navegador (F12)

---

## 📚 Recursos

- **Evolution API Docs**: https://doc.evolution-api.com
- **GitHub**: https://github.com/EvolutionAPI/evolution-api
- **Discord**: https://evolution-api.com/discord

---

## 🎯 Próximos Passos (Depois de Funcionar)

1. **Enviar Mensagens**: Usar Evolution API para enviar
2. **Receber Mensagens**: Configurar webhook
3. **Deploy em Produção**: Railway/DigitalOcean
4. **Múltiplas Contas**: Cada usuário pode conectar seu WhatsApp

---

**Ficou claro? Cada passo está numerado e em ordem. Siga um por um!** 🚀

Se travar em algum, me avise qual passo e o erro que deu.
