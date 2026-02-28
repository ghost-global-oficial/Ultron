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

console.log('=== ADICIONAR CHAVE API DO OPENROUTER ===\n');

if (!fs.existsSync(configPath)) {
  console.error('❌ Arquivo de configuração não encontrado:', configPath);
  process.exit(1);
}

rl.question('🔑 Cole sua chave API do OpenRouter (sk-or-...): ', (apiKey) => {
  apiKey = apiKey.trim();
  
  if (!apiKey || apiKey.length < 10) {
    console.error('❌ Chave API inválida!');
    rl.close();
    process.exit(1);
  }
  
  // Ler configuração
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Adicionar API key
  config.env = config.env || {};
  config.env.vars = config.env.vars || {};
  config.env.vars.OPENROUTER_API_KEY = apiKey;
  
  // Garantir que o modelo está correto
  config.agents = config.agents || {};
  config.agents.defaults = config.agents.defaults || {};
  config.agents.defaults.model = config.agents.defaults.model || {};
  
  // Se não tem modelo ou está com modelo do Groq, usar Claude 3.5 Sonnet
  if (!config.agents.defaults.model.primary || 
      config.agents.defaults.model.primary.includes('groq/')) {
    config.agents.defaults.model.primary = 'anthropic/claude-3.5-sonnet';
    console.log('✏️  Modelo atualizado para: anthropic/claude-3.5-sonnet');
  }
  
  // Salvar
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log('✅ Chave API adicionada com sucesso!');
  console.log();
  console.log('📋 Configuração:');
  console.log('  Modelo:', config.agents.defaults.model.primary);
  console.log('  API Key:', apiKey.substring(0, 16) + '...');
  console.log();
  console.log('🔄 Reinicie o Ultron para aplicar as mudanças.');
  
  rl.close();
});
