#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log('='.repeat(60));
console.log('TESTE DE INICIALIZAÇÃO DO GATEWAY');
console.log('='.repeat(60));
console.log();

const args = [
  'dist/entry.js',
  'gateway',
  'run',
  '--allow-unconfigured',
  '--force',
  '--port',
  '18789'
];

console.log('Comando:', 'node', args.join(' '));
console.log();

const gateway = spawn('node', args, {
  cwd: __dirname,
  env: {
    ...process.env,
    ULTRON_INTERACTIVE: 'false',
    NODE_ENV: 'production',
    ULTRON_GATEWAY_AUTH_TOKEN: 'test-token-123',
    ULTRON_GATEWAY_TOKEN: 'test-token-123',
    OPENROUTER_API_KEY: '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'
  },
  detached: false,
  stdio: ['ignore', 'pipe', 'pipe']
});

let hasOutput = false;

gateway.stdout.on('data', (data) => {
  hasOutput = true;
  console.log('[STDOUT]', data.toString().trim());
});

gateway.stderr.on('data', (data) => {
  hasOutput = true;
  console.log('[STDERR]', data.toString().trim());
});

gateway.on('error', (error) => {
  console.log('[ERROR]', error.message);
});

gateway.on('exit', (code, signal) => {
  console.log();
  console.log('[EXIT] Código:', code, 'Sinal:', signal);
  
  if (code === 0 || code === null) {
    console.log('✓ Gateway iniciou com sucesso!');
  } else {
    console.log('✗ Gateway falhou ao iniciar');
  }
  
  process.exit(code || 0);
});

// Aguardar 5 segundos para ver se inicia
setTimeout(() => {
  if (hasOutput) {
    console.log();
    console.log('✓ Gateway está gerando output - provavelmente funcionando');
    
    // Verificar se a porta está aberta
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      console.log('✓ Gateway está RODANDO na porta 18789');
      socket.destroy();
      gateway.kill();
      process.exit(0);
    });
    
    socket.on('timeout', () => {
      console.log('⚠️ Porta 18789 não está respondendo ainda');
      socket.destroy();
      gateway.kill();
      process.exit(1);
    });
    
    socket.on('error', () => {
      console.log('⚠️ Não foi possível conectar na porta 18789');
      gateway.kill();
      process.exit(1);
    });
    
    socket.connect(18789, '127.0.0.1');
  } else {
    console.log('✗ Gateway não gerou nenhum output em 5 segundos');
    gateway.kill();
    process.exit(1);
  }
}, 5000);
