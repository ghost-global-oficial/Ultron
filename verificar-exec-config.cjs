#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== VERIFICANDO CONFIGURAÇÃO EXEC ===\n');

// Ler configuração
const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');

if (!fs.existsSync(configPath)) {
    console.log('❌ Arquivo de configuração não encontrado:', configPath);
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('📋 Configuração do Gateway:');
console.log('  Port:', config.gateway?.port);
console.log('  Bind:', config.gateway?.bind);
console.log('  Mode:', config.gateway?.mode);
console.log('');

console.log('🔧 Configuração de Tools:');
if (config.tools) {
    console.log('  Tools definidas:', Object.keys(config.tools));
    
    if (config.tools.exec) {
        console.log('\n  📌 Configuração EXEC:');
        console.log('    Host:', config.tools.exec.host || 'sandbox (padrão)');
        console.log('    Security:', config.tools.exec.security || 'allowlist (padrão)');
        console.log('    Ask:', config.tools.exec.ask || 'on-miss (padrão)');
        console.log('    Node:', config.tools.exec.node || 'não definido');
    } else {
        console.log('\n  ⚠️ Configuração EXEC não encontrada (usando padrões)');
        console.log('    Host padrão: sandbox');
        console.log('    Security padrão: allowlist');
        console.log('    Ask padrão: on-miss');
    }
} else {
    console.log('  ⚠️ Nenhuma configuração de tools encontrada');
}

console.log('\n🤖 Agentes:');
if (config.agents && config.agents.list) {
    console.log('  Total de agentes:', config.agents.list.length);
    config.agents.list.forEach((agent, i) => {
        console.log(`\n  Agente ${i + 1}:`);
        console.log('    ID:', agent.id);
        console.log('    Name:', agent.name);
        if (agent.tools && agent.tools.exec) {
            console.log('    Exec Host:', agent.tools.exec.host);
            console.log('    Exec Security:', agent.tools.exec.security);
            console.log('    Exec Ask:', agent.tools.exec.ask);
        }
    });
} else {
    console.log('  ⚠️ Nenhum agente configurado');
}

console.log('\n💡 DIAGNÓSTICO:');
console.log('');

const execHost = config.tools?.exec?.host || 'sandbox';
if (execHost === 'sandbox') {
    console.log('❌ PROBLEMA IDENTIFICADO:');
    console.log('   O exec está configurado para rodar em SANDBOX (Docker)');
    console.log('   Isso impede a abertura de aplicativos do Windows!');
    console.log('');
    console.log('✅ SOLUÇÃO:');
    console.log('   Adicione esta configuração ao arquivo:');
    console.log('');
    console.log('   "tools": {');
    console.log('     "exec": {');
    console.log('       "host": "gateway",');
    console.log('       "security": "allowlist",');
    console.log('       "ask": "on-miss"');
    console.log('     }');
    console.log('   }');
} else if (execHost === 'gateway') {
    console.log('✅ Exec configurado para rodar no GATEWAY (correto para Windows)');
    
    const security = config.tools?.exec?.security || 'allowlist';
    const ask = config.tools?.exec?.ask || 'on-miss';
    
    console.log('');
    console.log('🔒 Configuração de Segurança:');
    console.log('   Security:', security);
    console.log('   Ask:', ask);
    
    if (security === 'deny') {
        console.log('');
        console.log('❌ PROBLEMA: Security está em "deny" - exec bloqueado!');
        console.log('   Mude para "allowlist" ou "full"');
    } else if (security === 'allowlist') {
        console.log('');
        console.log('⚠️ Com "allowlist", comandos precisam estar na lista de aprovados');
        console.log('   ou o usuário precisa aprovar manualmente');
    } else if (security === 'full') {
        console.log('');
        console.log('✅ Security "full" - todos os comandos permitidos');
    }
}

console.log('');
