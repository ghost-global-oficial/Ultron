// Script para criar um node via API do gateway
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== CRIAR NODE VIA API ===\n');

// Ler configuração
const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const port = config.gateway.port;
const token = config.gateway.auth.token;

console.log('1. Conectando ao gateway...');

const ws = new WebSocket(`ws://localhost:${port}`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

ws.on('open', () => {
    console.log('   ✅ Conectado!\n');
    
    console.log('2. Criando node "main"...');
    
    // Criar node
    const createNodeRequest = {
        type: 'req',
        id: 'create-node-' + Date.now(),
        method: 'node.create',
        params: {
            key: 'main',
            agent: {
                model: {
                    primary: 'groq/openai/gpt-oss-120b'
                }
            }
        }
    };
    
    console.log('   Request:', JSON.stringify(createNodeRequest, null, 2));
    ws.send(JSON.stringify(createNodeRequest));
    
    console.log('   ✅ Request enviado!\n');
    console.log('3. Aguardando resposta...\n');
});

ws.on('message', (data) => {
    console.log('   📨 Resposta:');
    try {
        const response = JSON.parse(data.toString());
        console.log(JSON.stringify(response, null, 2));
        
        if (response.type === 'res' && response.ok) {
            console.log('\n✅ Node criado com sucesso!');
            ws.close();
        }
    } catch (error) {
        console.log(data.toString());
    }
    console.log('');
});

ws.on('error', (error) => {
    console.log('   ❌ Erro:', error.message);
    process.exit(1);
});

ws.on('close', () => {
    console.log('   🔌 Conexão fechada');
    process.exit(0);
});

setTimeout(() => {
    console.log('   ⏱️ Timeout');
    ws.close();
    process.exit(1);
}, 10000);
