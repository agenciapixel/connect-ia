#!/bin/bash

echo "🚀 CONFIGURANDO GIT PARA DEPLOY AUTOMÁTICO"
echo "=========================================="
echo ""

# Verificar se o Git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git não encontrado. Instale o Git primeiro."
    exit 1
fi

# Inicializar repositório Git
echo "📁 Inicializando repositório Git..."
git init

# Adicionar arquivo .gitignore
echo "📝 Configurando .gitignore..."
git add .gitignore

# Fazer commit inicial
echo "💾 Fazendo commit inicial..."
git add .
git commit -m "🚀 Initial commit - Connect IA ready for production

✨ Features:
- Complete marketing system with AI
- WhatsApp & Instagram integration
- Advanced CRM with Kanban pipeline
- Real-time conversations
- Google Places prospecting
- Campaign management
- Automated deployment ready

🌐 Domain: connectia.agenciapixel.digital
📦 Build: Production ready
🔧 Deploy: GitHub Actions + Hostinger"

echo ""
echo "✅ Repositório Git configurado!"
echo ""
echo "🔧 PRÓXIMOS PASSOS:"
echo "1. Crie um repositório no GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Conecte o repositório local:"
echo "   git remote add origin https://github.com/SEU_USUARIO/connect-ia.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Configure os secrets no GitHub:"
echo "   Repository → Settings → Secrets and variables → Actions"
echo "   Adicione:"
echo "   - HOSTINGER_USERNAME: seu_usuario_ftp"
echo "   - HOSTINGER_PASSWORD: sua_senha_ftp"
echo ""
echo "4. Deploy automático será ativado!"
echo ""
echo "🎉 TUDO PRONTO PARA DEPLOY AUTOMÁTICO!"
