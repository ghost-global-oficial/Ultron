// Script para iniciar o gateway manualmente para testes
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('=== INICIANDO GATEWAY MANUALMENTE ===');

// Ler configuração
const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
if (!fs.existsSync(configPath)) {
    console.error('❌ Arquivo de configuração não encontrado:', configPath);
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
console.log('✓ Configuração carregada');
console.log('Porta:', config.gateway.port);
console.log('Token:', config.gateway.auth.token.substring(0, 16) + '...');

// Verificar se o entry.js existe
const entryPath = path.join(__dirname, 'dist', 'entry.js');
if (!fs.existsSync(entryPath)) {
    console.error('❌ Gateway não compilado:', entryPath);
    console.log('Execute: npm run build');
    process.exit(1);
}

console.log('✓ Entry point encontrado:', entryPath);

// Iniciar gateway
const args = [
    entryPath,
    'gateway',
    'run',
    '--allow-unconfigured',
    '--port',
    config.gateway.port.toString()
];

console.log('Comando:', 'node', args.join(' '));
console.log('');
console.log('Iniciando gateway...');
console.log('');

const gateway = spawn('node', args, {
    cwd: __dirname,
    env: {
        ...process.env,
        OPENCLAW_INTERACTIVE: 'false',
        NODE_ENV: 'production',
        OPENCLAW_GATEWAY_AUTH_TOKEN: config.gateway.auth.token,
        OPENCLAW_GATEWAY_TOKEN: config.gateway.auth.token,
        ...config.env.vars
    },
    stdio: 'inherit'
});

gateway.on('error', (error) => {
    console.error('❌ Erro ao iniciar gateway:', error);
    process.exit(1);
});

gateway.on('exit', (code, signal) => {
    console.log('');
    console.log('Gateway encerrado');
    console.log('Código:', code);
    console.log('Sinal:', signal);
    process.exit(code || 0);
});

// Capturar Ctrl+C
process.on('SIGINT', () => {
    console.log('');
    console.log('Encerrando gateway...');
    gateway.kill();
});

console.log('Gateway PID:', gateway.pid);
console.log('');
console.log('Pressione Ctrl+C para encerrar');
console.log('');
