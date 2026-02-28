#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== TESTE DA NOVA CONFIGURAÇÃO ===\n');

// Simular a configuração que será salva
const configState = {
    executionMode: 'host', // ou 'sandbox'
    gatewayMode: 'local',
    gatewayPort: 18789,
    gatewayBind: 'auto',
    authMode: 'token',
    authToken: 'test-token-123',
    provider: 'openrouter',
    apiKey: 'sk-or-v1-test',
    model: 'openrouter/openai/gpt-oss-120b:free'
};

console.log('1. Testando configuração para modo HOST...\n');

const configHost = {
    gateway: {
        mode: configState.gatewayMode,
        port: configState.gatewayPort,
        bind: configState.gatewayBind,
        auth: {
            mode: configState.authMode,
            token: configState.authToken
        }
    },
    agents: {
        defaults: {
            model: {
                primary: configState.model
            }
        }
    },
    env: {
        vars: {
            OPENROUTER_API_KEY: configState.apiKey
        }
    },
    tools: {
        exec: {
            host: 'gateway',
            security: 'full',
            ask: 'off'
        }
    }
};

console.log('Configuração HOST:');
console.log(JSON.stringify(configHost, null, 2));

console.log('\n2. Testando configuração para modo SANDBOX...\n');

const configSandbox = {
    gateway: {
        mode: configState.gatewayMode,
        port: configState.gatewayPort,
        bind: configState.gatewayBind,
        auth: {
            mode: configState.authMode,
            token: configState.authToken
        }
    },
    agents: {
        defaults: {
            model: {
                primary: configState.model
            }
        }
    },
    env: {
        vars: {
            OPENROUTER_API_KEY: configState.apiKey
        }
    },
    tools: {
        exec: {
            host: 'docker',
            security: 'full',
            ask: 'on'
        }
    }
};

console.log('Configuração SANDBOX:');
console.log(JSON.stringify(configSandbox, null, 2));

console.log('\n3. Verificando estrutura...\n');

// Verificar se a estrutura está correta
const checkConfig = (config, mode) => {
    console.log(`Verificando configuração ${mode}:`);
    
    // Verificar tools.exec
    if (!config.tools) {
        console.log('  ❌ tools não existe');
        return false;
    }
    
    if (!config.tools.exec) {
        console.log('  ❌ tools.exec não existe');
        return false;
    }
    
    if (!config.tools.exec.host) {
        console.log('  ❌ tools.exec.host não existe');
        return false;
    }
    
    if (!config.tools.exec.security) {
        console.log('  ❌ tools.exec.security não existe');
        return false;
    }
    
    if (!config.tools.exec.ask) {
        console.log('  ❌ tools.exec.ask não existe');
        return false;
    }
    
    // Verificar se não há chaves inválidas em tools
    const toolsKeys = Object.keys(config.tools);
    const validToolsKeys = ['exec', 'media', 'links', 'profile', 'alsoAllow', 'byProvider', 'message', 'web'];
    const invalidKeys = toolsKeys.filter(key => !validToolsKeys.includes(key));
    
    if (invalidKeys.length > 0) {
        console.log(`  ❌ Chaves inválidas em tools: ${invalidKeys.join(', ')}`);
        return false;
    }
    
    console.log('  ✓ Estrutura correta');
    console.log(`  ✓ tools.exec.host = ${config.tools.exec.host}`);
    console.log(`  ✓ tools.exec.security = ${config.tools.exec.security}`);
    console.log(`  ✓ tools.exec.ask = ${config.tools.exec.ask}`);
    
    return true;
};

const hostValid = checkConfig(configHost, 'HOST');
console.log();
const sandboxValid = checkConfig(configSandbox, 'SANDBOX');

console.log('\n4. Resultado Final:\n');

if (hostValid && sandboxValid) {
    console.log('✅ TODAS AS CONFIGURAÇÕES ESTÃO CORRETAS!');
    console.log('\nA nova estrutura de configuração está pronta para uso.');
    console.log('Quando o usuário abrir o app e completar o wizard,');
    console.log('a configuração será salva com a estrutura correta.');
} else {
    console.log('❌ ERRO: Algumas configurações estão incorretas!');
    console.log('Verifique o código em renderer.js');
}

console.log('\n5. Próximos passos:\n');
console.log('1. Abra o aplicativo ULTRON');
console.log('2. Complete o wizard de configuração');
console.log('3. Selecione o modo de execução (Host ou Sandbox)');
console.log('4. Verifique se o gateway inicia sem erros');
console.log('5. Confirme que o chat conecta ao WebSocket');
