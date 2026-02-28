#!/usr/bin/env node

/**
 * Script para verificar se todos os arquivos necessários existem
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando arquivos necessários...\n');

const arquivosNecessarios = [
    // Arquivos principais
    'main.js',
    'index.html',
    'renderer.js',
    'i18n.js',
    
    // Sistema de segurança
    'ultron-security-system.cjs',
    
    // Instaladores
    'install-ollama.cjs',
    'install-ollama-js.cjs',
    
    // Shield (se existir)
    'shield-js-engine.js',
    'shield-monitor.js',
    
    // Chat
    'chat-i18n.js'
];

let todosExistem = true;

for (const arquivo of arquivosNecessarios) {
    const existe = fs.existsSync(arquivo);
    const status = existe ? '✅' : '❌';
    console.log(`${status} ${arquivo}`);
    
    if (!existe) {
        todosExistem = false;
    }
}

console.log('\n' + '='.repeat(50));

if (todosExistem) {
    console.log('✅ Todos os arquivos necessários existem!');
} else {
    console.log('❌ Alguns arquivos estão faltando!');
    console.log('\nArquivos que podem estar causando o erro:');
    
    for (const arquivo of arquivosNecessarios) {
        if (!fs.existsSync(arquivo)) {
            console.log(`  - ${arquivo}`);
        }
    }
}

console.log('='.repeat(50));
