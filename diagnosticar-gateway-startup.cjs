#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

console.log('=== DIAGNÓSTICO DE INICIALIZAÇÃO DO GATEWAY ===\n');

// 1. Verificar se o arquivo de configuração existe
const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');
console.log('1. Verificando arquivo de configuração...');
console.log('   Path:', configPath);

if (fs.existsSync(configPath)) {
    console.log('   ✓ Arquivo existe');
    
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('   ✓ JSON válido');
        console.log('   Porta:', config.gateway?.port);
        console.log('   Token:', config.gateway?.auth?.token?.substring(0, 16) + '...');
        console.log('   Bind:', config.gateway?.bind);
        console.log('   Modelo:', config.agents?.defaults?.model?.primary);
        
        // Verificar se tem API key
        if (config.env?.vars) {
            const apiKeys = Object.keys(config.env.vars);
            console.log('   API Keys configuradas:', apiKeys.join(', '));
        } else {
            console.log('   ⚠️ Nenhuma API key configurada');
        }
        
        // Verificar configuração de tools
        if (config.tools) {
            console.log('   ✓ Tools configurado');
            console.log('   Exec host:', config.tools.exec?.host);
            console.log('   Security:', config.tools.security);
            console.log('   Ask:', config.tools.ask);
        } else {
            console.log('   ⚠️ Tools não configurado');
        }
    } catch (error) {
        console.log('   ❌ Erro ao ler JSON:', error.message);
    }
} else {
    console.log('   ❌ Arquivo não existe');
}

// 2. Verificar se o entry.js existe
console.log('\n2. Verificando entry.js...');
const entryPath = path.join(__dirname, 'dist', 'entry.js');
console.log('   Path:', entryPath);
console.log('   Existe:', fs.existsSync(entryPath) ? '✓' : '❌');

// 3. Verificar se a porta está em uso
console.log('\n3. Verificando porta 18789...');
const net = require('net');

const checkPort = () => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        
        socket.on('error', () => {
            resolve(false);
        });
        
        socket.connect(18789, '127.0.0.1');
    });
};

checkPort().then(inUse => {
    if (inUse) {
        console.log('   ⚠️ Porta 18789 está EM USO');
        console.log('   Pode haver um gateway já rodando');
    } else {
        console.log('   ✓ Porta 18789 está LIVRE');
    }
    
    // 4. Tentar iniciar o gateway manualmente
    console.log('\n4. Tentando iniciar gateway manualmente...');
    
    if (!fs.existsSync(entryPath)) {
        console.log('   ❌ entry.js não encontrado, não é possível iniciar');
        return;
    }
    
    if (!fs.existsSync(configPath)) {
        console.log('   ❌ Configuração não encontrada, não é possível iniciar');
        return;
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    const args = [
        entryPath,
        'gateway',
        'run',
        '--allow-unconfigured',
        '--port',
        '18789'
    ];
    
    console.log('   Comando:', 'node', args.join(' '));
    console.log('   Iniciando...\n');
    
    const gatewayProcess = spawn('node', args, {
        cwd: __dirname,
        env: {
            ...process.env,
            ULTRON_INTERACTIVE: 'false',
            NODE_ENV: 'production',
            ULTRON_GATEWAY_AUTH_TOKEN: config.gateway.auth.token,
            ULTRON_GATEWAY_TOKEN: config.gateway.auth.token,
            ...config.env.vars
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    let hasError = false;
    
    gatewayProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write('   [STDOUT] ' + text);
    });
    
    gatewayProcess.stderr.on('data', (data) => {
        const text = data.toString();
        output += '[STDERR] ' + text;
        process.stderr.write('   [STDERR] ' + text);
        
        if (text.includes('Error') || text.includes('EADDRINUSE')) {
            hasError = true;
        }
    });
    
    gatewayProcess.on('exit', (code) => {
        console.log('\n   Gateway encerrou com código:', code);
        
        if (code !== 0) {
            console.log('\n   ❌ Gateway falhou ao iniciar');
            console.log('   Verifique os logs acima para mais detalhes');
        }
    });
    
    // Aguardar 10 segundos e verificar se está rodando
    setTimeout(async () => {
        const isRunning = await checkPort();
        
        if (isRunning) {
            console.log('\n   ✓ Gateway está RODANDO na porta 18789!');
            console.log('   Você pode testar conectando ao ws://localhost:18789');
        } else {
            console.log('\n   ❌ Gateway NÃO está rodando após 10 segundos');
            console.log('   Verifique os logs acima para identificar o problema');
        }
        
        // Encerrar o processo
        gatewayProcess.kill();
        process.exit(isRunning ? 0 : 1);
    }, 10000);
});
