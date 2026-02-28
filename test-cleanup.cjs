#!/usr/bin/env node

/**
 * Script de teste para verificar a limpeza ao fechar o app
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

console.log('=== TESTE DE LIMPEZA AO FECHAR ===\n');

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

async function runTests() {
  console.log('📋 Teste 1: Verificar se configuração existe\n');
  
  if (fs.existsSync(configPath)) {
    console.log('❌ Configuração ainda existe!');
    console.log('   Caminho:', configPath);
    console.log('   Esperado: Arquivo deletado após fechar o app');
    
    // Mostrar conteúdo
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log('\n   Conteúdo:');
      console.log('   - Gateway Port:', config.gateway?.port);
      console.log('   - Gateway Bind:', config.gateway?.bind);
      console.log('   - Modelo:', config.agents?.defaults?.model?.primary);
    } catch (error) {
      console.log('   Erro ao ler:', error.message);
    }
  } else {
    console.log('✅ Configuração foi deletada corretamente!');
    console.log('   Caminho:', configPath);
  }
  
  console.log('\n📋 Teste 2: Verificar se porta 18789 está livre\n');
  
  const portInUse = await isPortInUse(18789);
  
  if (portInUse) {
    console.log('❌ Porta 18789 ainda está em uso!');
    console.log('   Esperado: Porta livre após fechar o app');
    console.log('   Pode haver um gateway ainda rodando');
    console.log('\n   Para verificar:');
    console.log('   Windows: netstat -ano | findstr :18789');
    console.log('   Linux/Mac: lsof -i :18789');
  } else {
    console.log('✅ Porta 18789 está livre!');
  }
  
  console.log('\n📋 Teste 3: Verificar código de limpeza em main.js\n');
  
  const mainJsPath = path.join(__dirname, 'main.js');
  
  if (fs.existsSync(mainJsPath)) {
    const mainContent = fs.readFileSync(mainJsPath, 'utf8');
    
    // Verificar eventos de limpeza
    const checks = [
      { name: "window.on('close')", pattern: "mainWindow.on('close'" },
      { name: "app.on('window-all-closed')", pattern: "app.on('window-all-closed'" },
      { name: "app.on('before-quit')", pattern: "app.on('before-quit'" },
      { name: "app.on('will-quit')", pattern: "app.on('will-quit'" },
      { name: "fs.unlinkSync(configPath)", pattern: "fs.unlinkSync(configPath)" },
      { name: "gatewayProcess.kill()", pattern: "gatewayProcess.kill()" }
    ];
    
    let allChecksPass = true;
    
    for (const check of checks) {
      if (mainContent.includes(check.pattern)) {
        console.log(`✅ ${check.name} encontrado`);
      } else {
        console.log(`❌ ${check.name} NÃO encontrado!`);
        allChecksPass = false;
      }
    }
    
    if (allChecksPass) {
      console.log('\n✅ Todos os eventos de limpeza estão implementados!');
    } else {
      console.log('\n❌ Alguns eventos de limpeza estão faltando!');
    }
  } else {
    console.log('❌ main.js não encontrado!');
  }
  
  console.log('\n=== RESUMO ===\n');
  
  const issues = [];
  
  if (fs.existsSync(configPath)) {
    issues.push('Configuração não foi deletada');
  }
  
  if (portInUse) {
    issues.push('Porta 18789 ainda em uso');
  }
  
  if (issues.length === 0) {
    console.log('✅ LIMPEZA COMPLETA!');
    console.log('\nO app foi fechado corretamente e todos os recursos foram liberados.');
    console.log('\nPróxima vez que abrir o app:');
    console.log('- O wizard será mostrado novamente');
    console.log('- Nenhum gateway estará rodando');
    console.log('- A porta 18789 estará livre');
  } else {
    console.log('❌ PROBLEMAS ENCONTRADOS:\n');
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
    
    console.log('\nAções recomendadas:');
    
    if (fs.existsSync(configPath)) {
      console.log('- Deletar manualmente: del %USERPROFILE%\\.openclaw\\openclaw.json');
    }
    
    if (portInUse) {
      console.log('- Matar processos: node kill-all-gateways.cjs');
      console.log('- Ou reiniciar o computador');
    }
  }
  
  console.log('\n📝 INSTRUÇÕES DE TESTE:\n');
  console.log('1. Abra o app: npm start');
  console.log('2. Complete o wizard e use o chat');
  console.log('3. Feche o app (clique no X)');
  console.log('4. Execute este script: node test-cleanup.cjs');
  console.log('5. Verifique se a limpeza foi feita corretamente');
  console.log('6. Abra o app novamente: npm start');
  console.log('7. Verifique se o wizard aparece (não o chat)');
}

runTests().catch(console.error);
