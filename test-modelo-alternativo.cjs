#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

async function testModelo() {
  console.log('=== TESTE DE MODELOS ALTERNATIVOS ===\n');
  
  const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  if (!fs.existsSync(configPath)) {
    console.error('❌ Configuração não encontrada');
    process.exit(1);
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const apiKey = config.env?.vars?.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENROUTER_API_KEY não configurada');
    process.exit(1);
  }
  
  const modelosParaTestar = [
    'openai/gpt-oss-120b:free',
    'openai/gpt-oss-120b',
    'anthropic/claude-3.5-sonnet',
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b-instruct:free'
  ];
  
  console.log('🔑 API Key:', apiKey.substring(0, 16) + '...\n');
  
  for (const modelo of modelosParaTestar) {
    console.log(`📤 Testando: ${modelo}`);
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://ultron.app',
          'X-Title': 'Ultron'
        },
        body: JSON.stringify({
          model: modelo,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`  ✅ FUNCIONA! (${response.status})`);
        console.log(`     Resposta: ${result.choices?.[0]?.message?.content || 'OK'}`);
      } else {
        const error = await response.text();
        console.log(`  ❌ FALHOU (${response.status})`);
        try {
          const errorJson = JSON.parse(error);
          console.log(`     Erro: ${errorJson.error?.message || error}`);
        } catch {
          console.log(`     Erro: ${error.substring(0, 100)}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ EXCEÇÃO: ${error.message}`);
    }
    
    console.log();
  }
  
  console.log('💡 Recomendação: Use um modelo que mostrou ✅ FUNCIONA');
}

testModelo();
