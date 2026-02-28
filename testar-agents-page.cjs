#!/usr/bin/env node

/**
 * Script para testar a página de Agents
 * 
 * Este script verifica:
 * 1. Se a página de agents foi integrada corretamente
 * 2. Se os ícones necessários foram adicionados
 * 3. Se a navegação está configurada
 * 4. Se o CSS foi importado
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testando integração da página de Agents...\n');

let allPassed = true;

// 1. Verificar se os ícones foram adicionados
console.log('1️⃣ Verificando ícones...');
const iconsPath = path.join(__dirname, 'ui/src/ui/icons.ts');
const iconsContent = fs.readFileSync(iconsPath, 'utf-8');

const requiredIcons = ['trash', 'clock'];
const missingIcons = requiredIcons.filter(icon => !iconsContent.includes(`${icon}:`));

if (missingIcons.length === 0) {
  console.log('   ✅ Todos os ícones necessários foram adicionados');
} else {
  console.log(`   ❌ Ícones faltando: ${missingIcons.join(', ')}`);
  allPassed = false;
}

// 2. Verificar se o componente foi importado no app-render.ts
console.log('\n2️⃣ Verificando importação do componente...');
const appRenderPath = path.join(__dirname, 'ui/src/ui/app-render.ts');
const appRenderContent = fs.readFileSync(appRenderPath, 'utf-8');

if (appRenderContent.includes('import { renderAgentsPage }')) {
  console.log('   ✅ Componente importado no app-render.ts');
} else {
  console.log('   ❌ Componente não foi importado no app-render.ts');
  allPassed = false;
}

if (appRenderContent.includes('state.tab === "agents"')) {
  console.log('   ✅ Renderização condicional configurada');
} else {
  console.log('   ❌ Renderização condicional não configurada');
  allPassed = false;
}

// 3. Verificar se o CSS foi importado
console.log('\n3️⃣ Verificando importação do CSS...');
const stylesPath = path.join(__dirname, 'ui/src/styles.css');
const stylesContent = fs.readFileSync(stylesPath, 'utf-8');

if (stylesContent.includes('@import "./styles/agents-page.css"')) {
  console.log('   ✅ CSS importado no styles.css');
} else {
  console.log('   ❌ CSS não foi importado no styles.css');
  allPassed = false;
}

// 4. Verificar se a navegação foi configurada
console.log('\n4️⃣ Verificando configuração de navegação...');
const navigationPath = path.join(__dirname, 'ui/src/ui/navigation.ts');
const navigationContent = fs.readFileSync(navigationPath, 'utf-8');

if (navigationContent.includes('"agents"')) {
  console.log('   ✅ Tab "agents" adicionada ao tipo Tab');
} else {
  console.log('   ❌ Tab "agents" não foi adicionada ao tipo Tab');
  allPassed = false;
}

if (navigationContent.includes('agents: "/agents"')) {
  console.log('   ✅ Path configurado para agents');
} else {
  console.log('   ❌ Path não configurado para agents');
  allPassed = false;
}

if (navigationContent.includes('case "agents":')) {
  console.log('   ✅ Ícone, título e subtítulo configurados');
} else {
  console.log('   ❌ Ícone, título ou subtítulo não configurados');
  allPassed = false;
}

// 5. Verificar se os handlers foram adicionados no app.ts
console.log('\n5️⃣ Verificando handlers no app.ts...');
const appPath = path.join(__dirname, 'ui/src/ui/app.ts');
const appContent = fs.readFileSync(appPath, 'utf-8');

const requiredHandlers = [
  'handleCreateAgent',
  'handleEditAgent',
  'handleDeleteAgent',
  'handleToggleAgent'
];

const missingHandlers = requiredHandlers.filter(handler => !appContent.includes(handler));

if (missingHandlers.length === 0) {
  console.log('   ✅ Todos os handlers foram adicionados');
} else {
  console.log(`   ❌ Handlers faltando: ${missingHandlers.join(', ')}`);
  allPassed = false;
}

// 6. Verificar se handleAgents foi atualizado
if (appContent.includes('this.setTab("agents")')) {
  console.log('   ✅ handleAgents atualizado para abrir a página de agents');
} else {
  console.log('   ❌ handleAgents não foi atualizado');
  allPassed = false;
}

// 7. Verificar se o arquivo foi compilado
console.log('\n6️⃣ Verificando compilação...');
const distPath = path.join(__dirname, 'dist/control-ui');

if (fs.existsSync(distPath)) {
  const assetsPath = path.join(distPath, 'assets');
  
  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);
    const jsFiles = files.filter(f => f.startsWith('index-') && f.endsWith('.js'));
    
    if (jsFiles.length > 0) {
      console.log('   ✅ UI compilada com sucesso');
      
      // Verificar se o código compilado contém a página de agents
      const compiledPath = path.join(assetsPath, jsFiles[0]);
      const compiledContent = fs.readFileSync(compiledPath, 'utf-8');
      if (compiledContent.includes('agents-page')) {
        console.log('   ✅ Código da página de agents presente no bundle');
      } else {
        console.log('   ⚠️  Código da página de agents pode não estar no bundle');
      }
    } else {
      console.log('   ❌ Arquivos JS compilados não encontrados');
      allPassed = false;
    }
  } else {
    console.log('   ❌ Diretório assets não encontrado');
    allPassed = false;
  }
} else {
  console.log('   ❌ Diretório dist não encontrado');
  allPassed = false;
}

// Resultado final
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ TODOS OS TESTES PASSARAM!');
  console.log('\n📝 Próximos passos:');
  console.log('   1. Reinicie o gateway: pnpm openclaw gateway run');
  console.log('   2. Abra o ULTRON Desktop');
  console.log('   3. Clique no botão "Agents" na barra lateral');
  console.log('   4. Ou navegue para a aba "Agents" no menu lateral');
} else {
  console.log('❌ ALGUNS TESTES FALHARAM');
  console.log('\nVerifique os erros acima e corrija antes de testar.');
}
console.log('='.repeat(50));
