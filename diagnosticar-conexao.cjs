#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');

console.log('='.repeat(60));
console.log('DIAGNÓSTICO DE CONEXÃO DO CHAT');
console.log('='.repeat(60));
console.log();

// 1. Verificar se o arquivo de config existe
console.log('1. VERIFICAR CONFIGURAÇÃO');
console.log('-'.repeat(60));

const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');
if (fs.existsSync(configPath)) {
  console.log('✓ Arquivo de config existe:', configPath);
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('✓ Config é válido (JSON parseável)');
    
    if (config.gateway) {
      console.log('✓ Seção gateway existe');
      console.log('  - Porta:', config.gateway.port);
      console.log('  - Modo:', config.gateway.mode);
      console.log('  - Bind:', config.gateway.bind);
      if (config.gateway.auth && config.gateway.auth.token) {
        console.log('  - Token:', config.gateway.auth.token.substring(0, 16) + '...');
      }
    } else {
      console.log('✗ Seção gateway não existe no config');
    }
    
    if (config.agents && config.agents.defaults && config.agents.defaults.model) {
      console.log('✓ Modelo configurado:', config.agents.defaults.model.primary);
    }
  } catch (error) {
    console.log('✗ Erro ao ler config:', error.message);
  }
} else {
  console.log('✗ Arquivo de config não existe');
}

console.log();

// 2. Verificar se a porta 18789 está em uso
console.log('2. VERIFICAR PORTA DO GATEWAY (18789)');
console.log('-'.repeat(60));

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, '127.0.0.1');
  });
}

checkPort(18789).then(isOpen => {
  if (isOpen) {
    console.log('✓ Porta 18789 está ABERTA (gateway rodando)');
  } else {
    console.log('✗ Porta 18789 está FECHADA (gateway NÃO está rodando)');
  }
  
  console.log();
  
  // 3. Verificar localStorage
  console.log('3. VERIFICAR LOCALSTORAGE');
  console.log('-'.repeat(60));
  
  const localStoragePath = path.join(os.homedir(), 'AppData', 'Roaming', 'ultron', 'Local Storage');
  if (fs.existsSync(localStoragePath)) {
    console.log('✓ Pasta de localStorage existe');
    console.log('  Localização:', localStoragePath);
  } else {
    console.log('⚠ Pasta de localStorage não existe');
  }
  
  console.log();
  
  // 4. Verificar logs
  console.log('4. VERIFICAR LOGS');
  console.log('-'.repeat(60));
  
  const logsPath = path.join(os.homedir(), '.ultron', 'logs');
  if (fs.existsSync(logsPath)) {
    console.log('✓ Pasta de logs existe');
    
    const gatewayLog = path.join(logsPath, 'gateway.log');
    if (fs.existsSync(gatewayLog)) {
      console.log('✓ Log do gateway existe');
      console.log();
      console.log('ÚLTIMAS 20 LINHAS DO LOG:');
      console.log('-'.repeat(60));
      
      const logContent = fs.readFileSync(gatewayLog, 'utf8');
      const lines = logContent.split('\n').filter(l => l.trim());
      const lastLines = lines.slice(-20);
      
      lastLines.forEach(line => console.log(line));
    } else {
      console.log('⚠ Log do gateway não existe');
    }
  } else {
    console.log('⚠ Pasta de logs não existe');
  }
  
  console.log();
  
  // 5. Verificar processos Node
  console.log('5. VERIFICAR PROCESSOS NODE');
  console.log('-'.repeat(60));
  
  const { exec } = require('child_process');
  exec('tasklist | findstr node', (error, stdout, stderr) => {
    if (stdout) {
      console.log('Processos Node rodando:');
      console.log(stdout);
    } else {
      console.log('⚠ Nenhum processo Node encontrado');
    }
    
    console.log();
    console.log('='.repeat(60));
    console.log('RESUMO DO DIAGNÓSTICO');
    console.log('='.repeat(60));
    console.log();
    
    if (!isOpen) {
      console.log('❌ PROBLEMA: Gateway não está rodando!');
      console.log();
      console.log('POSSÍVEIS CAUSAS:');
      console.log('1. O app não iniciou o gateway automaticamente');
      console.log('2. O gateway falhou ao iniciar (erro no log)');
      console.log('3. A porta 18789 está bloqueada');
      console.log('4. O processo do gateway crashou');
      console.log();
      console.log('SOLUÇÕES:');
      console.log('1. Feche o app completamente');
      console.log('2. Verifique o log do gateway (acima)');
      console.log('3. Abra o app novamente');
      console.log('4. Se o problema persistir, delete o config e reconfigure');
    } else {
      console.log('✓ Gateway está rodando!');
      console.log();
      console.log('Se o chat não conecta, o problema pode ser:');
      console.log('1. Token incorreto no localStorage');
      console.log('2. URL do WebSocket incorreta');
      console.log('3. Problema no código do chat');
      console.log();
      console.log('Abra o DevTools (F12) e verifique o Console para erros.');
    }
    
    console.log();
    console.log('='.repeat(60));
  });
});
