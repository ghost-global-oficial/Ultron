#!/usr/bin/env node

/**
 * Script para desabilitar o carregamento automático de arquivos de contexto
 * (SOUL.md, USER.md, IDENTITY.md, etc.) no Ultron
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');

console.log('=== DESABILITANDO BOOTSTRAP ===');
console.log('');

// Verificar se o arquivo de configuração existe
if (!fs.existsSync(configPath)) {
  console.log('❌ Arquivo de configuração não encontrado:', configPath);
  console.log('');
  console.log('Execute o Ultron primeiro para criar a configuração.');
  process.exit(1);
}

// Ler configuração atual
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('✓ Configuração carregada');

// Adicionar skipBootstrap
if (!config.agents) {
  config.agents = {};
}

if (!config.agents.defaults) {
  config.agents.defaults = {};
}

config.agents.defaults.skipBootstrap = true;

// Salvar configuração
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('✓ Bootstrap desabilitado');
console.log('');
console.log('Agora a IA não vai mais carregar arquivos de contexto automaticamente.');
console.log('');
console.log('Arquivos que NÃO serão mais carregados:');
console.log('  - SOUL.md');
console.log('  - USER.md');
console.log('  - IDENTITY.md');
console.log('  - MEMORY.md');
console.log('  - BOOTSTRAP.md');
console.log('  - HEARTBEAT.md');
console.log('');
console.log('Para reverter, edite o arquivo:', configPath);
console.log('E remova a linha: "skipBootstrap": true');
console.log('');
