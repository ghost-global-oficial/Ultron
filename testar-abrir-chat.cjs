#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== DIAGNÓSTICO: ABRIR CHAT ===\n');

// 1. Verificar se dist/control-ui/index.html existe
const uiPath = path.join(__dirname, 'dist', 'control-ui', 'index.html');
console.log('1. Verificando UI compilada...');
console.log('   Caminho:', uiPath);
console.log('   Existe?', fs.existsSync(uiPath));

if (!fs.existsSync(uiPath)) {
  console.log('\n❌ PROBLEMA: UI não compilada!');
  console.log('   Solução: Execute "npm run build" ou "pnpm build"');
  process.exit(1);
}

console.log('   ✓ UI compilada encontrada\n');

// 2. Verificar se main.js tem o handler
console.log('2. Verificando handler no main.js...');
const mainJsPath = path.join(__dirname, 'main.js');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

if (mainJsContent.includes("ipcMain.on('load-chat-ui'")) {
  console.log('   ✓ Handler load-chat-ui encontrado\n');
} else {
  console.log('   ❌ Handler load-chat-ui NÃO encontrado!\n');
  process.exit(1);
}

// 3. Verificar se há erros de sintaxe no main.js
console.log('3. Verificando sintaxe do main.js...');
try {
  // Tentar fazer parse básico
  const lines = mainJsContent.split('\n');
  let openBraces = 0;
  let openParens = 0;
  let openBrackets = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    openBraces += (line.match(/{/g) || []).length;
    openBraces -= (line.match(/}/g) || []).length;
    openParens += (line.match(/\(/g) || []).length;
    openParens -= (line.match(/\)/g) || []).length;
    openBrackets += (line.match(/\[/g) || []).length;
    openBrackets -= (line.match(/\]/g) || []).length;
  }
  
  if (openBraces !== 0) {
    console.log(`   ⚠️ Chaves desbalanceadas: ${openBraces > 0 ? '+' : ''}${openBraces}`);
  }
  if (openParens !== 0) {
    console.log(`   ⚠️ Parênteses desbalanceados: ${openParens > 0 ? '+' : ''}${openParens}`);
  }
  if (openBrackets !== 0) {
    console.log(`   ⚠️ Colchetes desbalanceados: ${openBrackets > 0 ? '+' : ''}${openBrackets}`);
  }
  
  if (openBraces === 0 && openParens === 0 && openBrackets === 0) {
    console.log('   ✓ Sintaxe básica OK\n');
  } else {
    console.log('   ❌ Possíveis erros de sintaxe detectados\n');
  }
} catch (error) {
  console.log('   ❌ Erro ao verificar sintaxe:', error.message, '\n');
}

// 4. Verificar se renderer.js está enviando o evento
console.log('4. Verificando renderer.js...');
const rendererJsPath = path.join(__dirname, 'renderer.js');
const rendererJsContent = fs.readFileSync(rendererJsPath, 'utf8');

if (rendererJsContent.includes("ipcRenderer.send('load-chat-ui'")) {
  console.log('   ✓ Evento load-chat-ui sendo enviado\n');
} else {
  console.log('   ❌ Evento load-chat-ui NÃO está sendo enviado!\n');
  process.exit(1);
}

// 5. Sugestões
console.log('=== SUGESTÕES ===\n');
console.log('1. Reinicie o aplicativo Electron completamente');
console.log('2. Verifique os logs do console do terminal (não DevTools)');
console.log('3. Procure por mensagens começando com "=== LOAD CHAT UI HANDLER CHAMADO ==="');
console.log('4. Se não aparecer, o handler não está sendo registrado');
console.log('\n✓ Diagnóstico concluído');
