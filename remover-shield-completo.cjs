#!/usr/bin/env node

const fs = require('fs');

console.log('=== REMOVENDO S.H.I.E.L.D. COMPLETAMENTE ===\n');

let content = fs.readFileSync('renderer.js', 'utf8');

// Remover função toggleShield
content = content.replace(/window\.toggleShield = async function\(enabled\) \{[\s\S]*?\n\};/g, '// toggleShield removida');

// Remover função generateDisableCode
content = content.replace(/function generateDisableCode\(\) \{[\s\S]*?\n\}/g, '// generateDisableCode removida');

// Remover função finishShieldAndStart
content = content.replace(/window\.finishShieldAndStart = function\(\) \{[\s\S]*?\n\};/g, '// finishShieldAndStart removida');

// Salvar
fs.writeFileSync('renderer.js', content, 'utf8');

console.log('✅ Funções do S.H.I.E.L.D. removidas!');
console.log('');
console.log('Funções removidas:');
console.log('  - window.toggleShield');
console.log('  - generateDisableCode');
console.log('  - window.finishShieldAndStart');
console.log('');
