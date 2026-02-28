// Script para testar envio de mensagem ao gateway
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== TESTE DE MENSAGEM AO GATEWAY ===\n');

// Ler configuração
const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
if (!fs.existsSync(configPath)) {
    console.log('❌ Configuração não encontrada!');
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const port = config.gateway.port;
const token = config.gateway.auth.token;

console.log('1. Configuração:');
console.log('   Porta:', port);
console.log('   Token:', token.substring(0, 16) + '...');
console.log('   Modelo:', config.agents?.defaults?.model?.primary);
console.log('');

// Conectar ao WebSocket
const wsUrl = `ws://localhost:${port}`;
console.log('2. Conectando ao gateway:', wsUrl);

const ws = new WebSocket(wsUrl, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

ws.on('open', () => {
    console.log('   ✅ Conectado!\n');
    
    console.log('3. Enviando mensagem de teste...');
    
    // Enviar mensagem de teste
    const message = {
        type: 'message',
        sessionKey: 'test-session',
        content: 'Olá! Este é um teste.',
        timestamp: Date.now()
    };
    
    console.log('   Mensagem:', JSON.stringify(message, null, 2));
    ws.send(JSON.stringify(message));
    
    console.log('   ✅ Mensagem enviada!\n');
    console.log('4. Aguardando resposta...\n');
});

ws.on('message', (data) => {
    console.log('   📨 Resposta recebida:');
    try {
        const response = JSON.parse(data.toString());
        console.log(JSON.stringify(response, null, 2));
    } catch (error) {
        console.log(data.toString());
    }
    console.log('');
});

ws.on('error', (error) => {
    console.log('   ❌ Erro:', error.message);
    process.exit(1);
});

ws.on('close', (code, reason) => {
    console.log('   🔌 Conexão fechada');
    console.log('   Código:', code);
    console.log('   Motivo:', reason.toString());
    process.exit(0);
});

// Timeout de 30 segundos
setTimeout(() => {
    console.log('   ⏱️ Timeout - sem resposta em 30 segundos');
    ws.close();
    process.exit(1);
}, 30000);
