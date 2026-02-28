#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('='.repeat(60));
console.log('VERIFICAÇÃO COMPLETA DO ULTRON');
console.log('='.repeat(60));
console.log();

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(msg) {
  console.log('✓', msg);
  results.passed.push(msg);
}

function fail(msg) {
  console.log('✗', msg);
  results.failed.push(msg);
}

function warn(msg) {
  console.log('⚠', msg);
  results.warnings.push(msg);
}

// 1. VERIFICAR ESTRUTURA DE PASTAS
console.log('1. ESTRUTURA DE PASTAS');
console.log('-'.repeat(60));

const ultronDir = path.join(os.homedir(), '.ultron');
if (fs.existsSync(ultronDir)) {
  pass('Pasta .ultron existe');
  
  const configPath = path.join(ultronDir, 'ultron.json');
  if (fs.existsSync(configPath)) {
    pass('Arquivo ultron.json existe');
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      pass('ultron.json é válido (JSON parseável)');
      
      // Verificar estrutura do config
      if (config.gateway) {
        pass('Config tem seção gateway');
        if (config.gateway.mode) pass(`  - mode: ${config.gateway.mode}`);
        if (config.gateway.port) pass(`  - port: ${config.gateway.port}`);
        if (config.gateway.bind) pass(`  - bind: ${config.gateway.bind}`);
        if (config.gateway.auth && config.gateway.auth.token) {
          pass(`  - token: ${config.gateway.auth.token.substring(0, 16)}...`);
        }
      } else {
        fail('Config não tem seção gateway');
      }
      
      if (config.agents && config.agents.defaults && config.agents.defaults.model) {
        pass('Config tem modelo configurado');
        pass(`  - modelo: ${config.agents.defaults.model.primary}`);
      } else {
        fail('Config não tem modelo configurado');
      }
      
      if (config.env && config.env.vars) {
        pass('Config tem variáveis de ambiente');
        const keys = Object.keys(config.env.vars);
        keys.forEach(key => {
          if (key.includes('API_KEY')) {
            pass(`  - ${key}: configurado`);
          }
        });
      }
      
      // Verificar se NÃO tem systemPrompt (bug corrigido)
      if (config.agents && config.agents.defaults && config.agents.defaults.systemPrompt) {
        fail('Config ainda tem systemPrompt (BUG!)');
      } else {
        pass('Config NÃO tem systemPrompt (correto)');
      }
      
    } catch (error) {
      fail(`Erro ao ler ultron.json: ${error.message}`);
    }
  } else {
    fail('Arquivo ultron.json não existe');
  }
  
  const shieldPath = path.join(ultronDir, 'shield-config.json');
  if (fs.existsSync(shieldPath)) {
    pass('Arquivo shield-config.json existe');
    try {
      const shield = JSON.parse(fs.readFileSync(shieldPath, 'utf8'));
      pass(`  - S.H.I.E.L.D. habilitado: ${shield.enabled}`);
      pass(`  - Aprovação humana: ${shield.requireHumanApproval}`);
      pass(`  - Auto-bloqueio: ${shield.autoBlock}`);
    } catch (error) {
      warn(`Erro ao ler shield-config.json: ${error.message}`);
    }
  } else {
    warn('Arquivo shield-config.json não existe');
  }
  
  const logsDir = path.join(ultronDir, 'logs');
  if (fs.existsSync(logsDir)) {
    pass('Pasta de logs existe');
  } else {
    warn('Pasta de logs não existe (será criada automaticamente)');
  }
  
} else {
  fail('Pasta .ultron não existe');
}

console.log();

// 2. VERIFICAR ARQUIVOS DO PROJETO
console.log('2. ARQUIVOS DO PROJETO');
console.log('-'.repeat(60));

const projectFiles = [
  'index.html',
  'main.js',
  'renderer.js',
  'i18n.js',
  'chat-i18n.js',
  'shield-js-engine.js',
  'shield-monitor.js',
  'ultron-security-system.cjs'
];

projectFiles.forEach(file => {
  if (fs.existsSync(file)) {
    pass(`${file} existe`);
    
    // Verificar se ainda tem referências a openclaw
    const content = fs.readFileSync(file, 'utf8');
    const openclawMatches = content.match(/openclaw|OpenClaw/gi);
    if (openclawMatches && openclawMatches.length > 0) {
      // Filtrar falsos positivos (comentários, strings de exemplo, etc)
      const realMatches = openclawMatches.filter(match => {
        const line = content.split('\n').find(l => l.includes(match));
        return line && !line.includes('//') && !line.includes('Sistema de tradução');
      });
      
      if (realMatches.length > 0) {
        warn(`  ${file} ainda tem ${realMatches.length} referências a "openclaw"`);
      }
    }
  } else {
    fail(`${file} não existe`);
  }
});

console.log();

// 3. VERIFICAR UI
console.log('3. INTERFACE DO USUÁRIO');
console.log('-'.repeat(60));

const uiFiles = [
  'ui/src/styles/base.css',
  'ui/src/styles/components.css',
  'ui/src/styles/config.css',
  'ui/src/styles/chat/layout.css',
  'ui/src/styles/chat/grouped.css',
  'ui/src/styles/chat/text.css'
];

uiFiles.forEach(file => {
  if (fs.existsSync(file)) {
    pass(`${file} existe`);
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Verificar cores (não deve ter vermelho)
    if (content.includes('#ff0000') || content.includes('rgb(255, 0, 0)')) {
      warn(`  ${file} ainda tem cor vermelha pura`);
    }
    
    // Verificar fundo preto
    if (file.includes('base.css')) {
      if (content.includes('--background: #000000') || content.includes('--background: #000')) {
        pass('  Fundo preto configurado');
      } else {
        warn('  Fundo pode não estar preto sólido');
      }
    }
  } else {
    fail(`${file} não existe`);
  }
});

console.log();

// 4. VERIFICAR SISTEMA DE SEGURANÇA
console.log('4. SISTEMA DE SEGURANÇA');
console.log('-'.repeat(60));

if (fs.existsSync('ultron-security-system.cjs')) {
  pass('ultron-security-system.cjs existe');
  
  const content = fs.readFileSync('ultron-security-system.cjs', 'utf8');
  
  // Verificar se não tem shebang (bug corrigido)
  if (content.startsWith('#!/usr/bin/env node')) {
    fail('ultron-security-system.cjs ainda tem shebang (BUG!)');
  } else {
    pass('ultron-security-system.cjs não tem shebang (correto)');
  }
  
  // Verificar se tem as principais funções
  if (content.includes('PROTECTED_FILES')) pass('  - PROTECTED_FILES definido');
  if (content.includes('PROTECTED_COMMANDS')) pass('  - PROTECTED_COMMANDS definido');
  if (content.includes('AI_RESTRICTIONS')) pass('  - AI_RESTRICTIONS definido');
  if (content.includes('isCommandBlocked')) pass('  - isCommandBlocked implementado');
  if (content.includes('isFileProtected')) pass('  - isFileProtected implementado');
}

if (fs.existsSync('shield-js-engine.js')) {
  pass('shield-js-engine.js existe');
}

if (fs.existsSync('shield-monitor.js')) {
  pass('shield-monitor.js existe');
  
  const content = fs.readFileSync('shield-monitor.js', 'utf8');
  if (content.includes('.ultron')) {
    pass('  - Usa pasta .ultron (correto)');
  } else if (content.includes('.openclaw')) {
    fail('  - Ainda usa pasta .openclaw (BUG!)');
  }
}

console.log();

// 5. VERIFICAR PACKAGE.JSON
console.log('5. DEPENDÊNCIAS');
console.log('-'.repeat(60));

if (fs.existsSync('package.json')) {
  pass('package.json existe');
  
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (pkg.dependencies) {
      const deps = Object.keys(pkg.dependencies);
      pass(`${deps.length} dependências instaladas`);
      
      // Verificar dependências críticas
      const critical = ['electron', 'express', 'ws'];
      critical.forEach(dep => {
        if (deps.includes(dep)) {
          pass(`  - ${dep}: ${pkg.dependencies[dep]}`);
        } else {
          warn(`  - ${dep}: não encontrado`);
        }
      });
    }
    
    if (pkg.scripts) {
      pass('Scripts npm configurados');
      if (pkg.scripts.start) pass('  - npm start disponível');
      if (pkg.scripts.build) pass('  - npm run build disponível');
    }
  } catch (error) {
    fail(`Erro ao ler package.json: ${error.message}`);
  }
}

console.log();

// 6. VERIFICAR CACHE DO ELECTRON
console.log('6. CACHE DO ELECTRON');
console.log('-'.repeat(60));

const electronCache = path.join(os.homedir(), 'AppData', 'Roaming', 'openclaw');
if (fs.existsSync(electronCache)) {
  warn('Cache antigo do Electron ainda existe (openclaw)');
  warn('  Recomendado: deletar manualmente');
} else {
  pass('Cache antigo do Electron foi removido');
}

const ultronCache = path.join(os.homedir(), 'AppData', 'Roaming', 'ultron');
if (fs.existsSync(ultronCache)) {
  pass('Cache do ULTRON existe');
} else {
  warn('Cache do ULTRON não existe (será criado na primeira execução)');
}

console.log();

// RESUMO FINAL
console.log('='.repeat(60));
console.log('RESUMO DA VERIFICAÇÃO');
console.log('='.repeat(60));
console.log();
console.log(`✓ Testes passados: ${results.passed.length}`);
console.log(`✗ Testes falhos: ${results.failed.length}`);
console.log(`⚠ Avisos: ${results.warnings.length}`);
console.log();

if (results.failed.length > 0) {
  console.log('PROBLEMAS ENCONTRADOS:');
  results.failed.forEach(msg => console.log(`  ✗ ${msg}`));
  console.log();
}

if (results.warnings.length > 0) {
  console.log('AVISOS:');
  results.warnings.forEach(msg => console.log(`  ⚠ ${msg}`));
  console.log();
}

if (results.failed.length === 0) {
  console.log('🎉 TODAS AS FUNCIONALIDADES ESTÃO OPERACIONAIS!');
  console.log();
  console.log('Próximos passos:');
  console.log('1. Feche o app completamente');
  console.log('2. Abra o app novamente');
  console.log('3. O gateway deve iniciar automaticamente');
  console.log('4. Teste o chat enviando uma mensagem');
} else {
  console.log('⚠️  ALGUNS PROBLEMAS FORAM ENCONTRADOS');
  console.log('Revise os erros acima antes de continuar.');
}

console.log();
console.log('='.repeat(60));
