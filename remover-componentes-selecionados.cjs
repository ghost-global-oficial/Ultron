#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗑️  Removendo componentes selecionados do OpenClaw...\n');

// Componentes para remover
const componentesParaRemover = [
  // 1. Apps Mobile (Android/iOS)
  'apps/android/',
  'apps/ios/',
  
  // 4. Vendor/A2UI
  'vendor/a2ui/',
  
  // 7. Packages específicos
  'packages/clawdbot/',
  'packages/moltbot/',
  
  // 8. Swabble
  'Swabble/',
];

let totalSize = 0;
let totalFiles = 0;
let totalDirs = 0;
const removidos = [];

function getDirectorySize(dirPath) {
  let size = 0;
  let fileCount = 0;
  
  try {
    if (!fs.existsSync(dirPath)) {
      return { size: 0, fileCount: 0 };
    }
    
    const stats = fs.statSync(dirPath);
    
    if (stats.isFile()) {
      return { size: stats.size, fileCount: 1 };
    }
    
    if (stats.isDirectory()) {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const result = getDirectorySize(filePath);
        size += result.size;
        fileCount += result.fileCount;
      }
    }
  } catch (error) {
    // Ignorar erros
  }
  
  return { size, fileCount };
}

function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return false;
  }
  
  try {
    const stats = fs.statSync(dirPath);
    
    if (stats.isDirectory()) {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        removeDirectory(filePath);
      }
      
      fs.rmdirSync(dirPath);
    } else {
      fs.unlinkSync(dirPath);
    }
    
    return true;
  } catch (error) {
    console.error(`⚠️  Erro ao remover ${dirPath}:`, error.message);
    return false;
  }
}

console.log('Componente                              | Tamanho    | Arquivos | Status');
console.log('─'.repeat(80));

for (const componente of componentesParaRemover) {
  const fullPath = path.join(process.cwd(), componente);
  const result = getDirectorySize(fullPath);
  
  if (result.size > 0 || result.fileCount > 0) {
    const sizeMB = (result.size / 1024 / 1024).toFixed(2);
    
    console.log(
      `${componente.padEnd(38)} | ${(sizeMB + ' MB').padEnd(10)} | ${String(result.fileCount).padEnd(8)} | Removendo...`
    );
    
    const sucesso = removeDirectory(fullPath);
    
    if (sucesso) {
      totalSize += result.size;
      totalFiles += result.fileCount;
      totalDirs++;
      removidos.push({
        path: componente,
        size: result.size,
        files: result.fileCount,
      });
      
      console.log(`${' '.repeat(38)} | ${' '.repeat(10)} | ${' '.repeat(8)} | ✅ Removido`);
    } else {
      console.log(`${' '.repeat(38)} | ${' '.repeat(10)} | ${' '.repeat(8)} | ❌ Erro`);
    }
  } else {
    console.log(
      `${componente.padEnd(38)} | ${'0.00 MB'.padEnd(10)} | ${'0'.padEnd(8)} | ⚠️  Não existe`
    );
  }
}

console.log('─'.repeat(80));
console.log(`${'TOTAL REMOVIDO'.padEnd(38)} | ${((totalSize / 1024 / 1024).toFixed(2) + ' MB').padEnd(10)} | ${String(totalFiles).padEnd(8)} |`);
console.log('\n');

console.log('✅ Remoção concluída!\n');
console.log(`📊 Estatísticas:`);
console.log(`   - Componentes removidos: ${totalDirs}`);
console.log(`   - Arquivos removidos: ${totalFiles}`);
console.log(`   - Espaço liberado: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log('\n');

// Salvar relatório
const relatorio = {
  data: new Date().toISOString(),
  componentesRemovidos: removidos,
  totalSize: totalSize,
  totalFiles: totalFiles,
  totalDirs: totalDirs,
};

fs.writeFileSync(
  'COMPONENTES_REMOVIDOS.json',
  JSON.stringify(relatorio, null, 2),
  'utf8'
);

console.log('📄 Relatório salvo em: COMPONENTES_REMOVIDOS.json');
console.log('\n');

console.log('🎯 Componentes mantidos:');
console.log('   ✓ Extensões de Canais (extensions/)');
console.log('   ✓ Código Fonte de Canais (src/)');
console.log('   ✓ Skills (skills/)');
console.log('   ✓ Documentação (docs/)');
console.log('   ✓ Testes (test/)');
console.log('   ✓ UI completa (ui/)');
console.log('\n');

console.log('⚠️  PRÓXIMO PASSO: Execute "git add -A" e "git commit" para salvar as mudanças');
