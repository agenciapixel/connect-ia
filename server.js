const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;
const distPath = path.join(__dirname, 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(distPath, req.url === '/' ? '/index.html' : req.url);
  
  // Verificar se o arquivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Se o arquivo não existe, servir index.html para SPA routing
      filePath = path.join(distPath, 'index.html');
    }
    
    // Ler o arquivo
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>');
        return;
      }
      
      // Determinar o tipo de conteúdo
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      // Configurar headers
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log(`🚀 Servidor SPA rodando em http://localhost:${port}`);
  console.log(`📁 Servindo arquivos de: ${distPath}`);
  console.log(`🔄 Fallback para index.html em todas as rotas`);
});

