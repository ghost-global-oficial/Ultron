#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

console.log('=== CORRIGINDO CONFIGURAÇÃO PARA OPENROUTER ===\n');

if (!fs.existsSync(configPath)) {
  console.error('❌ Arquivo de configuração não encontrado:', configPath);
  process.exit(1);
}

// Ler configuração atual
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('📄 Configuração atual:');
console.log('  Modelo:', config.agents?.defaults?.model?.primary);
console.log('  Provedor detectado:', config.env?.vars?.OPENROUTER_API_KEY ? 'OpenRouter' : 'Outro');
console.log();

// Perguntar qual modelo usar
console.log('🤖 Modelos OpenRouter disponíveis (GRATUITOS):');
console.log('  1. anthropic/claude-3.5-sonnet (Recomendado - mais inteligente)');
console.log('  2. google/gemini-2.0-flash-exp:free');
console.log('  3. google/gemini-exp-1206:free');
console.log('  4. openai/gpt-oss-120b:free');
console.log('  5. meta-llama/llama-3.3-70b-instruct:free');
console.log('  6. qwen/qwq-32b-preview:free');
console.log();

// Para este script, vamos usar Claude 3.5 Sonnet (melhor modelo)
const newModel = 'anthropic/claude-3.5-sonnet';

console.log('✏️  Atualizando para:', newModel);

// Atualizar configuração
config.agents = config.agents || {};
config.agents.defaults = config.agents.defaults || {};
config.agents.defaults.model = config.agents.defaults.model || {};
config.agents.defaults.model.primary = newModel;

// Salvar
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('✅ Configuração atualizada com sucesso!');
console.log();
console.log('📋 Nova configuração:');
console.log('  Modelo:', config.agents.defaults.model.primary);
console.log('  API Key:', config.env?.vars?.OPENROUTER_API_KEY ? '✓ Configurada' : '✗ Não encontrada');
console.log();
console.log('🔄 Reinicie o Ultron para aplicar as mudanças.');
