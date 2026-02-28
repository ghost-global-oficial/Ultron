#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const sessionsPath = path.join(os.homedir(), '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');

console.log('=== VERIFICANDO SESSÕES ===\n');
console.log('Caminho:', sessionsPath);
console.log('Existe?', fs.existsSync(sessionsPath));

if (fs.existsSync(sessionsPath)) {
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
  console.log('\n📋 Sessões:');
  console.log(JSON.stringify(sessions, null, 2));
} else {
  console.log('\n❌ Arquivo de sessões não existe!');
  console.log('\nIsso pode ser o problema. O chat UI precisa de uma sessão ativa.');
  console.log('\nVamos criar uma sessão padrão...');
  
  const sessionsDir = path.dirname(sessionsPath);
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }
  
  const defaultSessions = {
    "agent:main:main": {
      "key": "agent:main:main",
      "agentId": "main",
      "sessionId": "main",
      "createdAt": Date.now(),
      "updatedAt": Date.now()
    }
  };
  
  fs.writeFileSync(sessionsPath, JSON.stringify(defaultSessions, null, 2));
  console.log('✓ Sessão padrão criada!');
  console.log(JSON.stringify(defaultSessions, null, 2));
}
