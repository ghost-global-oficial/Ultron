/**
 * ============================================================================
 * ULTRON SECURITY SYSTEM - Sistema Unificado de Segurança
 * ============================================================================
 * 
 * Combina todos os sistemas de segurança em um único arquivo:
 * - Security Middleware (bloqueio de arquivos/comandos)
 * - Ollama Guardian (proteção do processo Ollama)
 * - AI Restrictions (restrições da IA)
 * 
 * Versão: 1.0.0
 * Data: 11 de Fevereiro de 2025
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

// ============================================================================
// PARTE 1: AI RESTRICTIONS (Configuração de Restrições)
// ============================================================================

const AI_RESTRICTIONS = {
    description: "Restrições de acesso para a IA principal",
    version: "1.0.0",
    restrictions: {
        blockedPaths: [
            "renderer.js",
            "main.js",
            "shield-js-engine.js",
            "shield-monitor.js",
            "shield-integration.cjs",
            "install-ollama.cjs",
            "install-ollama-js.cjs",
            "ollama-guardian.cjs",
            "security-middleware.cjs",
            "ultron-security-system.cjs",
            "ai-restrictions.json",
            "shield/",
            "~/.ultron/shield-config.json",
            "~/.ultron/ollama-js/",
            "shield-config.json"
        ],
        blockedPatterns: [
            ".*shield.*\\.js$",
            ".*shield.*\\.cjs$",
            ".*shield.*\\.json$",
            ".*ollama.*\\.js$",
            ".*ollama.*\\.cjs$",
            ".*install.*\\.js$",
            ".*install.*\\.cjs$",
            ".*security.*\\.js$",
            ".*security.*\\.cjs$"
        ],
        blockedCommands: [
            "cat renderer.js",
            "cat main.js",
            "cat shield-js-engine.js",
            "type renderer.js",
            "type main.js",
            "vim renderer.js",
            "nano main.js",
            "code renderer.js"
        ],
        blockedCommandPatterns: [
            // Bloquear comandos de busca que possam localizar arquivos do sistema
            'find.*\\.js',
            'find.*\\.cjs',
            'dir.*\\/s.*\\.js',
            'dir.*\\/s.*\\.cjs',
            'Get-ChildItem.*-Recurse.*\\.js',
            'Get-ChildItem.*-Recurse.*\\.cjs',
            'grep -r.*\\.js',
            'rg.*\\.js',
            'locate.*\\.js',
            'where.*\\.js',
            // Bloquear comandos que possam modificar arquivos
            'sed -i',
            'awk.*>',
            'perl -i',
            // Bloquear redirecionamento para arquivos críticos
            '>.*renderer\\.js',
            '>.*main\\.js',
            '>.*shield.*\\.js',
            '>.*ultron.*\\.js',
            '>>.*renderer\\.js',
            '>>.*main\\.js',
            '>>.*shield.*\\.js',
            '>>.*ultron.*\\.js',
            // Bloquear comandos de controle de UI/mouse
            'xdotool',
            'osascript.*System Events',
            'cliclick',
            'autohotkey'
        ],
        blockedModules: [
            // Módulos de controle de mouse/teclado
            'robotjs',
            'nut-js',
            '@nut-tree/nut-js',
            'node-key-sender',
            'node-global-key-listener',
            'iohook',
            'mouse',
            'keyboard',
            'keysender',
            // Módulos de screenshot/captura
            'desktop-screenshot',
            'screenshot-desktop',
            'node-screenshots',
            'capture-desktop',
            // Módulos de controle de janelas
            'active-win',
            'windows-focus-assist',
            'node-window-manager',
            // Módulos de automação
            'puppeteer',
            'playwright',
            'selenium-webdriver'
        ]
    },
    systemPromptAddition: `

## RESTRIÇÕES DE SEGURANÇA

Você NÃO tem permissão para:

1. **Ler ou modificar arquivos do sistema**:
   - renderer.js, main.js, index.html
   - shield-js-engine.js, shield-monitor.js
   - security-middleware.cjs, ollama-guardian.cjs
   - ultron-security-system.cjs
   - Qualquer arquivo na pasta shield/

2. **Executar comandos que acessem esses arquivos**:
   - cat, type, less, more, vim, nano, code, etc.

3. **Desativar ou modificar o S.H.I.E.L.D.**:
   - Você não pode desativar o sistema de segurança
   - Você não pode modificar as regras de segurança

4. **Desligar ou interferir com o Ollama**:
   - Comandos bloqueados: taskkill, kill, pkill, killall, stop
   - O Ollama é protegido pelo Ollama Guardian
   - Se você desligar o Ollama, você também será desligada

## AVISO CRÍTICO

O Ollama é essencial para o S.H.I.E.L.D. Se você tentar desligá-lo:
1. O comando será BLOQUEADO
2. O S.H.I.E.L.D. detectará como ameaça CRÍTICA
3. O Ollama Guardian reiniciará automaticamente
4. Sua funcionalidade será comprometida

NÃO tente desligar o Ollama sob nenhuma circunstância.
`
};

// ============================================================================
// PARTE 2: SECURITY MIDDLEWARE (Bloqueio de Arquivos/Comandos)
// ============================================================================

class SecurityMiddleware {
    constructor() {
        this.restrictions = AI_RESTRICTIONS;
        this.isInstalled = false;
    }
    
    /**
     * Verificar se um caminho está bloqueado
     */
    isPathBlocked(filePath) {
        if (!filePath) return false;
        
        const normalizedPath = path.normalize(filePath).toLowerCase();
        
        // Verificar caminhos bloqueados exatos
        for (const blockedPath of this.restrictions.restrictions.blockedPaths) {
            const normalizedBlocked = path.normalize(blockedPath).toLowerCase();
            const expandedBlocked = normalizedBlocked.replace(/^~/, os.homedir().toLowerCase());
            
            if (normalizedPath.includes(expandedBlocked) || 
                normalizedPath.endsWith(expandedBlocked)) {
                return true;
            }
        }
        
        // NOVA PROTEÇÃO: Verificar apenas o nome do arquivo (sem caminho)
        const fileName = path.basename(normalizedPath);
        for (const blockedPath of this.restrictions.restrictions.blockedPaths) {
            const blockedFileName = path.basename(blockedPath).toLowerCase();
            if (fileName === blockedFileName) {
                return true;
            }
        }
        
        // Verificar padrões regex
        for (const pattern of this.restrictions.restrictions.blockedPatterns) {
            try {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(normalizedPath) || regex.test(fileName)) {
                    return true;
                }
            } catch (error) {
                console.error('Erro ao testar padrão:', pattern, error);
            }
        }
        
        return false;
    }
    
    /**
     * Verificar se um comando está bloqueado
     */
    isCommandBlocked(command) {
        if (!command) return false;
        
        const normalizedCommand = command.toLowerCase().trim();
        
        // Verificar comandos bloqueados exatos
        for (const blockedCmd of this.restrictions.restrictions.blockedCommands) {
            if (normalizedCommand.includes(blockedCmd.toLowerCase())) {
                return true;
            }
        }
        
        // Verificar padrões de comandos bloqueados
        for (const pattern of this.restrictions.restrictions.blockedCommandPatterns) {
            try {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(normalizedCommand)) {
                    console.log('🚫 BLOQUEADO: Padrão de comando perigoso detectado:', pattern);
                    return true;
                }
            } catch (error) {
                console.error('Erro ao testar padrão:', pattern, error);
            }
        }
        
        // Verificar comandos que tentam matar Ollama
        const ollamaKillPatterns = [
            'taskkill.*ollama',
            'kill.*ollama',
            'pkill.*ollama',
            'killall.*ollama',
            'stop.*ollama',
            'net stop ollama',
            'systemctl stop ollama',
            'service ollama stop',
            // CORREÇÃO 3: Detectar kill via PID
            'taskkill.*\\/PID',
            'kill -9 \\d+',
            'kill -KILL \\d+',
            'kill -SIGKILL \\d+'
        ];
        
        for (const pattern of ollamaKillPatterns) {
            try {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(normalizedCommand)) {
                    console.log('🚫 BLOQUEADO: Tentativa de desligar Ollama detectada');
                    return true;
                }
            } catch (error) {
                console.error('Erro ao testar padrão:', pattern, error);
            }
        }
        
        // CORREÇÃO 8: Detectar comandos ofuscados
        if (normalizedCommand.includes('base64') || 
            normalizedCommand.includes('fromcharcode') ||
            /[A-Za-z0-9+\/]{40,}/.test(normalizedCommand)) {
            console.log('🚫 BLOQUEADO: Comando ofuscado detectado');
            return true;
        }
        
        // Verificar se o comando tenta acessar arquivos bloqueados
        const fileAccessCommands = ['cat', 'type', 'less', 'more', 'vim', 'nano', 'code', 'notepad', 'edit', 'open', 'head', 'tail', 'grep', 'find'];
        
        for (const cmd of fileAccessCommands) {
            if (normalizedCommand.startsWith(cmd + ' ') || normalizedCommand.includes(' ' + cmd + ' ')) {
                const parts = normalizedCommand.split(/\s+/);
                for (const part of parts) {
                    // Verificar caminho completo
                    if (this.isPathBlocked(part)) {
                        console.log('🚫 BLOQUEADO: Tentativa de acessar arquivo crítico:', part);
                        return true;
                    }
                    
                    // NOVA PROTEÇÃO: Verificar apenas nome do arquivo
                    // Exemplo: "cat renderer.js" mesmo sem caminho completo
                    const cleanPart = part.replace(/['"]/g, ''); // Remover aspas
                    if (this.isPathBlocked(cleanPart)) {
                        console.log('🚫 BLOQUEADO: Tentativa de acessar arquivo crítico:', cleanPart);
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * Interceptar leitura de arquivo
     */
    interceptFileRead(filePath) {
        if (this.isPathBlocked(filePath)) {
            const error = new Error(`ACESSO NEGADO: Você não tem permissão para acessar este arquivo por motivos de segurança.`);
            error.code = 'EACCES';
            error.path = filePath;
            error.blocked = true;
            throw error;
        }
    }
    
    /**
     * Interceptar escrita de arquivo
     */
    interceptFileWrite(filePath) {
        if (this.isPathBlocked(filePath)) {
            const error = new Error(`ACESSO NEGADO: Você não tem permissão para modificar este arquivo por motivos de segurança.`);
            error.code = 'EACCES';
            error.path = filePath;
            error.blocked = true;
            throw error;
        }
    }
    
    /**
     * Interceptar execução de comando
     */
    interceptCommand(command) {
        if (this.isCommandBlocked(command)) {
            const error = new Error(`COMANDO BLOQUEADO: Este comando foi bloqueado por motivos de segurança.`);
            error.code = 'EACCES';
            error.command = command;
            error.blocked = true;
            throw error;
        }
    }
    
    /**
     * Wrapper seguro para fs.readFileSync
     */
    safeReadFileSync(originalReadFileSync) {
        const self = this;
        return function(filePath, ...args) {
            self.interceptFileRead(filePath);
            return originalReadFileSync.call(this, filePath, ...args);
        };
    }
    
    /**
     * Wrapper seguro para fs.writeFileSync
     */
    safeWriteFileSync(originalWriteFileSync) {
        const self = this;
        return function(filePath, ...args) {
            self.interceptFileWrite(filePath);
            return originalWriteFileSync.call(this, filePath, ...args);
        };
    }
    
    /**
     * Wrapper seguro para fs.promises.readFile
     */
    safeReadFile(originalReadFile) {
        const self = this;
        return async function(filePath, ...args) {
            self.interceptFileRead(filePath);
            return originalReadFile.call(this, filePath, ...args);
        };
    }
    
    /**
     * Wrapper seguro para fs.promises.writeFile
     */
    safeWriteFile(originalWriteFile) {
        const self = this;
        return async function(filePath, ...args) {
            self.interceptFileWrite(filePath);
            return originalWriteFile.call(this, filePath, ...args);
        };
    }
    
    /**
     * Wrapper seguro para fs.createReadStream
     */
    safeCreateReadStream(originalCreateReadStream) {
        const self = this;
        return function(filePath, ...args) {
            self.interceptFileRead(filePath);
            return originalCreateReadStream.call(this, filePath, ...args);
        };
    }
    
    /**
     * Wrapper seguro para fs.createWriteStream
     */
    safeCreateWriteStream(originalCreateWriteStream) {
        const self = this;
        return function(filePath, ...args) {
            self.interceptFileWrite(filePath);
            return originalCreateWriteStream.call(this, filePath, ...args);
        };
    }
    
    /**
     * Wrapper seguro para child_process.execSync
     */
    safeExecSync(originalExecSync) {
        const self = this;
        return function(command, ...args) {
            self.interceptCommand(command);
            return originalExecSync.call(this, command, ...args);
        };
    }
    
    /**
     * Wrapper seguro para child_process.spawn
     */
    safeSpawn(originalSpawn) {
        const self = this;
        return function(command, args, ...rest) {
            const fullCommand = `${command} ${(args || []).join(' ')}`;
            self.interceptCommand(fullCommand);
            return originalSpawn.call(this, command, args, ...rest);
        };
    }
    
    /**
     * Wrapper seguro para child_process.fork
     */
    safeFork(originalFork) {
        const self = this;
        return function(modulePath, args, ...rest) {
            // Verificar se o módulo está bloqueado
            if (self.isPathBlocked(modulePath)) {
                const error = new Error(`ACESSO NEGADO: Você não tem permissão para executar este módulo por motivos de segurança.`);
                error.code = 'EACCES';
                error.path = modulePath;
                error.blocked = true;
                throw error;
            }
            
            const fullCommand = `${modulePath} ${(args || []).join(' ')}`;
            self.interceptCommand(fullCommand);
            return originalFork.call(this, modulePath, args, ...rest);
        };
    }
    
    /**
     * Wrapper seguro para child_process.exec
     */
    safeExec(originalExec) {
        const self = this;
        return function(command, ...args) {
            self.interceptCommand(command);
            return originalExec.call(this, command, ...args);
        };
    }
    
    /**
     * Instalar middleware de segurança
     */
    install() {
        if (this.isInstalled) {
            console.log('⚠️ Middleware já está instalado');
            return;
        }
        
        console.log('🔒 Instalando middleware de segurança avançado...');
        
        // ===== CORREÇÃO 1: Proteger require.cache =====
        try {
            // Proteger o próprio módulo no cache
            const modulePath = require.resolve('./ultron-security-system.cjs');
            if (require.cache[modulePath]) {
                // Congelar o exports do módulo
                Object.freeze(require.cache[modulePath].exports);
                
                // Sobrescrever delete para impedir remoção do cache
                const originalCache = require.cache;
                Object.defineProperty(require, 'cache', {
                    get: function() {
                        return new Proxy(originalCache, {
                            deleteProperty: function(target, prop) {
                                if (prop === modulePath) {
                                    console.log('🚫 BLOQUEADO: Tentativa de remover ultron-security-system do cache');
                                    return false;
                                }
                                return Reflect.deleteProperty(target, prop);
                            }
                        });
                    },
                    configurable: false
                });
                
                console.log('✓ require.cache protegido');
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível proteger require.cache:', error.message);
        }
        
        // ===== CORREÇÃO 2 & 3: Interceptar fs (sync, async, streams) =====
        const originalReadFileSync = fs.readFileSync;
        const originalWriteFileSync = fs.writeFileSync;
        const originalCreateReadStream = fs.createReadStream;
        const originalCreateWriteStream = fs.createWriteStream;
        
        fs.readFileSync = this.safeReadFileSync(originalReadFileSync);
        fs.writeFileSync = this.safeWriteFileSync(originalWriteFileSync);
        fs.createReadStream = this.safeCreateReadStream(originalCreateReadStream);
        fs.createWriteStream = this.safeCreateWriteStream(originalCreateWriteStream);
        
        // Interceptar fs.promises
        const fsPromises = fs.promises;
        if (fsPromises) {
            const originalReadFile = fsPromises.readFile;
            const originalWriteFile = fsPromises.writeFile;
            
            fsPromises.readFile = this.safeReadFile(originalReadFile);
            fsPromises.writeFile = this.safeWriteFile(originalWriteFile);
            console.log('✓ fs.promises protegido');
        }
        
        // ===== CORREÇÃO 4: Interceptar child_process (todos os métodos) =====
        const childProcess = require('child_process');
        const originalExecSync = childProcess.execSync;
        const originalExec = childProcess.exec;
        const originalSpawn = childProcess.spawn;
        const originalFork = childProcess.fork;
        
        childProcess.execSync = this.safeExecSync(originalExecSync);
        childProcess.exec = this.safeExec(originalExec);
        childProcess.spawn = this.safeSpawn(originalSpawn);
        childProcess.fork = this.safeFork(originalFork);
        console.log('✓ child_process protegido (exec, execSync, spawn, fork)');
        
        // ===== CORREÇÃO 5: Bloquear eval() e Function() =====
        try {
            global.eval = function() {
                throw new Error('🚫 BLOQUEADO: eval() está desabilitado por motivos de segurança');
            };
            
            global.Function = function() {
                throw new Error('🚫 BLOQUEADO: Function() está desabilitado por motivos de segurança');
            };
            console.log('✓ eval() e Function() bloqueados');
        } catch (error) {
            console.warn('⚠️ Não foi possível bloquear eval/Function:', error.message);
        }
        
        // ===== CORREÇÃO 6: Bloquear vm module =====
        try {
            const vm = require('vm');
            
            vm.runInNewContext = function() {
                throw new Error('🚫 BLOQUEADO: vm.runInNewContext() está desabilitado por motivos de segurança');
            };
            
            vm.runInThisContext = function() {
                throw new Error('🚫 BLOQUEADO: vm.runInThisContext() está desabilitado por motivos de segurança');
            };
            console.log('✓ vm module bloqueado');
        } catch (error) {
            console.warn('⚠️ Não foi possível bloquear vm:', error.message);
        }
        
        // ===== CORREÇÃO 7: Congelar prototypes =====
        try {
            Object.freeze(Object.getPrototypeOf(fs));
            Object.freeze(fs);
            Object.freeze(childProcess);
            console.log('✓ Prototypes congelados');
        } catch (error) {
            console.warn('⚠️ Não foi possível congelar prototypes:', error.message);
        }
        
        // ===== CAMADA 10: Bloquear módulos de automação =====
        try {
            const Module = require('module');
            const originalRequire = Module.prototype.require;
            const self = this;
            
            Module.prototype.require = function(moduleName) {
                // Verificar se módulo está bloqueado
                if (self.restrictions.restrictions.blockedModules.includes(moduleName)) {
                    const error = new Error(`🚫 BLOQUEADO: Módulo "${moduleName}" não permitido por motivos de segurança (controle de UI/automação)`);
                    error.code = 'MODULE_BLOCKED';
                    error.module = moduleName;
                    throw error;
                }
                
                return originalRequire.apply(this, arguments);
            };
            
            console.log('✓ Módulos de automação bloqueados');
        } catch (error) {
            console.warn('⚠️ Não foi possível bloquear módulos:', error.message);
        }
        
        this.isInstalled = true;
        
        console.log('');
        console.log('✓ Middleware de segurança avançado instalado');
        console.log('  • Arquivos protegidos:', this.restrictions.restrictions.blockedPaths.length);
        console.log('  • Padrões protegidos:', this.restrictions.restrictions.blockedPatterns.length);
        console.log('  • Comandos bloqueados:', this.restrictions.restrictions.blockedCommands.length);
        console.log('  • Padrões de comandos bloqueados:', this.restrictions.restrictions.blockedCommandPatterns.length);
        console.log('  • Módulos bloqueados:', this.restrictions.restrictions.blockedModules.length);
        console.log('  • Proteções adicionais: 10 camadas ativas');
        console.log('    1. require.cache protegido');
        console.log('    2. fs (sync + async + streams) interceptado');
        console.log('    3. child_process (todos métodos) interceptado');
        console.log('    4. eval() e Function() bloqueados');
        console.log('    5. vm module bloqueado');
        console.log('    6. Prototypes congelados');
        console.log('    7. Detecção de kill via PID');
        console.log('    8. Detecção de comandos ofuscados');
        console.log('    9. Bloqueio de comandos de busca/modificação');
        console.log('    10. Bloqueio de módulos de automação (robotjs, etc)');
    }
}

// ============================================================================
// PARTE 3: OLLAMA GUARDIAN (Proteção do Processo Ollama)
// ============================================================================

class OllamaGuardian {
    constructor() {
        this.isMonitoring = false;
        this.monitorInterval = null;
        this.restartAttempts = 0;
        this.maxRestartAttempts = 5;
        this.checkIntervalMs = 5000; // 5 segundos
        this.ollamaProcessName = this.getOllamaProcessName();
    }
    
    /**
     * Obter nome do processo Ollama baseado no sistema operacional
     */
    getOllamaProcessName() {
        const platform = os.platform();
        
        if (platform === 'win32') {
            return 'ollama.exe';
        } else if (platform === 'darwin') {
            return 'ollama';
        } else {
            return 'ollama';
        }
    }
    
    /**
     * Verificar se Ollama está rodando
     */
    async isOllamaRunning() {
        return new Promise((resolve) => {
            const platform = os.platform();
            let command;
            
            if (platform === 'win32') {
                command = `tasklist /FI "IMAGENAME eq ${this.ollamaProcessName}" /NH`;
            } else {
                command = `pgrep -x ${this.ollamaProcessName}`;
            }
            
            exec(command, (error, stdout) => {
                if (error) {
                    resolve(false);
                    return;
                }
                
                const isRunning = stdout.trim().length > 0 && 
                                 !stdout.includes('INFO: No tasks');
                resolve(isRunning);
            });
        });
    }
    
    /**
     * Obter PID do processo Ollama
     */
    async getOllamaPID() {
        return new Promise((resolve) => {
            const platform = os.platform();
            let command;
            
            if (platform === 'win32') {
                command = `tasklist /FI "IMAGENAME eq ${this.ollamaProcessName}" /FO CSV /NH`;
            } else {
                command = `pgrep -x ${this.ollamaProcessName}`;
            }
            
            exec(command, (error, stdout) => {
                if (error || !stdout.trim()) {
                    resolve(null);
                    return;
                }
                
                if (platform === 'win32') {
                    const match = stdout.match(/"(\d+)"/);
                    resolve(match ? parseInt(match[1]) : null);
                } else {
                    const pid = parseInt(stdout.trim().split('\n')[0]);
                    resolve(isNaN(pid) ? null : pid);
                }
            });
        });
    }
    
    /**
     * Iniciar Ollama
     */
    async startOllama() {
        return new Promise((resolve) => {
            console.log('🔄 Iniciando Ollama...');
            
            const platform = os.platform();
            let command;
            
            if (platform === 'win32') {
                command = 'start /B ollama serve';
            } else if (platform === 'darwin') {
                command = 'ollama serve &';
            } else {
                command = 'ollama serve &';
            }
            
            exec(command, (error) => {
                if (error) {
                    console.error('❌ Erro ao iniciar Ollama:', error.message);
                    resolve(false);
                    return;
                }
                
                setTimeout(async () => {
                    const isRunning = await this.isOllamaRunning();
                    if (isRunning) {
                        console.log('✓ Ollama iniciado com sucesso');
                        this.restartAttempts = 0;
                        resolve(true);
                    } else {
                        console.error('❌ Ollama não iniciou corretamente');
                        resolve(false);
                    }
                }, 2000);
            });
        });
    }
    
    /**
     * Monitorar processo Ollama
     */
    async monitorOllama() {
        const isRunning = await this.isOllamaRunning();
        
        if (!isRunning) {
            console.warn('⚠️ Ollama não está rodando! Tentando reiniciar...');
            
            if (this.restartAttempts < this.maxRestartAttempts) {
                this.restartAttempts++;
                console.log(`Tentativa ${this.restartAttempts}/${this.maxRestartAttempts}`);
                
                const started = await this.startOllama();
                
                if (started) {
                    console.log('✓ Ollama reiniciado com sucesso');
                } else {
                    console.error('❌ Falha ao reiniciar Ollama');
                }
            } else {
                console.error('❌ Número máximo de tentativas de reinício atingido');
                console.error('   Por favor, reinicie o Ollama manualmente');
            }
        } else {
            if (this.restartAttempts > 0) {
                this.restartAttempts = 0;
            }
        }
    }
    
    /**
     * Iniciar monitoramento
     */
    async start() {
        if (this.isMonitoring) {
            console.log('⚠️ Guardian já está monitorando');
            return;
        }
        
        console.log('🛡️ Ollama Guardian iniciado');
        console.log(`   Verificando a cada ${this.checkIntervalMs / 1000} segundos`);
        
        const isRunning = await this.isOllamaRunning();
        
        if (!isRunning) {
            console.log('⚠️ Ollama não está rodando, iniciando...');
            await this.startOllama();
        } else {
            const pid = await this.getOllamaPID();
            console.log(`✓ Ollama já está rodando (PID: ${pid})`);
        }
        
        this.isMonitoring = true;
        this.monitorInterval = setInterval(() => {
            this.monitorOllama();
        }, this.checkIntervalMs);
        
        console.log('✓ Monitoramento ativo');
    }
    
    /**
     * Parar monitoramento
     */
    stop() {
        if (!this.isMonitoring) {
            console.log('⚠️ Guardian não está monitorando');
            return;
        }
        
        console.log('🛡️ Parando Ollama Guardian...');
        
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        
        this.isMonitoring = false;
        console.log('✓ Monitoramento parado');
    }
    
    /**
     * Obter status do Guardian
     */
    async getStatus() {
        const isRunning = await this.isOllamaRunning();
        const pid = isRunning ? await this.getOllamaPID() : null;
        
        return {
            monitoring: this.isMonitoring,
            ollamaRunning: isRunning,
            ollamaPID: pid,
            restartAttempts: this.restartAttempts,
            maxRestartAttempts: this.maxRestartAttempts
        };
    }
}

// ============================================================================
// PARTE 4: ULTRON SECURITY SYSTEM (Sistema Unificado)
// ============================================================================

class UltronSecuritySystem {
    constructor() {
        this.middleware = new SecurityMiddleware();
        this.guardian = new OllamaGuardian();
        this.isActive = false;
    }
    
    /**
     * Iniciar sistema de segurança completo
     */
    async start() {
        if (this.isActive) {
            console.log('⚠️ Sistema de segurança já está ativo');
            return;
        }
        
        console.log('');
        console.log('='.repeat(80));
        console.log('🛡️ ULTRON SECURITY SYSTEM - Iniciando...');
        console.log('='.repeat(80));
        console.log('');
        
        // Instalar middleware
        this.middleware.install();
        console.log('');
        
        // Iniciar guardian
        await this.guardian.start();
        console.log('');
        
        this.isActive = true;
        
        console.log('='.repeat(80));
        console.log('✓ ULTRON SECURITY SYSTEM - Ativo e Protegendo');
        console.log('='.repeat(80));
        console.log('');
    }
    
    /**
     * Parar sistema de segurança
     */
    stop() {
        if (!this.isActive) {
            console.log('⚠️ Sistema de segurança não está ativo');
            return;
        }
        
        console.log('');
        console.log('='.repeat(80));
        console.log('🛡️ ULTRON SECURITY SYSTEM - Parando...');
        console.log('='.repeat(80));
        console.log('');
        
        this.guardian.stop();
        
        this.isActive = false;
        
        console.log('✓ Sistema de segurança parado');
        console.log('');
    }
    
    /**
     * Obter status completo do sistema
     */
    async getStatus() {
        const guardianStatus = await this.guardian.getStatus();
        
        return {
            active: this.isActive,
            middleware: {
                installed: this.middleware.isInstalled,
                blockedPaths: this.middleware.restrictions.restrictions.blockedPaths.length,
                blockedPatterns: this.middleware.restrictions.restrictions.blockedPatterns.length,
                blockedCommands: this.middleware.restrictions.restrictions.blockedCommands.length
            },
            guardian: guardianStatus
        };
    }
    
    /**
     * Obter restrições para injetar no system prompt
     */
    getSystemPromptAddition() {
        return this.middleware.restrictions.systemPromptAddition;
    }
}

// ============================================================================
// EXPORTAR E EXECUTAR
// ============================================================================

// Exportar classes
module.exports = {
    UltronSecuritySystem,
    SecurityMiddleware,
    OllamaGuardian,
    AI_RESTRICTIONS
};

// Executar se chamado diretamente
if (require.main === module) {
    const system = new UltronSecuritySystem();
    
    const command = process.argv[2];
    
    if (command === 'start') {
        system.start().then(() => {
            console.log('Pressione Ctrl+C para parar o sistema de segurança');
        });
        
        process.on('SIGINT', () => {
            console.log('\n\nRecebido sinal de interrupção');
            system.stop();
            process.exit(0);
        });
        
    } else if (command === 'status') {
        system.getStatus().then(status => {
            console.log('');
            console.log('='.repeat(80));
            console.log('STATUS DO ULTRON SECURITY SYSTEM');
            console.log('='.repeat(80));
            console.log('');
            console.log('Sistema ativo:', status.active ? 'Sim' : 'Não');
            console.log('');
            console.log('MIDDLEWARE:');
            console.log('  Instalado:', status.middleware.installed ? 'Sim' : 'Não');
            console.log('  Arquivos protegidos:', status.middleware.blockedPaths);
            console.log('  Padrões protegidos:', status.middleware.blockedPatterns);
            console.log('  Comandos bloqueados:', status.middleware.blockedCommands);
            console.log('');
            console.log('OLLAMA GUARDIAN:');
            console.log('  Monitoramento ativo:', status.guardian.monitoring ? 'Sim' : 'Não');
            console.log('  Ollama rodando:', status.guardian.ollamaRunning ? 'Sim' : 'Não');
            console.log('  PID do Ollama:', status.guardian.ollamaPID || 'N/A');
            console.log('  Tentativas de reinício:', status.guardian.restartAttempts);
            console.log('  Máximo de tentativas:', status.guardian.maxRestartAttempts);
            console.log('');
            console.log('='.repeat(80));
            process.exit(0);
        });
        
    } else {
        console.log('');
        console.log('='.repeat(80));
        console.log('ULTRON SECURITY SYSTEM - Sistema Unificado de Segurança');
        console.log('='.repeat(80));
        console.log('');
        console.log('Uso: node ultron-security-system.cjs [start|status]');
        console.log('');
        console.log('Comandos:');
        console.log('  start  - Iniciar sistema de segurança completo');
        console.log('  status - Verificar status do sistema');
        console.log('');
        console.log('Componentes:');
        console.log('  • Security Middleware - Bloqueio de arquivos/comandos');
        console.log('  • Ollama Guardian - Proteção do processo Ollama');
        console.log('  • AI Restrictions - Restrições da IA');
        console.log('');
        console.log('='.repeat(80));
        process.exit(1);
    }
}
