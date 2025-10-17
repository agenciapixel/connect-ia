#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Iniciando build manual do Connect IA...');

try {
  // Verificar se node_modules existe
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Instalando dependências...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Limpar dist anterior
  if (fs.existsSync('dist')) {
    console.log('🧹 Limpando pasta dist...');
    execSync('rm -rf dist', { stdio: 'inherit' });
  }

  // Fazer build
  console.log('🔨 Executando build...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verificar se build foi bem-sucedido
  if (fs.existsSync('dist/index.html')) {
    console.log('✅ Build concluído com sucesso!');
    
    // Mostrar conteúdo do index.html
    const indexContent = fs.readFileSync('dist/index.html', 'utf8');
    console.log('📄 Conteúdo do index.html:');
    console.log(indexContent.substring(0, 500) + '...');
    
    // Mostrar arquivos JS gerados
    const assetsDir = path.join('dist', 'assets');
    if (fs.existsSync(assetsDir)) {
      const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
      console.log('📄 Arquivos JavaScript gerados:');
      jsFiles.forEach(file => {
        console.log(`  - ${file}`);
        const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
        console.log(`    Primeiras linhas: ${content.substring(0, 100)}...`);
      });
    }
    
    // Copiar para raiz
    console.log('📁 Copiando arquivos para raiz...');
    execSync('cp -r dist/* .', { stdio: 'inherit' });
    
    console.log('🎉 Build manual concluído!');
  } else {
    console.error('❌ Build falhou - index.html não foi gerado');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Erro durante build:', error.message);
  process.exit(1);
}
