const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuração do Gateway
const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');
let currentConfig = {};

// Estado da configuração
let configState = {
    step: 'welcome',
    language: 'en-US', // Idioma padrão: inglês
    executionMode: 'host', // 'sandbox' ou 'host' - onde a IA executa comandos
    gatewayMode: 'local', // Sempre local
    gatewayPort: 18789, // Sempre 18789
    gatewayBind: 'auto', // Aceitar qualquer rede (configurado automaticamente)
    customBindHost: null, // IP customizado quando bind='lan'
    authMode: 'token', // Sempre token
    authToken: null, // Gerado automaticamente
    provider: null, // Google, Claude, Openrouter, Grok, OpenAI, Local
    apiKey: null, // Chave API do provedor
    model: null, // Depende do provider
    vaultStep: 'passwords', // Controla qual categoria do vault está sendo exibida
    vault: {
        passwords: [],
        creditCards: [],
        apiKeys: [],
        notes: [],
        aiRules: []
    }
    // Shield removido completamente
};

// Modelos disponíveis por provedor
const modelsByProvider = {
    google: [
        { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
        { id: 'google/gemini-3.0-pro', name: 'Gemini 3.0 Pro' },
        { id: 'google/gemini-3.0-flash', name: 'Gemini 3.0 Flash' }
    ],
    claude: [
        { id: 'anthropic/claude-opus-4.6', name: 'Claude 4.6 Opus' },
        { id: 'anthropic/claude-opus-4.5', name: 'Claude 4.5 Opus' },
        { id: 'anthropic/claude-sonnet-4', name: 'Claude 4 Sonnet' },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
        { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku' },
        { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' }
    ],
    openrouter: [
        // Anthropic via OpenRouter
        { id: 'openrouter/anthropic/claude-opus-4.6', name: 'Claude Opus 4.6 ⭐⭐⭐' },
        { id: 'openrouter/anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet ⭐' },
        { id: 'openrouter/anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku (Rápido)' },
        
        // DeepSeek via OpenRouter
        { id: 'openrouter/deepseek/deepseek-v3.2', name: 'DeepSeek V3.2 ⭐⭐' },
        { id: 'openrouter/deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 (Free) ⭐' },
        
        // Google via OpenRouter
        { id: 'openrouter/google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free) ⭐' },
        { id: 'openrouter/google/gemini-exp-1206:free', name: 'Gemini Exp 1206 (Free)' },
        
        // Zhipu AI (GLM) via OpenRouter
        { id: 'openrouter/z-ai/glm-4.7', name: 'GLM-4.7 ⭐⭐' },
        { id: 'openrouter/z-ai/glm-4.5-air:free', name: 'GLM-4.5 Air (Free) ⭐' },
        
        // Moonshot AI via OpenRouter
        { id: 'openrouter/moonshotai/kimi-k2.5', name: 'Kimi K2.5 ⭐⭐' },
        
        // Meta via OpenRouter
        { id: 'openrouter/meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free) ⭐' },
        { id: 'openrouter/meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (Free)' },
        
        // OpenAI via OpenRouter
        { id: 'openrouter/openai/gpt-oss-120b:free', name: 'GPT-OSS 120B (Free) ⭐' },
        
        // Qwen via OpenRouter
        { id: 'openrouter/qwen/qwen-2.5-7b-instruct:free', name: 'Qwen 2.5 7B (Free)' },
        
        // Mistral via OpenRouter
        { id: 'openrouter/mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)' }
    ],
    grok: [
        { id: 'xai/grok-4-1-fast-reasoning', name: 'grok-4-1-fast-reasoning' },
        { id: 'xai/grok-4-1-fast-non-reasoning', name: 'grok-4-1-fast-non-reasoning' },
        { id: 'xai/grok-4-fast-reasoning', name: 'grok-4-fast-reasoning' },
        { id: 'xai/grok-4-fast-non-reasoning', name: 'grok-4-fast-non-reasoning' }
    ],
    openai: [
        { id: 'openai/gpt-5.2', name: 'GPT-5.2' },
        { id: 'openai/gpt-5.1', name: 'GPT-5.1' },
        { id: 'openai/gpt-5', name: 'GPT-5' },
        { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini' },
        { id: 'openai/gpt-4o', name: 'GPT-4o' },
        { id: 'openai/gpt-4o-mini', name: 'GPT-4o-mini' },
        { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
        { id: 'openai/gpt-4', name: 'GPT-4' },
        { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ],
    local: [
        { id: 'ollama/llama3.2', name: 'Llama 3.2' },
        { id: 'ollama/llama3.1', name: 'Llama 3.1' },
        { id: 'ollama/llama3', name: 'Llama 3' },
        { id: 'ollama/mistral', name: 'Mistral' },
        { id: 'ollama/mixtral', name: 'Mixtral' },
        { id: 'ollama/codellama', name: 'Code Llama' },
        { id: 'ollama/phi3', name: 'Phi-3' },
        { id: 'ollama/gemma2', name: 'Gemma 2' },
        { id: 'ollama/qwen2.5', name: 'Qwen 2.5' },
        { id: 'ollama/deepseek-coder', name: 'DeepSeek Coder' }
    ]
};

// Carregar configuração existente se houver
function loadExistingConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            currentConfig = JSON.parse(data);
            
            // Carregar idioma do localStorage (não do arquivo de config)
            const savedLanguage = localStorage.getItem('ultron.language');
            if (savedLanguage) {
                configState.language = savedLanguage;
                setLanguage(savedLanguage);
                console.log('✓ Idioma carregado do localStorage:', savedLanguage);
            } else {
                // Se não houver idioma salvo, usar inglês como padrão
                setLanguage('en-US');
                console.log('✓ Idioma padrão definido: en-US');
            }
            
            // Carregar vault do arquivo separado se existir
            const vaultPath = path.join(path.dirname(configPath), 'vault.json');
            if (fs.existsSync(vaultPath)) {
                try {
                    const vaultData = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
                    configState.vault = decryptVault(vaultData.encrypted);
                    console.log('✓ Vault carregado e descriptografado do arquivo separado');
                } catch (error) {
                    console.error('Erro ao carregar vault:', error);
                }
            }
            
            // Shield removido - não carregar mais shield-config.json
            
            updateStatus(t('status.ready'));
            
            // Carregar chat automaticamente se já existe configuração
            console.log('✓ Configuração existente detectada, carregando chat automaticamente...');
            setTimeout(() => {
                openChatWithToken();
            }, 500);
        }
    } catch (error) {
        console.error('Erro ao carregar config:', error);
    }
}

// Funções de criptografia simples (Base64 + XOR)
function encryptVault(vaultData) {
    const json = JSON.stringify(vaultData);
    const key = configState.authToken || 'ultron-default-key';
    let encrypted = '';
    
    for (let i = 0; i < json.length; i++) {
        encrypted += String.fromCharCode(json.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    return Buffer.from(encrypted).toString('base64');
}

function decryptVault(encryptedData) {
    const key = configState.authToken || 'ultron-default-key';
    const encrypted = Buffer.from(encryptedData, 'base64');
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(encrypted[i] ^ key.charCodeAt(i % key.length));
    }
    
    return JSON.parse(decrypted);
}

// Salvar configuração
function saveConfig() {
    console.log('=== SAVE CONFIG ===');
    console.log('Estado completo:', JSON.stringify(configState, null, 2));
    
    try {
        const configDir = path.dirname(configPath);
        console.log('Diretório de config:', configDir);
        
        if (!fs.existsSync(configDir)) {
            console.log('Criando diretório:', configDir);
            fs.mkdirSync(configDir, { recursive: true });
        }

        // VALIDAÇÃO CRÍTICA: Verificar se modelo pertence ao provedor
        if (configState.model && configState.provider) {
            const modelPrefix = configState.model.split('/')[0];
            
            // Mapa de prefixos válidos por provedor
            const validPrefixesByProvider = {
                'google': ['google'],
                'claude': ['anthropic'],
                'openrouter': ['openrouter', 'anthropic', 'google', 'openai', 'meta-llama', 'mistralai', 'qwen', 'microsoft', 'nousresearch', 'liquid', 'eva-unit-01', 'deepseek', 'z-ai', 'moonshotai'],
                'grok': ['xai'],
                'openai': ['openai']
            };
            
            const allowedPrefixes = validPrefixesByProvider[configState.provider] || [];
            
            if (!allowedPrefixes.includes(modelPrefix)) {
                console.error('❌ VALIDAÇÃO CRÍTICA FALHOU!');
                console.error('  Provedor:', configState.provider);
                console.error('  Modelo:', configState.model);
                console.error('  Prefixo do modelo:', modelPrefix);
                console.error('  Prefixos permitidos:', allowedPrefixes);
                
                updateStatus('ERRO CRÍTICO: Modelo incompatível com provedor!', 'error');
                alert(`ERRO CRÍTICO: O modelo "${configState.model}" não pertence ao provedor "${configState.provider}"!\n\nConfiguração NÃO foi salva.`);
                return false;
            }
            
            console.log('✓ Validação OK: Modelo pertence ao provedor');
        }

        const config = {
            gateway: {
                mode: configState.gatewayMode,
                port: configState.gatewayPort,
                bind: configState.gatewayBind,
                auth: {
                    mode: configState.authMode,
                    token: configState.authToken
                }
            },
            agents: {
                defaults: {
                    model: {
                        primary: configState.model
                    }
                }
            },
            env: {
                vars: {}
            }
        };
        
        // Salvar idioma no localStorage (não no arquivo de config do ULTRON)
        if (configState.language) {
            localStorage.setItem('ultron.language', configState.language);
            console.log('✓ Idioma salvo no localStorage:', configState.language);
        }
        
        // Salvar vault criptografado em arquivo separado (se houver dados)
        const hasVaultData = configState.vault.passwords.length > 0 ||
                            configState.vault.creditCards.length > 0 ||
                            configState.vault.apiKeys.length > 0 ||
                            configState.vault.notes.length > 0 ||
                            configState.vault.aiRules.length > 0;
        
        if (hasVaultData) {
            try {
                const vaultPath = path.join(configDir, 'vault.json');
                const vaultData = {
                    encrypted: encryptVault(configState.vault),
                    version: '1.0.0',
                    createdAt: new Date().toISOString()
                };
                fs.writeFileSync(vaultPath, JSON.stringify(vaultData, null, 2));
                console.log('✓ Vault criptografado e salvo em arquivo separado:', vaultPath);
            } catch (error) {
                console.error('Erro ao salvar vault:', error);
            }
        }
        
        // S.H.I.E.L.D. REMOVIDO - não salvar mais shield-config.json
        /*
        // Salvar configuração do S.H.I.E.L.D. em arquivo separado
        try {
            const shieldPath = path.join(configDir, 'shield-config.json');
            const shieldData = {
                enabled: configState.shield.enabled,
                requireHumanApproval: configState.shield.requireHumanApproval,
                autoBlock: configState.shield.autoBlock,
                disableCode: configState.shield.disableCode,
                version: '1.0.0',
                createdAt: new Date().toISOString()
            };
            fs.writeFileSync(shieldPath, JSON.stringify(shieldData, null, 2));
            console.log('✓ Configuração do S.H.I.E.L.D. salva:', shieldPath);
            console.log('✓ Código de desativação:', configState.shield.disableCode);
        } catch (error) {
            console.error('Erro ao salvar configuração do S.H.I.E.L.D.:', error);
        }
        */
        
        // NOTA: systemPrompt não é uma chave reconhecida pelo ULTRON
        // As restrições de segurança são aplicadas via outros mecanismos
        // (S.H.I.E.L.D., middleware, etc.)
        
        // Adicionar customBindHost apenas se bind for 'lan' e houver um host customizado
        // Mas NÃO adicionar dentro de gateway, pois isso causa erro de validação
        // O ULTRON não suporta customBindHost na configuração

        // Adicionar credenciais do provedor como variáveis de ambiente
        if (configState.provider && configState.apiKey && configState.provider !== 'local') {
            const providerEnvMap = {
                google: 'GOOGLE_API_KEY',
                claude: 'ANTHROPIC_API_KEY',
                openrouter: 'OPENROUTER_API_KEY',
                grok: 'XAI_API_KEY',
                openai: 'OPENAI_API_KEY'
            };
            
            const envVarName = providerEnvMap[configState.provider];
            if (envVarName) {
                config.env.vars[envVarName] = configState.apiKey;
                console.log('✓ API Key configurada:', envVarName);
            }
        }

        // Configurar tools baseado no modo de execução
        if (configState.executionMode) {
            if (configState.executionMode === 'host') {
                // Execução direta no PC do usuário
                config.tools = {
                    exec: {
                        host: 'gateway',
                        security: 'full',
                        ask: 'off'
                    }
                };
                console.log('✓ Tools configurado para execução no host (PC do usuário)');
            } else if (configState.executionMode === 'sandbox') {
                // Execução isolada no Docker
                config.tools = {
                    exec: {
                        host: 'docker',
                        security: 'full',
                        ask: 'on'
                    }
                };
                console.log('✓ Tools configurado para execução no sandbox (Docker)');
            }
        }

        console.log('Salvando config:', JSON.stringify(config, null, 2));
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('✓ Config salvo com sucesso em:', configPath);
        
        // COMPATIBILIDADE: Salvar também em .openclaw para o gateway funcionar
        // O OpenClaw original está hardcoded para usar .openclaw
        try {
            const openclawDir = path.join(os.homedir(), '.openclaw');
            if (!fs.existsSync(openclawDir)) {
                fs.mkdirSync(openclawDir, { recursive: true });
            }
            const openclawConfigPath = path.join(openclawDir, 'openclaw.json');
            fs.writeFileSync(openclawConfigPath, JSON.stringify(config, null, 2));
            console.log('✓ Config também salvo em .openclaw para compatibilidade');
        } catch (error) {
            console.warn('⚠ Não foi possível salvar em .openclaw:', error.message);
        }
        
        updateStatus('Configuração salva com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar config:', error);
        updateStatus('Erro ao salvar configuração: ' + error.message, 'error');
        return false;
    }
}

// Atualizar status
function updateStatus(text, type = 'info') {
    const statusText = document.getElementById('status-text');
    if (statusText) {
        statusText.textContent = text;
        if (type === 'error') {
            statusText.style.color = '#ff4444';
        } else {
            statusText.style.color = '#ffffff';
        }
    }
}

// Renderizar conteúdo
function render() {
    console.log('render() chamado - step:', configState.step);
    const content = document.getElementById('config-content');
    
    if (!content) {
        console.error('Elemento config-content não encontrado!');
        return;
    }
    
    switch (configState.step) {
        case 'welcome':
            renderWelcome(content);
            break;
        case 'language':
            renderLanguageSelection(content);
            break;
        case 'execution-mode':
            renderExecutionMode(content);
            break;
        case 'gateway-bind':
            renderGatewayBind(content);
            break;
        case 'provider-selection':
            renderProviderSelection(content);
            break;
        case 'api-key':
            renderApiKey(content);
            break;
        case 'model-selection':
            renderModelSelection(content);
            break;
        case 'api-test':
            renderApiTest(content);
            break;
        case 'vault':
            renderVault(content);
            break;
        // Shield removido - pula direto para starting
        case 'starting':
            console.log('Renderizando tela starting...');
            renderStarting(content);
            break;
        default:
            console.error('Step desconhecido:', configState.step);
    }
}

function renderWelcome(content) {
    content.innerHTML = `
        <div class="terminal-line">
            <div class="question">${t('welcome.title')}</div>
            <p style="color: #888; margin: 15px 0;">
                ${t('welcome.description1')}
            </p>
            <p style="color: #888; margin: 15px 0;">
                ${t('welcome.description2')}
            </p>
            <div style="margin: 20px 0; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; border-left: 4px solid #ffffff;">
                <strong style="color: #ffffff;">${t('welcome.autoConfig')}</strong>
                <ul style="color: #888; margin-top: 10px; padding-left: 20px;">
                    <li>${t('welcome.mode')}</li>
                    <li>${t('welcome.port')}</li>
                    <li>${t('welcome.auth')}</li>
                </ul>
            </div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button onclick="startConfiguration()">${t('welcome.startButton')}</button>
            <button class="secondary" onclick="showJoinExistingUltron()">${t('welcome.joinExisting') || 'Entrar em ULTRON Existente'}</button>
        </div>
    `;
}

function showJoinExistingUltron() {
    const content = document.getElementById('config-content');
    content.innerHTML = `
        <div class="terminal-line">
            <div class="question">Entrar em ULTRON Existente</div>
            <p style="color: #888; margin: 15px 0;">
                Insira as credenciais do ULTRON que deseja acessar. Estas informações podem ser encontradas na seção "Conta" do ULTRON remoto.
            </p>
        </div>
        
        <div class="input-group">
            <label><strong>ID de Identificação</strong></label>
            <input type="text" id="join-ultron-id" placeholder="ULTRON-XXXXXXXX" />
        </div>
        
        <div class="input-group">
            <label><strong>Token de Acesso</strong></label>
            <input type="password" id="join-ultron-token" placeholder="tk_xxxxxxxxxxxxxxxxxxxxx" />
        </div>
        
        <div class="input-group">
            <label><strong>Palavra-passe 1</strong></label>
            <input type="text" id="join-ultron-pass1" placeholder="palavra-palavra-1234" />
        </div>
        
        <div class="input-group">
            <label><strong>Palavra-passe 2</strong></label>
            <input type="text" id="join-ultron-pass2" placeholder="palavra-palavra-5678" />
        </div>
        
        <div class="input-group">
            <label><strong>Endereço do Gateway (opcional)</strong></label>
            <input type="text" id="join-ultron-address" placeholder="http://192.168.1.100:18789 ou deixe em branco para auto-detectar" />
            <small style="display: block; margin-top: 5px;">Se deixado em branco, tentaremos conectar automaticamente usando as credenciais</small>
        </div>
        
        <div id="join-error" class="error-message hidden"></div>
        <div id="join-success" class="success-message hidden"></div>
        
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
            <button class="secondary" onclick="render()">Voltar</button>
            <button onclick="connectToExistingUltron()">Conectar</button>
        </div>
    `;
}

async function connectToExistingUltron() {
    const ultronId = document.getElementById('join-ultron-id').value.trim();
    const token = document.getElementById('join-ultron-token').value.trim();
    const pass1 = document.getElementById('join-ultron-pass1').value.trim();
    const pass2 = document.getElementById('join-ultron-pass2').value.trim();
    const address = document.getElementById('join-ultron-address').value.trim();
    
    const errorDiv = document.getElementById('join-error');
    const successDiv = document.getElementById('join-success');
    
    // Limpar mensagens anteriores
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
    
    // Validações
    if (!ultronId || !token || !pass1 || !pass2) {
        errorDiv.textContent = 'Por favor, preencha todos os campos obrigatórios.';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    if (!ultronId.startsWith('ULTRON-')) {
        errorDiv.textContent = 'ID inválido. Deve começar com "ULTRON-"';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    if (!token.startsWith('tk_')) {
        errorDiv.textContent = 'Token inválido. Deve começar com "tk_"';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    updateStatus('Conectando ao ULTRON remoto...');
    
    try {
        // Determinar o endereço do gateway
        let gatewayUrl = address;
        if (!gatewayUrl) {
            // Se não fornecido, tentar descobrir via rede local ou usar localhost
            gatewayUrl = 'http://localhost:18789';
        }
        
        // Validar e normalizar formato do endereço
        if (!gatewayUrl.startsWith('http://') && !gatewayUrl.startsWith('https://')) {
            gatewayUrl = 'http://' + gatewayUrl;
        }
        
        // Remover barra final se existir
        gatewayUrl = gatewayUrl.replace(/\/$/, '');
        
        successDiv.textContent = `Conectando a ${gatewayUrl}...`;
        successDiv.classList.remove('hidden');
        
        // Tentar conectar ao gateway remoto com timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
        
        let response;
        try {
            // Tentar endpoint de health primeiro
            response = await fetch(`${gatewayUrl}/health`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-OpenClaw-Token': token
                },
                signal: controller.signal
            });
        } catch (fetchError) {
            // Se falhar, tentar endpoint raiz
            try {
                response = await fetch(gatewayUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-OpenClaw-Token': token
                    },
                    signal: controller.signal
                });
            } catch (rootError) {
                throw new Error(`Não foi possível conectar ao gateway em ${gatewayUrl}`);
            }
        } finally {
            clearTimeout(timeoutId);
        }
        
        if (!response || (!response.ok && response.status !== 401)) {
            // 401 é aceitável - significa que o gateway existe mas precisa de autenticação
            throw new Error(`Gateway respondeu com status ${response?.status || 'desconhecido'}`);
        }
        
        // Extrair porta da URL
        let port = 18789;
        try {
            const urlObj = new URL(gatewayUrl);
            port = urlObj.port ? parseInt(urlObj.port) : (urlObj.protocol === 'https:' ? 443 : 80);
        } catch (e) {
            console.warn('Erro ao extrair porta, usando padrão 18789');
        }
        
        // Salvar configuração para conectar ao ULTRON remoto
        const remoteConfig = {
            gateway: {
                mode: 'remote',
                url: gatewayUrl,
                port: port,
                auth: {
                    mode: 'token',
                    token: token
                }
            },
            ultron: {
                id: ultronId,
                passphrase1: pass1,
                passphrase2: pass2,
                remote: true
            },
            env: {
                vars: {}
            }
        };
        
        // Salvar configuração
        const ultronDir = path.join(os.homedir(), '.ultron');
        if (!fs.existsSync(ultronDir)) {
            fs.mkdirSync(ultronDir, { recursive: true });
        }
        
        fs.writeFileSync(configPath, JSON.stringify(remoteConfig, null, 2));
        
        successDiv.textContent = '✓ Conectado com sucesso! Carregando interface...';
        updateStatus('Conectado ao ULTRON remoto');
        
        // Aguardar um pouco e então carregar a UI
        setTimeout(() => {
            ipcRenderer.send('load-chat-ui', {
                port: remoteConfig.gateway.port,
                token: remoteConfig.gateway.auth.token
            });
        }, 1500);
        
    } catch (error) {
        console.error('Erro ao conectar:', error);
        
        let errorMessage = 'Erro ao conectar: ';
        if (error.name === 'AbortError') {
            errorMessage += 'Tempo de conexão esgotado. Verifique se o endereço está correto e se o gateway está acessível.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage += 'Não foi possível alcançar o gateway. Verifique sua conexão de rede e o endereço fornecido.';
        } else {
            errorMessage += error.message;
        }
        
        errorDiv.textContent = errorMessage;
        errorDiv.classList.remove('hidden');
        successDiv.classList.add('hidden');
        updateStatus('Erro ao conectar');
    }
}

function renderLanguageSelection(content) {
    const languages = [
        { code: 'en-US', name: t('language.english'), flag: '' },
        { code: 'pt-BR', name: t('language.portuguese'), flag: '' },
        { code: 'es-ES', name: t('language.spanish'), flag: '' },
        { code: 'fr-FR', name: t('language.french'), flag: '' },
        { code: 'de-DE', name: t('language.german'), flag: '' }
    ];
    
    const languageOptions = languages.map((lang, index) => `
        <div class="option ${configState.language === lang.code ? 'selected' : ''}" 
             onclick="selectLanguage('${lang.code}')">
            <span>${lang.flag}</span>
            <div>
                <strong>${lang.name}</strong><br>
                <small style="color: #888;">${lang.code}</small>
            </div>
        </div>
    `).join('');
    
    content.innerHTML = `
        <div class="terminal-line">
            <div class="question">${t('language.title')}</div>
            <p style="color: #888; margin: 15px 0;">
                ${t('language.description')}
            </p>
        </div>
        
        ${languageOptions}
        
        <div style="margin-top: 20px;">
            <button onclick="skipGatewayBindAndContinue()" ${!configState.language ? 'disabled' : ''}>
                ${t('language.continue')}
            </button>
        </div>
    `;
}

function renderExecutionMode(content) {
    content.innerHTML = `
        <div class="terminal-line">
            <div class="question">${t('execution.title')}</div>
            <p style="color: #888; margin: 15px 0;">
                ${t('execution.description')}
            </p>
        </div>
        
        <div class="option ${configState.executionMode === 'host' ? 'selected' : ''}" 
             onclick="selectExecutionMode('host')">
            <div>
                <strong>${t('execution.host.title')}</strong><br>
                <small style="color: #888;">${t('execution.host.description')}</small>
            </div>
        </div>
        
        <div class="option ${configState.executionMode === 'sandbox' ? 'selected' : ''}" 
             onclick="selectExecutionMode('sandbox')">
            <div>
                <strong>${t('execution.sandbox.title')}</strong><br>
                <small style="color: #888;">${t('execution.sandbox.description')}</small>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <button onclick="nextStep('provider-selection')" ${!configState.executionMode ? 'disabled' : ''}>
                ${t('execution.continue')}
            </button>
        </div>
    `;
}

function renderGatewayBind(content) {
    // Detectar IP local
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let localIP = '127.0.0.1';
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIP = iface.address;
                break;
            }
        }
    }
    
    if (!configState.gatewayBind) {
        configState.gatewayBind = 'loopback';
    }
    
    content.innerHTML = `
        <div class="terminal-line">
            <div class="question">${t('network.title')}</div>
            <p style="color: #888; margin: 15px 0;">
                ${t('network.description')}
            </p>
        </div>
        
        <div class="option ${configState.gatewayBind === 'loopback' ? 'selected' : ''}" 
             onclick="selectBind('loopback')">
            <div>
                <strong>${t('network.loopback')}</strong><br>
                <small style="color: #888;">${t('network.loopbackDesc')}</small>
            </div>
        </div>
        
        <div class="option ${configState.gatewayBind === 'lan' ? 'selected' : ''}" 
             onclick="selectBind('lan', '${localIP}')">
            <div>
                <strong>${t('network.lan')} (${localIP})</strong><br>
                <small style="color: #888;">${t('network.lanDesc')}</small>
            </div>
        </div>
        
        <div class="option ${configState.gatewayBind === 'auto' ? 'selected' : ''}" 
             onclick="selectBind('auto')">
            <div>
                <strong>${t('network.auto')}</strong><br>
                <small style="color: #888;">${t('network.autoDesc')}</small>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <button onclick="nextStep('provider-selection')" ${!configState.gatewayBind ? 'disabled' : ''}>
                ${t('network.continue')}
            </button>
            <button class="secondary" onclick="previousStep('language')">${t('provider.back')}</button>
        </div>
    `;
}

function renderProviderSelection(content) {
    content.innerHTML = `
        <div class="terminal-line">
            <div class="question">${t('provider.title')}</div>
            <p style="color: #888; margin: 15px 0;">
                ${t('provider.description')}
            </p>
        </div>
        
        <div class="option ${configState.provider === 'google' ? 'selected' : ''}" 
             onclick="selectProvider('google')">
            <div>
                <strong>1. ${t('provider.google')}</strong><br>
                <small style="color: #888;">${t('provider.googleDesc')}</small>
            </div>
        </div>
        
        <div class="option ${configState.provider === 'claude' ? 'selected' : ''}" 
             onclick="selectProvider('claude')">
            <div>
                <strong>2. ${t('provider.claude')}</strong><br>
                <small style="color: #888;">${t('provider.claudeDesc')}</small>
            </div>
        </div>
        
        <div class="option ${configState.provider === 'openrouter' ? 'selected' : ''}" 
             onclick="selectProvider('openrouter')">
            <div>
                <strong>3. ${t('provider.openrouter')}</strong><br>
                <small style="color: #888;">${t('provider.openrouterDesc')}</small>
            </div>
        </div>
        
        <div class="option ${configState.provider === 'grok' ? 'selected' : ''}" 
             onclick="selectProvider('grok')">
            <div>
                <strong>4. ${t('provider.grok')}</strong><br>
                <small style="color: #888;">${t('provider.grokDesc')}</small>
            </div>
        </div>
        
        <div class="option ${configState.provider === 'openai' ? 'selected' : ''}" 
             onclick="selectProvider('openai')">
            <div>
                <strong>5. ${t('provider.openai')}</strong><br>
                <small style="color: #888;">${t('provider.openaiDesc')}</small>
            </div>
        </div>
        
        <div class="option ${configState.provider === 'local' ? 'selected' : ''}" 
             onclick="selectProvider('local')">
            <div>
                <strong>6. ${t('provider.local')}</strong><br>
                <small style="color: #888;">${t('provider.localDesc')}</small>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <button onclick="nextStep('api-key')" ${!configState.provider ? 'disabled' : ''}>
                ${t('provider.continue')}
            </button>
            <button class="secondary" onclick="previousStep('gateway-bind')">${t('provider.back')}</button>
        </div>
    `;
}

function renderApiKey(content) {
    if (!configState.provider) {
        nextStep('provider-selection');
        return;
    }
    
    // Modelos locais não precisam de API key
    if (configState.provider === 'local') {
        configState.apiKey = 'local-no-key-needed';
        nextStep('model-selection');
        return;
    }
    
    const providerInfo = {
        google: {
            name: 'Google AI Studio',
            icon: '',
            url: 'https://makersuite.google.com/app/apikey',
            placeholder: 'AIza...',
            description: 'Obtenha sua chave API gratuita no Google AI Studio'
        },
        claude: {
            name: 'Anthropic Claude',
            icon: '',
            url: 'https://console.anthropic.com/settings/keys',
            placeholder: 'sk-ant-...',
            description: 'Crie uma chave API no console da Anthropic'
        },
        openrouter: {
            name: 'OpenRouter',
            icon: '',
            url: 'https://openrouter.ai/keys',
            placeholder: 'sk-or-...',
            description: 'Obtenha sua chave API no OpenRouter'
        },
        grok: {
            name: 'xAI (Grok)',
            icon: '',
            url: 'https://console.x.ai/',
            placeholder: 'xai-...',
            description: 'Obtenha acesso à API do Grok no console xAI'
        },
        openai: {
            name: 'OpenAI',
            icon: '',
            url: 'https://platform.openai.com/api-keys',
            placeholder: 'sk-...',
            description: 'Crie uma chave API no OpenAI Platform'
        }
    };
    
    const info = providerInfo[configState.provider];
    
    content.innerHTML = `
        <div class="terminal-line">
            <div class="question">Chave API do ${info.name}</div>
            <p style="color: #888; margin: 15px 0;">
                ${info.description}
            </p>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background: rgba(0, 170, 255, 0.1); border-radius: 4px; border-left: 4px solid #00aaff;">
            <strong style="color: #00aaff;">${info.icon} Como obter sua chave API:</strong>
            <ol style="color: #888; margin-top: 10px; padding-left: 20px;">
                <li>Acesse: <a href="${info.url}" target="_blank" style="color: #ffffff;">${info.url}</a></li>
                <li>Faça login ou crie uma conta</li>
                <li>Gere uma nova chave API</li>
                <li>Cole a chave no campo abaixo</li>
            </ol>
        </div>
        
        <div class="input-group">
            <label style="color: #00aaff;">Chave API:</label>
            <input type="password" 
                   id="api-key-input" 
                   placeholder="${info.placeholder}"
                   value="${configState.apiKey || ''}"
                   oninput="updateApiKey(this.value)"
                   style="font-family: monospace;">
            <small style="color: #888; display: block; margin-top: 5px;">
                Sua chave será armazenada de forma segura localmente
            </small>
        </div>
        
        <div style="margin-top: 20px;">
            <button id="continue-btn" onclick="continueToModelSelection()" ${!configState.apiKey ? 'disabled' : ''}>
                Continuar →
            </button>
            <button class="secondary" onclick="previousStep('provider-selection')">← Voltar</button>
        </div>
    `;
}

function renderModelSelection(content) {
    if (!configState.provider) {
        nextStep('provider-selection');
        return;
    }
    
    const models = modelsByProvider[configState.provider];
    const providerNames = {
        google: 'Google',
        claude: 'Claude (Anthropic)',
        openrouter: 'OpenRouter',
        grok: 'Grok (xAI)',
        openai: 'OpenAI',
        local: 'Modelos Locais (Ollama)'
    };
    
    const modelOptions = models.map((model, index) => `
        <div class="option ${configState.model === model.id ? 'selected' : ''}" 
             onclick="selectModel('${model.id}')">
            <span>${index + 1}</span>
            <div>
                <strong>${model.name}</strong><br>
                <small style="color: #888;">${model.id}</small>
            </div>
        </div>
    `).join('');
    
    content.innerHTML = `
        <div class="terminal-line">
            <div class="question">Escolha o Modelo de IA</div>
            <p style="color: #888; margin: 15px 0;">
                Selecione qual modelo do <strong style="color: #ffffff;">${providerNames[configState.provider]}</strong> você deseja usar:
            </p>
        </div>
        
        ${modelOptions}
        
        <div style="margin-top: 20px;">
            <button onclick="finishAndStart()" ${!configState.model ? 'disabled' : ''}>
                Finalizar e Iniciar Gateway
            </button>
            <button class="secondary" onclick="previousStep('api-key')">← Voltar</button>
        </div>
    `;
}

function renderApiTest(content) {
    console.log('renderApiTest iniciado');
    console.log('configState:', configState);

    content.innerHTML = `
        <div class="terminal-line">
            <div class="question">Teste de Conexão API</div>
            <p style="color: #888; margin: 15px 0;">
                Validando sua chave API...
            </p>
            
            <div style="margin: 20px 0; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">
                <p style="color: #ffffff; margin: 5px 0;"><strong>Provedor:</strong> ${configState.provider.toUpperCase()}</p>
                <p style="color: #ffffff; margin: 5px 0;"><strong>Modelo:</strong> ${configState.model}</p>
            </div>
            
            <div id="test-status" style="margin: 20px 0; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 10px;"></div>
                <p style="color: #888;">Testando conexão com o provedor...</p>
            </div>
            
            <div id="test-result" style="display: none; margin: 20px 0;"></div>
            
            <div id="test-buttons" style="display: none; margin-top: 20px;">
                <button onclick="retryApiTest()" style="margin-right: 10px;">← Voltar e Corrigir</button>
                <button onclick="skipApiTest()" style="margin-right: 10px;">Pular Teste</button>
                <button id="continue-button" onclick="continueAfterTest()" style="display: none;">Continuar →</button>
            </div>
        </div>
    `;

    // Executar teste após 1 segundo
    setTimeout(async () => {
        await executeApiTest();
    }, 1000);
}

async function executeApiTest() {
    console.log('executeApiTest iniciado');
    
    const statusDiv = document.getElementById('test-status');
    const resultDiv = document.getElementById('test-result');
    const buttonsDiv = document.getElementById('test-buttons');
    
    try {
        // Fazer chamada de teste via IPC
        const result = await ipcRenderer.invoke('test-api-key', {
            provider: configState.provider,
            apiKey: configState.apiKey,
            model: configState.model
        });
        
        console.log('Resultado do teste:', result);
        
        if (result.success) {
            // Teste bem-sucedido
            statusDiv.style.display = 'none';
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div style="padding: 15px; background: rgba(255, 255, 255, 0.2); border-radius: 4px; border-left: 4px solid #ffffff;">
                    <p style="color: #ffffff; font-size: 18px; margin-bottom: 10px;"><strong>CONEXÃO ESTABELECIDA COM SUCESSO!</strong></p>
                    <p style="color: #888;">Chave API válida e funcional.</p>
                    ${result.modelInfo ? `<p style="color: #888; margin-top: 10px;">Modelo: ${result.modelInfo}</p>` : ''}
                </div>
            `;
            buttonsDiv.style.display = 'block';
            document.getElementById('continue-button').style.display = 'inline-block';
        } else {
            // Teste falhou
            statusDiv.style.display = 'none';
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div style="padding: 15px; background: rgba(255, 65, 65, 0.2); border-radius: 4px; border-left: 4px solid #ff4141;">
                    <p style="color: #ff4141; font-size: 18px; margin-bottom: 10px;"><strong>FALHA NA CONEXÃO</strong></p>
                    <p style="color: #888;">Erro: ${result.error || 'Chave API inválida ou sem permissões'}</p>
                    <p style="color: #666; margin-top: 10px; font-size: 14px;">Verifique sua chave API e tente novamente.</p>
                </div>
            `;
            buttonsDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao testar API:', error);
        statusDiv.style.display = 'none';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="padding: 15px; background: rgba(255, 65, 65, 0.2); border-radius: 4px; border-left: 4px solid #ff4141;">
                <p style="color: #ff4141; font-size: 18px; margin-bottom: 10px;"><strong>ERRO NO TESTE</strong></p>
                <p style="color: #888;">${error.message}</p>
            </div>
        `;
        buttonsDiv.style.display = 'block';
    }
}

window.retryApiTest = function() {
    configState.step = 'api-key';
    render();
};

window.skipApiTest = function() {
    console.log('=== SKIP API TEST ===');
    console.log('Usuário optou por pular o teste de API');
    console.log('Indo para o cofre de informações...');
    
    // Resetar vaultStep para começar do início
    configState.vaultStep = 'passwords';
    
    updateStatus('Avançando para cofre de informações...');
    configState.step = 'vault';
    render();
};

window.continueAfterTest = function() {
    console.log('=== CONTINUE AFTER TEST ===');
    console.log('Indo para o cofre de informações...');
    
    // Resetar vaultStep para começar do início
    configState.vaultStep = 'passwords';
    
    updateStatus('Avançando para cofre de informações...');
    configState.step = 'vault';
    render();
};

function renderVault(content) {
    console.log('renderVault iniciado - vaultStep:', configState.vaultStep);
    
    // Definir ordem das categorias
    const vaultCategories = ['passwords', 'creditCards', 'apiKeys', 'notes', 'aiRules'];
    const currentIndex = vaultCategories.indexOf(configState.vaultStep);
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === vaultCategories.length - 1;
    
    // Renderizar categoria atual
    let categoryHTML = '';
    
    if (configState.vaultStep === 'passwords') {
        categoryHTML = `
            <div class="terminal-line">
                <div class="question">${t('vault.passwords')}</div>
                <p style="color: #888; margin: 15px 0;">
                    ${t('vault.passwordsDesc')}
                </p>
            </div>
            
            ${configState.vault.passwords.length > 0 ? `
                <div style="margin: 20px 0;">
                    <strong style="color: #ffffff;">Senhas adicionadas (${configState.vault.passwords.length}):</strong>
                    <div style="margin-top: 10px;">
                        ${configState.vault.passwords.map((p, i) => `
                            <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${p.service}</strong><br>
                                    <small style="color: #888;">${p.username}</small>
                                </div>
                                <button onclick="deleteVaultItem('password', ${i})" class="secondary" style="padding: 5px 10px; font-size: 12px;">
                                    ${t('vault.delete')}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div style="margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div class="input-group">
                    <label>${t('vault.serviceName')}:</label>
                    <input type="text" id="vault-service" placeholder="Ex: Gmail, Netflix, etc.">
                </div>
                <div class="input-group">
                    <label>${t('vault.username')}:</label>
                    <input type="text" id="vault-username" placeholder="usuario@email.com">
                </div>
                <div class="input-group">
                    <label>${t('vault.password')}:</label>
                    <input type="password" id="vault-password" placeholder="••••••••">
                </div>
                <button onclick="addVaultItemInline('password')" style="width: 100%; margin-top: 10px;">
                    ${t('vault.addPassword')}
                </button>
            </div>
        `;
    } else if (configState.vaultStep === 'creditCards') {
        categoryHTML = `
            <div class="terminal-line">
                <div class="question">${t('vault.creditCards')}</div>
                <p style="color: #888; margin: 15px 0;">
                    ${t('vault.creditCardsDesc')}
                </p>
            </div>
            
            ${configState.vault.creditCards.length > 0 ? `
                <div style="margin: 20px 0;">
                    <strong style="color: #ffffff;">Cartões adicionados (${configState.vault.creditCards.length}):</strong>
                    <div style="margin-top: 10px;">
                        ${configState.vault.creditCards.map((c, i) => `
                            <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${c.holder}</strong><br>
                                    <small style="color: #888;">****${c.number.slice(-4)}</small>
                                </div>
                                <button onclick="deleteVaultItem('card', ${i})" class="secondary" style="padding: 5px 10px; font-size: 12px;">
                                    ${t('vault.delete')}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div style="margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div class="input-group">
                    <label>${t('vault.cardHolder')}:</label>
                    <input type="text" id="vault-cardholder" placeholder="Nome no Cartão">
                </div>
                <div class="input-group">
                    <label>${t('vault.cardNumber')}:</label>
                    <input type="text" id="vault-cardnumber" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="input-group">
                        <label>${t('vault.expiryDate')}:</label>
                        <input type="text" id="vault-expiry" placeholder="MM/AA" maxlength="5">
                    </div>
                    <div class="input-group">
                        <label>${t('vault.cvv')}:</label>
                        <input type="text" id="vault-cvv" placeholder="123" maxlength="4">
                    </div>
                </div>
                <button onclick="addVaultItemInline('card')" style="width: 100%; margin-top: 10px;">
                    ${t('vault.addCard')}
                </button>
            </div>
        `;
    } else if (configState.vaultStep === 'apiKeys') {
        categoryHTML = `
            <div class="terminal-line">
                <div class="question">${t('vault.apiKeys')}</div>
                <p style="color: #888; margin: 15px 0;">
                    ${t('vault.apiKeysDesc')}
                </p>
            </div>
            
            ${configState.vault.apiKeys.length > 0 ? `
                <div style="margin: 20px 0;">
                    <strong style="color: #ffffff;">Chaves API adicionadas (${configState.vault.apiKeys.length}):</strong>
                    <div style="margin-top: 10px;">
                        ${configState.vault.apiKeys.map((k, i) => `
                            <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${k.name}</strong><br>
                                    <small style="color: #888;">${k.value.substring(0, 20)}...</small>
                                </div>
                                <button onclick="deleteVaultItem('apikey', ${i})" class="secondary" style="padding: 5px 10px; font-size: 12px;">
                                    ${t('vault.delete')}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div style="margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div class="input-group">
                    <label>${t('vault.apiKeyName')}:</label>
                    <input type="text" id="vault-apiname" placeholder="Ex: OpenAI, Claude, etc.">
                </div>
                <div class="input-group">
                    <label>${t('vault.apiKeyValue')}:</label>
                    <textarea id="vault-apivalue" rows="3" placeholder="sk-..." style="font-family: monospace;"></textarea>
                </div>
                <button onclick="addVaultItemInline('apikey')" style="width: 100%; margin-top: 10px;">
                    ${t('vault.addApiKey')}
                </button>
            </div>
        `;
    } else if (configState.vaultStep === 'notes') {
        categoryHTML = `
            <div class="terminal-line">
                <div class="question">${t('vault.notes')}</div>
                <p style="color: #888; margin: 15px 0;">
                    ${t('vault.notesDesc')}
                </p>
            </div>
            
            ${configState.vault.notes.length > 0 ? `
                <div style="margin: 20px 0;">
                    <strong style="color: #ffffff;">Notas adicionadas (${configState.vault.notes.length}):</strong>
                    <div style="margin-top: 10px;">
                        ${configState.vault.notes.map((n, i) => `
                            <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${n.title}</strong><br>
                                    <small style="color: #888;">${n.content.substring(0, 50)}...</small>
                                </div>
                                <button onclick="deleteVaultItem('note', ${i})" class="secondary" style="padding: 5px 10px; font-size: 12px;">
                                    ${t('vault.delete')}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div style="margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div class="input-group">
                    <label>${t('vault.noteTitle')}:</label>
                    <input type="text" id="vault-notetitle" placeholder="Título da nota">
                </div>
                <div class="input-group">
                    <label>${t('vault.noteContent')}:</label>
                    <textarea id="vault-notecontent" rows="5" placeholder="Conteúdo confidencial..."></textarea>
                </div>
                <button onclick="addVaultItemInline('note')" style="width: 100%; margin-top: 10px;">
                    ${t('vault.addNote')}
                </button>
            </div>
        `;
    } else if (configState.vaultStep === 'aiRules') {
        categoryHTML = `
            <div class="terminal-line">
                <div class="question">${t('vault.aiRules')}</div>
                <p style="color: #888; margin: 15px 0;">
                    ${t('vault.aiRulesDesc')}
                </p>
            </div>
            
            ${configState.vault.aiRules.length > 0 ? `
                <div style="margin: 20px 0;">
                    <strong style="color: #ffffff;">Regras adicionadas (${configState.vault.aiRules.length}):</strong>
                    <div style="margin-top: 10px;">
                        ${configState.vault.aiRules.map((r, i) => `
                            <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${r.title}</strong>
                                    ${r.active ? '<span style="color: #00ff00; margin-left: 5px;">●</span>' : '<span style="color: #666; margin-left: 5px;">○</span>'}<br>
                                    <small style="color: #888;">${r.content.substring(0, 50)}...</small>
                                </div>
                                <div>
                                    <button onclick="toggleAiRule(${i})" class="secondary" style="padding: 5px 10px; font-size: 12px; margin-right: 5px;">
                                        ${r.active ? t('vault.hide') : t('vault.show')}
                                    </button>
                                    <button onclick="deleteVaultItem('airule', ${i})" class="secondary" style="padding: 5px 10px; font-size: 12px;">
                                        ${t('vault.delete')}
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div style="margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div class="input-group">
                    <label>${t('vault.ruleTitle')}:</label>
                    <input type="text" id="vault-ruletitle" placeholder="Ex: Responder em português, Ser formal, etc.">
                </div>
                <div class="input-group">
                    <label>${t('vault.ruleContent')}:</label>
                    <textarea id="vault-rulecontent" rows="6" placeholder="Você deve sempre responder em português brasileiro. Use linguagem formal e profissional..."></textarea>
                </div>
                <div class="input-group">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="vault-ruleactive" checked style="margin-right: 10px; width: 20px; height: 20px;">
                        ${t('vault.ruleActive')}
                    </label>
                </div>
                <button onclick="addVaultItemInline('airule')" style="width: 100%; margin-top: 10px;">
                    ${t('vault.addAiRule')}
                </button>
            </div>
        `;
    }
    
    content.innerHTML = `
        ${categoryHTML}
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(0, 170, 255, 0.1); border-radius: 4px; border-left: 4px solid #00aaff;">
            <small style="color: #888;">
                ${t('vault.encrypted')} - Passo ${currentIndex + 1} de ${vaultCategories.length}
            </small>
        </div>
        
        <div style="margin-top: 20px;">
            ${!isLast ? `
                <button onclick="nextVaultCategory()">${t('vault.continue')}</button>
                <button class="secondary" onclick="skipVault()">${t('vault.skip')}</button>
            ` : `
                <button onclick="finishVaultAndStart()">${t('vault.continue')}</button>
            `}
            ${!isFirst ? `
                <button class="secondary" onclick="previousVaultCategory()">${t('vault.back')}</button>
            ` : `
                <button class="secondary" onclick="previousStep('api-test')">${t('vault.back')}</button>
            `}
        </div>
    `;
}

// renderShield removida completamente

function renderStarting(content) {
    console.log('renderStarting iniciado');
    console.log('configState:', configState);
    
    const providerNames = {
        google: 'Google',
        claude: 'Claude (Anthropic)',
        openrouter: 'OpenRouter',
        grok: 'Grok (xAI)',
        openai: 'OpenAI',
        local: 'Modelos Locais (Ollama)'
    };
    
    const configSummary = `
        <strong>Modo:</strong> Local<br>
        <strong>Porta:</strong> ${configState.gatewayPort}<br>
        <strong>IP:</strong> ${configState.gatewayBind}<br>
        <strong>Auth:</strong> Token<br>
        <strong>Provedor:</strong> ${providerNames[configState.provider]}<br>
        <strong>Modelo:</strong> ${configState.model}
    `;
    
    console.log('Montando HTML da tela starting...');
    
    content.innerHTML = `
        <div class="success-message">
            <div style="font-size: 20px; margin-bottom: 10px;">Configuração Concluída!</div>
            <p>O Gateway Ultron foi configurado com sucesso.</p>
            <div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                ${configSummary}
            </div>
        </div>
        
        <div class="terminal-line" style="margin-top: 20px;">
            <div class="question">Iniciando Gateway...</div>
            <div style="margin: 20px 0; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;"></div>
                <div style="color: #ffffff; font-size: 18px;">Gateway em inicialização<span class="loading">...</span></div>
                <div style="color: #888; margin-top: 10px; font-size: 12px;">
                    Token: <code style="color: #ffffff;">${configState.authToken.substring(0, 16)}...</code>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(0, 170, 255, 0.1); border-radius: 4px; border-left: 4px solid #00aaff;">
            <strong style="color: #00aaff;">Informação:</strong>
            <p style="color: #888; margin-top: 5px;">
                Configuração salva em:<br>
                <code style="color: #ffffff;">${configPath}</code>
            </p>
        </div>
        
        <div id="gateway-status" style="margin-top: 20px;"></div>
    `;
    
    console.log('HTML da tela starting montado com sucesso');
    
    // Iniciar o gateway após 2 segundos
    console.log('Agendando início do gateway em 2 segundos...');
    setTimeout(() => {
        console.log('Iniciando gateway agora...');
        startGatewayProcess();
    }, 2000);
}



// Funções auxiliares
window.startConfiguration = function() {
    // Gerar token automaticamente
    configState.authToken = Array.from({length: 32}, () => 
        Math.random().toString(36).charAt(2)).join('');
    updateStatus(t('status.tokenGenerated'));
    nextStep('language');
};

window.skipGatewayBindAndContinue = function() {
    console.log('=== SKIP GATEWAY BIND ===');
    console.log('Configurando automaticamente para aceitar qualquer rede (auto)');
    
    // Configurar automaticamente para aceitar qualquer rede
    configState.gatewayBind = 'auto';
    
    console.log('✓ Gateway configurado para aceitar qualquer rede');
    console.log('  gatewayBind:', configState.gatewayBind);
    
    // Ir para seleção de modo de execução
    nextStep('execution-mode');
};

window.selectExecutionMode = function(mode) {
    console.log('=== SELECT EXECUTION MODE ===');
    console.log('Modo selecionado:', mode);
    
    configState.executionMode = mode;
    
    console.log('✓ Modo de execução configurado:', mode);
    
    // Re-renderizar para atualizar a seleção visual
    render();
};

window.selectLanguage = function(langCode) {
    console.log('=== SELECT LANGUAGE ===');
    console.log('Idioma selecionado:', langCode);
    
    configState.language = langCode;
    setLanguage(langCode);
    
    console.log('✓ Idioma configurado:', langCode);
    
    // Re-renderizar para aplicar traduções
    render();
};

window.nextStep = function(step) {
    configState.step = step;
    render();
};

window.previousStep = function(step) {
    configState.step = step;
    render();
};

window.selectBind = function(bind, customHost) {
    configState.gatewayBind = bind;
    configState.customBindHost = customHost || null;
    render();
};

window.selectProvider = function(provider) {
    console.log('=== SELECT PROVIDER ===');
    console.log('Provedor anterior:', configState.provider);
    console.log('Novo provedor:', provider);
    
    configState.provider = provider;
    configState.model = null; // Reset model quando mudar provider
    configState.apiKey = null; // Reset API key quando mudar provider
    
    console.log('✓ Estado resetado');
    console.log('  provider:', configState.provider);
    console.log('  model:', configState.model);
    console.log('  apiKey:', configState.apiKey);
    
    render();
};

window.updateApiKey = function(apiKey) {
    configState.apiKey = apiKey.trim();
    // Habilitar/desabilitar botão continuar
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.disabled = !configState.apiKey || configState.apiKey.length < 5;
    }
};

window.continueToModelSelection = function() {
    if (configState.apiKey && configState.apiKey.length >= 5) {
        updateStatus('Chave API configurada');
        nextStep('model-selection');
    }
};

window.selectModel = function(model) {
    console.log('=== SELECT MODEL ===');
    console.log('Provedor:', configState.provider);
    console.log('Modelo selecionado:', model);
    
    // VALIDAÇÃO: Garantir que o modelo pertence ao provedor
    const modelPrefix = model.split('/')[0];
    
    // Mapa de prefixos válidos por provedor
    const validPrefixesByProvider = {
        'google': ['google'],
        'claude': ['anthropic'],
        'openrouter': ['openrouter', 'anthropic', 'google', 'openai', 'meta-llama', 'mistralai', 'qwen', 'microsoft', 'nousresearch', 'liquid', 'eva-unit-01', 'deepseek', 'z-ai', 'moonshotai'],
        'grok': ['xai'],
        'openai': ['openai'],
        'local': ['ollama']
    };
    
    const allowedPrefixes = validPrefixesByProvider[configState.provider] || [];
    
    if (!allowedPrefixes.includes(modelPrefix)) {
        console.error('❌ VALIDAÇÃO FALHOU: Modelo não pertence ao provedor!');
        console.error('  Provedor:', configState.provider);
        console.error('  Modelo:', model);
        console.error('  Prefixo do modelo:', modelPrefix);
        console.error('  Prefixos permitidos:', allowedPrefixes);
        
        alert(`ERRO: O modelo "${model}" não pertence ao provedor "${configState.provider}"!\n\nPor favor, selecione um modelo válido.`);
        return;
    }
    
    console.log('✓ Validação OK: Modelo pertence ao provedor');
    
    configState.model = model;
    configState.step = 'api-test';
    render();
};

window.finishAndStart = function() {
    console.log('finishAndStart chamado');
    console.log('Estado atual:', configState);
    
    updateStatus('Salvando configuração...');
    
    if (saveConfig()) {
        console.log('Configuração salva com sucesso');
        updateStatus('Iniciando Gateway...');
        configState.step = 'starting';
        render();
    } else {
        console.error('Erro ao salvar configuração');
        updateStatus('Erro ao salvar configuração', 'error');
    }
};

window.startGatewayProcess = async function() {
    updateStatus('Iniciando Gateway...');
    
    const { ipcRenderer } = require('electron');
    
    try {
        // Primeiro, matar qualquer gateway existente
        console.log('Verificando gateways existentes...');
        await ipcRenderer.invoke('kill-existing-gateway');
        console.log('✓ Gateways existentes encerrados');
        
        const result = await ipcRenderer.invoke('start-gateway', {
            ULTRON_GATEWAY_TOKEN: configState.authToken,
            ULTRON_GATEWAY_PORT: configState.gatewayPort,
            ULTRON_GATEWAY_BIND: configState.gatewayBind
        });
        
        console.log('Resultado do start-gateway:', result);
        
        if (result.success) {
            updateStatus('Gateway iniciado com sucesso!');
            
            const statusDiv = document.getElementById('gateway-status');
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div class="success-message">
                        <strong>Gateway verificado e funcionando!</strong><br>
                        <small style="color: #888;">URL: ${result.gatewayUrl || 'ws://localhost:' + configState.gatewayPort}</small>
                        
                        <div style="margin-top: 20px; padding: 15px; background: rgba(0, 170, 255, 0.15); border: 2px solid #00aaff; border-radius: 8px;">
                            <strong style="color: #00aaff; font-size: 16px;">Gateway Pronto!</strong>
                            <p style="color: #888; margin: 10px 0; font-size: 13px;">
                                O gateway está rodando e pronto para uso.
                            </p>
                            <button 
                                onclick="openChatWithToken()" 
                                style="margin-top: 10px; padding: 15px 30px; background: #ffffff; color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px; width: 100%;">
                                Abrir Chat
                            </button>
                        </div>
                    </div>
                `;
            }
        } else {
            updateStatus('Erro ao iniciar Gateway: ' + result.message, 'error');
            const statusDiv = document.getElementById('gateway-status');
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div class="error-message">
                        <strong>Erro ao iniciar Gateway:</strong><br>
                        ${result.message}<br><br>
                        ${result.output ? `<details><summary>Ver detalhes</summary><pre style="font-size: 10px; max-height: 200px; overflow: auto;">${result.output}</pre></details><br>` : ''}
                        <button onclick="window.location.reload()" class="secondary">
                            Tentar Novamente
                        </button>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        updateStatus('Erro ao iniciar Gateway', 'error');
        const statusDiv = document.getElementById('gateway-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="error-message">
                    <strong>Erro:</strong><br>
                    ${error.message}<br><br>
                    <button onclick="window.location.reload()" class="secondary">
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }
};

window.restartConfiguration = function() {
    configState = {
        step: 'welcome',
        gatewayMode: 'local',
        gatewayPort: 18789,
        gatewayBind: null,
        authMode: 'token',
        authToken: null,
        provider: null,
        model: null
    };
    render();
};

// Copiar token para clipboard
window.copyTokenToClipboard = function() {
    const tokenInput = document.getElementById('token-display');
    if (tokenInput) {
        tokenInput.select();
        document.execCommand('copy');
        
        // Feedback visual
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copiado!';
        button.style.background = '#ffffff';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#00aaff';
        }, 2000);
    }
};

// Abrir chat com token
window.openChatWithToken = function() {
    console.log('=== ABRINDO CHAT ===');
    console.log('Timestamp:', new Date().toISOString());
    
    // IMPORTANTE: Verificar se o gateway está rodando antes de abrir o chat
    console.log('⚠️ AVISO: Abrindo chat SEM verificar se gateway está rodando!');
    console.log('⚠️ Isso pode causar erro de conexão ERR_CONNECTION_REFUSED');
    console.log('⚠️ O gateway deve ser iniciado ANTES de abrir o chat');
    
    // Ler o token do arquivo de configuração salvo
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');
    
    console.log('Config path:', configPath);
    console.log('Config existe?', fs.existsSync(configPath));
    
    let savedToken = configState.authToken; // Fallback para o token da sessão
    let savedPort = configState.gatewayPort || 18789; // Fallback para porta padrão
    let savedBind = configState.gatewayBind || 'auto'; // Fallback para bind padrão
    
    try {
        if (fs.existsSync(configPath)) {
            const configContent = fs.readFileSync(configPath, 'utf8');
            console.log('Config content length:', configContent.length);
            
            const savedConfig = JSON.parse(configContent);
            console.log('Config parsed successfully');
            console.log('Config keys:', Object.keys(savedConfig));
            
            if (savedConfig.gateway) {
                // Ler token
                if (savedConfig.gateway.auth && savedConfig.gateway.auth.token) {
                    savedToken = savedConfig.gateway.auth.token;
                    console.log('✓ Token lido do arquivo de configuração');
                    console.log('Token length:', savedToken.length);
                }
                
                // Ler porta
                if (savedConfig.gateway.port) {
                    savedPort = savedConfig.gateway.port;
                    console.log('✓ Porta lida do arquivo de configuração:', savedPort);
                }
                
                // Ler bind
                if (savedConfig.gateway.bind) {
                    savedBind = savedConfig.gateway.bind;
                    console.log('✓ Bind lido do arquivo de configuração:', savedBind);
                }
            } else {
                console.warn('⚠️ Configuração do gateway não encontrada');
                console.log('Config:', savedConfig);
            }
        } else {
            console.warn('⚠️ Arquivo de configuração não existe');
        }
    } catch (error) {
        console.error('❌ Erro ao ler configuração do arquivo:', error);
        console.error('Error stack:', error.stack);
    }
    
    console.log('Gateway Port:', savedPort);
    console.log('Gateway Token (primeiros 16 chars):', savedToken?.substring(0, 16) + '...');
    console.log('Gateway Bind:', savedBind);
    
    updateStatus('Carregando interface de chat...');
    
    const uiData = {
        port: savedPort,
        token: savedToken,
        bind: savedBind
    };
    
    console.log('=== DADOS PARA LOAD-CHAT-UI ===');
    console.log(JSON.stringify(uiData, null, 2));
    
    // Notificar o main process para carregar a UI
    const { ipcRenderer } = require('electron');
    
    console.log('Enviando evento load-chat-ui...');
    ipcRenderer.send('load-chat-ui', uiData);
    console.log('✓ Evento load-chat-ui enviado com sucesso');
    
    // Aguardar um pouco e verificar se a página mudou
    setTimeout(() => {
        const currentUrl = window.location.href;
        console.log('URL atual após 3 segundos:', currentUrl);
    }, 3000);
};

// Funções do Vault
window.openVaultModal = function(type) {
    const modal = document.getElementById('vault-modal');
    const modalContent = document.getElementById('modal-content');
    
    let formHTML = '';
    
    if (type === 'password') {
        formHTML = `
            <h3 style="color: #ffffff; margin-bottom: 20px;">${t('vault.addPassword')}</h3>
            <div class="input-group">
                <label>${t('vault.serviceName')}:</label>
                <input type="text" id="vault-service" placeholder="Ex: Gmail, Netflix, etc.">
            </div>
            <div class="input-group">
                <label>${t('vault.username')}:</label>
                <input type="text" id="vault-username" placeholder="usuario@email.com">
            </div>
            <div class="input-group">
                <label>${t('vault.password')}:</label>
                <input type="password" id="vault-password" placeholder="••••••••">
            </div>
            <div style="margin-top: 20px;">
                <button onclick="saveVaultItem('password')">${t('vault.save')}</button>
                <button class="secondary" onclick="closeVaultModal()">${t('vault.cancel')}</button>
            </div>
        `;
    } else if (type === 'card') {
        formHTML = `
            <h3 style="color: #ffffff; margin-bottom: 20px;">${t('vault.addCard')}</h3>
            <div class="input-group">
                <label>${t('vault.cardHolder')}:</label>
                <input type="text" id="vault-cardholder" placeholder="Nome no Cartão">
            </div>
            <div class="input-group">
                <label>${t('vault.cardNumber')}:</label>
                <input type="text" id="vault-cardnumber" placeholder="1234 5678 9012 3456" maxlength="19">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="input-group">
                    <label>${t('vault.expiryDate')}:</label>
                    <input type="text" id="vault-expiry" placeholder="MM/AA" maxlength="5">
                </div>
                <div class="input-group">
                    <label>${t('vault.cvv')}:</label>
                    <input type="text" id="vault-cvv" placeholder="123" maxlength="4">
                </div>
            </div>
            <div style="margin-top: 20px;">
                <button onclick="saveVaultItem('card')">${t('vault.save')}</button>
                <button class="secondary" onclick="closeVaultModal()">${t('vault.cancel')}</button>
            </div>
        `;
    } else if (type === 'apikey') {
        formHTML = `
            <h3 style="color: #ffffff; margin-bottom: 20px;">${t('vault.addApiKey')}</h3>
            <div class="input-group">
                <label>${t('vault.apiKeyName')}:</label>
                <input type="text" id="vault-apiname" placeholder="Ex: OpenAI, Claude, etc.">
            </div>
            <div class="input-group">
                <label>${t('vault.apiKeyValue')}:</label>
                <textarea id="vault-apivalue" rows="3" placeholder="sk-..." style="font-family: monospace;"></textarea>
            </div>
            <div style="margin-top: 20px;">
                <button onclick="saveVaultItem('apikey')">${t('vault.save')}</button>
                <button class="secondary" onclick="closeVaultModal()">${t('vault.cancel')}</button>
            </div>
        `;
    } else if (type === 'note') {
        formHTML = `
            <h3 style="color: #ffffff; margin-bottom: 20px;">${t('vault.addNote')}</h3>
            <div class="input-group">
                <label>${t('vault.noteTitle')}:</label>
                <input type="text" id="vault-notetitle" placeholder="Título da nota">
            </div>
            <div class="input-group">
                <label>${t('vault.noteContent')}:</label>
                <textarea id="vault-notecontent" rows="5" placeholder="Conteúdo confidencial..."></textarea>
            </div>
            <div style="margin-top: 20px;">
                <button onclick="saveVaultItem('note')">${t('vault.save')}</button>
                <button class="secondary" onclick="closeVaultModal()">${t('vault.cancel')}</button>
            </div>
        `;
    } else if (type === 'airule') {
        formHTML = `
            <h3 style="color: #ffffff; margin-bottom: 20px;">${t('vault.addAiRule')}</h3>
            <div class="input-group">
                <label>${t('vault.ruleTitle')}:</label>
                <input type="text" id="vault-ruletitle" placeholder="Ex: Responder em português, Ser formal, etc.">
            </div>
            <div class="input-group">
                <label>${t('vault.ruleContent')}:</label>
                <textarea id="vault-rulecontent" rows="6" placeholder="Você deve sempre responder em português brasileiro. Use linguagem formal e profissional..."></textarea>
            </div>
            <div class="input-group">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="vault-ruleactive" checked style="margin-right: 10px; width: 20px; height: 20px;">
                    ${t('vault.ruleActive')}
                </label>
            </div>
            <div style="margin-top: 20px;">
                <button onclick="saveVaultItem('airule')">${t('vault.save')}</button>
                <button class="secondary" onclick="closeVaultModal()">${t('vault.cancel')}</button>
            </div>
        `;
    }
    
    modalContent.innerHTML = formHTML;
    modal.style.display = 'flex';
};

window.closeVaultModal = function() {
    const modal = document.getElementById('vault-modal');
    modal.style.display = 'none';
};

window.saveVaultItem = function(type) {
    if (type === 'password') {
        const service = document.getElementById('vault-service').value.trim();
        const username = document.getElementById('vault-username').value.trim();
        const password = document.getElementById('vault-password').value.trim();
        
        if (!service || !username || !password) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        configState.vault.passwords.push({ service, username, password });
    } else if (type === 'card') {
        const holder = document.getElementById('vault-cardholder').value.trim();
        const number = document.getElementById('vault-cardnumber').value.trim().replace(/\s/g, '');
        const expiry = document.getElementById('vault-expiry').value.trim();
        const cvv = document.getElementById('vault-cvv').value.trim();
        
        if (!holder || !number || !expiry || !cvv) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        configState.vault.creditCards.push({ holder, number, expiry, cvv });
    } else if (type === 'apikey') {
        const name = document.getElementById('vault-apiname').value.trim();
        const value = document.getElementById('vault-apivalue').value.trim();
        
        if (!name || !value) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        configState.vault.apiKeys.push({ name, value });
    } else if (type === 'note') {
        const title = document.getElementById('vault-notetitle').value.trim();
        const content = document.getElementById('vault-notecontent').value.trim();
        
        if (!title || !content) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        configState.vault.notes.push({ title, content });
    } else if (type === 'airule') {
        const title = document.getElementById('vault-ruletitle').value.trim();
        const content = document.getElementById('vault-rulecontent').value.trim();
        const active = document.getElementById('vault-ruleactive').checked;
        
        if (!title || !content) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        configState.vault.aiRules.push({ title, content, active });
    }
    
    closeVaultModal();
    render(); // Re-renderizar para mostrar o novo item
};

window.deleteVaultItem = function(type, index) {
    if (!confirm(t('vault.confirmDelete'))) {
        return;
    }
    
    if (type === 'password') {
        configState.vault.passwords.splice(index, 1);
    } else if (type === 'card') {
        configState.vault.creditCards.splice(index, 1);
    } else if (type === 'apikey') {
        configState.vault.apiKeys.splice(index, 1);
    } else if (type === 'note') {
        configState.vault.notes.splice(index, 1);
    } else if (type === 'airule') {
        configState.vault.aiRules.splice(index, 1);
    }
    
    render();
};

window.toggleAiRule = function(index) {
    if (configState.vault.aiRules[index]) {
        configState.vault.aiRules[index].active = !configState.vault.aiRules[index].active;
        render();
    }
};

window.skipVault = function() {
    console.log('=== SKIP VAULT ===');
    console.log('Usuário optou por pular o cofre');
    finishVaultAndStart();
};

window.nextVaultCategory = function() {
    const vaultCategories = ['passwords', 'creditCards', 'apiKeys', 'notes', 'aiRules'];
    const currentIndex = vaultCategories.indexOf(configState.vaultStep);
    
    if (currentIndex < vaultCategories.length - 1) {
        configState.vaultStep = vaultCategories[currentIndex + 1];
        render();
    }
};

window.previousVaultCategory = function() {
    const vaultCategories = ['passwords', 'creditCards', 'apiKeys', 'notes', 'aiRules'];
    const currentIndex = vaultCategories.indexOf(configState.vaultStep);
    
    if (currentIndex > 0) {
        configState.vaultStep = vaultCategories[currentIndex - 1];
        render();
    }
};

window.addVaultItemInline = function(type) {
    if (type === 'password') {
        const service = document.getElementById('vault-service')?.value.trim();
        const username = document.getElementById('vault-username')?.value.trim();
        const password = document.getElementById('vault-password')?.value.trim();
        
        if (!service || !username || !password) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        configState.vault.passwords.push({ service, username, password });
        
        // Limpar campos
        document.getElementById('vault-service').value = '';
        document.getElementById('vault-username').value = '';
        document.getElementById('vault-password').value = '';
        
        render();
    } else if (type === 'card') {
        const holder = document.getElementById('vault-cardholder')?.value.trim();
        const number = document.getElementById('vault-cardnumber')?.value.trim().replace(/\s/g, '');
        const expiry = document.getElementById('vault-expiry')?.value.trim();
        const cvv = document.getElementById('vault-cvv')?.value.trim();
        
        if (!holder || !number || !expiry || !cvv) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        configState.vault.creditCards.push({ holder, number, expiry, cvv });
        
        // Limpar campos
        document.getElementById('vault-cardholder').value = '';
        document.getElementById('vault-cardnumber').value = '';
        document.getElementById('vault-expiry').value = '';
        document.getElementById('vault-cvv').value = '';
        
        render();
    } else if (type === 'apikey') {
        const name = document.getElementById('vault-apiname')?.value.trim();
        const value = document.getElementById('vault-apivalue')?.value.trim();
        
        if (!name || !value) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        configState.vault.apiKeys.push({ name, value });
        
        // Limpar campos
        document.getElementById('vault-apiname').value = '';
        document.getElementById('vault-apivalue').value = '';
        
        render();
    } else if (type === 'note') {
        const title = document.getElementById('vault-notetitle')?.value.trim();
        const content = document.getElementById('vault-notecontent')?.value.trim();
        
        if (!title || !content) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        configState.vault.notes.push({ title, content });
        
        // Limpar campos
        document.getElementById('vault-notetitle').value = '';
        document.getElementById('vault-notecontent').value = '';
        
        render();
    } else if (type === 'airule') {
        const title = document.getElementById('vault-ruletitle')?.value.trim();
        const content = document.getElementById('vault-rulecontent')?.value.trim();
        const active = document.getElementById('vault-ruleactive')?.checked;
        
        if (!title || !content) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        configState.vault.aiRules.push({ title, content, active });
        
        // Limpar campos
        document.getElementById('vault-ruletitle').value = '';
        document.getElementById('vault-rulecontent').value = '';
        document.getElementById('vault-ruleactive').checked = true;
        
        render();
    }
};

window.finishVaultAndStart = function() {
    console.log('=== FINISH VAULT ===');
    console.log('Salvando configuração com vault...');
    
    // Pular S.H.I.E.L.D. e ir direto para starting
    saveConfigAndStart();
};

// Função para salvar config e iniciar (sem shield)
window.saveConfigAndStart = function() {
    console.log('=== SAVE CONFIG AND START ===');
    console.log('Salvando configuração completa (sem S.H.I.E.L.D.)...');
    
    updateStatus('Salvando configuração...');
    
    if (saveConfig()) {
        console.log('✓ Configuração salva com sucesso');
        updateStatus('Iniciando Gateway...');
        configState.step = 'starting';
        render();
    } else {
        console.error('❌ Erro ao salvar configuração');
        updateStatus('Erro ao salvar configuração', 'error');
        alert('Erro ao salvar configuração. Por favor, tente novamente.');
    }
};

// toggleShield removida

// Gerar código de desativação aleatório
// generateDisableCode removida

// Instalar ollama-js com barra de progresso
async function installOllamaJsWithProgress() {
    return new Promise((resolve, reject) => {
        // Criar modal de progresso
        const modal = document.createElement('div');
        modal.id = 'ollama-js-progress-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: #1a1a1a; padding: 40px; border-radius: 12px; max-width: 500px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                <h2 style="color: #ffffff; margin: 0 0 20px 0; text-align: center;">
                    Instalando Ollama-js
                </h2>
                <p style="color: #888; text-align: center; margin-bottom: 30px;">
                    Aguarde enquanto instalamos as dependências do S.H.I.E.L.D...
                </p>
                
                <div style="background: #0a0a0a; border-radius: 8px; padding: 4px; margin-bottom: 15px;">
                    <div id="progress-bar" style="
                        width: 0%;
                        height: 30px;
                        background: linear-gradient(90deg, #00ff41, #00cc33);
                        border-radius: 6px;
                        transition: width 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <span id="progress-percent" style="color: #000; font-weight: bold; font-size: 14px;">0%</span>
                    </div>
                </div>
                
                <p id="progress-message" style="color: #888; text-align: center; font-size: 14px; min-height: 20px;">
                    Iniciando...
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const progressBar = document.getElementById('progress-bar');
        const progressPercent = document.getElementById('progress-percent');
        const progressMessage = document.getElementById('progress-message');
        
        // Listener para progresso
        ipcRenderer.on('ollama-js-progress', (event, data) => {
            const { progress, message } = data;
            progressBar.style.width = `${progress}%`;
            progressPercent.textContent = `${progress}%`;
            progressMessage.textContent = message;
        });
        
        // Iniciar instalação
        ipcRenderer.invoke('install-ollama-js').then(result => {
            // Remover listener
            ipcRenderer.removeAllListeners('ollama-js-progress');
            
            // Remover modal após 1 segundo
            setTimeout(() => {
                document.body.removeChild(modal);
                
                if (result.success) {
                    console.log('✓ Ollama-js instalado com sucesso!');
                    resolve(result);
                } else {
                    console.error('❌ Erro ao instalar ollama-js:', result.error);
                    alert(`Erro ao instalar ollama-js: ${result.error}`);
                    reject(new Error(result.error));
                }
            }, 1000);
        }).catch(error => {
            // Remover listener
            ipcRenderer.removeAllListeners('ollama-js-progress');
            
            // Remover modal
            document.body.removeChild(modal);
            
            console.error('❌ Erro ao instalar ollama-js:', error);
            alert(`Erro ao instalar ollama-js: ${error.message}`);
            reject(error);
        });
    });
}

// finishShieldAndStart removida

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    // Carregar idioma salvo do localStorage
    loadSavedLanguage();
    
    // Carregar configuração existente
    loadExistingConfig();
    
    // Renderizar interface
    render();
    
    updateStatus(t('status.ready'));
});
