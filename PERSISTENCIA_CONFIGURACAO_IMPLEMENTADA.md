# Persistência de Configuração Implementada ✅

## Problema Resolvido

Antes, o Ultron deletava toda a configuração do gateway sempre que o app era fechado, forçando o usuário a reconfigurar tudo novamente na próxima execução.

## Solução Implementada

### 1. Remoção da Limpeza de Configuração

Removido código que deletava `~/.ultron/ultron.json` em:
- `app.on('window-all-closed')` - Ao fechar todas as janelas
- `app.on('before-quit')` - Antes de sair do app
- `mainWindow.on('close')` - Ao fechar a janela principal
- `app.whenReady()` - Na inicialização do app

### 2. Auto-Start do Gateway

Implementado sistema de auto-start que:
1. Verifica se existe configuração salva em `~/.ultron/ultron.json`
2. Se existir:
   - Carrega a configuração
   - Inicia o gateway automaticamente
   - Carrega a UI do chat diretamente
3. Se não existir:
   - Abre o wizard de configuração

### 3. Preservação do localStorage

Removido `localStorage.clear()` da função `loadChatUIFromConfig`:
- Antes: Limpava todo o localStorage antes de carregar o chat
- Agora: Apenas atualiza as configurações necessárias, preservando dados existentes

## Arquivos Modificados

### main.js

#### Mudança 1: Auto-start na inicialização
```javascript
app.whenReady().then(async () => {
  // VERIFICAR SE JÁ EXISTE CONFIGURAÇÃO
  const configPath = path.join(os.homedir(), '.ultron', 'ultron.json');
  
  if (fs.existsSync(configPath)) {
    // Carregar configuração e iniciar gateway automaticamente
    const savedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    createWindow();
    const result = await startGatewayFromConfig(savedConfig);
    
    if (result.success) {
      loadChatUIFromConfig(savedConfig);
    }
  } else {
    // Abrir wizard de configuração
    createWindow();
  }
});
```

#### Mudança 2: Preservar configuração ao fechar janela
```javascript
mainWindow.on('close', (event) => {
  // Encerrar gateway
  if (gatewayProcess) {
    gatewayProcess.kill();
    gatewayProcess = null;
  }
  
  // CONFIGURAÇÃO MANTIDA: não deletar mais
  console.log('[Cleanup] ✓ Gateway encerrado, configuração preservada');
});
```

#### Mudança 3: Preservar configuração ao sair do app
```javascript
app.on('before-quit', () => {
  // Encerrar gateway
  if (gatewayProcess) {
    gatewayProcess.kill('SIGTERM');
    gatewayProcess = null;
  }
  
  // CONFIGURAÇÃO MANTIDA: não deletar mais
  console.log('[Cleanup] ✓ Gateway encerrado, configuração preservada para próxima execução');
});
```

#### Mudança 4: Preservar configuração ao fechar todas as janelas
```javascript
app.on('window-all-closed', () => {
  // Encerrar gateway
  if (gatewayProcess) {
    gatewayProcess.kill();
    gatewayProcess = null;
  }
  
  // CONFIGURAÇÃO MANTIDA: não deletar mais
  console.log('[Cleanup] ✓ Gateway encerrado, configuração preservada para próxima execução');
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### Mudança 5: Não limpar localStorage
```javascript
function loadChatUIFromConfig(config) {
  const configScript = `
    <script>
      // SALVAR CONFIGURAÇÕES NO LOCALSTORAGE
      // (removido localStorage.clear())
      
      const settings = {
        gatewayUrl: '${wsUrl}',
        token: '${config.gateway.auth.token}',
        sessionKey: 'agent:main:main',
        // ... outras configurações
      };
      localStorage.setItem('ultron.control.settings.v1', JSON.stringify(settings));
    </script>
  `;
  // ...
}
```

## Benefícios

1. **Experiência do Usuário Melhorada**
   - Não precisa reconfigurar o gateway toda vez
   - App abre direto no chat se já estiver configurado
   - Configurações persistem entre sessões

2. **Histórico de Chat Preservado**
   - localStorage não é mais limpo
   - Conversas anteriores são mantidas
   - Preferências do usuário são preservadas

3. **Inicialização Mais Rápida**
   - Gateway inicia automaticamente
   - Sem necessidade de passar pelo wizard toda vez
   - Usuário pode começar a usar imediatamente

## Fluxo de Uso

### Primeira Execução
1. App abre
2. Não encontra configuração
3. Mostra wizard de configuração
4. Usuário configura provedor, API key, etc.
5. Configuração é salva em `~/.ultron/ultron.json`
6. Gateway inicia
7. Chat abre

### Execuções Seguintes
1. App abre
2. Encontra configuração salva
3. Carrega configuração automaticamente
4. Inicia gateway com as configurações salvas
5. Chat abre direto
6. Histórico de conversas está preservado

### Reconfiguração (se necessário)
- Usuário pode deletar manualmente `~/.ultron/ultron.json`
- Na próxima execução, wizard será mostrado novamente
- Ou adicionar botão "Reconfigurar" na UI (futura implementação)

## Testes Recomendados

1. **Teste de Persistência**
   ```bash
   # 1. Abrir app e configurar
   # 2. Fechar app
   # 3. Verificar se arquivo existe
   ls ~/.ultron/ultron.json
   # 4. Abrir app novamente
   # 5. Verificar se chat abre direto sem wizard
   ```

2. **Teste de Histórico**
   ```bash
   # 1. Enviar mensagens no chat
   # 2. Fechar app
   # 3. Abrir app novamente
   # 4. Verificar se mensagens estão lá
   ```

3. **Teste de Primeira Execução**
   ```bash
   # 1. Deletar configuração
   rm ~/.ultron/ultron.json
   # 2. Abrir app
   # 3. Verificar se wizard aparece
   ```

## Status

✅ Implementado e pronto para teste
