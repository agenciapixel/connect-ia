#!/bin/bash

# Script para testar o webhook do WhatsApp manualmente
# Simula o Meta/Facebook enviando uma mensagem

WEBHOOK_URL="https://bjsuujkbrhjhuyzydxbr.supabase.co/functions/v1/whatsapp-webhook"

echo "🧪 Testando Webhook do WhatsApp..."
echo "=================================="
echo ""

# Teste 1: Verificação do webhook (GET)
echo "📞 Teste 1: Verificação do Webhook (GET)"
echo "Enviando requisição GET para verificação..."
echo ""

# Substitua 'seu_verify_token' pelo valor real do META_VERIFY_TOKEN
VERIFY_TOKEN="seu_verify_token"

curl -X GET "${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test_challenge_123" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "=================================="
echo ""

# Teste 2: Recebimento de mensagem (POST)
echo "📨 Teste 2: Recebimento de Mensagem (POST)"
echo "Enviando mensagem de teste simulada..."
echo ""

# Payload simulando mensagem do WhatsApp
cat > /tmp/whatsapp_test_payload.json << 'EOF'
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "5511999999999",
              "phone_number_id": "123456789012345"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Test User"
                },
                "wa_id": "5511888888888"
              }
            ],
            "messages": [
              {
                "from": "5511888888888",
                "id": "wamid.test123456",
                "timestamp": "1697500000",
                "text": {
                  "body": "Olá, esta é uma mensagem de teste!"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
EOF

curl -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d @/tmp/whatsapp_test_payload.json \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "=================================="
echo ""
echo "✅ Testes concluídos!"
echo ""
echo "📊 Próximos passos:"
echo "1. Verifique se a mensagem apareceu no banco de dados"
echo "2. Verifique os logs no Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/logs/edge-functions"
echo ""
