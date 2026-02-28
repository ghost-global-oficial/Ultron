#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');

console.log('=== DEBUG DE CONEXÃO ===\n');

// 1. Verificar se configuração existe
const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
console.log('1️⃣ Configuração:');
console.log('   Caminho:', configPath);
console.log('   Existe?', fs.existsSync(configPath));

if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('   Porta:', config.gateway?.port);
  console.log('   Token:', config.gateway?.auth?.token?.substring(0, 16) + '...');
  console.log('   Modelo:', config.agents?.defaults?.model?.primary);
  
  // 2. Verificar se porta está aberta
  const port = config.gateway?.port || 18789;
  console.log('\n2️⃣ Porta do Gateway:');
  console.log('   Porta:', port);
  
  const socket = new net.Socket();
  socket.setTimeout(2000);
  
  socket.on('connect', () => {
    console.log('   Status: ✅ ABERTA (gateway está rodando)');
    socket.destroy();
  });
  
  socket.on('timeout', () => {
    console.log('   Status: ❌ FECHADA (gateway não está rodando)');
    socket.destroy();
  });
  
  socket.on('error', () => {
    console.log('   Status: ❌ FECHADA (gateway não está rodando)');
  });
  
  socket.connect(port, '127.0.0.1');
  
  // 3. Verificar sessões
  setTimeout(() => {
    console.log('\n3️⃣ Sessões:');
    const sessionsPath = path.join(os.homedir(), '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');
    console.log('   Caminho:', sessionsPath);
    console.log('   Existe?', fs.existsSync(sessionsPath));
    
    if (fs.existsSync(sessionsPath)) {
      const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
      console.log('   Sessões:', Object.keys(sessions).length);
      console.log('   Keys:', Object.keys(sessions).join(', '));
    }
    
    console.log('\n4️⃣ Diagnóstico:');
    console.log('   Se porta está FECHADA: Gateway não está rodando');
    console.log('   Se porta está ABERTA mas desconecta: Token mismatch');
    console.log('\n💡 Solução:');
    console.log('   1. Fechar o app completamente');
    console.log('   2. Executar: node clean-all-configs.cjs');
    console.log('   3. Reiniciar: npm start');
    console.log('   4. Configurar novamente');
  }, 2500);
} else {
  console.log('   ❌ Configuração não existe!');
  console.log('\n💡 Solução:');
  console.log('   1. Executar: node clean-all-configs.cjs');
  console.log('   2. Iniciar: npm start');
  console.log('   3. Configurar com o wizard');
}
