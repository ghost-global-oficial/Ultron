#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== DIAGNÓSTICO DOS TOOL CARDS ===\n');

// 1. Verificar se o arquivo JSON existe
const jsonPath = path.join('ui', 'src', 'ui', 'tool-display.json');
console.log('1. Verificando arquivo JSON...');
if (fs.existsSync(jsonPath)) {
    console.log('   ✅ tool-display.json encontrado');
    
    const content = fs.readFileSync(jsonPath, 'utf8');
    const config = JSON.parse(content);
    
    // Verificar se as tools estão configuradas
    const tools = ['web_search', 'web_fetch', 'exe'];
    console.log('\n2. Verificando configuração das tools:');
    
    for (const tool of tools) {
        if (config.tools && config.tools[tool]) {
            console.log(`   ✅ ${tool} configurado`);
            const toolConfig = config.tools[tool];
            console.log(`      - Icon: ${toolConfig.icon}`);
            console.log(`      - Title: ${toolConfig.title}`);
            console.log(`      - Label: ${toolConfig.label || 'N/A'}`);
            console.log(`      - DetailKeys: ${JSON.stringify(toolConfig.detailKeys || [])}`);
        } else {
            console.log(`   ❌ ${tool} NÃO configurado`);
        }
    }
} else {
    console.log('   ❌ tool-display.json NÃO encontrado');
}

// 2. Verificar se o arquivo TypeScript existe
const tsPath = path.join('ui', 'src', 'ui', 'tool-display.ts');
console.log('\n3. Verificando arquivo TypeScript...');
if (fs.existsSync(tsPath)) {
    console.log('   ✅ tool-display.ts encontrado');
    
    const content = fs.readFileSync(tsPath, 'utf8');
    
    // Verificar se tem a lógica especial para "exe"
    if (content.includes('if (key === "exe"')) {
        console.log('   ✅ Lógica especial para "exe" implementada');
    } else {
        console.log('   ❌ Lógica especial para "exe" NÃO encontrada');
    }
    
    // Verificar se tem os padrões de extração
    const patterns = [
        'startMatch',
        'exeMatch',
        'pathMatch',
        'firstWord'
    ];
    
    console.log('\n4. Verificando padrões de extração:');
    for (const pattern of patterns) {
        if (content.includes(pattern)) {
            console.log(`   ✅ Padrão "${pattern}" implementado`);
        } else {
            console.log(`   ❌ Padrão "${pattern}" NÃO encontrado`);
        }
    }
} else {
    console.log('   ❌ tool-display.ts NÃO encontrado');
}

// 3. Verificar se o build foi feito
const distPath = path.join('dist', 'control-ui');
console.log('\n5. Verificando build compilado...');
if (fs.existsSync(distPath)) {
    console.log('   ✅ Pasta dist/control-ui existe');
    
    // Verificar se há arquivos JS
    const files = fs.readdirSync(distPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    
    if (jsFiles.length > 0) {
        console.log(`   ✅ ${jsFiles.length} arquivo(s) JS encontrado(s)`);
        
        // Verificar se algum contém a lógica de tool-display
        let foundLogic = false;
        for (const file of jsFiles) {
            const content = fs.readFileSync(path.join(distPath, file), 'utf8');
            if (content.includes('resolveToolDisplay') || content.includes('tool-display')) {
                foundLogic = true;
                console.log(`   ✅ Lógica de tool-display encontrada em: ${file}`);
                break;
            }
        }
        
        if (!foundLogic) {
            console.log('   ⚠️  Lógica de tool-display NÃO encontrada nos arquivos compilados');
            console.log('   💡 Execute: cd ui && npm run build');
        }
    } else {
        console.log('   ❌ Nenhum arquivo JS encontrado');
        console.log('   💡 Execute: cd ui && npm run build');
    }
} else {
    console.log('   ❌ Pasta dist/control-ui NÃO existe');
    console.log('   💡 Execute: cd ui && npm run build');
}

console.log('\n═══════════════════════════════════════════════════');
console.log('📋 RESUMO DO DIAGNÓSTICO');
console.log('═══════════════════════════════════════════════════\n');

console.log('Para que os tool cards funcionem corretamente:');
console.log('');
console.log('1. ✅ tool-display.json deve ter as configurações');
console.log('2. ✅ tool-display.ts deve ter a lógica especial');
console.log('3. ⚠️  O build deve estar atualizado (npm run build)');
console.log('4. ⚠️  O app deve ser reiniciado após o build');
console.log('');
console.log('💡 Se algo estiver ❌ ou ⚠️, siga as instruções acima');
console.log('');
