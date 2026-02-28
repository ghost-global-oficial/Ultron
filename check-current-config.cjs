#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

console.log('=== VERIFICANDO CONFIGURAÇÃO ATUAL ===\n');

if (!fs.existsSync(configPath)) {
  console.error('❌ Arquivo de configuração não encontrado:', configPath);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('📄 Configuração Completa:');
console.log(JSON.stringify(config, null, 2));
console.log();

console.log('🔍 Análise:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Gateway
console.log('\n🌐 Gateway:');
console.log('  Modo:', config.gateway?.mode || '❌ Não configurado');
console.log('  Porta:', config.gateway?.port || '❌ Não configurado');
console.log('  Bind:', config.gateway?.bind || '❌ Não configurado');
console.log('  Token:', config.gateway?.auth?.token ? '✓ Configurado (' + config.gateway.auth.token.substring(0, 16) + '...)' : '❌ Não configurado');

// Modelo
console.log('\n🤖 Modelo:');
const model = config.agents?.defaults?.model?.primary;
if (model) {
  console.log('  Modelo:', model);
  
  const modelPrefix = model.split('/')[0];
  console.log('  Prefixo:', modelPrefix);
  
  const providerMap = {
    'google': 'Google',
    'anthropic': 'Claude (Anthropic)',
    'openrouter': 'OpenRouter',
    'groq': 'Groq',
    'xai': 'Grok (xAI)',
    'openai': 'OpenAI'
  };
  
  const detectedProvider = providerMap[modelPrefix] || '❓ Desconhecido';
  console.log('  Provedor detectado:', detectedProvider);
} else {
  console.log('  ❌ Modelo não configurado');
}

// API Keys
console.log('\n🔑 API Keys:');
const envVars = config.env?.vars || {};
const apiKeys = {
  'GOOGLE_API_KEY': 'Google',
  'ANTHROPIC_API_KEY': 'Claude (Anthropic)',
  'OPENROUTER_API_KEY': 'OpenRouter',
  'GROQ_API_KEY': 'Groq',
  'XAI_API_KEY': 'Grok (xAI)',
  'OPENAI_API_KEY': 'OpenAI'
};

let foundKeys = 0;
for (const [envVar, providerName] of Object.entries(apiKeys)) {
  if (envVars[envVar]) {
    console.log(`  ✓ ${providerName}: ${envVars[envVar].substring(0, 16)}...`);
    foundKeys++;
  }
}

if (foundKeys === 0) {
  console.log('  ❌ Nenhuma API key configurada!');
}

// Validação
console.log('\n✅ Validação:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

let hasErrors = false;

// Validar modelo vs API key
if (model) {
  const modelPrefix = model.split('/')[0];
  
  // Detectar se está usando OpenRouter
  const hasOpenRouterKey = !!envVars['OPENROUTER_API_KEY'];
  
  if (hasOpenRouterKey) {
    // Se tem chave OpenRouter, qualquer modelo via OpenRouter é válido
    const openRouterPrefixes = ['anthropic', 'google', 'openai', 'meta-llama', 'mistralai', 'qwen', 'microsoft', 'nousresearch', 'liquid', 'eva-unit-01'];
    
    if (openRouterPrefixes.includes(modelPrefix)) {
      console.log(`✓ Modelo ${model} será usado via OpenRouter (OPENROUTER_API_KEY configurada)`);
    } else {
      // Modelo não é via OpenRouter, verificar API key específica
      const requiredKeyMap = {
        'groq': 'GROQ_API_KEY',
        'xai': 'XAI_API_KEY'
      };
      
      const requiredKey = requiredKeyMap[modelPrefix];
      
      if (requiredKey) {
        if (envVars[requiredKey]) {
          console.log(`✓ Modelo ${model} tem API key correspondente (${requiredKey})`);
        } else {
          console.log(`❌ ERRO: Modelo ${model} requer ${requiredKey} mas não está configurada!`);
          hasErrors = true;
        }
      }
    }
  } else {
    // Sem OpenRouter, verificar API key específica do provedor
    const requiredKeyMap = {
      'google': 'GOOGLE_API_KEY',
      'anthropic': 'ANTHROPIC_API_KEY',
      'groq': 'GROQ_API_KEY',
      'xai': 'XAI_API_KEY',
      'openai': 'OPENAI_API_KEY'
    };
    
    const requiredKey = requiredKeyMap[modelPrefix];
    
    if (requiredKey) {
      if (envVars[requiredKey]) {
        console.log(`✓ Modelo ${model} tem API key correspondente (${requiredKey})`);
      } else {
        console.log(`❌ ERRO: Modelo ${model} requer ${requiredKey} mas não está configurada!`);
        hasErrors = true;
      }
    } else {
      console.log(`⚠️  Aviso: Não foi possível determinar API key necessária para ${model}`);
    }
  }
}

// Validar gateway
if (!config.gateway?.auth?.token) {
  console.log('❌ ERRO: Token do gateway não configurado!');
  hasErrors = true;
}

if (!config.gateway?.port) {
  console.log('❌ ERRO: Porta do gateway não configurada!');
  hasErrors = true;
}

console.log();
if (hasErrors) {
  console.log('❌ CONFIGURAÇÃO COM ERROS - Corrija antes de usar!');
  process.exit(1);
} else {
  console.log('✅ CONFIGURAÇÃO VÁLIDA - Pronta para uso!');
}
