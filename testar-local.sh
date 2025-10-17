#!/bin/bash

echo "🚀 Connect IA - Servidor Local Simples"
echo "======================================"
echo ""
echo "📁 Pasta atual: $(pwd)"
echo "📂 Conteúdo da pasta dist:"
ls -la dist/
echo ""
echo "🌐 Iniciando servidor na porta 8081..."
echo "   Acesse: http://localhost:8081"
echo "   Para parar: Ctrl+C"
echo ""

cd dist
python3 -m http.server 8081
