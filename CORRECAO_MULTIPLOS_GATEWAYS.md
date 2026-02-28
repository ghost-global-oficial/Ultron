# Correção: Múltiplos Gateways e Terminal Não Abrindo

## Problema Identificado

O sistema estava iniciando múltiplos gateways simultaneamente e pulando o terminal de configuração devido a:

1. **FORCE_WIZARD = true** no `main.js` (linha 247)
   - Forçava sempre mostrar o wizard mesmo com configuração existente
   - Mas o código ainda tentava iniciar o gateway automaticamente

2. **Dupla Inicialização**
   - Gateway iniciado automaticamente no `app.whenReady()` quando detectava configuração
   - Outro gateway iniciado quando o wizard terminava via `startGatewayProcess()`
   - Resultado: **2 gateways rodando na mesma porta** → conflitos e erros

3. **Falta de Verificação de Porta**
   - Não verificava se a porta já estava em uso antes de iniciar
   - Não matava processos anteriores antes de iniciar novos

## Correções Aplicadas

### 1. Removido FORCE_WIZARD (main.js)

**Antes:**
```javascript
const FORCE_WIZARD = true;

if (fs.existsSync(configPath) && !FORCE_WIZARD) {
  // iniciar gateway
} else {
  if (FORCE_WIZARD) {
    console.log('=== MODO DE TESTE: FORÇANDO WIZARD ===');
  }
  // mostrar wizard
}
```

**Depois:**
```javascript
if (fs.existsSync(configPath)) {
  // iniciar gateway automaticamente
} else {
  // mostrar wizard
}
```

### 2. Adicionado Handler para Matar Gateway Existente (main.js)

```javascript
ipcMain.handle('kill-existing-gateway', async () => {
  if (gatewayProcess) {
    console.log('[Gateway] Encerrando gateway existente...');
    gatewayProcess.kill();
    gatewayProcess = null;
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }
  return { success: true, message: 'Nenhum gateway em execução' };
});
```

### 3. Verificação de Gateway Existente no start-gateway (main.js)

```javascript
ipcMain.handle('start-gateway', async (event, config) => {
  // CRÍTICO: Matar qualquer gateway existente primeiro
  if (gatewayProcess) {
    console.log('[Gateway] ⚠️ Gateway já está rodando! Encerrando...');
    gatewayProcess.kill();
    gatewayProcess = null;
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('[Gateway] ✓ Gateway anterior encerrado');
  }
  
  // ... resto do código
});
```

### 4. Verificação de Porta em Uso (main.js)

```javascript
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
  
  socket.connect(config.OPENCLAW_GATEWAY_PORT, '127.0.0.1');
});

if (portInUse) {
  return {
    success: false,
    message: `Porta ${config.OPENCLAW_GATEWAY_PORT} já está em uso.`
  };
}
```

### 5. Matar Gateway Antes de Iniciar Novo (renderer.js)

```javascript
window.startGatewayProcess = async function() {
  // Primeiro, matar qualquer gateway existente
  console.log('Verificando gateways existentes...');
  await ipcRenderer.invoke('kill-existing-gateway');
  console.log('✓ Gateways existentes encerrados');
  
  // Agora iniciar o novo gateway
  const result = await ipcRenderer.invoke('start-gateway', { ... });
  // ...
};
```

## Fluxo Correto Agora

### Primeira Execução (Sem Configuração)
1. App inicia
2. Não encontra `~/.openclaw/openclaw.json`
3. Mostra wizard de configuração
4. Usuário completa wizard
5. Configuração é salva
6. Gateway é iniciado (apenas 1)
7. Chat UI é carregada

### Execuções Subsequentes (Com Configuração)
1. App inicia
2. Encontra `~/.openclaw/openclaw.json`
3. Lê configuração
4. Inicia gateway automaticamente (apenas 1)
5. Carrega chat UI diretamente
6. **Não mostra wizard**

### Reconfiguração Manual
1. Usuário deleta `~/.openclaw/openclaw.json`
2. Reinicia o app
3. Wizard é mostrado novamente

## Garantias Implementadas

✅ **Apenas 1 gateway por vez**
- Verifica se já existe processo antes de iniciar
- Mata processo anterior se necessário
- Aguarda 1.5s para garantir encerramento

✅ **Verificação de porta**
- Testa se porta está em uso antes de iniciar
- Retorna erro claro se porta ocupada

✅ **Fluxo determinístico**
- Com config → vai direto pro chat
- Sem config → mostra wizard
- Sem ambiguidade ou condições de corrida

✅ **Logs claros**
- Cada etapa logada no console
- Fácil debug de problemas

## Como Testar

### Teste 1: Primeira Execução
```bash
# Deletar configuração existente
rm ~/.openclaw/openclaw.json

# Iniciar app
npm start

# Esperado: Wizard de configuração aparece
```

### Teste 2: Execução com Configuração
```bash
# Garantir que configuração existe
ls ~/.openclaw/openclaw.json

# Iniciar app
npm start

# Esperado: Chat UI carrega diretamente, sem wizard
```

### Teste 3: Múltiplas Inicializações
```bash
# Iniciar app
npm start

# Completar wizard
# Clicar em "Abrir Chat"

# Esperado: Apenas 1 gateway rodando
# Verificar: ps aux | grep "gateway run"
```

## Arquivos Modificados

- `main.js`: Removido FORCE_WIZARD, adicionado kill-existing-gateway, verificação de porta
- `renderer.js`: Adicionado chamada para kill-existing-gateway antes de iniciar

## Próximos Passos

Se ainda houver problemas:

1. **Verificar logs do console**
   - Procurar por "Gateway já está rodando"
   - Procurar por "Porta já está em uso"

2. **Verificar processos**
   ```bash
   # Windows
   netstat -ano | findstr :18789
   
   # Linux/Mac
   lsof -i :18789
   ```

3. **Limpar estado**
   ```bash
   # Matar todos os processos node
   taskkill /F /IM node.exe
   
   # Deletar configuração
   rm ~/.openclaw/openclaw.json
   
   # Reiniciar app
   npm start
   ```
