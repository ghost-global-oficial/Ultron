import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import net from 'net';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================
// INSTALAR SISTEMA DE SEGURANÇA UNIFICADO
// ============================================
console.log('🔒 Carregando Ultron Security System...');
const { UltronSecuritySystem } = require('./ultron-security-system.cjs');

// Verificar se S.H.I.E.L.D. está habilitado
const shieldConfigPath = path.join(os.homedir(), '.ultron', 'shield-config.json');
let shieldEnabled = false;

try {
    if (fs.existsSync(shieldConfigPath)) {
        const shieldConfig = JSON.parse(fs.readFileSync(shieldConfigPath, 'utf8'));
        shieldEnabled = shieldConfig.enabled === true;
    }
} catch (error) {
    console.error('Erro ao verificar S.H.I.E.L.D.:', error);
}

// Instalar sistema de segurança se S.H.I.E.L.D. estiver habilitado
if (shieldEnabled) {
    console.log('🛡️ S.H.I.E.L.D. está habilitado - ativando proteções...');
    const securitySystem = new UltronSecuritySystem();
    securitySystem.start();
} else {
    console.log('ℹ️ S.H.I.E.L.D. desabilitado - sistema de segurança não instalado');
}
// ============================================

let mainWindow;
let gatewayProcess = null; // Manter referência ao processo do gateway

// Função para verificar e instalar Ollama na primeira execução
async function setupOllama() {
  const ollamaFlagPath = path.join(os.homedir(), '.ultron', '.ollama-installed');
  
  // Verificar se já foi instalado antes
  if (fs.existsSync(ollamaFlagPath)) {
    console.log('✓ Ollama já foi configurado anteriormente');
    return true;
  }
  
  console.log('=== PRIMEIRA EXECUÇÃO: INSTALANDO OLLAMA ===');
  
  try {
    const OllamaInstaller = require('./install-ollama.cjs');
    const installer = new OllamaInstaller();
    
    const success = await installer.setup();
    
    if (success) {
      // Criar flag para não instalar novamente
      const ultronDir = path.join(os.homedir(), '.ultron');
      if (!fs.existsSync(ultronDir)) {
        fs.mkdirSync(ultronDir, { recursive: true });
      }
      fs.writeFileSync(ollamaFlagPath, new Date().toISOString());
      console.log('✓ Ollama configurado com sucesso!');
      return true;
    } else {
      console.error('❌ Falha ao configurar Ollama');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao configurar Ollama:', error);
    return false;
  }
}

// Função para iniciar gateway a partir da configuração
async function startGatewayFromConfig(config) {
  const entryPath = path.join(__dirname, 'dist', 'entry.js');
  
  if (!fs.existsSync(entryPath)) {
    return {
      success: false,
      message: 'Gateway não compilado. Execute "npm run build" primeiro.'
    };
  }
  
  const args = [
    entryPath,
    'gateway',
    'run',
    '--allow-unconfigured',
    '--port',
    config.gateway.port.toString()
  ];
  
  console.log('[Gateway] Iniciando com args:', args);
  
  gatewayProcess = spawn('node', args, {
    cwd: __dirname,
    env: {
      ...process.env,
      ULTRON_INTERACTIVE: 'false',
      NODE_ENV: 'production',
      ULTRON_GATEWAY_AUTH_TOKEN: config.gateway.auth.token,
      ULTRON_GATEWAY_TOKEN: config.gateway.auth.token,
      ...config.env.vars
    },
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  let gatewayStarted = false;
  let gatewayError = null;
  
  gatewayProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('[Gateway STDOUT]', output);
    
    // Detectar quando o gateway está pronto
    // O símbolo "|" indica que o banner foi impresso e o gateway está rodando
    if (output.toLowerCase().includes('listening') || 
        output.toLowerCase().includes('started') ||
        output.toLowerCase().includes('ready') ||
        output.includes('|') ||  // Banner do gateway
        output.includes('Gateway') ||
        output.includes('Doctor')) {
      gatewayStarted = true;
    }
  });
  
  gatewayProcess.stderr.on('data', (data) => {
    const error = data.toString();
    console.error('[Gateway STDERR]', error);
    
    if (error.includes('Error')) {
      gatewayError = error;
    }
  });
  
  gatewayProcess.on('exit', (code, signal) => {
    console.log(`[Gateway] Processo encerrado com código ${code}`);
    gatewayProcess = null;
    
    if (code !== 0 && code !== null) {
      gatewayError = `Gateway encerrou com código ${code}`;
    }
  });
  
  // Aguardar gateway iniciar (máximo 30 segundos)
  for (let i = 0; i < 60; i++) {
    if (gatewayStarted || gatewayError) break;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  if (gatewayError) {
    return { success: false, message: gatewayError };
  }
  
  if (gatewayStarted) {
    return { success: true };
  }
  
  return { success: false, message: 'Gateway não foi detectado após 30 segundos' };
}

// Função para carregar UI do chat
function loadChatUIFromConfig(config) {
  const uiPath = path.join(__dirname, 'dist', 'control-ui', 'index.html');
  
  if (fs.existsSync(uiPath)) {
    let html = fs.readFileSync(uiPath, 'utf8');
    
    // Ler o script de tradução
    const i18nScriptPath = path.join(__dirname, 'chat-i18n.js');
    let i18nScript = '';
    if (fs.existsSync(i18nScriptPath)) {
      i18nScript = fs.readFileSync(i18nScriptPath, 'utf8');
      console.log('✓ Script de tradução carregado para auto-start');
    }
    
    // Ler o script do S.H.I.E.L.D. monitor
    const shieldMonitorPath = path.join(__dirname, 'shield-monitor.js');
    let shieldMonitorScript = '';
    if (fs.existsSync(shieldMonitorPath)) {
      shieldMonitorScript = fs.readFileSync(shieldMonitorPath, 'utf8');
      console.log('✓ Script do S.H.I.E.L.D. monitor carregado');
    }
    
    // Ler o S.H.I.E.L.D. JavaScript Engine
    const shieldEnginePath = path.join(__dirname, 'shield-js-engine.js');
    let shieldEngineScript = '';
    if (fs.existsSync(shieldEnginePath)) {
      shieldEngineScript = fs.readFileSync(shieldEnginePath, 'utf8');
      console.log('✓ S.H.I.E.L.D. JavaScript Engine carregado');
    }
    
    const wsUrl = `ws://localhost:${config.gateway.port}`;
    const configScript = `
      <script>
        // SALVAR CONFIGURAÇÕES NO LOCALSTORAGE
        console.log('=== SALVANDO CONFIGURAÇÕES NO LOCALSTORAGE ===');
        
        const settings = {
          gatewayUrl: '${wsUrl}',
          token: '${config.gateway.auth.token}',
          sessionKey: 'agent:main:main',
          lastActiveSessionKey: 'agent:main:main',
          theme: 'dark',
          chatFocusMode: false,
          chatShowThinking: true,
          splitRatio: 0.6,
          navCollapsed: false,
          navGroupsCollapsed: {}
        };
        localStorage.setItem('ultron.control.settings.v1', JSON.stringify(settings));
        console.log('✓ Settings saved to localStorage');
        console.log('✓ SessionKey:', 'agent:main:main');
        console.log('✓ Token:', '${config.gateway.auth.token}'.substring(0, 16) + '...');
        console.log('✓ Gateway URL:', '${wsUrl}');
        
        // Definir variáveis globais também (fallback)
        window.__ULTRON_GATEWAY_URL__ = '${wsUrl}';
        window.__ULTRON_GATEWAY_TOKEN__ = '${config.gateway.auth.token}';
        window.__ULTRON_CONTROL_UI_BASE_PATH__ = '';
        window.__ULTRON_ASSISTANT_NAME__ = 'Ultron';
        window.__ULTRON_ASSISTANT_AVATAR__ = '';
        
        console.log('=== ULTRON CONFIG INJECTED ===');
        console.log('Gateway URL:', window.__ULTRON_GATEWAY_URL__);
        console.log('Gateway Token:', '${config.gateway.auth.token}'.substring(0, 16) + '...');
      </script>
      ${i18nScript ? `<script>\n${i18nScript}\n</script>` : ''}
      ${shieldEngineScript ? `<script>\n${shieldEngineScript}\n</script>` : ''}
      ${shieldMonitorScript ? `<script>\n${shieldMonitorScript}\n</script>` : ''}
    `;
    
    const firstScriptIndex = html.indexOf('<script');
    if (firstScriptIndex !== -1) {
      html = html.slice(0, firstScriptIndex) + configScript + html.slice(firstScriptIndex);
    } else {
      html = html.replace('</head>', configScript + '</head>');
    }
    
    const tempPath = path.join(__dirname, 'dist', 'control-ui', 'index-temp.html');
    fs.writeFileSync(tempPath, html);
    mainWindow.loadFile(tempPath);
  } else {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Ultron - Moltbot Powered",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Permitir carregar recursos locais
    },
    backgroundColor: '#0a0a0a',
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // Abrir DevTools para debug
  mainWindow.webContents.openDevTools();
  
  // Limpeza quando a janela for fechada
  mainWindow.on('close', (event) => {
    console.log('=== JANELA FECHANDO ===');
    
    // Encerrar gateway
    if (gatewayProcess) {
      console.log('[Cleanup] Encerrando gateway...');
      try {
        gatewayProcess.kill();
        gatewayProcess = null;
        console.log('[Cleanup] ✓ Gateway encerrado');
      } catch (error) {
        console.error('[Cleanup] ❌ Erro ao encerrar gateway:', error);
      }
    }
    
    // CONFIGURAÇÃO MANTIDA: não deletar mais a configuração ao fechar
    console.log('[Cleanup] ✓ Gateway encerrado, configuração preservada');
  });
  
  // Interceptar recarregamentos de página
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('=== PÁGINA CARREGADA ===');
  });
}

// Listener para carregar a UI do chat
// Debounce para evitar múltiplas chamadas
let loadChatUiTimeout = null;

ipcMain.on('load-chat-ui', (event, data) => {
  // Cancelar timeout anterior se existir
  if (loadChatUiTimeout) {
    console.log('⚠️ Cancelando chamada anterior de load-chat-ui');
    clearTimeout(loadChatUiTimeout);
  }
  
  // Aguardar 500ms antes de processar (debounce)
  loadChatUiTimeout = setTimeout(() => {
    console.log('');
    console.log('='.repeat(80));
    console.log('=== LOAD CHAT UI HANDLER CHAMADO ===');
    console.log('='.repeat(80));
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data recebida:', JSON.stringify(data, null, 2));
    
    if (!mainWindow || mainWindow.isDestroyed()) {
      console.error('❌ ERRO: mainWindow não existe ou foi destruída!');
      return;
    }
    
    // Construir a URL do WebSocket
    const wsUrl = `ws://localhost:${data.port}`;
    console.log('WebSocket URL:', wsUrl);
    console.log('Token:', data.token?.substring(0, 16) + '...');
    
    // CARREGAR A URL DO GATEWAY DIRETAMENTE NO ELECTRON
    // O gateway serve a UI web em http://localhost:PORT
    const chatUrl = `http://localhost:${data.port}/?token=${encodeURIComponent(data.token)}`;
    
    console.log('✓ Carregando chat na janela Electron');
    console.log('URL:', chatUrl);
    
    mainWindow.loadURL(chatUrl).then(() => {
      console.log('✓✓✓ Chat carregado com sucesso! ✓✓✓');
      console.log('URL da janela:', mainWindow.webContents.getURL());
    }).catch(err => {
      console.error('❌ Erro ao carregar chat:', err);
      console.error('Stack:', err.stack);
      console.error('URL tentada:', chatUrl);
    });
    
    console.log('='.repeat(80));
    
    loadChatUiTimeout = null;
  }, 500);
});

app.whenReady().then(async () => {
  // OLLAMA DESABILITADO: Não é necessário para o ULTRON funcionar
  // O usuário pode usar provedores externos (OpenRouter, Claude, etc.)
  // console.log('🔍 Verificando Ollama...');
  // await setupOllama();
  
  // VERIFICAR SE JÁ EXISTE CONFIGURAÇÃO
  console.log('=== VERIFICANDO CONFIGURAÇÃO EXISTENTE ===');
  
  const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');
  
  if (fs.existsSync(configPath)) {
    console.log('✓ Configuração encontrada:', configPath);
    
    try {
      // Carregar configuração existente
      const savedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log('✓ Configuração carregada com sucesso');
      
      // Criar janela
      createWindow();
      
      // Iniciar gateway automaticamente com a configuração salva
      console.log('=== INICIANDO GATEWAY AUTOMATICAMENTE ===');
      const result = await startGatewayFromConfig(savedConfig);
      
      if (result.success) {
        console.log('✓ Gateway iniciado automaticamente!');
        
        // Carregar UI do chat
        loadChatUIFromConfig(savedConfig);
      } else {
        console.error('❌ Erro ao iniciar gateway:', result.message);
        // Mesmo com erro, manter a janela aberta para o usuário reconfigurar
      }
    } catch (error) {
      console.error('❌ Erro ao processar configuração:', error);
      // Se houver erro, abrir wizard de configuração
      createWindow();
    }
  } else {
    console.log('ℹ️ Nenhuma configuração encontrada');
    console.log('=== ABRINDO WIZARD DE CONFIGURAÇÃO ===');
    createWindow();
  }
});

app.on('window-all-closed', () => {
  console.log('=== APP FECHANDO ===');
  
  // Encerrar gateway ao fechar o app
  if (gatewayProcess) {
    console.log('[Cleanup] Encerrando gateway...');
    gatewayProcess.kill();
    gatewayProcess = null;
    console.log('[Cleanup] ✓ Gateway encerrado');
  }
  
  // CONFIGURAÇÃO MANTIDA: não deletar mais a configuração ao fechar
  console.log('[Cleanup] ✓ Gateway encerrado, configuração preservada para próxima execução');
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Limpeza antes de sair do app
app.on('before-quit', () => {
  console.log('=== APP SAINDO (before-quit) ===');
  
  // Encerrar gateway
  if (gatewayProcess) {
    console.log('[Cleanup] Encerrando gateway...');
    try {
      gatewayProcess.kill('SIGTERM');
      gatewayProcess = null;
      console.log('[Cleanup] ✓ Gateway encerrado');
    } catch (error) {
      console.error('[Cleanup] ❌ Erro ao encerrar gateway:', error);
    }
  }
  
  // CONFIGURAÇÃO MANTIDA: não deletar mais a configuração ao fechar
  console.log('[Cleanup] ✓ Gateway encerrado, configuração preservada para próxima execução');
});

// Limpeza ao sair do app (fallback)
app.on('will-quit', () => {
  console.log('=== APP SAINDO (will-quit) ===');
  
  // Garantir que o gateway foi encerrado
  if (gatewayProcess) {
    console.log('[Cleanup] Forçando encerramento do gateway...');
    try {
      gatewayProcess.kill('SIGKILL');
      gatewayProcess = null;
      console.log('[Cleanup] ✓ Gateway forçadamente encerrado');
    } catch (error) {
      console.error('[Cleanup] ❌ Erro ao forçar encerramento:', error);
    }
  }
});

// IPC Handlers para comunicação com o renderer
ipcMain.handle('start-gateway', async (event, config) => {
  try {
    console.log('Iniciando gateway com config:', config);
    
    // CRÍTICO: Matar qualquer gateway existente primeiro
    if (gatewayProcess) {
      console.log('[Gateway] ⚠️ Gateway já está rodando! Encerrando...');
      gatewayProcess.kill();
      gatewayProcess = null;
      
      // Aguardar um pouco para garantir que o processo foi encerrado
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('[Gateway] ✓ Gateway anterior encerrado');
    }
    
    // Verificar se o entry point existe
    const entryPath = path.join(__dirname, 'dist', 'entry.js');
    if (!fs.existsSync(entryPath)) {
      console.error('dist/entry.js não encontrado em:', entryPath);
      return { 
        success: false, 
        message: 'Gateway não encontrado. Execute "npm run build" primeiro.' 
      };
    }
    
    // Verificar se a configuração foi salva
    const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');
    if (!fs.existsSync(configPath)) {
      return {
        success: false,
        message: 'Arquivo de configuração não encontrado. Por favor, complete a configuração novamente.'
      };
    }
    
    // Ler e validar a configuração
    const savedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('Configuração carregada:', savedConfig);
    
    // Verificar se tem API key do provedor (agora em env.vars)
    if (!savedConfig.env || !savedConfig.env.vars || Object.keys(savedConfig.env.vars).length === 0) {
      return {
        success: false,
        message: 'Chave API não configurada. Por favor, configure a chave API do provedor.'
      };
    }
    
    // Iniciar o gateway usando o arquivo compilado
    const args = [entryPath, 'gateway', 'run', '--allow-unconfigured', '--port', config.ULTRON_GATEWAY_PORT.toString()];
    
    console.log('Iniciando gateway com node:', args);
    console.log('Token que será usado:', config.ULTRON_GATEWAY_TOKEN?.substring(0, 16) + '...');
    console.log('Diretório de trabalho:', __dirname);
    
    // Verificar se a porta já está em uso
    const portInUse = await new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
      
      socket.connect(config.ULTRON_GATEWAY_PORT, '127.0.0.1');
    });
    
    if (portInUse) {
      console.log('[Gateway] ⚠️ Porta', config.ULTRON_GATEWAY_PORT, 'já está em uso!');
      return {
        success: false,
        message: `Porta ${config.ULTRON_GATEWAY_PORT} já está em uso. Pode haver outro gateway rodando.`,
        output: 'Porta em uso'
      };
    }
    
    console.log('[Gateway] ✓ Porta', config.ULTRON_GATEWAY_PORT, 'está livre');
    
    // Salvar referência global ao processo do gateway
    gatewayProcess = spawn('node', args, {
      cwd: __dirname,
      env: { 
        ...process.env,
        ULTRON_INTERACTIVE: 'false',
        NODE_ENV: 'production',
        ULTRON_GATEWAY_AUTH_TOKEN: config.ULTRON_GATEWAY_TOKEN,
        ULTRON_GATEWAY_TOKEN: config.ULTRON_GATEWAY_TOKEN,
        // Adicionar as variáveis de ambiente da config (API keys)
        ...savedConfig.env.vars
      },
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let gatewayStarted = false;
    let gatewayError = null;
    let startupOutput = '';
    
    gatewayProcess.stdout.on('data', (data) => {
      const output = data.toString();
      startupOutput += output;
      console.log('[Gateway STDOUT]', output);
      mainWindow.webContents.send('gateway-output', output);
      
      // Detectar quando o gateway está pronto - procurar por múltiplos indicadores
      const readyIndicators = [
        'listening',
        'WebSocket',
        'started',
        'Gateway running',
        'Server started',
        'Ready',
        'port ' + config.ULTRON_GATEWAY_PORT
      ];
      
      const outputLower = output.toLowerCase();
      for (const indicator of readyIndicators) {
        if (outputLower.includes(indicator.toLowerCase())) {
          gatewayStarted = true;
          console.log('[Gateway] ✓ Gateway detectado como iniciado! (indicador:', indicator + ')');
          break;
        }
      }
    });
    
    gatewayProcess.stderr.on('data', (data) => {
      const error = data.toString();
      startupOutput += '[STDERR] ' + error + '\n';
      console.error('[Gateway STDERR]', error);
      mainWindow.webContents.send('gateway-error', error);
      
      // Capturar erros críticos
      if (error.includes('Error') || error.includes('EADDRINUSE') || error.includes('EACCES')) {
        gatewayError = error;
      }
    });
    
    gatewayProcess.on('error', (error) => {
      console.error('[Gateway Process Error]', error);
      gatewayError = error.message;
    });
    
    gatewayProcess.on('exit', (code, signal) => {
      console.log(`[Gateway] Processo encerrado com código ${code}, sinal ${signal}`);
      
      // Limpar referência global
      gatewayProcess = null;
      
      if (code !== 0 && code !== null) {
        gatewayError = `Gateway encerrou com código ${code}`;
      }
    });
    
    // Aguardar o gateway iniciar (máximo 30 segundos)
    const maxWaitTime = 30000;
    const checkInterval = 500;
    let waited = 0;
    
    console.log('[Gateway] Aguardando inicialização...');
    
    while (waited < maxWaitTime && !gatewayStarted && !gatewayError) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
      
      // A cada 1 segundo, tentar verificar a porta diretamente
      if (waited % 1000 === 0) {
        try {
          const portCheck = await new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(1000);
            
            socket.on('connect', () => {
              socket.destroy();
              resolve(true);
            });
            
            socket.on('timeout', () => {
              socket.destroy();
              resolve(false);
            });
            
            socket.on('error', () => {
              resolve(false);
            });
            
            socket.connect(config.ULTRON_GATEWAY_PORT, '127.0.0.1');
          });
          
          if (portCheck) {
            console.log('[Gateway] ✓ Porta acessível! Gateway considerado iniciado.');
            gatewayStarted = true;
            break;
          } else {
            console.log(`[Gateway] Porta ainda não acessível (${waited}ms)...`);
          }
        } catch (error) {
          console.log(`[Gateway] Erro ao verificar porta (${waited}ms):`, error.message);
        }
      }
    }
    
    console.log('[Gateway] Tempo de espera:', waited, 'ms');
    console.log('[Gateway] Iniciado:', gatewayStarted);
    console.log('[Gateway] Erro:', gatewayError);
    console.log('[Gateway] Output completo:', startupOutput);
    
    // Verificar se houve erro
    if (gatewayError) {
      return {
        success: false,
        message: `Erro ao iniciar gateway: ${gatewayError}`,
        output: startupOutput
      };
    }
    
    // Se o gateway foi detectado como iniciado, considerar sucesso
    if (gatewayStarted) {
      console.log('[Gateway] ✓ Gateway iniciado com sucesso!');
      return { 
        success: true, 
        message: 'Gateway iniciado e verificado com sucesso!',
        output: startupOutput,
        gatewayUrl: `ws://localhost:${config.ULTRON_GATEWAY_PORT}`
      };
    }
    
    // Se chegou aqui, timeout sem detectar o gateway
    return {
      success: false,
      message: `Gateway não foi detectado após ${maxWaitTime}ms`,
      output: startupOutput
    };
  } catch (error) {
    console.error('Erro ao iniciar gateway:', error);
    return { 
      success: false, 
      message: `Erro: ${error.message}` 
    };
  }
});

// OLLAMA HANDLERS DESABILITADOS
// O Ollama não é necessário para o ULTRON funcionar
// Usuários podem usar provedores externos (OpenRouter, Claude, etc.)

/*
// Handler para instalar Ollama
ipcMain.handle('install-ollama', async () => {
  try {
    console.log('=== INSTALANDO OLLAMA ===');
    
    const OllamaInstaller = require('./install-ollama.cjs');
    const installer = new OllamaInstaller();
    
    const success = await installer.setup();
    
    if (success) {
      // Criar flag
      const ollamaFlagPath = path.join(os.homedir(), '.ultron', '.ollama-installed');
      const ultronDir = path.join(os.homedir(), '.ultron');
      if (!fs.existsSync(ultronDir)) {
        fs.mkdirSync(ultronDir, { recursive: true });
      }
      fs.writeFileSync(ollamaFlagPath, new Date().toISOString());
      
      return { success: true, message: 'Ollama instalado com sucesso!' };
    } else {
      return { success: false, message: 'Falha ao instalar Ollama' };
    }
  } catch (error) {
    console.error('Erro ao instalar Ollama:', error);
    return { success: false, message: error.message };
  }
});

// Handler para verificar status do Ollama
ipcMain.handle('check-ollama-status', async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      const data = await response.json();
      return {
        installed: true,
        running: true,
        models: data.models || []
      };
    }
    return { installed: true, running: false };
  } catch (error) {
    return { installed: false, running: false };
  }
});
*/

// Handler para matar gateway existente antes de iniciar novo
ipcMain.handle('kill-existing-gateway', async () => {
  if (gatewayProcess) {
    console.log('[Gateway] Encerrando gateway existente...');
    gatewayProcess.kill();
    gatewayProcess = null;
    
    // Aguardar um pouco para garantir que o processo foi encerrado
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  }
  return { success: true, message: 'Nenhum gateway em execução' };
});

// OLLAMA-JS HANDLERS DESABILITADOS
/*
// Handler para verificar se ollama-js está instalado
ipcMain.handle('check-ollama-js', async () => {
  try {
    const { isOllamaJsInstalled } = require('./install-ollama-js.cjs');
    const installed = isOllamaJsInstalled();
    console.log('Ollama-js instalado?', installed);
    return { installed };
  } catch (error) {
    console.error('Erro ao verificar ollama-js:', error);
    return { installed: false, error: error.message };
  }
});

// Handler para instalar ollama-js
ipcMain.handle('install-ollama-js', async (event) => {
  try {
    console.log('=== INSTALANDO OLLAMA-JS ===');
    const { installOllamaJs } = require('./install-ollama-js.cjs');
    
    const result = await installOllamaJs((progress, message) => {
      // Enviar progresso para o renderer
      event.sender.send('ollama-js-progress', { progress, message });
      console.log(`[${progress}%] ${message}`);
    });
    
    console.log('Resultado da instalação:', result);
    return result;
  } catch (error) {
    console.error('Erro ao instalar ollama-js:', error);
    return { success: false, error: error.message };
  }
});
*/

// Handler para fechar o app
ipcMain.on('close-app', () => {
  console.log('=== FECHANDO APP (solicitado pelo renderer) ===');
  app.quit();
});

// Handler para testar chave API
ipcMain.handle('test-api-key', async (event, data) => {
  try {
    console.log('=== TESTE DE API ===');
    console.log('Provedor:', data.provider);
    console.log('Modelo:', data.model);
    console.log('API Key (primeiros 10 chars):', data.apiKey?.substring(0, 10) + '...');
    
    const { provider, apiKey, model } = data;
    
    // Mapear provedor para URL da API
    const apiUrls = {
      google: 'https://generativelanguage.googleapis.com/v1beta/models',
      claude: 'https://api.anthropic.com/v1/messages',
      openrouter: 'https://openrouter.ai/api/v1/chat/completions',
      grok: 'https://api.x.ai/v1/chat/completions',
      openai: 'https://api.openai.com/v1/chat/completions'
    };
    
    const url = apiUrls[provider];
    if (!url) {
      return { success: false, error: `Provedor ${provider} não suportado para teste` };
    }
    
    // Fazer uma chamada de teste simples
    const testMessage = 'Hi';
    
    let requestBody, headers, testUrl = url;
    
    if (provider === 'google') {
      // Google Gemini usa um formato diferente
      const modelName = model.includes('/') ? model.split('/')[1] : model;
      testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      headers = {
        'Content-Type': 'application/json'
      };
      requestBody = {
        contents: [{
          parts: [{ text: testMessage }]
        }]
      };
      
      console.log('Google - URL:', testUrl.replace(apiKey, 'API_KEY_HIDDEN'));
      console.log('Google - Body:', JSON.stringify(requestBody));
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      console.log('Google - Status:', response.status);
      
      if (response.ok) {
        return { success: true, modelInfo: model };
      } else {
        const error = await response.text();
        console.log('Google - Error:', error);
        return { success: false, error: `Erro ${response.status}: ${error}` };
      }
    } else if (provider === 'claude') {
      // Anthropic Claude
      const modelName = model.includes('/') ? model.split('/')[1] : model;
      
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      };
      requestBody = {
        model: modelName,
        messages: [{ role: 'user', content: testMessage }],
        max_tokens: 10
      };
      
      console.log('Claude - URL:', url);
      console.log('Claude - Model:', modelName);
      console.log('Claude - Body:', JSON.stringify(requestBody));
    } else {
      // OpenAI-compatible APIs (OpenRouter, Grok, OpenAI)
      let modelName = model;
      
      // Para OpenRouter, remover o prefixo 'openrouter/' se existir
      if (provider === 'openrouter' && model.startsWith('openrouter/')) {
        modelName = model.substring('openrouter/'.length);
      }
      
      // Para outros provedores, remover o prefixo se for igual ao provedor
      if (provider !== 'openrouter' && model.includes('/')) {
        const parts = model.split('/');
        // Se tem prefixo do provedor, remover
        if (parts[0] === provider) {
          modelName = parts.slice(1).join('/');
        }
      }
      
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      
      // OpenRouter precisa de headers adicionais
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = 'https://ultron.app';
        headers['X-Title'] = 'Ultron';
      }
      
      requestBody = {
        model: modelName,
        messages: [{ role: 'user', content: testMessage }],
        max_tokens: 10
      };
      
      console.log(`${provider.toUpperCase()} - URL:`, url);
      console.log(`${provider.toUpperCase()} - Model:`, modelName);
      console.log(`${provider.toUpperCase()} - Body:`, JSON.stringify(requestBody));
    }
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✓ Teste bem-sucedido!');
      return { 
        success: true, 
        modelInfo: model,
        response: result
      };
    } else {
      const errorText = await response.text();
      console.log('✗ Erro na resposta:', errorText);
      
      let errorMessage = `Erro ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorText;
      } catch {
        errorMessage = errorText;
      }
      
      return { success: false, error: errorMessage };
    }
    
  } catch (error) {
    console.error('✗ Exceção ao testar API:', error);
    return { 
      success: false, 
      error: error.message || 'Erro desconhecido ao testar a API'
    };
  }
});

ipcMain.handle('check-gateway-status', async () => {
  // Implementar verificação de status do gateway
  return { running: false };
});

// Handler para chamadas da IA
ipcMain.handle('call-ai', async (event, data) => {
  try {
    console.log('Chamada da IA recebida:', data.message);
    
    // Por enquanto, retornar uma resposta simulada
    // TODO: Implementar chamada real para a API do provedor
    const response = `Recebi sua mensagem: "${data.message}". 

Esta é uma resposta simulada do Ultron. A integração completa com ${data.config.agent?.model || 'o modelo de IA'} será implementada em breve.

Configuração detectada:
- Modelo: ${data.config.agent?.model}
- Provedor: ${Object.keys(data.config.credentials || {})[0] || 'não configurado'}

Para implementar a chamada real, precisaremos integrar com a API do provedor escolhido.`;
    
    return { 
      success: true, 
      response: response 
    };
  } catch (error) {
    console.error('Erro na chamada da IA:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

// Handler para testar conexão do gateway
ipcMain.handle('test-gateway-connection', async (event, data) => {
  try {
    console.log('Testando conexão do gateway...');
    console.log('Porta:', data.port);
    console.log('Token (primeiros 16 chars):', data.token?.substring(0, 16) + '...');
    
    // Testar se a porta está acessível
    const portCheck = await new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(3000);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
      
      socket.connect(data.port, '127.0.0.1');
    });
    
    if (!portCheck) {
      return {
        success: false,
        error: 'Gateway não está respondendo na porta ' + data.port
      };
    }
    
    console.log('✓ Gateway está acessível na porta', data.port);
    
    // TODO: Testar autenticação com o token via WebSocket
    // Por enquanto, apenas verificar se a porta está aberta
    
    return {
      success: true,
      message: 'Gateway conectado com sucesso!'
    };
    
  } catch (error) {
    console.error('Erro ao testar conexão do gateway:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Handler para apagar configuração do ULTRON
ipcMain.handle('delete-ultron-config', async () => {
  try {
    console.log('=== APAGANDO CONFIGURAÇÃO DO ULTRON ===');
    
    const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');
    const vaultPath = path.join(os.homedir(), '.ultron', 'vault.json');
    const shieldPath = path.join(os.homedir(), '.ultron', 'shield-config.json');
    
    let deletedFiles = [];
    
    // Deletar configuração principal
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
      deletedFiles.push('ultron.json');
      console.log('✓ Configuração deletada:', configPath);
    }
    
    // Deletar vault
    if (fs.existsSync(vaultPath)) {
      fs.unlinkSync(vaultPath);
      deletedFiles.push('vault.json');
      console.log('✓ Vault deletado:', vaultPath);
    }
    
    // Deletar configuração do SHIELD
    if (fs.existsSync(shieldPath)) {
      fs.unlinkSync(shieldPath);
      deletedFiles.push('shield-config.json');
      console.log('✓ SHIELD config deletado:', shieldPath);
    }
    
    // Encerrar gateway se estiver rodando
    if (gatewayProcess) {
      console.log('✓ Encerrando gateway...');
      gatewayProcess.kill();
      gatewayProcess = null;
    }
    
    console.log('✓ Configuração do ULTRON apagada com sucesso');
    console.log('✓ Arquivos deletados:', deletedFiles.join(', '));
    
    return {
      success: true,
      message: 'Configuração apagada com sucesso',
      deletedFiles
    };
  } catch (error) {
    console.error('❌ Erro ao apagar configuração:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

