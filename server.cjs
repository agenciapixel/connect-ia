const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;
const distPath = path.join(__dirname, 'dist');

// Sistema de monitoramento
const monitoring = {
  startTime: new Date(),
  requestCount: 0,
  errorCount: 0,
  uptime: () => Date.now() - monitoring.startTime.getTime(),
  log: (message, type = 'INFO') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type}: ${message}`);
  }
};

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
  monitoring.requestCount++;
  
  // Endpoints de monitoramento
  if (req.url === '/health') {
    const healthData = {
      status: 'OK',
      uptime: monitoring.uptime(),
      timestamp: new Date().toISOString(),
      requestCount: monitoring.requestCount,
      errorCount: monitoring.errorCount,
      version: '1.0.0'
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthData, null, 2));
    monitoring.log(`Health check accessed - Uptime: ${Math.floor(monitoring.uptime() / 1000)}s`);
    return;
  }
  
  if (req.url === '/status') {
    const statusData = {
      server: 'Connect IA',
      status: 'running',
      uptime: Math.floor(monitoring.uptime() / 1000),
      requests: monitoring.requestCount,
      errors: monitoring.errorCount,
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(statusData, null, 2));
    monitoring.log(`Status accessed - Requests: ${monitoring.requestCount}, Errors: ${monitoring.errorCount}`);
    return;
  }
  
  let filePath = path.join(distPath, req.url === '/' ? '/index.html' : req.url);
  
  // Verificar se o arquivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Se o arquivo não existe, verificar se é uma rota SPA
      const ext = path.extname(req.url).toLowerCase();
      
      // Se não tem extensão ou é uma rota SPA, servir index.html
      if (!ext || ext === '.html' || req.url.startsWith('/api/') || req.url.startsWith('/auth')) {
        filePath = path.join(distPath, 'index.html');
      } else {
        // Para arquivos com extensão que não existem, retornar 404
        monitoring.errorCount++;
        monitoring.log(`404 Error: ${req.url}`, 'ERROR');
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>');
        return;
      }
    }
    
    // Ler o arquivo
    fs.readFile(filePath, (err, data) => {
      if (err) {
        monitoring.errorCount++;
        monitoring.log(`File read error: ${filePath}`, 'ERROR');
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>');
        return;
      }
      
      // Determinar o tipo de conteúdo
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      // Configurar headers anti-cache
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${Date.now()}"`
      });
      
      res.end(data);
      
      // Log de sucesso para arquivos estáticos
      if (ext && ext !== '.html') {
        monitoring.log(`Served: ${req.url} (${data.length} bytes)`);
      }
    });
  });
});

server.listen(port, () => {
  monitoring.log(`🚀 Servidor SPA iniciado em http://localhost:${port}`);
  monitoring.log(`📁 Servindo arquivos de: ${distPath}`);
  monitoring.log(`🔄 Fallback para index.html em todas as rotas`);
  monitoring.log(`📊 Endpoints de monitoramento: /health e /status`);
});
