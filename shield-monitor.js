// S.H.I.E.L.D. Monitor - Intercepta e monitora ações da IA
(function() {
    console.log('🛡️ S.H.I.E.L.D. Monitor carregado');
    
    // Carregar configuração do S.H.I.E.L.D.
    let shieldConfig = {
        enabled: false,
        requireHumanApproval: true,
        autoBlock: true,
        disableCode: null
    };
    
    // Tentar carregar do arquivo
    try {
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        
        const shieldPath = path.join(os.homedir(), '.ultron', 'shield-config.json');
        if (fs.existsSync(shieldPath)) {
            const data = JSON.parse(fs.readFileSync(shieldPath, 'utf8'));
            shieldConfig = {
                enabled: data.enabled || false,
                requireHumanApproval: data.requireHumanApproval !== false,
                autoBlock: data.autoBlock !== false,
                disableCode: data.disableCode || null
            };
            console.log('🛡️ S.H.I.E.L.D. configuração carregada:', shieldConfig);
        }
    } catch (error) {
        console.error('Erro ao carregar configuração do S.H.I.E.L.D.:', error);
    }
    
    if (!shieldConfig.enabled) {
        console.log('🛡️ S.H.I.E.L.D. desabilitado');
        return;
    }
    
    console.log('🛡️ S.H.I.E.L.D. ATIVO - Monitorando ações da IA');
    
    // Carregar S.H.I.E.L.D. JavaScript Engine
    let ShieldJSEngine = null;
    let shieldEngine = null;
    
    try {
        // Tentar carregar do arquivo
        const fs = require('fs');
        const path = require('path');
        const enginePath = path.join(__dirname, 'shield-js-engine.js');
        
        if (fs.existsSync(enginePath)) {
            const engineCode = fs.readFileSync(enginePath, 'utf8');
            eval(engineCode);
            ShieldJSEngine = window.ShieldJSEngine || ShieldJSEngine;
        }
    } catch (error) {
        console.error('Erro ao carregar S.H.I.E.L.D. Engine:', error);
    }
    
    // Se não conseguiu carregar, usar versão inline
    if (!ShieldJSEngine) {
        console.log('🛡️ Usando S.H.I.E.L.D. Engine inline');
        // Incluir versão inline do engine aqui se necessário
    }
    
    // Inicializar engine
    if (ShieldJSEngine) {
        shieldEngine = new ShieldJSEngine(shieldConfig);
        shieldEngine.start().then(() => {
            console.log('🛡️ S.H.I.E.L.D. JavaScript Engine iniciado');
            showShieldNotification('S.H.I.E.L.D. Ativo', 'Sistema de segurança monitorando ações da IA');
        });
    } else {
        console.warn('🛡️ S.H.I.E.L.D. Engine não disponível');
        return;
    }
    
    // Adicionar interface de desativação no chat
    addShieldControlPanel();
    
    // Interceptar WebSocket para monitorar mensagens
    const originalWebSocket = window.WebSocket;
    window.WebSocket = function(...args) {
        const ws = new originalWebSocket(...args);
        
        // Interceptar envio de mensagens
        const originalSend = ws.send;
        ws.send = function(data) {
            try {
                const message = JSON.parse(data);
                
                // Monitorar apenas mensagens de usuário para IA
                if (message.type === 'message' || message.type === 'chat') {
                    console.log('🛡️ Monitorando mensagem:', message);
                    
                    if (shieldEngine) {
                        // Criar ação para monitorar
                        const action = {
                            type: 'API_CALL',
                            description: 'Enviar mensagem para IA',
                            parameters: {
                                message: message.content || message.text,
                                model: message.model
                            },
                            agentId: 'ultron-agent',
                            reasoning: 'Responder usuário'
                        };
                        
                        // Monitorar de forma assíncrona (não bloquear)
                        shieldEngine.monitorAction(action).then(result => {
                            console.log('🛡️ Resultado da análise:', result);
                            
                            if (!result.allowed) {
                                console.warn('🛡️ Ação bloqueada pelo S.H.I.E.L.D.:', result);
                                showShieldNotification(
                                    'Ação Bloqueada',
                                    result.reason,
                                    'warning'
                                );
                                // Não enviar mensagem se bloqueada
                                return;
                            }
                        });
                    }
                }
            } catch (error) {
                // Não é JSON ou erro ao processar, enviar normalmente
            }
            
            return originalSend.call(this, data);
        };
        
        // Interceptar recebimento de mensagens
        ws.addEventListener('message', function(event) {
            try {
                const message = JSON.parse(event.data);
                
                // Monitorar respostas da IA
                if (message.type === 'response' || message.type === 'completion') {
                    console.log('🛡️ Monitorando resposta da IA:', message);
                    
                    // Verificar se há código na resposta
                    if (message.code || (message.content && message.content.includes('```'))) {
                        if (shieldEngine) {
                            const action = {
                                type: 'CODE_EXECUTION',
                                description: 'IA sugeriu executar código',
                                parameters: {
                                    code: message.code || extractCode(message.content)
                                },
                                agentId: 'ultron-agent',
                                reasoning: message.reasoning || 'Resposta da IA'
                            };
                            
                            shieldEngine.monitorAction(action).then(result => {
                                if (!result.allowed) {
                                    console.warn('🛡️ Código bloqueado pelo S.H.I.E.L.D.:', result);
                                    showShieldNotification(
                                        'Código Bloqueado',
                                        result.reason,
                                        'warning'
                                    );
                                }
                            });
                        }
                    }
                }
            } catch (error) {
                // Não é JSON ou erro ao processar
            }
        });
        
        return ws;
    };
    
    // Função para adicionar painel de controle do S.H.I.E.L.D.
    function addShieldControlPanel() {
        // Aguardar DOM carregar
        setTimeout(() => {
            const panel = document.createElement('div');
            panel.id = 'shield-control-panel';
            panel.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #00aaff;
                border-radius: 8px;
                padding: 15px;
                z-index: 9999;
                min-width: 250px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            `;
            
            panel.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="font-size: 20px;">🛡️</div>
                        <strong style="color: #00aaff;">S.H.I.E.L.D.</strong>
                    </div>
                    <div id="shield-status-indicator" style="width: 10px; height: 10px; border-radius: 50%; background: #00ff00;"></div>
                </div>
                
                <div id="shield-ollama-status" style="font-size: 11px; color: #888; margin-bottom: 10px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <div id="ollama-indicator" style="width: 8px; height: 8px; border-radius: 50%; background: #888;"></div>
                        <span id="ollama-status-text">Verificando Ollama...</span>
                    </div>
                </div>
                
                <div style="font-size: 11px; color: #888; margin-bottom: 10px;">
                    <div>Ações: <span id="shield-total-actions">0</span></div>
                    <div>Ameaças: <span id="shield-threats">0</span></div>
                    <div>Bloqueadas: <span id="shield-blocked">0</span></div>
                </div>
                
                <button id="shield-disable-btn" style="
                    width: 100%;
                    padding: 8px;
                    background: #ff0000;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                ">
                    Desativar S.H.I.E.L.D.
                </button>
                
                <button id="shield-minimize-btn" style="
                    width: 100%;
                    padding: 6px;
                    background: transparent;
                    color: #888;
                    border: 1px solid #444;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    margin-top: 5px;
                ">
                    Minimizar
                </button>
            `;
            
            document.body.appendChild(panel);
            
            // Verificar Ollama
            async function checkOllamaStatus() {
                try {
                    const response = await fetch('http://localhost:11434/api/tags');
                    if (response.ok) {
                        document.getElementById('ollama-indicator').style.background = '#00ff00';
                        document.getElementById('ollama-status-text').textContent = 'Ollama: Conectado';
                        document.getElementById('ollama-status-text').style.color = '#00ff00';
                    } else {
                        throw new Error('Ollama not responding');
                    }
                } catch (error) {
                    document.getElementById('ollama-indicator').style.background = '#ff0000';
                    document.getElementById('ollama-status-text').textContent = 'Ollama: Desconectado';
                    document.getElementById('ollama-status-text').style.color = '#ff0000';
                }
            }
            
            // Verificar Ollama a cada 5 segundos
            checkOllamaStatus();
            setInterval(checkOllamaStatus, 5000);
            
            // Atualizar métricas a cada 2 segundos
            setInterval(() => {
                if (shieldEngine) {
                    const metrics = shieldEngine.getMetrics();
                    document.getElementById('shield-total-actions').textContent = metrics.totalActions;
                    document.getElementById('shield-threats').textContent = metrics.threatsDetected;
                    document.getElementById('shield-blocked').textContent = metrics.actionsBlocked;
                }
            }, 2000);
            
            // Botão de desativar
            document.getElementById('shield-disable-btn').addEventListener('click', () => {
                showDisableCodePrompt();
            });
            
            // Botão de minimizar
            document.getElementById('shield-minimize-btn').addEventListener('click', () => {
                const content = panel.querySelector('div:nth-child(2)');
                const buttons = panel.querySelectorAll('button');
                
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    buttons.forEach(btn => btn.style.display = 'block');
                    document.getElementById('shield-minimize-btn').textContent = 'Minimizar';
                } else {
                    content.style.display = 'none';
                    buttons[0].style.display = 'none';
                    document.getElementById('shield-minimize-btn').textContent = 'Expandir';
                }
            });
        }, 2000);
    }
    
    // Função para mostrar prompt de código de desativação
    function showDisableCodePrompt() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="
                background: #1a1a1a;
                padding: 30px;
                border-radius: 8px;
                max-width: 400px;
                width: 90%;
                border: 2px solid #ff0000;
            ">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🛡️</div>
                    <strong style="color: #ff0000; font-size: 18px;">Desativar S.H.I.E.L.D.</strong>
                </div>
                
                <p style="color: #888; margin-bottom: 20px; text-align: center;">
                    Digite o código de desativação fornecido durante a configuração:
                </p>
                
                <input type="text" id="disable-code-input" placeholder="XXXX-XXXX" style="
                    width: 100%;
                    padding: 12px;
                    background: rgba(0,0,0,0.5);
                    border: 2px solid #444;
                    border-radius: 4px;
                    color: white;
                    font-size: 16px;
                    text-align: center;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 20px;
                ">
                
                <div style="display: flex; gap: 10px;">
                    <button id="disable-confirm-btn" style="
                        flex: 1;
                        padding: 12px;
                        background: #ff0000;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        Desativar
                    </button>
                    <button id="disable-cancel-btn" style="
                        flex: 1;
                        padding: 12px;
                        background: #444;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">
                        Cancelar
                    </button>
                </div>
                
                <div id="disable-error" style="
                    color: #ff0000;
                    text-align: center;
                    margin-top: 10px;
                    font-size: 12px;
                    display: none;
                "></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = document.getElementById('disable-code-input');
        const errorDiv = document.getElementById('disable-error');
        
        // Focar no input
        input.focus();
        
        // Confirmar
        document.getElementById('disable-confirm-btn').addEventListener('click', () => {
            const code = input.value.trim().toUpperCase();
            
            if (!code) {
                errorDiv.textContent = 'Digite o código';
                errorDiv.style.display = 'block';
                return;
            }
            
            if (shieldEngine) {
                const result = shieldEngine.disableWithCode(code);
                
                if (result.success) {
                    // Salvar estado desabilitado
                    try {
                        const fs = require('fs');
                        const path = require('path');
                        const os = require('os');
                        
                        const shieldPath = path.join(os.homedir(), '.ultron', 'shield-config.json');
                        if (fs.existsSync(shieldPath)) {
                            const data = JSON.parse(fs.readFileSync(shieldPath, 'utf8'));
                            data.enabled = false;
                            fs.writeFileSync(shieldPath, JSON.stringify(data, null, 2));
                        }
                    } catch (error) {
                        console.error('Erro ao salvar estado:', error);
                    }
                    
                    document.body.removeChild(modal);
                    showShieldNotification('S.H.I.E.L.D. Desativado', 'Sistema de segurança foi desativado', 'warning');
                    
                    // Remover painel
                    const panel = document.getElementById('shield-control-panel');
                    if (panel) {
                        document.body.removeChild(panel);
                    }
                } else {
                    errorDiv.textContent = result.message;
                    errorDiv.style.display = 'block';
                    input.value = '';
                    input.focus();
                }
            }
        });
        
        // Cancelar
        document.getElementById('disable-cancel-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Enter para confirmar
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('disable-confirm-btn').click();
            }
        });
    }
    
    // Função para extrair código de markdown
    function extractCode(content) {
        const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)```/);
        return codeMatch ? codeMatch[1] : '';
    }
    
    // Função para mostrar notificação do S.H.I.E.L.D.
    function showShieldNotification(title, message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : type === 'warning' ? '#ffa500' : '#00aaff'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="font-size: 24px;">🛡️</div>
                <div>
                    <strong style="display: block; margin-bottom: 5px;">${title}</strong>
                    <small>${message}</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
    
    // Adicionar animações CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('🛡️ S.H.I.E.L.D. Monitor pronto');
})();
