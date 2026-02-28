// Script para verificar logs do gateway em tempo real
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== VERIFICAÇÃO DO GATEWAY ULTRON ===\n');

// 1. Verificar se o gateway está rodando
console.log('1. Verificando se o gateway está rodando...');
const { execSync } = require('child_process');

try {
  const result = execSync('netstat -ano | findstr "18789"', { encoding: 'utf8' });
  if (result.includes('18789')) {
    console.log('   ✅ Gateway está rodando na porta 18789');
    console.log('   ' + result.trim().split('\n')[0]);
  } else {
    console.log('   ❌ Gateway NÃO está rodando');
  }
} catch (error) {
  console.log('   ❌ Gateway NÃO está rodando');
}

// 2. Verificar configuração
console.log('\n2. Verificando configuração...');
const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('   ✅ Configuração encontrada');
  console.log('   📊 Provider:', config.agents?.defaults?.model?.primary?.split('/')[0] || 'não configurado');
  console.log('   📊 Modelo:', config.agents?.defaults?.model?.primary || 'não configurado');
  
  // Verificar API keys
  const envVars = config.env?.vars || {};
  const apiKeys = Object.keys(envVars).filter(key => key.includes('API_KEY'));
  
  if (apiKeys.length > 0) {
    console.log('   ✅ API Keys configuradas:');
    apiKeys.forEach(key => {
      const value = envVars[key];
      const preview = value.substring(0, 10) + '...' + value.substring(value.length - 4);
      console.log(`      - ${key}: ${preview}`);
    });
  } else {
    console.log('   ⚠️  Nenhuma API key configurada');
  }
} else {
  console.log('   ❌ Configuração não encontrada');
}

// 3. Verificar logs do gateway
console.log('\n3. Verificando logs do gateway...');
const logPath = path.join(os.tmpdir(), 'openclaw', `openclaw-${new Date().toISOString().split('T')[0]}.log`);

if (fs.existsSync(logPath)) {
  console.log('   ✅ Arquivo de log encontrado:', logPath);
  
  // Ler últimas 50 linhas
  const logContent = fs.readFileSync(logPath, 'utf8');
  const lines = logContent.split('\n').filter(line => line.trim());
  const lastLines = lines.slice(-50);
  
  console.log('\n   📋 Últimas 50 linhas do log:');
  console.log('   ' + '='.repeat(80));
  lastLines.forEach(line => {
    // Destacar erros e avisos
    if (line.toLowerCase().includes('error')) {
      console.log('   ❌', line);
    } else if (line.toLowerCase().includes('warn')) {
      console.log('   ⚠️ ', line);
    } else if (line.toLowerCase().includes('api') || line.toLowerCase().includes('model')) {
      console.log('   🔍', line);
    } else {
      console.log('   ', line);
    }
  });
  console.log('   ' + '='.repeat(80));
} else {
  console.log('   ⚠️  Arquivo de log não encontrado em:', logPath);
  console.log('   💡 O gateway pode não ter iniciado ainda ou está usando outro caminho');
}

// 4. Verificar variáveis de ambiente do processo
console.log('\n4. Verificando variáveis de ambiente...');
const envKeys = [
  'GROQ_API_KEY',
  'OPENROUTER_API_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_API_KEY',
  'XAI_API_KEY'
];

envKeys.forEach(key => {
  if (process.env[key]) {
    const value = process.env[key];
    const preview = value.substring(0, 10) + '...' + value.substring(value.length - 4);
    console.log(`   ✅ ${key}: ${preview}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('Verificação concluída!');
console.log('='.repeat(80));
