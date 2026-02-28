#!/usr/bin/env node

/**
 * Script para diagnosticar o problema de abertura de sessões/tarefas
 */

const fs = require('fs');
const path = require('path');

console.log('=== Diagnóstico de Sessões ===\n');

// 1. Verificar arquivos relacionados a sessões
const filesToCheck = [
  'ui/src/ui/views/new-sidebar.ts',
  'ui/src/ui/app-render.ts',
  'ui/src/ui/controllers/chat.ts',
  'ui/src/ui/app-view-state.ts',
];

console.log('1. Verificando arquivos principais:\n');
for (const file of filesToCheck) {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✓' : '✗'} ${file}`);
}

// 2. Verificar se há problemas no código da sidebar
console.log('\n2. Verificando implementação do onSessionSelect na sidebar:\n');
const sidebarCode = fs.readFileSync('ui/src/ui/views/new-sidebar.ts', 'utf8');
const hasOnClick = sidebarCode.includes('@click=${() => props.onSessionSelect(session.key)}');
console.log(`   ${hasOnClick ? '✓' : '✗'} Handler de clique está presente`);

// 3. Verificar implementação no app-render
console.log('\n3. Verificando implementação no app-render.ts:\n');
const appRenderCode = fs.readFileSync('ui/src/ui/app-render.ts', 'utf8');
const hasOnSessionSelect = appRenderCode.includes('onSessionSelect: (key) => {');
const hasLoadChatHistory = appRenderCode.includes('void loadChatHistory(state)');
console.log(`   ${hasOnSessionSelect ? '✓' : '✗'} onSessionSelect está definido`);
console.log(`   ${hasLoadChatHistory ? '✓' : '✗'} loadChatHistory é chamado`);

// 4. Verificar se há erros de sintaxe óbvios
console.log('\n4. Procurando por possíveis problemas:\n');

// Verificar se o sessionKey está sendo atualizado
const hasSessionKeyUpdate = appRenderCode.includes('state.sessionKey = key');
console.log(`   ${hasSessionKeyUpdate ? '✓' : '✗'} sessionKey é atualizado`);

// Verificar se applySettings é chamado
const hasApplySettings = appRenderCode.includes('state.applySettings');
console.log(`   ${hasApplySettings ? '✓' : '✗'} applySettings é chamado`);

// 5. Verificar se há console.log para debug
console.log('\n5. Verificando logs de debug:\n');
const chatControllerCode = fs.readFileSync('ui/src/ui/controllers/chat.ts', 'utf8');
const hasDebugLogs = chatControllerCode.includes('[DEBUG]');
console.log(`   ${hasDebugLogs ? '✓' : '✗'} Logs de debug estão presentes`);

console.log('\n=== Recomendações ===\n');
console.log('1. Abra o DevTools do navegador (F12)');
console.log('2. Vá para a aba Console');
console.log('3. Clique em uma tarefa na barra lateral');
console.log('4. Verifique se aparecem os logs [DEBUG]');
console.log('5. Se não aparecer nada, o problema pode estar no evento de clique');
console.log('6. Se aparecer erro, copie e cole aqui para análise');

console.log('\n=== Possíveis Causas ===\n');
console.log('• O evento de clique pode estar sendo bloqueado por CSS (pointer-events)');
console.log('• Pode haver um erro JavaScript que impede a execução');
console.log('• O estado pode não estar sendo atualizado corretamente');
console.log('• A conexão com o gateway pode estar falhando');

console.log('\n');
