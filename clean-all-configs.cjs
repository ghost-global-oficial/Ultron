#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== LIMPANDO TODAS AS CONFIGURAÇÕES ===\n');

const paths = [
  path.join(os.homedir(), '.openclaw', 'openclaw.json'),
  path.join(os.homedir(), '.moltbot', 'moltbot.json'),
  path.join(os.homedir(), '.openclaw')
];

for (const p of paths) {
  if (fs.existsSync(p)) {
    try {
      if (fs.statSync(p).isDirectory()) {
        console.log('🗑️  Removendo diretório:', p);
        fs.rmSync(p, { recursive: true, force: true });
      } else {
        console.log('🗑️  Removendo arquivo:', p);
        fs.unlinkSync(p);
      }
      console.log('✓ Removido:', p);
    } catch (error) {
      console.error('❌ Erro ao remover:', p, error.message);
    }
  } else {
    console.log('⊘ Não existe:', p);
  }
}

console.log('\n✅ Limpeza completa!');
console.log('\nAgora você pode reiniciar o app e configurar do zero.');
