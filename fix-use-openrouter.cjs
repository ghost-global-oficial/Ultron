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

console.log('=== CONFIGURAR OPENROUTER ===\n');
console.log('OpenRouter permite usar Claude e outros modelos com preços melhores.');
console.log('Obtenha sua chave em: https://openrouter.ai/keys\n');

rl.question('🔑 Cole sua chave API do OpenRouter (sk-or-v1-...): ', (apiKey) => {
  apiKey = apiKey.trim();
  
  if (!apiKey || !apiKey.startsWith('sk-or-')) {
    console.error('❌ Chave API inválida! Deve começar com sk-or-');
    rl.close();
    process.exit(1);
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Remover chave do Groq
  delete config.env.vars.GROQ_API_KEY;
  
  // Adicionar chave do OpenRouter
  config.env.vars.OPENROUTER_API_KEY = apiKey;
  
  // Manter o modelo Claude 3.5 Sonnet
  config.agents.defaults.model.primary = 'anthropic/claude-3.5-sonnet';
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log('\n✅ Configuração atualizada!');
  console.log('\n📋 Nova configuração:');
  console.log('  Provedor: OpenRouter');
  console.log('  Modelo: anthropic/claude-3.5-sonnet');
  console.log('  API Key:', apiKey.substring(0, 20) + '...');
  console.log('\n🔄 Reinicie o Ultron para aplicar.');
  
  rl.close();
});
