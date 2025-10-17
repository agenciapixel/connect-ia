# 🚀 Connect IA - Acesso Local

## 📋 Instruções para Executar Localmente

### Opção 1: Servidor Python (Mais Simples)
```bash
# Executar o script
./servidor-local.sh

# Ou manualmente:
cd dist
python3 -m http.server 8080
```

**Acesse:** http://localhost:8080

### Opção 2: Servidor Node.js (Recomendado)
```bash
# Primeiro, baixar Node.js (se necessário)
./baixar-nodejs.sh

# Executar o servidor
./servidor-local-node.sh

# Ou manualmente:
cd dist
npx serve -p 3000
```

**Acesse:** http://localhost:3000

### Opção 3: Servidor de Desenvolvimento
```bash
# Configurar Node.js local
export PATH="$(pwd)/node-v20.11.0-darwin-x64/bin:$PATH"

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

**Acesse:** http://localhost:5173

## 🔧 Scripts Disponíveis

| Script | Descrição | Porta |
|--------|-----------|-------|
| `servidor-local.sh` | Servidor Python simples | 8080 |
| `servidor-local-node.sh` | Servidor Node.js com serve | 3000 |
| `baixar-nodejs.sh` | Baixa Node.js localmente | - |

## 📁 Estrutura de Arquivos

```
Connect IA/
├── dist/                    # Build de produção
│   ├── index.html          # Página principal
│   ├── assets/             # JS, CSS, imagens
│   ├── .htaccess          # Configuração Apache
│   └── sw.js              # Service Worker
├── src/                    # Código fonte React
├── public/                 # Arquivos públicos
└── scripts/               # Scripts de servidor
```

## 🌐 URLs de Acesso

- **Local Python:** http://localhost:8080
- **Local Node.js:** http://localhost:3000
- **Desenvolvimento:** http://localhost:5173
- **Produção:** https://connectia.agenciapixel.digital

## 🚨 Solução de Problemas

### Erro: "python3: command not found"
```bash
# Instalar Python via Homebrew
brew install python3
```

### Erro: "node: command not found"
```bash
# Baixar Node.js localmente
./baixar-nodejs.sh
```

### Erro: "npx: command not found"
```bash
# Instalar serve globalmente
npm install -g serve
```

## 📝 Notas Importantes

1. **Build Atualizado:** Sempre execute `npm run build` antes de testar localmente
2. **Arquivos Estáticos:** O servidor local serve arquivos da pasta `dist/`
3. **CORS:** Para desenvolvimento, pode ser necessário configurar CORS
4. **HTTPS:** Para testar recursos que requerem HTTPS, use `npx serve -s dist -p 3000 --ssl-cert cert.pem --ssl-key key.pem`

## 🔄 Workflow Recomendado

1. **Desenvolvimento:** `npm run dev` (porta 5173)
2. **Teste Local:** `./servidor-local-node.sh` (porta 3000)
3. **Build:** `npm run build`
4. **Deploy:** Commit e push para GitHub
5. **Produção:** Hostinger Git Deploy automático
