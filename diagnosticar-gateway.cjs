#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico do Gateway\n');

// 1. Verificar se o config existe
const configPath = path.join(process.env.USERPROFILE || process.env.HOME, '.openclaw', 'openclaw.json');
console.log('1. Verificando configuração...');
if (fs.existsSync(configPath)) {
  console.log('   ✓ Config existe:', configPath);
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log('   ✓ Gateway mode:', config.gateway?.mode);
    console.log('   ✓ Gateway port:', config.gateway?.port);
    console.log('   ✓ Gateway bind:', config.gateway?.bind);
  } catch (e) {
    console.log('   ❌ Erro ao ler config:', e.message);
  }
} else {
  console.log('   ❌ Config não existe');
}

// 2. Verificar se a porta está em uso
console.log('\n2. Verificando porta 18789...');
try {
  const result = execSync('netstat -ano | findstr :18789', { encoding: 'utf-8' });
  if (result.trim()) {
    console.log('   ⚠️  Porta 18789 já está em uso:');
    console.log(result);
  } else {
    console.log('   ✓ Porta 18789 está livre');
  }
} catch (e) {
  console.log('   ✓ Porta 18789 está livre');
}

// 3. Verificar processos Node
console.log('\n3. Verificando processos Node...');
try {
  const result = execSync('tasklist | findstr node.exe', { encoding: 'utf-8' });
  if (result.trim()) {
    console.log('   Processos Node rodando:');
    console.log(result);
  } else {
    console.log('   ✓ Nenhum processo Node rodando');
  }
} catch (e) {
  console.log('   ✓ Nenhum processo Node rodando');
}

// 4. Verificar se o main.js existe
console.log('\n4. Verificando main.js...');
const mainPath = path.join(process.cwd(), 'main.js');
if (fs.existsSync(mainPath)) {
  console.log('   ✓ main.js existe:', mainPath);
} else {
  console.log('   ❌ main.js não encontrado');
}

// 5. Verificar logs
console.log('\n5. Verificando logs...');
const logsPath = path.join(process.env.USERPROFILE || process.env.HOME, '.openclaw', 'logs');
if (fs.existsSync(logsPath)) {
  console.log('   ✓ Pasta de logs existe:', logsPath);
  const files = fs.readdirSync(logsPath);
  if (files.length > 0) {
    console.log('   Arquivos de log:');
    files.forEach(f => console.log('   -', f));
    
    // Ler último log do gateway
    const gatewayLog = path.join(logsPath, 'gateway.log');
    if (fs.existsSync(gatewayLog)) {
      console.log('\n   Últimas 10 linhas do gateway.log:');
      const content = fs.readFileSync(gatewayLog, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());
      lines.slice(-10).forEach(l => console.log('   ', l));
    }
  } else {
    console.log('   ⚠️  Pasta de logs vazia');
  }
} else {
  console.log('   ❌ Pasta de logs não existe');
}

console.log('\n✅ Diagnóstico concluído');
