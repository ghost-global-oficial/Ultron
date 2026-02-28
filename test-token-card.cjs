// Script para testar se o card de token deve aparecer
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== TESTE DO CARD DE TOKEN ===\n');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

console.log('1. Verificando arquivo de configuração...');
console.log('   Path:', configPath);

if (!fs.existsSync(configPath)) {
    console.log('   ❌ Arquivo não existe!');
    console.log('   💡 Execute a configuração primeiro: npm start');
    process.exit(1);
}

console.log('   ✅ Arquivo existe\n');

console.log('2. Lendo configuração...');
let config;
try {
    const data = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(data);
    console.log('   ✅ Configuração lida com sucesso\n');
} catch (error) {
    console.log('   ❌ Erro ao ler:', error.message);
    process.exit(1);
}

console.log('3. Verificando gateway...');
if (!config.gateway) {
    console.log('   ❌ Gateway não configurado!');
    process.exit(1);
}
console.log('   ✅ Gateway configurado');
console.log('   📊 Porta:', config.gateway.port);
console.log('   📊 Bind:', config.gateway.bind);
console.log('   📊 Modo:', config.gateway.mode);
console.log('');

console.log('4. Verificando autenticação...');
if (!config.gateway.auth) {
    console.log('   ⚠️  Objeto auth não existe');
    console.log('   ✅ CARD DEVE APARECER!\n');
    showSolution('add-token');
    process.exit(0);
}

console.log('   ✅ Objeto auth existe');
console.log('   📊 Modo:', config.gateway.auth.mode);
console.log('');

console.log('5. Verificando token...');
if (!config.gateway.auth.token) {
    console.log('   ⚠️  Token não existe');
    console.log('   ✅ CARD DEVE APARECER!\n');
    showSolution('add-token');
    process.exit(0);
}

console.log('   ✅ Token existe');
console.log('   📊 Token (primeiros 16 chars):', config.gateway.auth.token.substring(0, 16) + '...');
console.log('');

console.log('=== RESULTADO ===');
console.log('❌ CARD NÃO VAI APARECER');
console.log('   Motivo: Token já está configurado\n');

showSolution('remove-token');

function showSolution(type) {
    if (type === 'add-token') {
        console.log('💡 PRÓXIMOS PASSOS:');
        console.log('   1. Inicie o aplicativo: npm start');
        console.log('   2. Clique em "Abrir Chat"');
        console.log('   3. O card deve aparecer automaticamente');
        console.log('   4. Cole o token que foi exibido na configuração');
        console.log('   5. Clique em "Conectar"\n');
    } else if (type === 'remove-token') {
        console.log('💡 PARA TESTAR O CARD NOVAMENTE:');
        console.log('   1. Abra o arquivo de configuração:');
        console.log('      notepad ' + configPath);
        console.log('');
        console.log('   2. Encontre a seção "auth" dentro de "gateway":');
        console.log('      "gateway": {');
        console.log('        ...');
        console.log('        "auth": {');
        console.log('          "mode": "token",');
        console.log('          "token": "abc123..."  <-- REMOVA ESTA LINHA');
        console.log('        }');
        console.log('      }');
        console.log('');
        console.log('   3. Remova APENAS a linha do token (mantenha o resto)');
        console.log('   4. Salve o arquivo');
        console.log('   5. Recarregue o chat (Ctrl+R)');
        console.log('   6. O card deve aparecer!\n');
        
        console.log('📋 COMANDO RÁPIDO (PowerShell):');
        console.log('   $config = Get-Content "' + configPath + '" | ConvertFrom-Json');
        console.log('   $config.gateway.auth.PSObject.Properties.Remove("token")');
        console.log('   $config | ConvertTo-Json -Depth 10 | Set-Content "' + configPath + '"');
        console.log('');
    }
}

console.log('='.repeat(50));
