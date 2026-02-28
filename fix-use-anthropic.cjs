#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== CONFIGURAR ANTHROPIC (CLAUDE DIRETO) ===\n');
console.log('Use a API oficial da Anthropic para Claude.');
console.log('Obtenha sua chave em: https://console.anthropic.com/settings/keys\n');

rl.question('🔑 Cole sua chave API da Anthropic (sk-ant-...): ', (apiKey) => {
  apiKey = apiKey.trim();
  
  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    console.error('❌ Chave API inválida! Deve começar com sk-ant-');
    rl.close();
    process.exit(1);
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Remover chave do Groq
  delete config.env.vars.GROQ_API_KEY;
  
  // Adicionar chave da Anthropic
  config.env.vars.ANTHROPIC_API_KEY = apiKey;
  
  // Manter o modelo Claude 3.5 Sonnet
  config.agents.defaults.model.primary = 'anthropic/claude-3.5-sonnet';
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log('\n✅ Configuração atualizada!');
  console.log('\n📋 Nova configuração:');
  console.log('  Provedor: Anthropic (direto)');
  console.log('  Modelo: anthropic/claude-3.5-sonnet');
  console.log('  API Key:', apiKey.substring(0, 20) + '...');
  console.log('\n🔄 Reinicie o Ultron para aplicar.');
  
  rl.close();
});
