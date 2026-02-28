#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Analisando componentes não utilizados do OpenClaw no ULTRON...\n');

// Componentes que provavelmente não são usados no ULTRON
const componentesParaAnalisar = {
  'Canais de Comunicação (UI)': [
    'ui/src/ui/views/channels.discord.ts',
    'ui/src/ui/views/channels.signal.ts',
    'ui/src/ui/views/channels.telegram.ts',
    'ui/src/ui/views/channels.slack.ts',
    'ui/src/ui/views/channels.whatsapp.ts',
    'ui/src/ui/views/channels.imessage.ts',
    'ui/src/ui/views/channels.googlechat.ts',
    'ui/src/ui/views/channels.nostr.ts',
    'ui/src/ui/views/channels.nostr-profile-form.ts',
  ],
  'Extensões de Canais': [
    'extensions/discord/',
    'extensions/telegram/',
    'extensions/signal/',
    'extensions/slack/',
    'extensions/whatsapp/',
    'extensions/imessage/',
    'extensions/googlechat/',
    'extensions/matrix/',
    'extensions/mattermost/',
    'extensions/msteams/',
    'extensions/line/',
    'extensions/nostr/',
    'extensions/bluebubbles/',
    'extensions/nextcloud-talk/',
    'extensions/tlon/',
    'extensions/twitch/',
    'extensions/voice-call/',
    'extensions/zalo/',
    'extensions/zalouser/',
  ],
  'Código Fonte de Canais': [
    'src/discord/',
    'src/telegram/',
    'src/signal/',
    'src/slack/',
    'src/whatsapp/',
    'src/imessage/',
    'src/line/',
    'src/web/',
  ],
  'Skills Específicos': [
    'skills/1password/',
    'skills/apple-notes/',
    'skills/apple-reminders/',
    'skills/bear-notes/',
    'skills/bird/',
    'skills/blogwatcher/',
    'skills/blucli/',
    'skills/bluebubbles/',
    'skills/camsnap/',
    'skills/clawhub/',
    'skills/discord/',
    'skills/eightctl/',
    'skills/food-order/',
    'skills/gifgrep/',
    'skills/github/',
    'skills/gog/',
    'skills/goplaces/',
    'skills/himalaya/',
    'skills/imsg/',
    'skills/local-places/',
    'skills/mcporter/',
    'skills/nano-banana-pro/',
    'skills/nano-pdf/',
    'skills/notion/',
    'skills/obsidian/',
    'skills/openhue/',
    'skills/oracle/',
    'skills/ordercli/',
    'skills/peekaboo/',
    'skills/sag/',
    'skills/sherpa-onnx-tts/',
    'skills/slack/',
    'skills/songsee/',
    'skills/sonoscli/',
    'skills/spotify-player/',
    'skills/things-mac/',
    'skills/tmux/',
    'skills/trello/',
    'skills/video-frames/',
    'skills/voice-call/',
    'skills/wacli/',
    'skills/weather/',
  ],
  'Apps Mobile (Android/iOS)': [
    'apps/android/',
    'apps/ios/',
  ],
  'Packages Específicos': [
    'packages/clawdbot/',
    'packages/moltbot/',
  ],
  'Documentação Extensa': [
    'docs/channels/',
    'docs/platforms/',
    'docs/plugins/',
    'docs/zh-CN/',
  ],
  'Componentes de Teste': [
    'test/',
  ],
  'Swabble (Projeto Separado)': [
    'Swabble/',
  ],
  'Vendor': [
    'vendor/a2ui/',
  ],
};

let totalSize = 0;
let totalDirs = 0;
let totalFiles = 0;
const detalhes = [];

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
    // Ignorar erros de permissão
  }
  
  return { size, fileCount };
}

console.log('Categoria                              | Tamanho    | Arquivos | Status');
console.log('─'.repeat(80));

for (const [categoria, componentes] of Object.entries(componentesParaAnalisar)) {
  let categoriaSize = 0;
  let categoriaFiles = 0;
  let existentes = 0;
  
  for (const componente of componentes) {
    const fullPath = path.join(process.cwd(), componente);
    const result = getDirectorySize(fullPath);
    
    if (result.size > 0 || result.fileCount > 0) {
      categoriaSize += result.size;
      categoriaFiles += result.fileCount;
      existentes++;
    }
  }
  
  if (categoriaSize > 0) {
    const sizeMB = (categoriaSize / 1024 / 1024).toFixed(2);
    const status = existentes === componentes.length ? '✓ Todos' : `✓ ${existentes}/${componentes.length}`;
    
    console.log(
      `${categoria.padEnd(38)} | ${(sizeMB + ' MB').padEnd(10)} | ${String(categoriaFiles).padEnd(8)} | ${status}`
    );
    
    totalSize += categoriaSize;
    totalFiles += categoriaFiles;
    totalDirs += existentes;
    
    detalhes.push({
      categoria,
      componentes: componentes.filter(c => {
        const fullPath = path.join(process.cwd(), c);
        return fs.existsSync(fullPath);
      }),
      size: categoriaSize,
      files: categoriaFiles,
    });
  }
}

console.log('─'.repeat(80));
console.log(`${'TOTAL'.padEnd(38)} | ${((totalSize / 1024 / 1024).toFixed(2) + ' MB').padEnd(10)} | ${String(totalFiles).padEnd(8)} |`);
console.log('\n');

console.log('📊 RESUMO DA ANÁLISE\n');
console.log(`Total de espaço ocupado: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Total de arquivos: ${totalFiles}`);
console.log(`Total de componentes: ${totalDirs}`);
console.log('\n');

console.log('💡 RECOMENDAÇÕES\n');
console.log('Os seguintes componentes podem ser removidos se não forem usados no ULTRON:\n');

for (const detalhe of detalhes) {
  if (detalhe.size > 1024 * 1024) { // Maior que 1MB
    console.log(`\n${detalhe.categoria}:`);
    console.log(`  Tamanho: ${(detalhe.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Arquivos: ${detalhe.files}`);
    console.log(`  Componentes:`);
    for (const comp of detalhe.componentes.slice(0, 5)) {
      console.log(`    - ${comp}`);
    }
    if (detalhe.componentes.length > 5) {
      console.log(`    ... e mais ${detalhe.componentes.length - 5} componentes`);
    }
  }
}

console.log('\n');
console.log('⚠️  ATENÇÃO: Antes de remover, verifique se estes componentes são realmente necessários!');
console.log('   Alguns podem ser dependências indiretas ou usados em runtime.');
console.log('\n');

// Salvar relatório
const relatorio = {
  data: new Date().toISOString(),
  totalSize: totalSize,
  totalFiles: totalFiles,
  totalDirs: totalDirs,
  detalhes: detalhes,
};

fs.writeFileSync(
  'ANALISE_COMPONENTES_NAO_USADOS.json',
  JSON.stringify(relatorio, null, 2),
  'utf8'
);

console.log('📄 Relatório detalhado salvo em: ANALISE_COMPONENTES_NAO_USADOS.json');
