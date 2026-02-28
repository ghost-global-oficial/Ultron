#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

console.log('=== CONFIGURAR GROQ (GRÁTIS) ===\n');
console.log('⚠️  ATENÇÃO: Groq tem limite de 12.000 tokens.');
console.log('O system prompt do OpenClaw usa ~12.000 tokens.');
console.log('Isso pode causar erros 413 (Request too large).\n');

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Manter chave do Groq (já existe)
// Mudar modelo para Groq
config.agents.defaults.model.primary = 'groq/llama-3.1-8b-instant';

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('✅ Configuração atualizada!');
console.log('\n📋 Nova configuração:');
console.log('  Provedor: Groq');
console.log('  Modelo: groq/llama-3.1-8b-instant (menor, mais rápido)');
console.log('  API Key: gsk_0IHo7JQQMeYy...');
console.log('\n💡 Dica: Use llama-3.1-8b-instant em vez de llama-3.3-70b-versatile');
console.log('   para evitar o erro 413 (Request too large).');
console.log('\n🔄 Reinicie o Ultron para aplicar.');
