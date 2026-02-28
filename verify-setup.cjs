// Script de verificação do setup do Ultron
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== VERIFICAÇÃO DO SETUP ULTRON ===\n');

let allGood = true;

// 1. Verificar se openclaw.mjs existe
console.log('1. Verificando openclaw.mjs...');
const openclawPath = path.join(__dirname, 'openclaw.mjs');
if (fs.existsSync(openclawPath)) {
    console.log('   ✅ openclaw.mjs encontrado');
} else {
    console.log('   ❌ openclaw.mjs NÃO encontrado');
    allGood = false;
}

// 2. Verificar se a UI foi compilada
console.log('\n2. Verificando UI compilada...');
const uiPath = path.join(__dirname, 'dist', 'control-ui', 'index.html');
if (fs.existsSync(uiPath)) {
    console.log('   ✅ UI compilada encontrada');
    const uiSize = fs.statSync(uiPath).size;
    console.log(`   📊 Tamanho: ${uiSize} bytes`);
} else {
    console.log('   ❌ UI compilada NÃO encontrada');
    console.log('   💡 Execute: cd ui && npm install && npm run build');
    allGood = false;
}

// 2.5. Verificar se o projeto foi compilado
console.log('\n2.5. Verificando projeto compilado...');
const entryPath = path.join(__dirname, 'dist', 'entry.js');
if (fs.existsSync(entryPath)) {
    console.log('   ✅ Projeto compilado (dist/entry.js existe)');
} else {
    console.log('   ❌ Projeto NÃO compilado');
    console.log('   💡 Execute: npm run build');
    allGood = false;
}

// 3. Verificar se main.js tem as correções
console.log('\n3. Verificando correções no main.js...');
const mainPath = path.join(__dirname, 'main.js');
if (fs.existsSync(mainPath)) {
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    
    const hasImportOs = mainContent.includes('import os from');
    const hasImportNet = mainContent.includes('import net from');
    const hasLocalStorage = mainContent.includes('localStorage.setItem');
    
    if (hasImportOs && hasImportNet) {
        console.log('   ✅ Imports ES6 corretos');
    } else {
        console.log('   ❌ Imports ES6 incorretos');
        if (!hasImportOs) console.log('      - Falta: import os from "os"');
        if (!hasImportNet) console.log('      - Falta: import net from "net"');
        allGood = false;
    }
    
    if (hasLocalStorage) {
        console.log('   ✅ Injeção de localStorage presente');
    } else {
        console.log('   ❌ Injeção de localStorage ausente');
        allGood = false;
    }
} else {
    console.log('   ❌ main.js NÃO encontrado');
    allGood = false;
}

// 4. Verificar se renderer.js existe
console.log('\n4. Verificando renderer.js...');
const rendererPath = path.join(__dirname, 'renderer.js');
if (fs.existsSync(rendererPath)) {
    console.log('   ✅ renderer.js encontrado');
} else {
    console.log('   ❌ renderer.js NÃO encontrado');
    allGood = false;
}

// 5. Verificar se index.html existe
console.log('\n5. Verificando index.html...');
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
    console.log('   ✅ index.html encontrado');
} else {
    console.log('   ❌ index.html NÃO encontrado');
    allGood = false;
}

// 6. Verificar se package.json está correto
console.log('\n6. Verificando package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (pkg.type === 'module') {
        console.log('   ✅ type: "module" configurado');
    } else {
        console.log('   ❌ type: "module" NÃO configurado');
        allGood = false;
    }
    
    if (pkg.main === 'main.js') {
        console.log('   ✅ main: "main.js" configurado');
    } else {
        console.log('   ❌ main: "main.js" NÃO configurado');
        allGood = false;
    }
    
    if (pkg.dependencies && pkg.dependencies.electron) {
        console.log('   ✅ Electron instalado (dependencies)');
    } else if (pkg.devDependencies && pkg.devDependencies.electron) {
        console.log('   ✅ Electron instalado (devDependencies)');
    } else {
        console.log('   ❌ Electron NÃO instalado');
        allGood = false;
    }
} else {
    console.log('   ❌ package.json NÃO encontrado');
    allGood = false;
}

// 7. Verificar se há configuração existente
console.log('\n7. Verificando configuração existente...');
const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
if (fs.existsSync(configPath)) {
    console.log('   ℹ️  Configuração existente encontrada');
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('   📊 Gateway Port:', config.gateway?.port || 'não configurado');
        console.log('   📊 Gateway Bind:', config.gateway?.bind || 'não configurado');
        console.log('   📊 Modelo:', config.agent?.model || 'não configurado');
        
        const providers = Object.keys(config.credentials || {});
        if (providers.length > 0) {
            console.log('   📊 Provedores configurados:', providers.join(', '));
        } else {
            console.log('   ⚠️  Nenhum provedor configurado');
        }
    } catch (error) {
        console.log('   ⚠️  Erro ao ler configuração:', error.message);
    }
} else {
    console.log('   ℹ️  Nenhuma configuração existente (será criada no primeiro uso)');
}

// Resultado final
console.log('\n' + '='.repeat(50));
if (allGood) {
    console.log('✅ TUDO PRONTO! Você pode executar: npm start');
} else {
    console.log('❌ PROBLEMAS ENCONTRADOS! Corrija os erros acima antes de continuar.');
}
console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);
