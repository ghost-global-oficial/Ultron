#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('=== MODELOS SUPORTADOS PELO GATEWAY ===\n');
console.log('Listando modelos do OpenClaw...\n');

const child = spawn('node', ['dist/entry.js', 'models', 'list'], {
  cwd: __dirname,
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
let error = '';

child.stdout.on('data', (data) => {
  output += data.toString();
});

child.stderr.on('data', (data) => {
  error += data.toString();
});

child.on('close', (code) => {
  console.log(output);
  
  if (error && !error.includes('Doctor warnings')) {
    console.error('\nErros:', error);
  }
  
  console.log('\n📝 Notas:');
  console.log('  - Modelos com "missing" = sem autenticação configurada');
  console.log('  - Modelos com "default" = modelo padrão');
  console.log('  - Para usar OpenRouter, configure OPENROUTER_API_KEY');
  console.log('\n💡 Modelos Recomendados (OpenRouter):');
  console.log('  - anthropic/claude-3.5-sonnet');
  console.log('  - google/gemini-2.0-flash-exp:free');
  console.log('  - meta-llama/llama-3.3-70b-instruct:free');
});
