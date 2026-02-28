#!/usr/bin/env node

/**
 * Script de teste para verificar o seletor de modelo de IA
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando implementação do seletor de modelo...\n');

let allGood = true;

// Verificar arquivos TypeScript
const tsFiles = [
  'ui/src/ui/app.ts',
  'ui/src/ui/app-view-state.ts',
  'ui/src/ui/app-render.helpers.ts',
  'ui/src/ui/navigation.ts'
];

console.log('📝 Verificando arquivos TypeScript:');
for (const file of tsFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (file.includes('app.ts') && !file.includes('view-state')) {
      if (content.includes('chatModelMenuOpen') && content.includes('chatCurrentModel')) {
        console.log(`  ✅ ${file} - Estados adicionados`);
      } else {
        console.log(`  ❌ ${file} - Estados faltando`);
        allGood = false;
      }
      
      if (content.includes('handleChatModelMenuToggle') && 
          content.includes('handleChatModelMenuClose') && 
          content.includes('handleChatModelChange')) {
        console.log(`  ✅ ${file} - Handlers adicionados`);
      } else {
        console.log(`  ❌ ${file} - Handlers faltando`);
        allGood = false;
      }
    }
    
    if (file.includes('app-render.helpers')) {
      if (content.includes('chat-model-selector') && content.includes('availableModels')) {
        console.log(`  ✅ ${file} - Seletor implementado`);
      } else {
        console.log(`  ❌ ${file} - Seletor não implementado`);
        allGood = false;
      }
    }
    
    if (file.includes('navigation.ts')) {
      if (content.includes('case "chat":') && content.includes('return "";')) {
        console.log(`  ✅ ${file} - Subtítulo removido`);
      } else {
        console.log(`  ⚠️  ${file} - Subtítulo pode não estar removido`);
      }
    }
  } else {
    console.log(`  ❌ ${file} - Arquivo não encontrado`);
    allGood = false;
  }
}

console.log('\n📦 Verificando arquivos CSS:');
const cssFile = 'ui/src/styles/chat-model-selector.css';
const cssPath = path.join(__dirname, cssFile);
if (fs.existsSync(cssPath)) {
  const content = fs.readFileSync(cssPath, 'utf-8');
  if (content.includes('.chat-model-selector') && 
      content.includes('.chat-model-selector__menu') &&
      content.includes('[data-theme="light"]')) {
    console.log(`  ✅ ${cssFile} - Estilos completos`);
  } else {
    console.log(`  ❌ ${cssFile} - Estilos incompletos`);
    allGood = false;
  }
} else {
  console.log(`  ❌ ${cssFile} - Arquivo não encontrado`);
  allGood = false;
}

// Verificar import do CSS
const chatCssPath = path.join(__dirname, 'ui/src/styles/chat.css');
if (fs.existsSync(chatCssPath)) {
  const content = fs.readFileSync(chatCssPath, 'utf-8');
  if (content.includes('chat-model-selector.css')) {
    console.log(`  ✅ ui/src/styles/chat.css - Import adicionado`);
  } else {
    console.log(`  ❌ ui/src/styles/chat.css - Import faltando`);
    allGood = false;
  }
}

// Verificar build
console.log('\n🏗️  Verificando build:');
const distPath = path.join(__dirname, 'dist/control-ui');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  const hasIndex = files.some(f => f.startsWith('index-') && f.endsWith('.js'));
  const hasCss = files.some(f => f.startsWith('index-') && f.endsWith('.css'));
  
  if (hasIndex && hasCss) {
    console.log('  ✅ Build gerado com sucesso');
  } else {
    console.log('  ⚠️  Build pode estar incompleto');
  }
} else {
  console.log('  ⚠️  Pasta dist não encontrada - execute: cd ui && pnpm build');
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ Todos os testes passaram!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Limpe o cache: .\\limpar-cache-electron.ps1');
  console.log('2. Abra o Ultron Desktop');
  console.log('3. Vá para a aba Chat');
  console.log('4. Verifique o seletor de modelo no header');
  console.log('5. Teste trocar de modelo');
} else {
  console.log('❌ Alguns testes falharam. Verifique os erros acima.');
}
console.log('='.repeat(50));
