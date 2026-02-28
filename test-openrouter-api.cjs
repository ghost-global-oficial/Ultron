#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

async function testOpenRouterAPI() {
  console.log('=== TESTE OPENROUTER API ===\n');
  
  // Ler configuração
  const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  if (!fs.existsSync(configPath)) {
    console.error('❌ Configuração não encontrada');
    process.exit(1);
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const apiKey = config.env?.vars?.OPENROUTER_API_KEY;
  const model = config.agents?.defaults?.model?.primary;
  
  if (!apiKey) {
    console.error('❌ OPENROUTER_API_KEY não configurada');
    process.exit(1);
  }
  
  if (!model) {
    console.error('❌ Modelo não configurado');
    process.exit(1);
  }
  
  console.log('🔑 API Key:', apiKey.substring(0, 16) + '...');
  console.log('🤖 Modelo:', model);
  console.log();
  
  // Fazer chamada de teste
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': 'https://ultron.app',
    'X-Title': 'Ultron'
  };
  
  const body = {
    model: model, // Usar modelo completo (com prefixo)
    messages: [{ role: 'user', content: 'Hi' }],
    max_tokens: 10
  };
  
  console.log('📤 Request:');
  console.log('  URL:', url);
  console.log('  Model:', model);
  console.log('  Headers:', JSON.stringify(headers, null, 2).replace(apiKey, 'API_KEY_HIDDEN'));
  console.log('  Body:', JSON.stringify(body, null, 2));
  console.log();
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    console.log('📥 Response:');
    console.log('  Status:', response.status, response.statusText);
    console.log('  Headers:', Object.fromEntries(response.headers.entries()));
    console.log();
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCESSO!');
      console.log('  Response:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ ERRO!');
      console.log('  Error:', error);
      
      try {
        const errorJson = JSON.parse(error);
        console.log('  Error Message:', errorJson.error?.message || errorJson.message);
      } catch {}
    }
  } catch (error) {
    console.error('❌ EXCEÇÃO:', error.message);
  }
}

testOpenRouterAPI();
