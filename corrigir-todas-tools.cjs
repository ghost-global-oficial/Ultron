#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== CORRIGINDO TODAS AS CONFIGURAÇÕES DE TOOLS ===\n');

const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');

if (!fs.existsSync(configPath)) {
    console.log('❌ Arquivo de configuração não encontrado');
    process.exit(1);
}

// Ler configuração atual
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('📝 Configurando todas as tools para funcionar no Windows...\n');

// Inicializar tools se não existir
if (!config.tools) {
    config.tools = {};
}

// 1. EXEC - Para executar comandos e abrir aplicativos
config.tools.exec = {
    host: 'gateway',      // Rodar no host local (Windows)
    security: 'full',     // Sem restrições
    ask: 'off'            // Sem aprovação manual
};
console.log('✅ EXEC configurado:');
console.log('   - Roda no Windows (não em Docker)');
console.log('   - Sem restrições de segurança');
console.log('   - Sem aprovação manual');
console.log('');

// 2. BROWSER - Para controlar navegador
if (!config.browser) {
    config.browser = {};
}
config.browser.enabled = true;
config.browser.allowHostControl = true;  // Permitir controle do navegador do host
console.log('✅ BROWSER configurado:');
console.log('   - Controle do navegador habilitado');
console.log('   - Pode controlar navegador do Windows');
console.log('');

// 3. AGENTS - Configurar agente padrão se não existir
if (!config.agents) {
    config.agents = {
        defaults: {
            sandbox: {
                enabled: false  // Desabilitar sandbox por padrão
            }
        },
        list: []
    };
    console.log('✅ AGENTS configurado:');
    console.log('   - Sandbox desabilitado (roda direto no Windows)');
    console.log('');
} else {
    // Se já existe, apenas garantir que sandbox está desabilitado
    if (!config.agents.defaults) {
        config.agents.defaults = {};
    }
    if (!config.agents.defaults.sandbox) {
        config.agents.defaults.sandbox = {};
    }
    config.agents.defaults.sandbox.enabled = false;
    console.log('✅ AGENTS atualizado:');
    console.log('   - Sandbox desabilitado');
    console.log('');
}

// Salvar configuração
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

console.log('═══════════════════════════════════════════════════');
console.log('✅ TODAS AS CONFIGURAÇÕES ATUALIZADAS!');
console.log('═══════════════════════════════════════════════════');
console.log('');
console.log('📋 Resumo das mudanças:');
console.log('');
console.log('1. EXEC (executar comandos):');
console.log('   • Host: gateway (Windows local)');
console.log('   • Security: full (sem restrições)');
console.log('   • Ask: off (sem aprovação)');
console.log('');
console.log('2. BROWSER (controlar navegador):');
console.log('   • Enabled: true');
console.log('   • AllowHostControl: true');
console.log('');
console.log('3. AGENTS (agentes):');
console.log('   • Sandbox: disabled (roda no Windows)');
console.log('');
console.log('🔄 Reinicie o ULTRON para aplicar as mudanças');
console.log('');
console.log('💡 Agora a IA pode:');
console.log('   ✓ Abrir aplicativos do Windows');
console.log('   ✓ Executar comandos no terminal');
console.log('   ✓ Controlar o navegador');
console.log('   ✓ Acessar arquivos do sistema');
console.log('');
