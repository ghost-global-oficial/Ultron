#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== CORRIGINDO CONFIGURAÇÃO EXEC ===\n');

const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');

if (!fs.existsSync(configPath)) {
    console.log('❌ Arquivo de configuração não encontrado');
    process.exit(1);
}

// Ler configuração atual
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('📝 Adicionando configuração de tools...');

// Adicionar configuração de tools
if (!config.tools) {
    config.tools = {};
}

config.tools.exec = {
    host: 'gateway',      // Rodar no host local (não em Docker)
    security: 'full',     // Permitir todos os comandos (sem restrições)
    ask: 'off'            // Não pedir aprovação (executar diretamente)
};

// Salvar configuração
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

console.log('✅ Configuração atualizada!');
console.log('');
console.log('📋 Nova configuração EXEC:');
console.log('   Host: gateway (roda no Windows, não em Docker)');
console.log('   Security: full (sem restrições)');
console.log('   Ask: off (sem aprovação manual)');
console.log('');
console.log('🔄 Reinicie o ULTRON para aplicar as mudanças');
console.log('');
