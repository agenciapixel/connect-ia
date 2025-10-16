#!/bin/bash

echo "🚀 DEPLOY AUTOMÁTICO PARA HOSTINGER"
echo "===================================="
echo "Domínio: connectia.agenciapixel.digital"
echo ""

# Configurações (ALTERE AQUI)
FTP_HOST="ftp.connectia.agenciapixel.digital"
FTP_USER="seu_usuario_ftp"
FTP_PASS="sua_senha_ftp"
FTP_DIR="/public_html"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

# Verificar se lftp está instalado
if ! command -v lftp &> /dev/null; then
    warning "lftp não encontrado. Instalando..."
    
    # Detectar sistema operacional
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install lftp
        else
            error "Homebrew não encontrado. Instale o lftp manualmente: https://lftp.yar.ru/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y lftp
        elif command -v yum &> /dev/null; then
            sudo yum install -y lftp
        else
            error "Gerenciador de pacotes não encontrado. Instale o lftp manualmente."
            exit 1
        fi
    else
        error "Sistema operacional não suportado. Instale o lftp manualmente."
        exit 1
    fi
fi

# 1. Build do projeto
log "🏗️ Fazendo build do projeto..."
export PATH="./node-v20.11.0-darwin-x64/bin:$PATH"

if ! npm run build; then
    error "Erro no build. Verifique os logs acima."
    exit 1
fi

success "Build concluído!"

# 2. Verificar se a pasta dist existe
if [ ! -d "dist" ]; then
    error "Pasta dist não encontrada após o build."
    exit 1
fi

# 3. Backup do servidor (opcional)
log "📦 Fazendo backup do servidor..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"

lftp -c "
set ftp:ssl-allow no;
open $FTP_HOST;
user $FTP_USER $FTP_PASS;
cd $FTP_DIR;
mirror -R --backup --backup-dir=../$BACKUP_DIR . backup_old/;
quit
" 2>/dev/null

if [ $? -eq 0 ]; then
    success "Backup criado: $BACKUP_DIR"
else
    warning "Não foi possível criar backup (normal se for o primeiro deploy)"
fi

# 4. Upload dos arquivos
log "📤 Fazendo upload para o servidor..."

lftp -c "
set ftp:ssl-allow no;
open $FTP_HOST;
user $FTP_USER $FTP_PASS;
cd $FTP_DIR;
lcd dist;
mirror -R --delete --verbose;
quit
"

if [ $? -eq 0 ]; then
    success "Upload concluído!"
else
    error "Erro no upload. Verifique as credenciais FTP."
    exit 1
fi

# 5. Verificar se o site está funcionando
log "🔍 Verificando se o site está funcionando..."
sleep 5

if curl -s -I "https://connectia.agenciapixel.digital" | grep -q "200 OK"; then
    success "Site está funcionando!"
    echo ""
    echo "🌐 Acesse: https://connectia.agenciapixel.digital"
    echo "📱 Teste no mobile: https://connectia.agenciapixel.digital"
    echo ""
    echo "✅ Deploy concluído com sucesso!"
else
    warning "Site pode não estar funcionando ainda. Aguarde alguns minutos e teste manualmente."
    echo "🌐 Teste em: https://connectia.agenciapixel.digital"
fi

# 6. Limpeza
log "🧹 Limpando arquivos temporários..."
# Manter apenas os últimos 5 backups
lftp -c "
set ftp:ssl-allow no;
open $FTP_HOST;
user $FTP_USER $FTP_PASS;
cd /;
ls backup_* | head -n -5 | xargs -r rm -rf;
quit
" 2>/dev/null

echo ""
echo "🎉 DEPLOY CONCLUÍDO!"
echo "===================="
echo "📊 Estatísticas:"
echo "   - Tamanho do build: $(du -sh dist | cut -f1)"
echo "   - Arquivos enviados: $(find dist -type f | wc -l)"
echo "   - Tempo total: $(($(date +%s) - START_TIME))s"
echo ""
echo "🔧 Próximos passos:"
echo "   1. Configure SSL/HTTPS no hPanel"
echo "   2. Configure URLs no Meta for Developers"
echo "   3. Configure variáveis no Supabase"
echo "   4. Teste todas as funcionalidades"
echo ""
echo "📞 Suporte: https://support.hostinger.com"
