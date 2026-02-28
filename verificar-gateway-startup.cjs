#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('=== TESTANDO INICIALIZAÇÃO DO GATEWAY ===\n');

// Ler configuração
const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');
if (!fs.existsSync(configPath)) {
    console.log('❌ Configuração não encontrada');
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const token = config.gateway?.auth?.token;
const port = config.gateway?.port || 18789;

console.log('📋 Configuração:');
console.log('  Port:', port);
console.log('  Token:', token?.substring(0, 16) + '...');
console.log('');

// Verificar se entry.js existe
const entryPath = path.join(__dirname, 'dist', 'entry.js');
console.log('📁 Verificando arquivos:');
console.log('  Entry.js:', entryPath);
console.log('  Existe?', fs.existsSync(entryPath));

if (!fs.existsSync(entryPath)) {
    console.log('');
    console.log('❌ ERRO: dist/entry.js não encontrado!');
    console.log('');
    console.log('💡 SOLUÇÃO: Execute "npm run build" para compilar o projeto');
    process.exit(1);
}

console.log('');
console.log('🚀 Iniciando gateway...');
console.log('');

const args = [
    entryPath,
    'gateway',
    'run',
    '--allow-unconfigured',
    '--port',
    port.toString()
];

console.log('📝 Comando:', 'node', args.join(' '));
console.log('');

const child = spawn('node', args, {
    cwd: __dirname,
    env: {
        ...process.env,
        ULTRON_INTERACTIVE: 'false',
        NODE_ENV: 'production',
        ULTRON_GATEWAY_AUTH_TOKEN: token,
        ULTRON_GATEWAY_TOKEN: token
    },
    stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';
let started = false;

child.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    process.stdout.write(text);
    
    if (text.toLowerCase().includes('listening') || 
        text.toLowerCase().includes('started') ||
        text.toLowerCase().includes('ready')) {
        started = true;
        console.log('');
        console.log('✅ Gateway iniciado com sucesso!');
        setTimeout(() => {
            child.kill();
            process.exit(0);
        }, 2000);
    }
});

child.stderr.on('data', (data) => {
    const text = data.toString();
    errorOutput += text;
    process.stderr.write(text);
});

child.on('exit', (code) => {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('Gateway encerrado com código:', code);
    console.log('═══════════════════════════════════════');
    
    if (!started) {
        console.log('');
        console.log('❌ Gateway NÃO iniciou corretamente');
        console.log('');
        
        if (errorOutput) {
            console.log('🔴 ERROS:');
            console.log(errorOutput);
        }
        
        if (output) {
            console.log('📋 OUTPUT:');
            console.log(output);
        }
    }
    
    process.exit(code || 0);
});

// Timeout de 20 segundos
setTimeout(() => {
    if (!started) {
        console.log('');
        console.log('⏱️ TIMEOUT: Gateway não iniciou em 20 segundos');
        console.log('');
        console.log('📋 Output capturado:');
        console.log(output || '(nenhum output)');
        console.log('');
        console.log('🔴 Erros capturados:');
        console.log(errorOutput || '(nenhum erro)');
        child.kill();
        process.exit(1);
    }
}, 20000);
