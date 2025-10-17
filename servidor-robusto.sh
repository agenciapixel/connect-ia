#!/bin/bash

echo "🚀 Connect IA - Servidor Local Robusto"
echo "======================================"
echo ""

# Verificar se estamos na pasta correta
if [ ! -f "dist/index.html" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto"
    echo "   Pasta atual: $(pwd)"
    echo "   Arquivo esperado: dist/index.html"
    exit 1
fi

echo "📁 Pasta atual: $(pwd)"
echo "📂 Conteúdo da pasta dist:"
ls -la dist/
echo ""

# Função para tentar iniciar servidor em uma porta
start_server() {
    local port=$1
    echo "🌐 Tentando iniciar servidor na porta $port..."
    
    # Verificar se a porta está livre
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "   ⚠️  Porta $port já está em uso"
        return 1
    fi
    
    echo "   ✅ Porta $port disponível"
    echo "   🌐 Servidor iniciado!"
    echo "   📱 Acesse: http://localhost:$port"
    echo "   🛑 Para parar: Ctrl+C"
    echo ""
    
    cd dist
    python3 -m http.server $port
    return 0
}

# Tentar diferentes portas
for port in 3000 8080 8081 9000 5000; do
    if start_server $port; then
        exit 0
    fi
done

echo "❌ Não foi possível iniciar o servidor em nenhuma porta"
echo "   Portas testadas: 3000, 8080, 8081, 9000, 5000"
echo "   Verifique se há outros servidores rodando"
