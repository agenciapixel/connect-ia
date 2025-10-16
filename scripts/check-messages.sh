#!/bin/bash

echo "📨 Verificando mensagens recebidas no banco de dados..."
echo "========================================================"
echo ""

# Criar query SQL temporária
cat > /tmp/check_messages.sql << 'EOF'
-- Últimas 10 mensagens recebidas
SELECT
    m.id,
    m.content,
    m.direction,
    m.channel_type,
    m.sender_type,
    m.status,
    m.created_at,
    c.external_id as contact_phone,
    c.full_name as contact_name
FROM messages m
LEFT JOIN conversations conv ON m.conversation_id = conv.id
LEFT JOIN contacts c ON conv.contact_id = c.id
WHERE m.channel_type = 'whatsapp'
ORDER BY m.created_at DESC
LIMIT 10;
EOF

echo "🔍 Últimas mensagens do WhatsApp:"
echo ""

# Mostrar a query
cat /tmp/check_messages.sql

echo ""
echo "========================================================"
echo ""
echo "📌 Para executar essa query:"
echo "1. Acesse: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr/editor"
echo "2. Cole a query acima"
echo "3. Clique em 'Run'"
echo ""
echo "Ou use o psql diretamente se tiver acesso."
echo ""
