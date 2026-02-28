// Script para instalar Ollama automaticamente
const { execSync, spawn } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const OLLAMA_VERSION = 'latest';
const OLLAMA_MODEL = 'llama3.2:latest';

class OllamaInstaller {
    constructor() {
        this.platform = os.platform();
        this.arch = os.arch();
        this.ollamaPath = this.getOllamaPath();
    }
    
    getOllamaPath() {
        if (this.platform === 'win32') {
            return path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Ollama', 'ollama.exe');
        } else if (this.platform === 'darwin') {
            return '/usr/local/bin/ollama';
        } else {
            return '/usr/local/bin/ollama';
        }
    }
    
    isInstalled() {
        try {
            if (fs.existsSync(this.ollamaPath)) {
                console.log('✓ Ollama já está instalado:', this.ollamaPath);
                return true;
            }
            
            // Tentar executar comando
            execSync('ollama --version', { stdio: 'ignore' });
            console.log('✓ Ollama encontrado no PATH');
            return true;
        } catch (error) {
            console.log('✗ Ollama não está instalado');
            return false;
        }
    }
    
    async downloadInstaller() {
        console.log('📥 Baixando instalador do Ollama...');
        
        let url;
        let filename;
        
        if (this.platform === 'win32') {
            url = 'https://ollama.ai/download/OllamaSetup.exe';
            filename = 'OllamaSetup.exe';
        } else if (this.platform === 'darwin') {
            url = 'https://ollama.ai/download/Ollama-darwin.zip';
            filename = 'Ollama-darwin.zip';
        } else {
            // Linux usa script de instalação
            return null;
        }
        
        const tempDir = os.tmpdir();
        const installerPath = path.join(tempDir, filename);
        
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(installerPath);
            
            https.get(url, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    // Seguir redirect
                    https.get(response.headers.location, (redirectResponse) => {
                        redirectResponse.pipe(file);
                        
                        file.on('finish', () => {
                            file.close();
                            console.log('✓ Download concluído:', installerPath);
                            resolve(installerPath);
                        });
                    }).on('error', reject);
                } else {
                    response.pipe(file);
                    
                    file.on('finish', () => {
                        file.close();
                        console.log('✓ Download concluído:', installerPath);
                        resolve(installerPath);
                    });
                }
            }).on('error', (error) => {
                fs.unlink(installerPath, () => {});
                reject(error);
            });
        });
    }
    
    async install() {
        console.log('🔧 Instalando Ollama...');
        
        if (this.platform === 'win32') {
            return this.installWindows();
        } else if (this.platform === 'darwin') {
            return this.installMacOS();
        } else {
            return this.installLinux();
        }
    }
    
    async installWindows() {
        try {
            const installerPath = await this.downloadInstaller();
            
            console.log('🚀 Executando instalador...');
            console.log('⚠️ Aguarde a instalação concluir...');
            
            // Executar instalador silenciosamente
            execSync(`"${installerPath}" /S`, {
                stdio: 'inherit',
                windowsHide: false
            });
            
            // Aguardar instalação
            await this.waitForInstallation();
            
            console.log('✓ Ollama instalado com sucesso!');
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao instalar Ollama:', error.message);
            return false;
        }
    }
    
    async installMacOS() {
        try {
            console.log('📦 Instalando Ollama no macOS...');
            
            // Usar Homebrew se disponível
            try {
                execSync('brew --version', { stdio: 'ignore' });
                console.log('🍺 Usando Homebrew...');
                execSync('brew install ollama', { stdio: 'inherit' });
                console.log('✓ Ollama instalado via Homebrew!');
                return true;
            } catch (error) {
                // Homebrew não disponível, baixar instalador
                const installerPath = await this.downloadInstaller();
                console.log('📦 Descompactando e instalando...');
                execSync(`unzip -o "${installerPath}" -d /Applications`, { stdio: 'inherit' });
                console.log('✓ Ollama instalado!');
                return true;
            }
            
        } catch (error) {
            console.error('❌ Erro ao instalar Ollama:', error.message);
            return false;
        }
    }
    
    async installLinux() {
        try {
            console.log('🐧 Instalando Ollama no Linux...');
            
            // Usar script oficial de instalação
            execSync('curl -fsSL https://ollama.ai/install.sh | sh', {
                stdio: 'inherit',
                shell: '/bin/bash'
            });
            
            console.log('✓ Ollama instalado com sucesso!');
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao instalar Ollama:', error.message);
            return false;
        }
    }
    
    async waitForInstallation(maxWait = 60000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            if (this.isInstalled()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return false;
    }
    
    async startOllama() {
        console.log('🚀 Iniciando Ollama...');
        
        try {
            // Verificar se já está rodando
            try {
                const response = await fetch('http://localhost:11434/api/tags');
                if (response.ok) {
                    console.log('✓ Ollama já está rodando');
                    return true;
                }
            } catch (error) {
                // Não está rodando, iniciar
            }
            
            // Iniciar Ollama em background
            if (this.platform === 'win32') {
                // Windows: iniciar como processo em background
                spawn('ollama', ['serve'], {
                    detached: true,
                    stdio: 'ignore',
                    windowsHide: true
                }).unref();
            } else {
                // Linux/Mac: iniciar em background
                spawn('ollama', ['serve'], {
                    detached: true,
                    stdio: 'ignore'
                }).unref();
            }
            
            // Aguardar Ollama iniciar
            console.log('⏳ Aguardando Ollama iniciar...');
            await this.waitForOllama();
            
            console.log('✓ Ollama iniciado com sucesso!');
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao iniciar Ollama:', error.message);
            return false;
        }
    }
    
    async waitForOllama(maxWait = 30000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            try {
                const response = await fetch('http://localhost:11434/api/tags');
                if (response.ok) {
                    return true;
                }
            } catch (error) {
                // Ainda não está pronto
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return false;
    }
    
    async installModel() {
        console.log(`📦 Instalando modelo ${OLLAMA_MODEL}...`);
        console.log('⚠️ Isso pode demorar alguns minutos (download de ~2GB)...');
        
        try {
            // Verificar se modelo já está instalado
            const response = await fetch('http://localhost:11434/api/tags');
            const data = await response.json();
            
            const modelExists = data.models && data.models.some(m => m.name === OLLAMA_MODEL);
            
            if (modelExists) {
                console.log('✓ Modelo já está instalado');
                return true;
            }
            
            // Instalar modelo
            execSync(`ollama pull ${OLLAMA_MODEL}`, {
                stdio: 'inherit'
            });
            
            console.log('✓ Modelo instalado com sucesso!');
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao instalar modelo:', error.message);
            return false;
        }
    }
    
    async setup() {
        console.log('=== INSTALAÇÃO DO OLLAMA ===\n');
        
        // 1. Verificar se já está instalado
        if (this.isInstalled()) {
            console.log('✓ Ollama já está instalado\n');
        } else {
            // 2. Instalar Ollama
            const installed = await this.install();
            if (!installed) {
                console.error('\n❌ Falha na instalação do Ollama');
                return false;
            }
            console.log('');
        }
        
        // 3. Iniciar Ollama
        const started = await this.startOllama();
        if (!started) {
            console.error('\n❌ Falha ao iniciar Ollama');
            return false;
        }
        console.log('');
        
        // 4. Instalar modelo
        const modelInstalled = await this.installModel();
        if (!modelInstalled) {
            console.error('\n❌ Falha ao instalar modelo');
            return false;
        }
        console.log('');
        
        console.log('=== INSTALAÇÃO CONCLUÍDA ===');
        console.log('✓ Ollama instalado e configurado');
        console.log('✓ Modelo llama3.2:latest instalado');
        console.log('✓ Serviço rodando em http://localhost:11434');
        
        return true;
    }
}

// Executar instalação se chamado diretamente
if (require.main === module) {
    const installer = new OllamaInstaller();
    
    installer.setup()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Erro fatal:', error);
            process.exit(1);
        });
}

module.exports = OllamaInstaller;
