#!/usr/bin/env node

/**
 * Script de teste para verificar configuração automática de bind
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== TESTE DE CONFIGURAÇÃO AUTOMÁTICA DE BIND ===\n');

// Caminho do arquivo de configuração
const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

console.log('📁 Caminho do arquivo:', configPath);

// Verificar se o arquivo existe
if (!fs.existsSync(configPath)) {
    console.log('❌ Arquivo de configuração não encontrado');
    console.log('   Execute o wizard primeiro para criar a configuração');
    process.exit(1);
}

// Ler configuração
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('\n📋 Configuração atual:');
console.log(JSON.stringify(config, null, 2));

// Verificar valor de bind
const bind = config.gateway?.bind;

console.log('\n🔍 Verificando valor de bind...');
console.log('   Valor atual:', bind);

// Valores válidos do OpenClaw
const validBindValues = ['loopback', 'lan', 'auto', 'tailnet'];

if (validBindValues.includes(bind)) {
    console.log('   ✅ Valor válido!');
    
    if (bind === 'auto') {
        console.log('   🎉 Configuração automática aplicada corretamente!');
        console.log('   Gateway configurado para aceitar qualquer rede');
    } else {
        console.log('   ⚠️  Valor válido, mas não é "auto"');
        console.log('   Esperado: "auto"');
        console.log('   Atual:', bind);
    }
} else {
    console.log('   ❌ Valor inválido!');
    console.log('   Valores válidos:', validBindValues.join(', '));
    console.log('   Valor atual:', bind);
    
    // Corrigir automaticamente
    console.log('\n🔧 Corrigindo automaticamente...');
    config.gateway.bind = 'auto';
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('   ✅ Configuração corrigida para "auto"');
}

console.log('\n=== TESTE CONCLUÍDO ===');
