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
  console.log('');
  console.log('='.repeat(80));
  console.log('=== START GATEWAY FROM CONFIG ===');
  console.log('='.repeat(80));
  console.log('Config recebida:', JSON.stringify(config, null, 2));
  
  const entryPath = path.join(__dirname, 'dist', 'entry.js');
  console.log('Entry path:', entryPath);
  console.log('Entry existe?', fs.existsSync(entryPath));
  
  if (!fs.existsSync(entryPath)) {
    console.error('❌ Entry path não encontrado!');
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
  console.log('[Gateway] Porta:', config.gateway.port);
  console.log('[Gateway] Token (primeiros 20 chars):', config.gateway.auth.token?.substring(0, 20) + '...');
  console.log('[Gateway] Variáveis de ambiente:', Object.keys(config.env?.vars || {}));
  
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
  
  console.log('[Gateway] Processo iniciado com PID:', gatewayProcess.pid);
  
  let gatewayStarted = false;
  let gatewayError = null;
  let outputLines = [];
  
  gatewayProcess.stdout.on('data', (data) => {
    const output = data.toString();
    outputLines.push(output);
    console.log('[Gateway STDOUT]', output);
    
    // Detectar quando o gateway está pronto
    // O símbolo "|" indica que o banner foi impresso e o gateway está rodando
    if (output.toLowerCase().includes('listening') || 
        output.toLowerCase().includes('started') ||
        output.toLowerCase().includes('ready') ||
        output.includes('|') ||  // Banner do gateway
        output.includes('Gateway') ||
        output.includes('Doctor')) {
      console.log('[Gateway] ✓ Detectado indicador de inicialização no output');
      gatewayStarted = true;
    }
  });
  
  gatewayProcess.stderr.on('data', (data) => {
    const error = data.toString();
    outputLines.push('[STDERR] ' + error);
    console.error('[Gateway STDERR]', error);
    
    if (error.includes('Error')) {
      gatewayError = error;
    }
  });
  
  gatewayProcess.on('exit', (code, signal) => {
    console.log(`[Gateway] Processo encerrado com código ${code}, sinal ${signal}`);
    gatewayProcess = null;
    
    if (code !== 0 && code !== null) {
      gatewayError = `Gateway encerrou com código ${code}`;
    }
  });
  
  console.log('[Gateway] Aguardando inicialização (máximo 30 segundos)...');
  
  // Aguardar gateway iniciar (máximo 30 segundos)
  // Verificar tanto o output quanto a disponibilidade da porta HTTP
  for (let i = 0; i < 60; i++) {
    if (gatewayError) {
      console.error('[Gateway] ❌ Erro detectado, parando espera');
      break;
    }
    
    // Se detectamos no output, verificar se a porta está realmente acessível
    if (gatewayStarted) {
      console.log(`[Gateway] Tentativa ${i + 1}/60: Verificando porta HTTP...`);
      try {
        const http = require('http');
        await new Promise((resolve, reject) => {
          const req = http.get(`http://localhost:${config.gateway.port}/health`, (res) => {
            console.log('[Gateway] ✓ Porta HTTP respondeu com status:', res.statusCode);
            resolve(true);
          });
          req.on('error', (err) => {
            console.log('[Gateway] Porta HTTP ainda não acessível:', err.message);
            reject(err);
          });
          req.setTimeout(1000, () => {
            req.destroy();
            reject(new Error('Timeout'));
          });
        });
        // Se chegou aqui, o gateway está realmente pronto
        console.log('[Gateway] ✓✓✓ Porta HTTP acessível, gateway PRONTO! ✓✓✓');
        break;
      } catch (err) {
        console.log('[Gateway] Aguardando porta HTTP ficar acessível...');
        gatewayStarted = false; // Resetar para continuar esperando
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('[Gateway] Tempo de espera finalizado');
  console.log('[Gateway] Status final:');
  console.log('  - gatewayStarted:', gatewayStarted);
  console.log('  - gatewayError:', gatewayError);
  console.log('  - Output lines:', outputLines.length);
  
  if (gatewayError) {
    console.error('[Gateway] ❌ Falha com erro:', gatewayError);
    return { success: false, message: gatewayError };
  }
  
  if (gatewayStarted) {
    console.log('[Gateway] ✓ Inicialização bem-sucedida!');
    return { success: true };
  }
  
  console.error('[Gateway] ❌ Timeout: Gateway não foi detectado após 30 segundos');
  console.log('[Gateway] Output completo:');
  outputLines.forEach((line, i) => console.log(`  ${i + 1}: ${line}`));
  
  return { success: false, message: 'Gateway não foi detectado após 30 segundos' };
}

// Função para carregar UI do chat
async function loadChatUIFromConfig(config) {
  console.log('');
  console.log('='.repeat(80));
  console.log('=== LOAD CHAT UI FROM CONFIG ===');
  console.log('='.repeat(80));
  console.log('Config recebida:', JSON.stringify(config, null, 2));
  
  // CARREGAR A UI LOCAL (dist/control-ui/index.html) COM PARÂMETROS DE CONEXÃO
  // A UI se conectará ao gateway via WebSocket
  
  const port = config.gateway.port || 18789;
  const token = config.gateway.auth.token;
  
  // Construir URL do WebSocket
  let wsUrl;
  if (config.gateway?.mode === 'remote' || config.ultron?.remote) {
    // Gateway remoto
    const baseUrl = config.gateway.url || `http://localhost:${port}`;
    wsUrl = baseUrl.replace(/^http/, 'ws');
    console.log('✓ Modo: Gateway remoto');
    console.log('✓ WebSocket URL:', wsUrl);
  } else {
    // Gateway local
    wsUrl = `ws://localhost:${port}`;
    console.log('✓ Modo: Gateway local');
    console.log('✓ Porta:', port);
    console.log('✓ WebSocket URL:', wsUrl);
  }
  
  // Carregar UI local com parâmetros
  const uiPath = path.join(__dirname, 'dist', 'control-ui', 'index.html');
  const chatUrl = `file://${uiPath}?gatewayUrl=${encodeURIComponent(wsUrl)}&token=${encodeURIComponent(token)}`;
  
  console.log('✓ UI Path:', uiPath);
  console.log('✓ URL completa:', chatUrl.replace(/token=[^&]+/, 'token=***'));
  console.log('✓ Token (primeiros 20 chars):', token?.substring(0, 20) + '...');
  
  // Testar se o gateway está respondendo
  console.log('');
  console.log('--- TESTANDO CONEXÃO COM GATEWAY ---');
  try {
    const http = require('http');
    const testUrl = `http://localhost:${port}/health`;
    console.log('Testando URL:', testUrl);
    
    await new Promise((resolve, reject) => {
      const req = http.get(testUrl, (res) => {
        console.log('✓ Gateway respondeu com status:', res.statusCode);
        resolve(true);
      });
      
      req.on('error', (err) => {
        console.error('❌ Erro ao conectar ao gateway:', err.message);
        reject(err);
      });
      
      req.setTimeout(3000, () => {
        console.error('❌ Timeout ao conectar ao gateway');
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
    
    console.log('✓ Gateway está acessível e respondendo!');
  } catch (err) {
    console.error('❌ Gateway NÃO está acessível:', err.message);
    console.error('⚠️ Tentando carregar UI mesmo assim (ela tentará reconectar)...');
  }
  
  console.log('');
  console.log('--- CARREGANDO URL NO ELECTRON ---');
  console.log('Aguardando 1 segundo antes de carregar...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Chamando mainWindow.loadURL()...');
  
  try {
    await mainWindow.loadURL(chatUrl);
    console.log('✓✓✓ loadURL() completou com sucesso! ✓✓✓');
    console.log('URL atual da janela:', mainWindow.webContents.getURL().replace(/token=[^&]+/, 'token=***'));
    
    // Verificar se a página carregou corretamente
    setTimeout(() => {
      const title = mainWindow.getTitle();
      console.log('Título da janela:', title);
      
      mainWindow.webContents.executeJavaScript('document.body.innerHTML.length').then(length => {
        console.log('Tamanho do HTML carregado:', length, 'caracteres');
        if (length === 0) {
          console.error('⚠️ AVISO: HTML está vazio! Página não carregou corretamente.');
        }
      }).catch(err => {
        console.error('Erro ao verificar HTML:', err);
      });
    }, 1000);
    
  } catch (err) {
    console.error('❌ Erro ao carregar URL:', err);
    console.error('Stack:', err.stack);
    console.error('URL tentada:', chatUrl.replace(/token=[^&]+/, 'token=***'));
  }
  
  console.log('='.repeat(80));
  console.log('');
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
    console.log('');
    console.log('=== PÁGINA CARREGADA (did-finish-load) ===');
    console.log('URL:', mainWindow.webContents.getURL());
    console.log('Título:', mainWindow.getTitle());
  });
  
  // Interceptar falhas de carregamento
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('');
    console.error('=== FALHA AO CARREGAR PÁGINA (did-fail-load) ===');
    console.error('URL:', validatedURL);
    console.error('Código de erro:', errorCode);
    console.error('Descrição:', errorDescription);
  });
  
  // Interceptar erros de console da página
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levelNames = ['verbose', 'info', 'warning', 'error'];
    console.log(`[WebContents Console ${levelNames[level]}]`, message);
    if (sourceId) {
      console.log(`  Source: ${sourceId}:${line}`);
    }
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
    
    // CARREGAR A UI LOCAL (dist/control-ui/index.html) COM PARÂMETROS DE CONEXÃO
    const uiPath = path.join(__dirname, 'dist', 'control-ui', 'index.html');
    const chatUrl = `file://${uiPath}?gatewayUrl=${encodeURIComponent(wsUrl)}&token=${encodeURIComponent(data.token)}`;
    
    console.log('✓ Carregando chat na janela Electron');
    console.log('✓ UI Path:', uiPath);
    console.log('✓ URL:', chatUrl.replace(/token=[^&]+/, 'token=***'));
    
    mainWindow.loadURL(chatUrl).then(() => {
      console.log('✓✓✓ Chat carregado com sucesso! ✓✓✓');
      console.log('URL da janela:', mainWindow.webContents.getURL().replace(/token=[^&]+/, 'token=***'));
    }).catch(err => {
      console.error('❌ Erro ao carregar chat:', err);
      console.error('Stack:', err.stack);
      console.error('URL tentada:', chatUrl.replace(/token=[^&]+/, 'token=***'));
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
      
      // Verificar se é uma configuração remota
      if (savedConfig.gateway?.mode === 'remote' || savedConfig.ultron?.remote) {
        console.log('=== CONECTANDO A ULTRON REMOTO ===');
        console.log('Gateway URL:', savedConfig.gateway.url);
        
        // Não iniciar gateway local, apenas carregar a UI conectada ao remoto
        await loadChatUIFromConfig(savedConfig);
      } else {
        // Iniciar gateway local automaticamente com a configuração salva
        console.log('=== INICIANDO GATEWAY LOCAL AUTOMATICAMENTE ===');
        const result = await startGatewayFromConfig(savedConfig);
        
        if (result.success) {
          console.log('✓ Gateway iniciado automaticamente!');
          console.log('⏰ Aguardando 3 segundos para garantir que o gateway está pronto...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Carregar UI do chat
          console.log('✓ Chamando loadChatUIFromConfig...');
          await loadChatUIFromConfig(savedConfig);
        } else {
          console.error('❌ Erro ao iniciar gateway:', result.message);
          // Mesmo com erro, manter a janela aberta para o usuário reconfigurar
        }
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

// ============================================
// HIVE P2P HANDLERS
// ============================================

let hiveManager = null;

// IPC Handler para criar/juntar colmeia
ipcMain.handle('hive-create-or-join', async (event, config) => {
  try {
    console.log('=== CRIANDO/JUNTANDO COLMEIA P2P ===');
    console.log('Config:', config);
    
    if (!hiveManager) {
      const { HiveP2PManager } = await import('./dist/hive/hive-p2p-manager.js');
      hiveManager = new HiveP2PManager();
      
      // Eventos da colmeia
      hiveManager.on('member-joined', (peer) => {
        console.log('Membro entrou na colmeia:', peer);
        mainWindow.webContents.send('hive-member-joined', peer);
      });
      
      hiveManager.on('member-left', (peerId) => {
        console.log('Membro saiu da colmeia:', peerId);
        mainWindow.webContents.send('hive-member-left', peerId);
      });
      
      hiveManager.on('task-received', (task) => {
        console.log('Tarefa recebida:', task);
        mainWindow.webContents.send('hive-task-received', task);
      });
      
      hiveManager.on('data-received', (data, fromPeerId) => {
        console.log('Dados recebidos de:', fromPeerId);
        mainWindow.webContents.send('hive-data-received', { data, fromPeerId });
      });
      
      hiveManager.on('hive-active', () => {
        console.log('✓ Colmeia ativa!');
        mainWindow.webContents.send('hive-status-changed', { active: true });
      });
      
      hiveManager.on('hive-inactive', () => {
        console.log('✓ Colmeia inativa');
        mainWindow.webContents.send('hive-status-changed', { active: false });
      });
    }
    
    await hiveManager.createOrJoinHive(config);
    
    console.log('✓ Colmeia criada/juntada com sucesso!');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao criar/juntar colmeia:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler para sair da colmeia
ipcMain.handle('hive-leave', async () => {
  try {
    if (hiveManager) {
      hiveManager.leaveHive();
      console.log('✓ Saiu da colmeia');
      return { success: true };
    }
    return { success: false, error: 'Colmeia não está ativa' };
  } catch (error) {
    console.error('❌ Erro ao sair da colmeia:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler para obter membros
ipcMain.handle('hive-get-members', async () => {
  try {
    if (hiveManager) {
      const members = hiveManager.getMembers();
      return { success: true, members };
    }
    return { success: false, members: [] };
  } catch (error) {
    console.error('❌ Erro ao obter membros:', error);
    return { success: false, members: [], error: error.message };
  }
});

// IPC Handler para obter peers locais
ipcMain.handle('hive-get-local-peers', async () => {
  try {
    if (hiveManager) {
      const peers = hiveManager.getLocalPeers();
      return { success: true, peers };
    }
    return { success: false, peers: [] };
  } catch (error) {
    console.error('❌ Erro ao obter peers locais:', error);
    return { success: false, peers: [], error: error.message };
  }
});

// IPC Handler para enviar mensagem
ipcMain.handle('hive-send-message', async (event, { type, payload, to }) => {
  try {
    if (hiveManager) {
      hiveManager.sendMessage(type, payload, to);
      return { success: true };
    }
    return { success: false, error: 'Colmeia não está ativa' };
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler para sincronizar contexto
ipcMain.handle('hive-sync-context', async (event, context) => {
  try {
    if (hiveManager) {
      hiveManager.syncContext(context);
      return { success: true };
    }
    return { success: false, error: 'Colmeia não está ativa' };
  } catch (error) {
    console.error('❌ Erro ao sincronizar contexto:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler para distribuir tarefa
ipcMain.handle('hive-distribute-task', async (event, task) => {
  try {
    if (hiveManager) {
      hiveManager.distributeTask(task);
      return { success: true };
    }
    return { success: false, error: 'Colmeia não está ativa' };
  } catch (error) {
    console.error('❌ Erro ao distribuir tarefa:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler para verificar status da colmeia
ipcMain.handle('hive-is-active', async () => {
  try {
    if (hiveManager) {
      const active = hiveManager.isHiveActive();
      return { success: true, active };
    }
    return { success: true, active: false };
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    return { success: false, active: false, error: error.message };
  }
});



// ============================================
// ULTRON UPDATES HANDLERS
// ============================================

const GITHUB_REPO = 'ghost-global-oficial/Ultron';
const CURRENT_VERSION = '1.0.0';

// Handler para verificar atualizações no GitHub
ipcMain.handle('check-updates', async () => {
  try {
    console.log('=== VERIFICANDO ATUALIZAÇÕES NO GITHUB ===');
    
    // Buscar a última release no GitHub
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    
    if (!response.ok) {
      throw new Error(`GitHub API retornou ${response.status}`);
    }
    
    const release = await response.json();
    
    const latestVersion = release.tag_name.replace('v', '');
    const currentVersion = CURRENT_VERSION;
    
    console.log('Versão atual:', currentVersion);
    console.log('Última versão:', latestVersion);
    
    // Comparar versões
    const isNewer = compareVersions(latestVersion, currentVersion) > 0;
    
    if (isNewer) {
      console.log('✓ Nova versão disponível!');
      
      // Procurar asset do instalador Windows
      const windowsAsset = release.assets.find(asset => 
        asset.name.endsWith('.exe') || asset.name.includes('Setup')
      );
      
      return {
        success: true,
        updateAvailable: true,
        available: true,
        currentVersion,
        latestVersion,
        releaseNotes: release.body || 'Sem notas de versão disponíveis.',
        downloadUrl: windowsAsset?.browser_download_url || release.html_url,
        publishedAt: release.published_at,
        assetName: windowsAsset?.name || 'ULTRON-Setup.exe'
      };
    } else {
      console.log('✓ Você já está na versão mais recente');
      
      return {
        success: true,
        updateAvailable: false,
        available: false,
        currentVersion,
        latestVersion: currentVersion
      };
    }
  } catch (error) {
    console.error('❌ Erro ao verificar atualizações:', error);
    return {
      success: false,
      updateAvailable: false,
      error: error.message || 'Erro ao conectar com o GitHub'
    };
  }
});

// Alias para compatibilidade
ipcMain.handle('check-for-updates', async () => {
  // Reutilizar a lógica do check-updates
  try {
    console.log('=== VERIFICANDO ATUALIZAÇÕES NO GITHUB (via check-for-updates) ===');
    
    // Buscar a última release no GitHub
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    
    if (!response.ok) {
      throw new Error(`GitHub API retornou ${response.status}`);
    }
    
    const release = await response.json();
    
    const latestVersion = release.tag_name.replace('v', '');
    const currentVersion = CURRENT_VERSION;
    
    console.log('Versão atual:', currentVersion);
    console.log('Última versão:', latestVersion);
    
    // Comparar versões
    const isNewer = compareVersions(latestVersion, currentVersion) > 0;
    
    if (isNewer) {
      console.log('✓ Nova versão disponível!');
      
      // Procurar asset do instalador Windows
      const windowsAsset = release.assets.find(asset => 
        asset.name.endsWith('.exe') || asset.name.includes('Setup')
      );
      
      return {
        success: true,
        updateAvailable: true,
        available: true,
        currentVersion,
        latestVersion,
        releaseNotes: release.body || 'Sem notas de versão disponíveis.',
        downloadUrl: windowsAsset?.browser_download_url || release.html_url,
        publishedAt: release.published_at,
        assetName: windowsAsset?.name || 'ULTRON-Setup.exe'
      };
    } else {
      console.log('✓ Você já está na versão mais recente');
      
      return {
        success: true,
        updateAvailable: false,
        available: false,
        currentVersion,
        latestVersion: currentVersion
      };
    }
  } catch (error) {
    console.error('❌ Erro ao verificar atualizações:', error);
    return {
      success: false,
      updateAvailable: false,
      error: error.message || 'Erro ao conectar com o GitHub'
    };
  }
});

// Handler para baixar e instalar atualização
ipcMain.handle('install-update', async (event, { downloadUrl, assetName }) => {
  try {
    console.log('=== BAIXANDO ATUALIZAÇÃO ===');
    console.log('URL:', downloadUrl);
    console.log('Arquivo:', assetName);
    
    const https = require('https');
    const downloadPath = path.join(os.tmpdir(), assetName);
    
    // Baixar o arquivo
    const response = await fetch(downloadUrl, {
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao baixar: ${response.status}`);
    }
    
    const totalSize = parseInt(response.headers.get('content-length') || '0');
    let downloadedSize = 0;
    
    const fileStream = fs.createWriteStream(downloadPath);
    
    // Stream com progresso
    for await (const chunk of response.body) {
      fileStream.write(chunk);
      downloadedSize += chunk.length;
      
      const progress = Math.round((downloadedSize / totalSize) * 100);
      
      // Enviar progresso para a UI
      mainWindow.webContents.send('update-download-progress', progress);
    }
    
    fileStream.end();
    
    console.log('✓ Download concluído:', downloadPath);
    
    // Executar o instalador
    console.log('✓ Iniciando instalador...');
    
    const { exec } = require('child_process');
    
    exec(`"${downloadPath}"`, (error) => {
      if (error) {
        console.error('Erro ao executar instalador:', error);
      }
    });
    
    // Fechar o ULTRON após iniciar o instalador
    setTimeout(() => {
      app.quit();
    }, 1000);
    
    return {
      success: true,
      message: 'Instalador iniciado. O ULTRON será fechado.'
    };
    
  } catch (error) {
    console.error('❌ Erro ao instalar atualização:', error);
    return {
      success: false,
      error: error.message || 'Erro ao baixar/instalar atualização'
    };
  }
});

// Função auxiliar para comparar versões
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}
