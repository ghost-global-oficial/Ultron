// Script para restaurar o token do backup
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== RESTAURAR TOKEN DO BACKUP ===\n');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
const backupPath = path.join(os.homedir(), '.openclaw', 'token-backup.txt');

if (!fs.existsSync(backupPath)) {
    console.log('❌ Backup não encontrado!');
    console.log('   Path:', backupPath);
    console.log('   Execute "node remove-token.cjs" primeiro.\n');
    process.exit(1);
}

console.log('1. Lendo backup...');
const token = fs.readFileSync(backupPath, 'utf8').trim();
console.log('   ✅ Token:', token.substring(0, 16) + '...\n');

console.log('2. Lendo configuração...');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

if (config.gateway && config.gateway.auth && config.gateway.auth.token) {
    console.log('   ⚠️  Token já existe na configuração!');
    console.log('   Token atual:', config.gateway.auth.token.substring(0, 16) + '...');
    console.log('   Nada a fazer.\n');
    process.exit(0);
}

console.log('3. Restaurando token...');
if (!config.gateway) config.gateway = {};
if (!config.gateway.auth) config.gateway.auth = {};
config.gateway.auth.token = token;

console.log('4. Salvando configuração...');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('   ✅ Configuração salva!\n');

console.log('=== SUCESSO ===');
console.log('✅ Token restaurado com sucesso!\n');

console.log('💡 PRÓXIMOS PASSOS:');
console.log('   1. Recarregue o chat (Ctrl+R)');
console.log('   2. O card NÃO deve aparecer (token já configurado)');
console.log('   3. O chat deve funcionar normalmente\n');

console.log('='.repeat(50));
