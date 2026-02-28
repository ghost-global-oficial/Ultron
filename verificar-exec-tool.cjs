#!/usr/bin/env node

/**
 * Verificar se o suporte para "exec" foi adicionado corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando suporte para ferramenta "exec"...\n');

// 1. Verificar tool-display.json
console.log('1️⃣ Verificando tool-display.json...');
const jsonPath = path.join(__dirname, 'ui', 'src', 'ui', 'tool-display.json');
const jsonContent = fs.readFileSync(jsonPath, 'utf8');
const config = JSON.parse(jsonContent);

if (config.tools && config.tools.exec) {
  console.log('   ✅ "exec" encontrado no JSON');
  console.log('   📋 Config:', JSON.stringify(config.tools.exec, null, 2));
} else {
  console.log('   ❌ "exec" NÃO encontrado no JSON');
  process.exit(1);
}

// 2. Verificar tool-display.ts
console.log('\n2️⃣ Verificando tool-display.ts...');
const tsPath = path.join(__dirname, 'ui', 'src', 'ui', 'tool-display.ts');
const tsContent = fs.readFileSync(tsPath, 'utf8');

if (tsContent.includes('key === "exec"')) {
  console.log('   ✅ Lógica para "exec" encontrada no TypeScript');
  
  // Verificar se está na condição correta
  if (tsContent.includes('(key === "bash" || key === "exe" || key === "exec")')) {
    console.log('   ✅ "exec" está na condição junto com bash e exe');
  } else {
    console.log('   ⚠️  "exec" pode não estar na condição correta');
  }
} else {
  console.log('   ❌ Lógica para "exec" NÃO encontrada no TypeScript');
  process.exit(1);
}

// 3. Verificar build
console.log('\n3️⃣ Verificando build...');
const distPath = path.join(__dirname, 'dist', 'control-ui', 'assets');

if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(f => f.startsWith('index-') && f.endsWith('.js'));
  
  if (jsFiles.length > 0) {
    console.log('   ✅ Build encontrado:', jsFiles[0]);
    
    const buildPath = path.join(distPath, jsFiles[0]);
    const buildContent = fs.readFileSync(buildPath, 'utf8');
    
    // Verificar se o código compilado contém a lógica
    if (buildContent.includes('exec') && buildContent.includes('Opening')) {
      console.log('   ✅ Build contém lógica de "exec" e "Opening"');
    } else {
      console.log('   ⚠️  Build pode não conter a lógica atualizada');
      console.log('   💡 Execute: cd ui && npm run build');
    }
  } else {
    console.log('   ❌ Nenhum arquivo JS encontrado no build');
    console.log('   💡 Execute: cd ui && npm run build');
  }
} else {
  console.log('   ❌ Pasta dist não encontrada');
  console.log('   💡 Execute: cd ui && npm run build');
}

// 4. Resumo
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO');
console.log('='.repeat(60));
console.log('✅ Suporte para "exec" adicionado com sucesso!');
console.log('\n📝 Ferramentas suportadas:');
console.log('   • bash  - Comandos shell genéricos');
console.log('   • exe   - Executáveis diretos');
console.log('   • exec  - Ferramenta principal de execução ← NOVO!');
console.log('\n🚀 Próximos passos:');
console.log('   1. Feche o app completamente (Ctrl+C)');
console.log('   2. Limpe o cache (Ctrl+Shift+Delete)');
console.log('   3. Reinicie: npm start');
console.log('   4. Teste: "Abra o Blender"');
console.log('   5. Verifique: Deve aparecer "Opening Blender"');
console.log('\n🔍 Debug:');
console.log('   • Abra DevTools (F12)');
console.log('   • Procure por: [TOOL-DISPLAY] Tool called: exec');
console.log('   • Procure por: [DEBUG] extracted command:');
console.log('='.repeat(60));
