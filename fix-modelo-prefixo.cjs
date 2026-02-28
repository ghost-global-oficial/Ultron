#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== CORRIGINDO PREFIXO DO MODELO ===\n');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

if (!fs.existsSync(configPath)) {
  console.error('❌ Configuração não encontrada');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('Modelo atual:', config.agents?.defaults?.model?.primary);

// Adicionar prefixo openrouter/ se não tiver
const currentModel = config.agents?.defaults?.model?.primary;

if (currentModel && !currentModel.startsWith('openrouter/')) {
  const newModel = `openrouter/${currentModel}`;
  config.agents.defaults.model.primary = newModel;
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log('✓ Modelo atualizado para:', newModel);
  console.log('\n💡 Reinicie o gateway para aplicar a mudança');
  console.log('   (Fechar e abrir o app novamente)');
} else if (currentModel && currentModel.startsWith('openrouter/')) {
  console.log('✓ Modelo já tem o prefixo correto');
} else {
  console.log('❌ Modelo não encontrado na configuração');
}
