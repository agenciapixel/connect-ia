# Hostinger Git Deploy Configuration
# Domínio: connectia.agenciapixel.digital

## Configuração no hPanel:

1. **Acesse**: hPanel → Advanced → Git Version Control
2. **Ative** Git Version Control
3. **Configure**:
   - **Repository URL**: `https://github.com/SEU_USUARIO/connect-ia.git`
   - **Branch**: `main`
   - **Deploy Directory**: `public_html`
   - **Auto Deploy**: ✅ Ativado
   - **Build Command**: `npm install && npm run build`
   - **Deploy Command**: `cp -r dist/* public_html/`

## Como funciona:

1. **Push para GitHub**: Detecta mudanças
2. **Hostinger Git Deploy**: Puxa automaticamente
3. **Build automático**: npm install && npm run build
4. **Deploy automático**: Copia dist/* para public_html/
5. **Resultado**: Site atualizado automaticamente

## Vantagens:

- ✅ **Mais confiável** que FTP/SSH
- ✅ **Deploy automático** na Hostinger
- ✅ **Build na nuvem** da Hostinger
- ✅ **Sem problemas** de conexão
- ✅ **Rollback fácil**
- ✅ **Histórico de deploys**

## Status:

- **GitHub**: Código fonte
- **Hostinger**: Deploy automático
- **Site**: https://connectia.agenciapixel.digital

## Próximos passos:

1. **Criar repositório GitHub**
2. **Configurar Git Deploy no hPanel**
3. **Fazer push do código**
4. **Deploy automático funcionará!**