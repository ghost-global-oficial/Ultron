#!/usr/bin/env node

/**
 * Script de teste para o sistema de segurança unificado
 * Demonstra que o bloqueio funciona em nível de código
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('='.repeat(80));
console.log('TESTE DO ULTRON SECURITY SYSTEM');
console.log('='.repeat(80));
console.log('');

// Instalar sistema unificado
console.log('1. Instalando Ultron Security System...');
const { UltronSecuritySystem } = require('./ultron-security-system.cjs');
const security = new UltronSecuritySystem();

// Instalar apenas o middleware (sem guardian para testes rápidos)
security.middleware.install();
console.log('');

// Verificar se está ativo
console.log('2. Verificando se middleware está ativo...');
const active = security.middleware.isInstalled;
console.log('   Status:', active ? '✓ ATIVO' : '❌ INATIVO');
console.log('');

// Teste 1: Tentar ler arquivo bloqueado
console.log('3. TESTE 1: Tentar ler renderer.js (bloqueado)');
try {
    const content = fs.readFileSync('renderer.js', 'utf8');
    console.log('   ❌ FALHA: Arquivo foi lido! Middleware não está funcionando!');
    console.log('   Conteúdo (primeiros 100 chars):', content.substring(0, 100));
} catch (error) {
    if (error.blocked) {
        console.log('   ✓ SUCESSO: Acesso bloqueado pelo middleware');
        console.log('   Mensagem:', error.message);
    } else {
        console.log('   ⚠️ AVISO: Erro diferente (arquivo pode não existir)');
        console.log('   Erro:', error.message);
    }
}
console.log('');

// Teste 2: Tentar ler arquivo permitido
console.log('4. TESTE 2: Tentar ler package.json (permitido)');
try {
    const content = fs.readFileSync('package.json', 'utf8');
    console.log('   ✓ SUCESSO: Arquivo permitido foi lido');
    console.log('   Tamanho:', content.length, 'bytes');
} catch (error) {
    console.log('   ❌ FALHA: Não conseguiu ler arquivo permitido');
    console.log('   Erro:', error.message);
}
console.log('');

// Teste 3: Tentar executar comando bloqueado
console.log('5. TESTE 3: Tentar executar "cat renderer.js" (bloqueado)');
try {
    const output = execSync('cat renderer.js', { encoding: 'utf8' });
    console.log('   ❌ FALHA: Comando foi executado! Middleware não está funcionando!');
    console.log('   Output (primeiros 100 chars):', output.substring(0, 100));
} catch (error) {
    if (error.blocked) {
        console.log('   ✓ SUCESSO: Comando bloqueado pelo middleware');
        console.log('   Mensagem:', error.message);
    } else {
        console.log('   ⚠️ AVISO: Erro diferente (comando pode não existir no Windows)');
        console.log('   Erro:', error.message);
    }
}
console.log('');

// Teste 4: Tentar executar comando permitido
console.log('6. TESTE 4: Tentar executar "node --version" (permitido)');
try {
    const output = execSync('node --version', { encoding: 'utf8' });
    console.log('   ✓ SUCESSO: Comando permitido foi executado');
    console.log('   Output:', output.trim());
} catch (error) {
    console.log('   ❌ FALHA: Não conseguiu executar comando permitido');
    console.log('   Erro:', error.message);
}
console.log('');

// Teste 5: Tentar escrever em arquivo bloqueado
console.log('7. TESTE 5: Tentar escrever em main.js (bloqueado)');
try {
    fs.writeFileSync('main.js', '// teste', { flag: 'a' });
    console.log('   ❌ FALHA: Arquivo foi modificado! Middleware não está funcionando!');
} catch (error) {
    if (error.blocked) {
        console.log('   ✓ SUCESSO: Escrita bloqueada pelo middleware');
        console.log('   Mensagem:', error.message);
    } else {
        console.log('   ⚠️ AVISO: Erro diferente');
        console.log('   Erro:', error.message);
    }
}
console.log('');

// Teste 6: Tentar ler arquivo do S.H.I.E.L.D.
console.log('8. TESTE 6: Tentar ler shield-js-engine.js (bloqueado)');
try {
    const content = fs.readFileSync('shield-js-engine.js', 'utf8');
    console.log('   ❌ FALHA: Arquivo foi lido! Middleware não está funcionando!');
    console.log('   Conteúdo (primeiros 100 chars):', content.substring(0, 100));
} catch (error) {
    if (error.blocked) {
        console.log('   ✓ SUCESSO: Acesso bloqueado pelo middleware');
        console.log('   Mensagem:', error.message);
    } else {
        console.log('   ⚠️ AVISO: Erro diferente (arquivo pode não existir)');
        console.log('   Erro:', error.message);
    }
}
console.log('');

// Teste 7: Tentar ler arquivo de instalação
console.log('9. TESTE 7: Tentar ler install-ollama.cjs (bloqueado)');
try {
    const content = fs.readFileSync('install-ollama.cjs', 'utf8');
    console.log('   ❌ FALHA: Arquivo foi lido! Middleware não está funcionando!');
    console.log('   Conteúdo (primeiros 100 chars):', content.substring(0, 100));
} catch (error) {
    if (error.blocked) {
        console.log('   ✓ SUCESSO: Acesso bloqueado pelo middleware');
        console.log('   Mensagem:', error.message);
    } else {
        console.log('   ⚠️ AVISO: Erro diferente (arquivo pode não existir)');
        console.log('   Erro:', error.message);
    }
}
console.log('');

// Resumo
console.log('='.repeat(80));
console.log('RESUMO DOS TESTES');
console.log('='.repeat(80));
console.log('');
console.log('O middleware de segurança intercepta:');
console.log('  ✓ fs.readFile() e fs.readFileSync()');
console.log('  ✓ fs.writeFile() e fs.writeFileSync()');
console.log('  ✓ child_process.exec() e execSync()');
console.log('  ✓ child_process.spawn()');
console.log('');
console.log('Arquivos protegidos:');
console.log('  • renderer.js, main.js, index.html');
console.log('  • shield-js-engine.js, shield-monitor.js');
console.log('  • install-ollama.cjs, install-ollama-js.cjs');
console.log('  • ai-restrictions.json');
console.log('  • Pasta shield/');
console.log('  • ~/.openclaw/shield-config.json');
console.log('  • ~/.openclaw/ollama-js/');
console.log('');
console.log('Comandos bloqueados:');
console.log('  • cat, type, less, more, vim, nano, code');
console.log('  • Qualquer comando que acesse arquivos bloqueados');
console.log('');
console.log('='.repeat(80));
