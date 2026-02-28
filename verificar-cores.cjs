#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando cores no CSS compilado...\n');

// Cores vermelhas que NÃO devem existir
const coresVermelhas = [
  '#ff5c5c',
  '#ef4444',
  '#dc2626',
  'rgba(239, 68, 68',
  'rgba(220, 38, 38',
  'rgba(255, 92, 92'
];

// Cores corretas que DEVEM existir
const coresCorretas = {
  escuro: {
    accent: '#ffffff',
    danger: '#ffffff',
    destructive: '#ffffff'
  },
  claro: {
    accent: '#000000',
    danger: '#000000',
    destructive: '#000000'
  }
};

function buscarArquivosCSS(dir) {
  const arquivos = [];
  
  if (!fs.existsSync(dir)) {
    return arquivos;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      arquivos.push(...buscarArquivosCSS(fullPath));
    } else if (item.endsWith('.css')) {
      arquivos.push(fullPath);
    }
  }
  
  return arquivos;
}

function verificarCores() {
  const distPath = path.join(process.cwd(), 'dist');
  const arquivosCSS = buscarArquivosCSS(distPath);
  
  if (arquivosCSS.length === 0) {
    console.log('❌ Nenhum arquivo CSS encontrado em dist/');
    console.log('   Execute: pnpm build\n');
    return false;
  }
  
  console.log(`📁 Encontrados ${arquivosCSS.length} arquivos CSS\n`);
  
  let encontrouVermelho = false;
  let encontrouBranco = false;
  let encontrouPreto = false;
  
  for (const arquivo of arquivosCSS) {
    const conteudo = fs.readFileSync(arquivo, 'utf-8');
    
    // Verificar cores vermelhas
    for (const cor of coresVermelhas) {
      if (conteudo.includes(cor)) {
        console.log(`❌ Cor vermelha encontrada: ${cor}`);
        console.log(`   Arquivo: ${path.relative(process.cwd(), arquivo)}\n`);
        encontrouVermelho = true;
      }
    }
    
    // Verificar cores corretas
    if (conteudo.includes('--accent: #ffffff') || conteudo.includes('--accent:#ffffff')) {
      encontrouBranco = true;
    }
    if (conteudo.includes('--accent: #000000') || conteudo.includes('--accent:#000000')) {
      encontrouPreto = true;
    }
  }
  
  console.log('📊 Resultado:\n');
  
  if (encontrouVermelho) {
    console.log('❌ FALHOU: Cores vermelhas ainda existem no CSS compilado');
    console.log('   Solução: Verifique os arquivos fonte em ui/src/styles/\n');
    return false;
  }
  
  if (!encontrouBranco) {
    console.log('⚠️  AVISO: --accent: #ffffff não encontrado (modo escuro)');
  } else {
    console.log('✅ Modo escuro: --accent: #ffffff (branco)');
  }
  
  if (!encontrouPreto) {
    console.log('⚠️  AVISO: --accent: #000000 não encontrado (modo claro)');
  } else {
    console.log('✅ Modo claro: --accent: #000000 (preto)');
  }
  
  if (!encontrouVermelho && encontrouBranco && encontrouPreto) {
    console.log('\n✅ SUCESSO: Todas as cores estão corretas!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Feche o app completamente');
    console.log('   2. Abra o app novamente');
    console.log('   3. As cores devem estar corretas agora\n');
    return true;
  }
  
  return false;
}

verificarCores();
