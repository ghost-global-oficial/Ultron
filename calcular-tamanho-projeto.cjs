#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📊 Calculando tamanho total do projeto ULTRON...\n');

// Diretórios para ignorar
const ignoreDirs = new Set([
  'node_modules',
  '.git',
  'dist',
  '.vscode',
]);

function getDirectorySize(dirPath, depth = 0, maxDepth = 10) {
  let size = 0;
  let fileCount = 0;
  let dirCount = 0;
  
  if (depth > maxDepth) {
    return { size: 0, fileCount: 0, dirCount: 0 };
  }
  
  try {
    if (!fs.existsSync(dirPath)) {
      return { size: 0, fileCount: 0, dirCount: 0 };
    }
    
    const stats = fs.statSync(dirPath);
    
    if (stats.isFile()) {
      return { size: stats.size, fileCount: 1, dirCount: 0 };
    }
    
    if (stats.isDirectory()) {
      const dirName = path.basename(dirPath);
      
      // Ignorar diretórios específicos
      if (ignoreDirs.has(dirName)) {
        return { size: 0, fileCount: 0, dirCount: 0 };
      }
      
      dirCount = 1;
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const result = getDirectorySize(filePath, depth + 1, maxDepth);
        size += result.size;
        fileCount += result.fileCount;
        dirCount += result.dirCount;
      }
    }
  } catch (error) {
    // Ignorar erros de permissão
  }
  
  return { size, fileCount, dirCount };
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// Calcular tamanho de cada diretório principal
const mainDirs = [
  'src',
  'ui',
  'apps',
  'extensions',
  'skills',
  'docs',
  'test',
  'scripts',
  'packages',
  'vendor',
  'assets',
  'patches',
  'git-hooks',
];

console.log('Diretório                    | Tamanho      | Arquivos | Pastas');
console.log('─'.repeat(75));

let totalSize = 0;
let totalFiles = 0;
let totalDirs = 0;
const details = [];

for (const dir of mainDirs) {
  const fullPath = path.join(process.cwd(), dir);
  const result = getDirectorySize(fullPath);
  
  if (result.size > 0 || result.fileCount > 0) {
    console.log(
      `${dir.padEnd(28)} | ${formatSize(result.size).padEnd(12)} | ${String(result.fileCount).padEnd(8)} | ${result.dirCount}`
    );
    
    totalSize += result.size;
    totalFiles += result.fileCount;
    totalDirs += result.dirCount;
    
    details.push({
      dir,
      size: result.size,
      files: result.fileCount,
      dirs: result.dirCount,
    });
  }
}

// Calcular arquivos na raiz
const rootFiles = fs.readdirSync(process.cwd()).filter(file => {
  const fullPath = path.join(process.cwd(), file);
  const stats = fs.statSync(fullPath);
  return stats.isFile();
});

let rootSize = 0;
for (const file of rootFiles) {
  const fullPath = path.join(process.cwd(), file);
  const stats = fs.statSync(fullPath);
  rootSize += stats.size;
}

console.log(
  `${'(arquivos na raiz)'.padEnd(28)} | ${formatSize(rootSize).padEnd(12)} | ${String(rootFiles.length).padEnd(8)} | 0`
);

totalSize += rootSize;
totalFiles += rootFiles.length;

console.log('─'.repeat(75));
console.log(
  `${'TOTAL (sem node_modules/dist)'.padEnd(28)} | ${formatSize(totalSize).padEnd(12)} | ${String(totalFiles).padEnd(8)} | ${totalDirs}`
);

console.log('\n');
console.log('📦 RESUMO DO PROJETO ULTRON\n');
console.log(`Tamanho total: ${formatSize(totalSize)}`);
console.log(`Total de arquivos: ${totalFiles.toLocaleString()}`);
console.log(`Total de diretórios: ${totalDirs.toLocaleString()}`);
console.log('\n');

// Calcular node_modules e dist (se existirem)
console.log('📊 DIRETÓRIOS EXCLUÍDOS (não contam no tamanho):\n');

const excludedDirs = ['node_modules', 'dist', '.git'];
for (const dir of excludedDirs) {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    const result = getDirectorySize(fullPath, 0, 5); // Limitar profundidade para node_modules
    console.log(`${dir.padEnd(20)}: ${formatSize(result.size)} (${result.fileCount.toLocaleString()} arquivos)`);
  }
}

console.log('\n');

// Top 5 maiores diretórios
console.log('🏆 TOP 5 MAIORES DIRETÓRIOS:\n');
const sorted = details.sort((a, b) => b.size - a.size).slice(0, 5);
for (let i = 0; i < sorted.length; i++) {
  const item = sorted[i];
  console.log(`${i + 1}. ${item.dir.padEnd(20)}: ${formatSize(item.size).padEnd(12)} (${item.files.toLocaleString()} arquivos)`);
}

console.log('\n');
console.log('💡 NOTA: O tamanho mostrado NÃO inclui node_modules, dist e .git');
console.log('   Estes diretórios são gerados automaticamente e não fazem parte do código fonte.');

// Salvar relatório
const relatorio = {
  data: new Date().toISOString(),
  tamanhoTotal: totalSize,
  tamanhoFormatado: formatSize(totalSize),
  totalArquivos: totalFiles,
  totalDiretorios: totalDirs,
  detalhes: details,
  top5: sorted,
};

fs.writeFileSync(
  'TAMANHO_PROJETO.json',
  JSON.stringify(relatorio, null, 2),
  'utf8'
);

console.log('\n📄 Relatório detalhado salvo em: TAMANHO_PROJETO.json');
