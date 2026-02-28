#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== CONFIGURANDO ATUALIZAÇÕES DO ULTRON ===\n');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

// Verificar se o arquivo existe
if (!fs.existsSync(configPath)) {
  console.error('❌ Arquivo de configuração não encontrado:', configPath);
  console.log('\n💡 Execute o Ultron primeiro para criar a configuração inicial.');
  process.exit(1);
}

// Ler configuração atual
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('✓ Configuração atual carregada');
} catch (error) {
  console.error('❌ Erro ao ler configuração:', error.message);
  process.exit(1);
}

// Fazer backup
const backupPath = configPath + '.backup-' + Date.now();
try {
  fs.writeFileSync(backupPath, JSON.stringify(config, null, 2));
  console.log('✓ Backup criado:', backupPath);
} catch (error) {
  console.error('⚠️ Não foi possível criar backup:', error.message);
}

// Adicionar/atualizar configuração de updates
config.updates = {
  // Configurações básicas
  channel: 'stable',
  autoCheck: true,
  autoDownload: false,
  autoInstall: false,
  
  // Repositório GitHub do Ultron
  provider: 'github',
  repo: 'ghost-global-oficial/Ultron',
  useReleases: true,
  
  // Filtros
  tagPattern: 'v*',
  includePrerelease: false,
  
  // Segurança
  verifyChecksum: false,
  allowDowngrade: false
};

console.log('\n✓ Configuração de updates adicionada:');
console.log('  - Repositório: ghost-global-oficial/Ultron');
console.log('  - Canal: stable');
console.log('  - Auto-check: ✓ (verifica automaticamente)');
console.log('  - Auto-download: ✗ (você controla)');
console.log('  - Auto-install: ✗ (você controla)');

// Salvar configuração atualizada
try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('\n✅ Configuração salva com sucesso!');
  console.log('📁 Arquivo:', configPath);
} catch (error) {
  console.error('\n❌ Erro ao salvar configuração:', error.message);
  console.log('💡 Restaurando backup...');
  
  try {
    fs.copyFileSync(backupPath, configPath);
    console.log('✓ Backup restaurado');
  } catch (restoreError) {
    console.error('❌ Erro ao restaurar backup:', restoreError.message);
  }
  
  process.exit(1);
}

console.log('\n🎉 Pronto! O Ultron agora vai buscar atualizações do repositório:');
console.log('   https://github.com/ghost-global-oficial/Ultron');
console.log('\n💡 Próximos passos:');
console.log('   1. Reinicie o Ultron para aplicar as mudanças');
console.log('   2. O sistema vai verificar atualizações automaticamente');
console.log('   3. Você será notificado quando houver novas versões');
console.log('\n📋 Para verificar atualizações manualmente:');
console.log('   openclaw update check');
