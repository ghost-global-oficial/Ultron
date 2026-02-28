#!/usr/bin/env node

/**
 * Script para limpar sessões com formato incorreto
 * Mantém apenas sessões que começam com "agent:main:"
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const sessionsPath = path.join(os.homedir(), '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');

console.log('=== Limpeza de Sessões Incorretas ===\n');

// Verifica se o arquivo existe
if (!fs.existsSync(sessionsPath)) {
  console.log('❌ Arquivo de sessões não encontrado:', sessionsPath);
  console.log('\nIsso é normal se você nunca usou o OpenClaw antes.');
  process.exit(0);
}

// Faz backup
const backupPath = sessionsPath + '.backup-' + Date.now();
try {
  fs.copyFileSync(sessionsPath, backupPath);
  console.log('✅ Backup criado:', backupPath);
} catch (err) {
  console.error('❌ Erro ao criar backup:', err.message);
  process.exit(1);
}

// Lê o arquivo
let sessions;
try {
  const content = fs.readFileSync(sessionsPath, 'utf8');
  sessions = JSON.parse(content);
  console.log('✅ Arquivo de sessões carregado\n');
} catch (err) {
  console.error('❌ Erro ao ler arquivo:', err.message);
  process.exit(1);
}

// Analisa as sessões
console.log('Sessões encontradas:\n');
const toKeep = {};
const toRemove = [];

for (const [key, value] of Object.entries(sessions)) {
  const isCorrectFormat = key.startsWith('agent:main:');
  
  if (isCorrectFormat) {
    toKeep[key] = value;
    console.log(`  ✅ MANTER: ${key}`);
  } else {
    toRemove.push(key);
    console.log(`  ❌ REMOVER: ${key}`);
  }
}

console.log('\n=== Resumo ===\n');
console.log(`Total de sessões: ${Object.keys(sessions).length}`);
console.log(`Sessões corretas (manter): ${Object.keys(toKeep).length}`);
console.log(`Sessões incorretas (remover): ${toRemove.length}`);

if (toRemove.length === 0) {
  console.log('\n✅ Nenhuma sessão incorreta encontrada!');
  console.log('Todas as sessões já estão no formato correto.');
  process.exit(0);
}

// Salva o arquivo limpo
try {
  fs.writeFileSync(sessionsPath, JSON.stringify(toKeep, null, 2), 'utf8');
  console.log('\n✅ Arquivo de sessões atualizado!');
  console.log('\nSessões removidas:');
  toRemove.forEach(key => console.log(`  - ${key}`));
  
  console.log('\n=== Próximos Passos ===\n');
  console.log('1. Reinicie o Ultron');
  console.log('2. As tarefas antigas não aparecerão mais');
  console.log('3. Crie uma nova tarefa (botão "Nova Tarefa")');
  console.log('4. Teste enviando mensagens');
  console.log('5. O histórico deve ser salvo corretamente agora');
  
  console.log('\n=== Restaurar Backup ===\n');
  console.log('Se algo der errado, restaure o backup:');
  console.log(`Copy-Item "${backupPath}" "${sessionsPath}"`);
  
} catch (err) {
  console.error('\n❌ Erro ao salvar arquivo:', err.message);
  console.log('\nRestaurando backup...');
  try {
    fs.copyFileSync(backupPath, sessionsPath);
    console.log('✅ Backup restaurado');
  } catch (restoreErr) {
    console.error('❌ Erro ao restaurar backup:', restoreErr.message);
  }
  process.exit(1);
}

console.log('\n');
