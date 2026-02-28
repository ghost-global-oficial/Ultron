#!/usr/bin/env node

/**
 * Script para instalar ollama-js do GitHub
 * Usado pelo S.H.I.E.L.D. para análise de segurança
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Diretório de instalação
const ollamaJsDir = path.join(os.homedir(), '.openclaw', 'ollama-js');

/**
 * Verificar se ollama-js já está instalado
 */
function isOllamaJsInstalled() {
    try {
        const packageJsonPath = path.join(ollamaJsDir, 'package.json');
        return fs.existsSync(packageJsonPath);
    } catch (error) {
        return false;
    }
}

/**
 * Instalar ollama-js do GitHub
 */
async function installOllamaJs(onProgress) {
    try {
        console.log('=== INSTALAÇÃO DO OLLAMA-JS ===');
        
        // Criar diretório se não existir
        if (!fs.existsSync(ollamaJsDir)) {
            fs.mkdirSync(ollamaJsDir, { recursive: true });
        }
        
        // Etapa 1: Clonar repositório (40%)
        onProgress && onProgress(10, 'Clonando repositório do GitHub...');
        console.log('📦 Clonando repositório...');
        
        const gitClone = spawn('git', [
            'clone',
            'https://github.com/ollama/ollama-js.git',
            ollamaJsDir
        ], {
            stdio: 'pipe'
        });
        
        await new Promise((resolve, reject) => {
            gitClone.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Git clone falhou com código ${code}`));
                }
            });
            gitClone.on('error', reject);
        });
        
        onProgress && onProgress(40, 'Repositório clonado com sucesso');
        console.log('✓ Repositório clonado');
        
        // Etapa 2: Instalar dependências (80%)
        onProgress && onProgress(50, 'Instalando dependências...');
        console.log('📦 Instalando dependências...');
        
        const npmInstall = spawn('npm', ['install', '--production'], {
            cwd: ollamaJsDir,
            stdio: 'pipe',
            shell: true
        });
        
        let installOutput = '';
        npmInstall.stdout.on('data', (data) => {
            installOutput += data.toString();
            // Atualizar progresso baseado na saída
            if (installOutput.includes('added')) {
                onProgress && onProgress(70, 'Instalando pacotes...');
            }
        });
        
        await new Promise((resolve, reject) => {
            npmInstall.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`npm install falhou com código ${code}`));
                }
            });
            npmInstall.on('error', reject);
        });
        
        onProgress && onProgress(90, 'Dependências instaladas');
        console.log('✓ Dependências instaladas');
        
        // Etapa 3: Verificar instalação (100%)
        onProgress && onProgress(95, 'Verificando instalação...');
        console.log('🔍 Verificando instalação...');
        
        const packageJsonPath = path.join(ollamaJsDir, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('Instalação falhou: package.json não encontrado');
        }
        
        onProgress && onProgress(100, 'Ollama-js instalado com sucesso!');
        console.log('✓ Ollama-js instalado com sucesso!');
        console.log('📁 Localização:', ollamaJsDir);
        
        return {
            success: true,
            path: ollamaJsDir
        };
        
    } catch (error) {
        console.error('❌ Erro ao instalar ollama-js:', error.message);
        onProgress && onProgress(0, `Erro: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Desinstalar ollama-js
 */
function uninstallOllamaJs() {
    try {
        if (fs.existsSync(ollamaJsDir)) {
            fs.rmSync(ollamaJsDir, { recursive: true, force: true });
            console.log('✓ Ollama-js desinstalado');
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Erro ao desinstalar ollama-js:', error.message);
        return false;
    }
}

// Exportar funções
module.exports = {
    isOllamaJsInstalled,
    installOllamaJs,
    uninstallOllamaJs,
    ollamaJsDir
};

// Executar se chamado diretamente
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'check') {
        const installed = isOllamaJsInstalled();
        console.log(installed ? 'installed' : 'not-installed');
        process.exit(installed ? 0 : 1);
    } else if (command === 'install') {
        installOllamaJs((progress, message) => {
            console.log(`[${progress}%] ${message}`);
        }).then(result => {
            process.exit(result.success ? 0 : 1);
        });
    } else if (command === 'uninstall') {
        const success = uninstallOllamaJs();
        process.exit(success ? 0 : 1);
    } else {
        console.log('Uso: node install-ollama-js.cjs [check|install|uninstall]');
        process.exit(1);
    }
}
