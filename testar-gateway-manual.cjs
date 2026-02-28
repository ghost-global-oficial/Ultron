#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('=== TESTE MANUAL DO GATEWAY ===');
console.log();

// Ler config
const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('Config carregado:');
console.log('- Porta:', config.gateway.port);
console.log('- Token:', config.gateway.auth.token.substring(0, 16) + '...');
console.log('- Modelo:', config.agents.defaults.model.primary);
console.log();

const entryPath = path.join(__dirname, 'dist', 'entry.js');

if (!fs.existsSync(entryPath)) {
  console.error('❌ dist/entry.js não existe!');
  process.exit(1);
}

console.log('✓ dist/entry.js existe');
console.log();

const args = [
  entryPath,
  'gateway',
  'run',
  '--allow-unconfigured',
  '--port',
  config.gateway.port.toString()
];

console.log('Iniciando gateway com args:', args);
console.log();

const gatewayProcess = spawn('node', args, {
  cwd: __dirname,
  env: {
    ...process.env,
    ULTRON_INTERACTIVE: 'false',
    NODE_ENV: 'production',
    ULTRON_GATEWAY_AUTH_TOKEN: config.gateway.auth.token,
    ULTRON_GATEWAY_TOKEN: config.gateway.auth.token,
    ...config.env.vars
  },
  detached: false,
  stdio: ['ignore', 'pipe', 'pipe']
});

console.log('Processo iniciado. PID:', gatewayProcess.pid);
console.log();
console.log('=== OUTPUT DO GATEWAY ===');
console.log();

gatewayProcess.stdout.on('data', (data) => {
  console.log('[STDOUT]', data.toString().trim());
});

gatewayProcess.stderr.on('data', (data) => {
  console.error('[STDERR]', data.toString().trim());
});

gatewayProcess.on('exit', (code, signal) => {
  console.log();
  console.log('=== GATEWAY ENCERRADO ===');
  console.log('Código:', code);
  console.log('Signal:', signal);
  process.exit(code || 0);
});

// Aguardar 10 segundos e então encerrar
setTimeout(() => {
  console.log();
  console.log('=== ENCERRANDO TESTE (10 segundos) ===');
  gatewayProcess.kill();
}, 10000);
