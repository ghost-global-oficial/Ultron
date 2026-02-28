// Script para remover o token e testar o card
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== REMOVER TOKEN PARA TESTE ===\n');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

if (!fs.existsSync(configPath)) {
    console.log('❌ Arquivo de configuração não encontrado!');
    process.exit(1);
}

console.log('1. Lendo configuração...');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

if (!config.gateway || !config.gateway.auth || !config.gateway.auth.token) {
    console.log('   ⚠️  Token já não existe!');
    console.log('   ✅ O card deve aparecer quando você abrir o chat.\n');
    process.exit(0);
}

const tokenBackup = config.gateway.auth.token;
console.log('   ✅ Token encontrado:', tokenBackup.substring(0, 16) + '...\n');

console.log('2. Fazendo backup do token...');
const backupPath = path.join(os.homedir(), '.openclaw', 'token-backup.txt');
fs.writeFileSync(backupPath, tokenBackup);
console.log('   ✅ Backup salvo em:', backupPath, '\n');

console.log('3. Removendo token da configuração...');
delete config.gateway.auth.token;

console.log('4. Salvando configuração...');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('   ✅ Configuração salva!\n');

console.log('=== SUCESSO ===');
console.log('✅ Token removido com sucesso!\n');

console.log('💡 PRÓXIMOS PASSOS:');
console.log('   1. Abra o aplicativo (se já estiver aberto, recarregue com Ctrl+R)');
console.log('   2. O card de token deve aparecer automaticamente');
console.log('   3. Cole o token abaixo no card:');
console.log('');
console.log('   📋 TOKEN:');
console.log('   ' + tokenBackup);
console.log('');
console.log('   4. Clique em "Conectar"');
console.log('   5. O card deve fechar e mostrar "✅ Gateway conectado!"\n');

console.log('💾 PARA RESTAURAR O TOKEN AUTOMATICAMENTE:');
console.log('   node restore-token.cjs\n');

console.log('='.repeat(50));
