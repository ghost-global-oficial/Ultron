#!/usr/bin/env node

/**
 * Script para testar as cores do menu de Integrações
 * Agora com a mesma cor da barra lateral (#000000)
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🎨 Testando cores do menu de Integrações...\n');

// Limpar cache do Electron
console.log('1️⃣ Limpando cache do Electron...');
try {
  const appDataPath = process.env.APPDATA || path.join(process.env.HOME, 'AppData', 'Roaming');
  const cachePath = path.join(appDataPath, 'ultron-app');
  
  if (require('fs').existsSync(cachePath)) {
    execSync(`rmdir /s /q "${cachePath}"`, { stdio: 'inherit', shell: true });
    console.log('✅ Cache limpo com sucesso\n');
  } else {
    console.log('ℹ️ Cache não encontrado\n');
  }
} catch (error) {
  console.log('⚠️ Erro ao limpar cache (pode ser ignorado)\n');
}

// Recompilar
console.log('2️⃣ Recompilando aplicação...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, 'ui') });
  console.log('✅ Compilação concluída\n');
} catch (error) {
  console.error('❌ Erro na compilação:', error.message);
  process.exit(1);
}

// Iniciar aplicação
console.log('3️⃣ Iniciando aplicação...');
console.log('\n📋 Checklist de teste:');
console.log('   ✓ Abra a barra lateral');
console.log('   ✓ Clique no botão "Conectores" (ícone de camadas)');
console.log('   ✓ Verifique se o menu de Integrações tem fundo preto (#000000)');
console.log('   ✓ Verifique se os cards têm fundo #1a1a1a');
console.log('   ✓ Verifique se as bordas são #2a2a2a');
console.log('   ✓ Verifique se o hover dos cards muda a borda para #6366f1 (roxo)');
console.log('   ✓ Compare com a cor da barra lateral (devem ser iguais)\n');

try {
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erro ao iniciar:', error.message);
  process.exit(1);
}
