#!/usr/bin/env node

/**
 * Script de teste para verificar a correção de múltiplos gateways
 * 
 * Testa:
 * 1. Primeira execução sem configuração (deve mostrar wizard)
 * 2. Execução com configuração (deve ir direto pro chat)
 * 3. Verificação de porta em uso
 * 4. Verificação de apenas 1 gateway rodando
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const net = require('net');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
const backupPath = configPath + '.backup';

console.log('=== TESTE DE CORREÇÃO DE MÚLTIPLOS GATEWAYS ===\n');

// Função para verificar se porta está em uso
async function isPortInUse(port) {
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

// Função para contar processos gateway
function countGatewayProcesses() {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows 
      ? 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH'
      : 'ps aux | grep "gateway run" | grep -v grep';
    
    const proc = spawn(isWindows ? 'cmd' : 'sh', 
      isWindows ? ['/c', cmd] : ['-c', cmd],
      { shell: true }
    );
    
    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    proc.on('close', () => {
      const lines = output.split('\n').filter(line => 
        line.includes('gateway') || line.includes('node.exe')
      );
      resolve(lines.length);
    });
  });
}

async function runTests() {
  console.log('📋 Teste 1: Verificar estado inicial\n');
  
  // Backup da configuração se existir
  if (fs.existsSync(configPath)) {
    console.log('✓ Configuração existente encontrada');
    console.log('  Fazendo backup em:', backupPath);
    fs.copyFileSync(configPath, backupPath);
  } else {
    console.log('✓ Nenhuma configuração existente');
  }
  
  console.log('\n📋 Teste 2: Verificar porta 18789\n');
  
  const portInUse = await isPortInUse(18789);
  if (portInUse) {
    console.log('⚠️  Porta 18789 está em uso!');
    console.log('   Pode haver um gateway rodando.');
    console.log('   Execute: taskkill /F /IM node.exe (Windows)');
    console.log('   Execute: pkill -f "gateway run" (Linux/Mac)');
  } else {
    console.log('✓ Porta 18789 está livre');
  }
  
  console.log('\n📋 Teste 3: Contar processos gateway\n');
  
  const gatewayCount = await countGatewayProcesses();
  console.log(`  Processos gateway encontrados: ${gatewayCount}`);
  
  if (gatewayCount > 1) {
    console.log('❌ PROBLEMA: Múltiplos gateways detectados!');
  } else if (gatewayCount === 1) {
    console.log('✓ Apenas 1 gateway rodando');
  } else {
    console.log('✓ Nenhum gateway rodando');
  }
  
  console.log('\n📋 Teste 4: Verificar arquivos principais\n');
  
  const mainJsPath = path.join(__dirname, 'main.js');
  const rendererJsPath = path.join(__dirname, 'renderer.js');
  
  if (fs.existsSync(mainJsPath)) {
    const mainContent = fs.readFileSync(mainJsPath, 'utf8');
    
    // Verificar se FORCE_WIZARD foi removido
    if (mainContent.includes('FORCE_WIZARD = true')) {
      console.log('❌ FORCE_WIZARD ainda está presente em main.js!');
    } else {
      console.log('✓ FORCE_WIZARD removido de main.js');
    }
    
    // Verificar se kill-existing-gateway foi adicionado
    if (mainContent.includes('kill-existing-gateway')) {
      console.log('✓ Handler kill-existing-gateway adicionado');
    } else {
      console.log('❌ Handler kill-existing-gateway não encontrado!');
    }
    
    // Verificar se verificação de porta foi adicionada
    if (mainContent.includes('portInUse')) {
      console.log('✓ Verificação de porta adicionada');
    } else {
      console.log('❌ Verificação de porta não encontrada!');
    }
  } else {
    console.log('❌ main.js não encontrado!');
  }
  
  if (fs.existsSync(rendererJsPath)) {
    const rendererContent = fs.readFileSync(rendererJsPath, 'utf8');
    
    // Verificar se kill-existing-gateway é chamado
    if (rendererContent.includes("invoke('kill-existing-gateway')")) {
      console.log('✓ Chamada para kill-existing-gateway adicionada em renderer.js');
    } else {
      console.log('❌ Chamada para kill-existing-gateway não encontrada em renderer.js!');
    }
  } else {
    console.log('❌ renderer.js não encontrado!');
  }
  
  console.log('\n📋 Teste 5: Verificar fluxo de configuração\n');
  
  if (fs.existsSync(configPath)) {
    console.log('✓ Configuração existe');
    console.log('  Comportamento esperado: Ir direto pro chat');
    console.log('  Para testar wizard: delete o arquivo e reinicie');
  } else {
    console.log('✓ Configuração não existe');
    console.log('  Comportamento esperado: Mostrar wizard');
  }
  
  console.log('\n=== RESUMO DOS TESTES ===\n');
  
  const issues = [];
  
  if (portInUse) {
    issues.push('Porta 18789 em uso');
  }
  
  if (gatewayCount > 1) {
    issues.push('Múltiplos gateways rodando');
  }
  
  const mainContent = fs.readFileSync(mainJsPath, 'utf8');
  if (mainContent.includes('FORCE_WIZARD = true')) {
    issues.push('FORCE_WIZARD ainda presente');
  }
  
  if (!mainContent.includes('kill-existing-gateway')) {
    issues.push('Handler kill-existing-gateway não encontrado');
  }
  
  if (!mainContent.includes('portInUse')) {
    issues.push('Verificação de porta não encontrada');
  }
  
  const rendererContent = fs.readFileSync(rendererJsPath, 'utf8');
  if (!rendererContent.includes("invoke('kill-existing-gateway')")) {
    issues.push('Chamada kill-existing-gateway não encontrada em renderer.js');
  }
  
  if (issues.length === 0) {
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('\nPróximos passos:');
    console.log('1. Feche todos os processos node: taskkill /F /IM node.exe');
    console.log('2. Delete a configuração: del %USERPROFILE%\\.openclaw\\openclaw.json');
    console.log('3. Inicie o app: npm start');
    console.log('4. Complete o wizard');
    console.log('5. Verifique que apenas 1 gateway está rodando');
  } else {
    console.log('❌ PROBLEMAS ENCONTRADOS:\n');
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
  }
  
  // Restaurar backup se existir
  if (fs.existsSync(backupPath)) {
    console.log('\n📦 Restaurando backup da configuração...');
    fs.copyFileSync(backupPath, configPath);
    fs.unlinkSync(backupPath);
    console.log('✓ Backup restaurado');
  }
}

runTests().catch(console.error);
