#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== LIMPEZA COMPLETA DE CACHE ===\n');

// 1. Limpar dist
console.log('1. Limpando pasta dist...');
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('   ✅ dist removido');
} else {
    console.log('   ⚠️  dist não existe');
}

// 2. Limpar node_modules/.vite
console.log('\n2. Limpando cache do Vite...');
const viteCachePath = path.join(process.cwd(), 'node_modules', '.vite');
if (fs.existsSync(viteCachePath)) {
    fs.rmSync(viteCachePath, { recursive: true, force: true });
    console.log('   ✅ Cache do Vite removido');
} else {
    console.log('   ⚠️  Cache do Vite não existe');
}

// 3. Limpar cache do Electron
console.log('\n3. Limpando cache do Electron...');
const appDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'ultron');
const cachePaths = [
    path.join(appDataPath, 'Cache'),
    path.join(appDataPath, 'Code Cache'),
    path.join(appDataPath, 'GPUCache'),
    path.join(appDataPath, 'DawnCache')
];

for (const cachePath of cachePaths) {
    if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath, { recursive: true, force: true });
        console.log(`   ✅ ${path.basename(cachePath)} removido`);
    }
}

console.log('\n═══════════════════════════════════════════════════');
console.log('✅ LIMPEZA COMPLETA!');
console.log('═══════════════════════════════════════════════════\n');

console.log('📋 Próximos passos:');
console.log('');
console.log('1. Recompilar a UI:');
console.log('   cd ui');
console.log('   npm run build');
console.log('   cd ..');
console.log('');
console.log('2. Reiniciar o app:');
console.log('   npm start');
console.log('');
console.log('3. Testar:');
console.log('   "Abra o Blender"');
console.log('');
