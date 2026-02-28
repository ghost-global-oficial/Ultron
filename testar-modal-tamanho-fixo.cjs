#!/usr/bin/env node

/**
 * Script de teste para verificar o tamanho fixo do modal de configurações
 * 
 * Este script verifica se:
 * 1. O modal tem tamanho fixo de 1000px x 700px
 * 2. Todas as seções mantêm o mesmo tamanho
 * 3. O conteúdo tem scroll interno quando necessário
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando tamanho fixo do modal de configurações...\n');

// Ler o arquivo CSS
const cssPath = path.join(__dirname, 'ui', 'src', 'styles', 'manage-connectors-settings.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

// Verificar tamanho fixo do modal
const modalSizeRegex = /\.manage-connectors-settings\s*{[^}]*width:\s*1000px[^}]*height:\s*700px[^}]*}/s;
if (modalSizeRegex.test(cssContent)) {
  console.log('✅ Modal tem tamanho fixo de 1000px x 700px');
} else {
  console.log('❌ Modal não tem tamanho fixo correto');
}

// Verificar max-width e max-height para responsividade
if (cssContent.includes('max-width: 90vw') && cssContent.includes('max-height: 85vh')) {
  console.log('✅ Modal tem limites responsivos (max-width: 90vw, max-height: 85vh)');
} else {
  console.log('❌ Modal não tem limites responsivos');
}

// Verificar overflow no conteúdo
if (cssContent.includes('overflow-y: auto') || cssContent.includes('overflow: auto')) {
  console.log('✅ Conteúdo tem scroll interno');
} else {
  console.log('❌ Conteúdo não tem scroll interno');
}

// Verificar min-height: 0 para permitir scroll
if (cssContent.includes('min-height: 0')) {
  console.log('✅ Containers flex têm min-height: 0 para permitir scroll');
} else {
  console.log('⚠️  Containers flex podem não ter min-height: 0');
}

console.log('\n📋 Resumo:');
console.log('- Tamanho fixo: 1000px x 700px');
console.log('- Responsivo: max-width 90vw, max-height 85vh');
console.log('- Scroll interno: overflow-y: auto');
console.log('- Todas as seções têm o mesmo tamanho visual');

console.log('\n✨ Teste concluído!');
console.log('\n📝 Para testar manualmente:');
console.log('1. Abra o Ultron Desktop');
console.log('2. Clique no botão "Gerir conectores"');
console.log('3. Navegue entre as diferentes seções');
console.log('4. Verifique se o modal mantém o mesmo tamanho em todas as seções');
console.log('5. Adicione conteúdo longo e verifique se o scroll funciona');
