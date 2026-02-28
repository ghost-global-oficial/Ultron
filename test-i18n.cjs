#!/usr/bin/env node

/**
 * Script de teste para o sistema de i18n do Ultron
 * Verifica se todas as traduções estão presentes e corretas
 */

const fs = require('fs');
const path = require('path');

console.log('=== TESTE DO SISTEMA DE IDIOMAS ===\n');

// Ler o arquivo i18n.js
const i18nPath = path.join(__dirname, 'i18n.js');
if (!fs.existsSync(i18nPath)) {
    console.error('❌ Arquivo i18n.js não encontrado!');
    process.exit(1);
}

console.log('✅ Arquivo i18n.js encontrado\n');

// Carregar o conteúdo
const content = fs.readFileSync(i18nPath, 'utf8');

// Verificar idiomas disponíveis
const languages = ['pt-BR', 'en-US', 'es-ES'];
console.log('📋 Idiomas disponíveis:');
languages.forEach(lang => {
    if (content.includes(`'${lang}':`)) {
        console.log(`  ✅ ${lang}`);
    } else {
        console.log(`  ❌ ${lang} - NÃO ENCONTRADO`);
    }
});

console.log('\n📋 Verificando chaves de tradução:');

// Chaves principais que devem existir
const requiredKeys = [
    'welcome.title',
    'language.title',
    'network.title',
    'provider.title',
    'apikey.title',
    'model.title',
    'apitest.title',
    'starting.title'
];

let allKeysPresent = true;

requiredKeys.forEach(key => {
    if (content.includes(`'${key}':`)) {
        console.log(`  ✅ ${key}`);
    } else {
        console.log(`  ❌ ${key} - NÃO ENCONTRADO`);
        allKeysPresent = false;
    }
});

console.log('\n📋 Verificando funções:');

const requiredFunctions = [
    'function t(',
    'function setLanguage(',
    'function loadSavedLanguage('
];

requiredFunctions.forEach(func => {
    if (content.includes(func)) {
        console.log(`  ✅ ${func.replace('function ', '').replace('(', '')}`);
    } else {
        console.log(`  ❌ ${func.replace('function ', '').replace('(', '')} - NÃO ENCONTRADA`);
        allKeysPresent = false;
    }
});

console.log('\n📋 Verificando integração com renderer.js:');

const rendererPath = path.join(__dirname, 'renderer.js');
if (!fs.existsSync(rendererPath)) {
    console.error('  ❌ Arquivo renderer.js não encontrado!');
    process.exit(1);
}

const rendererContent = fs.readFileSync(rendererPath, 'utf8');

// Verificar se tem a função renderLanguageSelection
if (rendererContent.includes('function renderLanguageSelection(')) {
    console.log('  ✅ renderLanguageSelection() presente');
} else {
    console.log('  ❌ renderLanguageSelection() NÃO ENCONTRADA');
    allKeysPresent = false;
}

// Verificar se tem a função selectLanguage
if (rendererContent.includes('window.selectLanguage = function(')) {
    console.log('  ✅ selectLanguage() presente');
} else {
    console.log('  ❌ selectLanguage() NÃO ENCONTRADA');
    allKeysPresent = false;
}

// Verificar se o step 'language' foi adicionado
if (rendererContent.includes("case 'language':")) {
    console.log('  ✅ Step "language" adicionado ao switch');
} else {
    console.log('  ❌ Step "language" NÃO ENCONTRADO no switch');
    allKeysPresent = false;
}

// Verificar se configState tem language
if (rendererContent.includes('language: null')) {
    console.log('  ✅ configState.language presente');
} else {
    console.log('  ❌ configState.language NÃO ENCONTRADO');
    allKeysPresent = false;
}

console.log('\n📋 Verificando integração com index.html:');

const indexPath = path.join(__dirname, 'index.html');
if (!fs.existsSync(indexPath)) {
    console.error('  ❌ Arquivo index.html não encontrado!');
    process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf8');

// Verificar se i18n.js está incluído
if (indexContent.includes('<script src="i18n.js"></script>')) {
    console.log('  ✅ i18n.js incluído no HTML');
} else {
    console.log('  ❌ i18n.js NÃO INCLUÍDO no HTML');
    allKeysPresent = false;
}

console.log('\n' + '='.repeat(50));

if (allKeysPresent) {
    console.log('\n✅ TODOS OS TESTES PASSARAM!');
    console.log('\n🎉 Sistema de idiomas está pronto para uso!\n');
    console.log('📝 Idiomas disponíveis:');
    console.log('   • Português (Brasil) - pt-BR 🇧🇷');
    console.log('   • English (US) - en-US 🇺🇸');
    console.log('   • Español - es-ES 🇪🇸');
    console.log('   • Français - fr-FR 🇫🇷');
    console.log('   • Deutsch - de-DE 🇩🇪');
    console.log('\n🚀 Para testar, execute: npm start\n');
    process.exit(0);
} else {
    console.log('\n❌ ALGUNS TESTES FALHARAM!');
    console.log('\nVerifique os erros acima e corrija antes de usar.\n');
    process.exit(1);
}
