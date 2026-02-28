#!/usr/bin/env node

/**
 * Script para matar todos os processos gateway rodando
 */

const { spawn } = require('child_process');

console.log('🔪 Matando todos os processos gateway...\n');

const isWindows = process.platform === 'win32';

if (isWindows) {
  // Windows: Matar todos os processos node.exe
  console.log('Executando: taskkill /F /IM node.exe');
  
  const proc = spawn('taskkill', ['/F', '/IM', 'node.exe'], {
    stdio: 'inherit'
  });
  
  proc.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Todos os processos node foram encerrados');
    } else if (code === 128) {
      console.log('\n✓ Nenhum processo node encontrado');
    } else {
      console.log(`\n⚠️  Código de saída: ${code}`);
    }
    
    console.log('\nPróximos passos:');
    console.log('1. Verifique: netstat -ano | findstr :18789');
    console.log('2. Se a porta ainda estiver em uso, reinicie o computador');
    console.log('3. Inicie o app: npm start');
  });
} else {
  // Linux/Mac: Matar processos gateway
  console.log('Executando: pkill -9 -f "gateway run"');
  
  const proc = spawn('pkill', ['-9', '-f', 'gateway run'], {
    stdio: 'inherit'
  });
  
  proc.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Todos os processos gateway foram encerrados');
    } else {
      console.log('\n✓ Nenhum processo gateway encontrado');
    }
    
    console.log('\nPróximos passos:');
    console.log('1. Verifique: lsof -i :18789');
    console.log('2. Inicie o app: npm start');
  });
}
