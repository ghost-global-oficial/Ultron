#!/usr/bin/env node

/**
 * Script de diagnóstico para o seletor de modelo
 */

console.log('🔍 Diagnóstico do Seletor de Modelo\n');

console.log('📋 Instruções de Teste:');
console.log('1. Abra o DevTools (F12)');
console.log('2. Vá para a aba Console');
console.log('3. Limpe o console');
console.log('4. Clique no botão do seletor de modelo');
console.log('5. Verifique se aparece a mensagem: [DEBUG] Model selector clicked');
console.log('');

console.log('🔧 Possíveis Problemas:');
console.log('');

console.log('❌ Problema 1: Cache não foi limpo');
console.log('   Solução: Execute .\\limpar-cache-electron.ps1');
console.log('');

console.log('❌ Problema 2: Botão não está visível');
console.log('   Verifique:');
console.log('   - Você está na aba "Chat"?');
console.log('   - O botão aparece no header do chat?');
console.log('   - O botão tem o texto "Claude Sonnet 4.5"?');
console.log('');

console.log('❌ Problema 3: Método não está definido');
console.log('   No console, verifique se aparece:');
console.log('   - hasMethod: true');
console.log('   - Se aparecer false, o método não foi definido corretamente');
console.log('');

console.log('❌ Problema 4: Estado não está mudando');
console.log('   No console, verifique:');
console.log('   - currentState: false (antes de clicar)');
console.log('   - currentState: true (depois de clicar)');
console.log('');

console.log('🔍 Debug Avançado:');
console.log('No console do DevTools, execute:');
console.log('');
console.log('// Verificar se o elemento existe');
console.log('document.querySelector(".chat-model-selector")');
console.log('');
console.log('// Verificar se o botão existe');
console.log('document.querySelector(".chat-model-selector__button")');
console.log('');
console.log('// Verificar se o menu existe (deve ser null se fechado)');
console.log('document.querySelector(".chat-model-selector__menu")');
console.log('');

console.log('📝 Passos para Resolver:');
console.log('1. Feche o Ultron Desktop');
console.log('2. Execute: .\\limpar-cache-electron.ps1');
console.log('3. Abra o Ultron Desktop novamente');
console.log('4. Vá para a aba Chat');
console.log('5. Abra o DevTools (F12)');
console.log('6. Clique no botão do seletor');
console.log('7. Verifique o console');
console.log('');

console.log('💡 Se ainda não funcionar:');
console.log('Cole aqui o que aparece no console quando você clica no botão.');
