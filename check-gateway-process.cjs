#!/usr/bin/env node

const { exec } = require('child_process');

console.log('=== VERIFICANDO PROCESSO DO GATEWAY ===\n');

// Verificar se há processo node rodando na porta 18789
exec('netstat -ano | findstr :18789', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Erro ao verificar porta:', error.message);
    return;
  }
  
  if (stdout) {
    console.log('✓ Gateway está rodando na porta 18789:');
    console.log(stdout);
    
    // Extrair PID
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        pids.add(pid);
      }
    });
    
    console.log('\n📋 PIDs encontrados:', Array.from(pids).join(', '));
    
    // Ver detalhes do processo
    pids.forEach(pid => {
      exec(`tasklist /FI "PID eq ${pid}" /FO LIST`, (err, out) => {
        if (!err && out) {
          console.log(`\n🔍 Processo ${pid}:`);
          console.log(out);
        }
      });
    });
    
  } else {
    console.log('❌ Nenhum processo encontrado na porta 18789');
    console.log('O gateway não está rodando!');
  }
});

// Verificar se há arquivo de log
const fs = require('fs');
const path = require('path');
const os = require('os');

const logPath = path.join(os.homedir(), '.openclaw', 'logs', 'gateway.log');
console.log('\n📁 Arquivo de log:', logPath);
console.log('Existe?', fs.existsSync(logPath));

if (fs.existsSync(logPath)) {
  const stats = fs.statSync(logPath);
  console.log('Tamanho:', stats.size, 'bytes');
  console.log('Última modificação:', stats.mtime);
  
  // Ler últimas 20 linhas
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  const lastLines = lines.slice(-20);
  
  console.log('\n📋 Últimas 20 linhas do log:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lastLines.forEach(line => console.log(line));
}
