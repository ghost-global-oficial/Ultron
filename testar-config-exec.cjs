#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== VERIFICAÇÃO DA CONFIGURAÇÃO EXEC ===\n');

const configPath = path.join(process.env.USERPROFILE || process.env.HOME, '.ultron', 'ultron.json');

try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  console.log('✓ Arquivo de configuração encontrado:', configPath);
  console.log('\n--- Configuração do Gateway ---');
  console.log('Mode:', config.gateway?.mode || 'não definido');
  console.log('Port:', config.gateway?.port || 'não definido');
  
  console.log('\n--- Configuração do Sandbox ---');
  console.log('Mode:', config.agents?.defaults?.sandbox?.mode || 'não definido (padrão: "off")');
  
  console.log('\n--- Configuração do Exec Tool ---');
  console.log('Host:', config.tools?.exec?.host || 'não definido (padrão: "sandbox")');
  console.log('Security:', config.tools?.exec?.security || 'não definido (padrão: "allowlist")');
  console.log('Ask:', config.tools?.exec?.ask || 'não definido (padrão: "on-miss")');
  
  console.log('\n--- Análise ---');
  
  const host = config.tools?.exec?.host || 'sandbox';
  const sandboxMode = config.agents?.defaults?.sandbox?.mode || 'off';
  
  if (host === 'gateway') {
    console.log('✓ CORRETO: Exec tool configurado para rodar no gateway (Windows host)');
    console.log('✓ Comandos serão executados diretamente no Windows');
    console.log('✓ Aplicativos GUI como Blender, Notepad, Chrome podem ser abertos');
  } else if (host === 'sandbox') {
    console.log('✗ PROBLEMA: Exec tool ainda configurado para rodar no sandbox');
    console.log('✗ Comandos serão executados dentro de um container Docker');
    console.log('✗ Aplicativos GUI NÃO funcionarão');
    console.log('\nSOLUÇÃO: Adicione ao ultron.json:');
    console.log('"tools": { "exec": { "host": "gateway" } }');
  }
  
  const security = config.tools?.exec?.security || 'allowlist';
  const ask = config.tools?.exec?.ask || 'on-miss';
  
  if (security === 'full' && ask === 'off') {
    console.log('✓ CORRETO: Segurança configurada para execução sem aprovação');
  } else {
    console.log('⚠ AVISO: Segurança não está em modo "full" ou ask não está "off"');
    console.log('  A IA pode precisar de aprovação para executar comandos');
  }
  
  console.log('\n=== FIM DA VERIFICAÇÃO ===');
  
} catch (error) {
  console.error('✗ Erro ao ler configuração:', error.message);
  process.exit(1);
}
