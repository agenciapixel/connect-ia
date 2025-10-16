# Hostinger Git Deploy Configuration

## Configuração no hPanel:

1. **Acesse**: hPanel → Advanced → Git Version Control
2. **Ative** Git Version Control
3. **Configure**:
   - **Repository URL**: `https://github.com/agenciapixel/connect-ia.git`
   - **Branch**: `main`
   - **Deploy Directory**: `public_html`
   - **Auto Deploy**: ✅ Ativado
   - **Build Command**: `npm install && npm run build`
   - **Deploy Command**: `cp -r dist/* public_html/`

## Como funciona:

1. **GitHub Actions**: Faz build e validação
2. **Hostinger Git Deploy**: Detecta push e faz deploy automático
3. **Resultado**: Site atualizado automaticamente

## Vantagens:

- ✅ **Mais confiável** que FTP/SSH
- ✅ **Deploy automático** na Hostinger
- ✅ **Build na nuvem** (GitHub Actions)
- ✅ **Sem problemas** de conexão

## Status:

- **GitHub Actions**: Build + Validação
- **Hostinger**: Deploy automático
- **Site**: https://connectia.agenciapixel.digital
