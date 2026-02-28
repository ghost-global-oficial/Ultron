# Limpeza Automática ao Fechar o App

## 🧹 Funcionalidade Implementada

Quando o usuário fechar o app Ultron, o sistema agora:

1. ✅ **Para o gateway** automaticamente
2. ✅ **Deleta a configuração** (`~/.openclaw/openclaw.json`)
3. ✅ **Limpa todos os recursos** antes de sair

## 🎯 Objetivo

Garantir que:
- Cada vez que o app for aberto, o usuário passe pelo wizard de configuração
- Não fiquem processos gateway órfãos rodando
- Não haja conflitos de configuração entre sessões
- O estado seja sempre limpo e previsível

## 🔧 Implementação

### 1. Limpeza na Janela (window.on('close'))

```javascript
mainWindow.on('close', (event) => {
  console.log('=== JANELA FECHANDO ===');
  
  // Encerrar gateway
  if (gatewayProcess) {
    gatewayProcess.kill();
    gatewayProcess = null;
  }
  
  // Deletar configuração
  const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }
});
```

**Quando dispara:** Quando o usuário clica no X da janela

### 2. Limpeza em Todas as Janelas (app.on('window-all-closed'))

```javascript
app.on('window-all-closed', () => {
  console.log('=== APP FECHANDO ===');
  
  // Encerrar gateway
  if (gatewayProcess) {
    gatewayProcess.kill();
    gatewayProcess = null;
  }
  
  // Deletar configuração
  const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

**Quando dispara:** Quando todas as janelas são fechadas

### 3. Limpeza Antes de Sair (app.on('before-quit'))

```javascript
app.on('before-quit', () => {
  console.log('=== APP SAINDO (before-quit) ===');
  
  // Encerrar gateway com SIGTERM
  if (gatewayProcess) {
    gatewayProcess.kill('SIGTERM');
    gatewayProcess = null;
  }
  
  // Deletar configuração
  const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }
});
```

**Quando dispara:** Antes do app sair (Ctrl+Q, Alt+F4, etc)

### 4. Limpeza Forçada (app.on('will-quit'))

```javascript
app.on('will-quit', () => {
  console.log('=== APP SAINDO (will-quit) ===');
  
  // Forçar encerramento do gateway com SIGKILL
  if (gatewayProcess) {
    gatewayProcess.kill('SIGKILL');
    gatewayProcess = null;
  }
});
```

**Quando dispara:** Último recurso antes do app sair completamente

## 📋 Fluxo Completo

### Abertura do App
```
1. App inicia
2. Verifica ~/.openclaw/openclaw.json
3. Não existe (foi deletado na última vez)
4. Mostra wizard
5. Usuário configura
6. Salva config
7. Inicia gateway
8. Carrega chat
```

### Fechamento do App
```
1. Usuário fecha janela (X)
   ↓
2. Evento 'close' dispara
   ↓
3. Gateway é encerrado
   ↓
4. Configuração é deletada
   ↓
5. Evento 'window-all-closed' dispara
   ↓
6. Evento 'before-quit' dispara
   ↓
7. Evento 'will-quit' dispara (fallback)
   ↓
8. App sai completamente
```

### Próxima Abertura
```
1. App inicia
2. Verifica ~/.openclaw/openclaw.json
3. Não existe (foi deletado)
4. Mostra wizard novamente
5. Ciclo se repete
```

## 🎨 Comportamento do Usuário

### Experiência do Usuário

**Primeira vez:**
1. Abre o app
2. Vê o wizard
3. Configura provedor, API key, modelo
4. Usa o chat
5. Fecha o app

**Segunda vez:**
1. Abre o app
2. Vê o wizard novamente (não o chat)
3. Configura novamente
4. Usa o chat
5. Fecha o app

**Sempre:**
- Cada abertura = novo wizard
- Cada fechamento = limpeza completa
- Sem estado persistente entre sessões

## 🔒 Segurança

### Vantagens

1. **Sem credenciais persistentes**
   - API keys não ficam salvas no disco
   - Tokens são deletados ao fechar
   - Menor risco de vazamento

2. **Sem processos órfãos**
   - Gateway sempre é encerrado
   - Não fica consumindo recursos
   - Porta 18789 sempre liberada

3. **Estado limpo**
   - Cada sessão é independente
   - Sem conflitos de configuração
   - Fácil debug e troubleshooting

### Desvantagens

1. **Reconfiguração necessária**
   - Usuário precisa configurar toda vez
   - Pode ser inconveniente para uso frequente

2. **Sem persistência**
   - Histórico de chat não é salvo
   - Preferências não são mantidas

## 🛠️ Logs de Debug

### Logs ao Fechar

```
=== JANELA FECHANDO ===
[Cleanup] Encerrando gateway...
[Cleanup] ✓ Gateway encerrado
[Cleanup] ✓ Configuração deletada: C:\Users\...\openclaw.json
[Cleanup] ✓ Limpeza completa (janela fechando)

=== APP FECHANDO ===
[Cleanup] Encerrando gateway...
[Cleanup] ✓ Gateway encerrado
[Cleanup] ✓ Configuração deletada: C:\Users\...\openclaw.json
[Cleanup] ✓ Limpeza completa

=== APP SAINDO (before-quit) ===
[Cleanup] Encerrando gateway...
[Cleanup] ✓ Gateway encerrado
[Cleanup] ✓ Configuração deletada: C:\Users\...\openclaw.json
[Cleanup] ✓ Limpeza completa (before-quit)

=== APP SAINDO (will-quit) ===
[Cleanup] Forçando encerramento do gateway...
[Cleanup] ✓ Gateway forçadamente encerrado
```

### Verificação Pós-Fechamento

```bash
# Verificar se gateway foi encerrado
netstat -ano | findstr :18789
# Deve retornar vazio

# Verificar se configuração foi deletada
dir %USERPROFILE%\.openclaw\openclaw.json
# Deve retornar "File Not Found"

# Verificar processos node
tasklist | findstr node.exe
# Não deve ter processos gateway
```

## 🧪 Como Testar

### Teste 1: Limpeza Básica

```bash
# 1. Iniciar app
npm start

# 2. Configurar e usar
# (completar wizard, usar chat)

# 3. Fechar app (X na janela)

# 4. Verificar limpeza
dir %USERPROFILE%\.openclaw\openclaw.json
# Esperado: File Not Found

netstat -ano | findstr :18789
# Esperado: vazio (porta livre)
```

### Teste 2: Múltiplas Sessões

```bash
# 1. Abrir app
npm start

# 2. Configurar
# (wizard)

# 3. Fechar
# (X)

# 4. Abrir novamente
npm start

# Esperado: Wizard aparece novamente (não o chat)
```

### Teste 3: Fechamento Forçado

```bash
# 1. Abrir app
npm start

# 2. Configurar e usar

# 3. Fechar forçadamente
# Windows: Alt+F4
# Mac: Cmd+Q

# 4. Verificar limpeza
dir %USERPROFILE%\.openclaw\openclaw.json
# Esperado: File Not Found
```

## 🔄 Alternativas (Se Necessário)

Se o comportamento de "sempre limpar" não for desejado, aqui estão alternativas:

### Opção 1: Modo de Desenvolvimento

```javascript
const isDevelopment = process.env.NODE_ENV === 'development';

app.on('window-all-closed', () => {
  if (gatewayProcess) {
    gatewayProcess.kill();
    gatewayProcess = null;
  }
  
  // Só deletar config em produção
  if (!isDevelopment) {
    const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

### Opção 2: Configuração do Usuário

```javascript
// Adicionar opção no wizard
const configState = {
  // ...
  rememberConfig: false, // Checkbox no wizard
};

app.on('window-all-closed', () => {
  if (gatewayProcess) {
    gatewayProcess.kill();
    gatewayProcess = null;
  }
  
  // Só deletar se usuário não marcou "lembrar"
  const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!config.rememberConfig) {
      fs.unlinkSync(configPath);
    }
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

### Opção 3: Botão "Esquecer Configuração"

```javascript
// Adicionar botão na UI do chat
ipcMain.handle('forget-config', async () => {
  const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
    return { success: true };
  }
  return { success: false, message: 'Configuração não encontrada' };
});
```

## 📊 Comparação de Comportamentos

| Comportamento | Antes | Depois |
|--------------|-------|--------|
| Fechar app | Config mantida | Config deletada |
| Gateway ao fechar | Pode ficar rodando | Sempre encerrado |
| Próxima abertura | Vai pro chat | Mostra wizard |
| Segurança | API keys no disco | API keys deletadas |
| Conveniência | Alta (não reconfigura) | Baixa (reconfigura sempre) |
| Estado limpo | Não garantido | Sempre garantido |

## ✅ Checklist de Verificação

Após fechar o app, verificar:

- [ ] Gateway foi encerrado (porta 18789 livre)
- [ ] Configuração foi deletada (`~/.openclaw/openclaw.json` não existe)
- [ ] Nenhum processo node órfão rodando
- [ ] Logs mostram limpeza completa
- [ ] Próxima abertura mostra wizard

## 🎯 Conclusão

A limpeza automática ao fechar garante:
- ✅ Estado sempre limpo e previsível
- ✅ Sem processos órfãos
- ✅ Sem credenciais persistentes
- ✅ Fácil debug e troubleshooting
- ✅ Cada sessão é independente

Mas requer:
- ⚠️ Reconfiguração a cada abertura
- ⚠️ Sem persistência de preferências
- ⚠️ Pode ser inconveniente para uso frequente

Se necessário, as alternativas acima podem ser implementadas para dar mais controle ao usuário.
