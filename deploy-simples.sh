#!/bin/bash

echo "🚀 DEPLOY SIMPLES PARA HOSTINGER"
echo "================================"
echo ""

# Configurações - ALTERE AQUI
FTP_USER=""
FTP_PASS=""

# Verificar se as credenciais foram preenchidas
if [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ]; then
    echo "❌ ERRO: Configure suas credenciais FTP no script primeiro!"
    echo ""
    echo "Edite o arquivo deploy-simples.sh e altere:"
    echo "FTP_USER=\"seu_usuario_ftp\""
    echo "FTP_PASS=\"sua_senha_ftp\""
    echo ""
    echo "Você encontra essas informações em:"
    echo "hPanel → Advanced → FTP Accounts"
    exit 1
fi

# Build do projeto
echo "🏗️ Fazendo build..."
export PATH="./node-v20.11.0-darwin-x64/bin:$PATH"
npm run build

# Upload via FTP
echo "📤 Fazendo upload..."
lftp -c "
set ftp:ssl-allow no;
open ftp.connectia.agenciapixel.digital;
user $FTP_USER $FTP_PASS;
cd public_html;
lcd dist;
mirror -R --delete;
quit
"

echo ""
echo "✅ Deploy concluído!"
echo "🌐 Teste em: https://connectia.agenciapixel.digital"
