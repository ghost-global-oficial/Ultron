# Guia Rápido: Correção de Múltiplos Gateways

## ✅ Problema Resolvido

O problema de múltiplos gateways sendo iniciados e o terminal de configuração não abrindo foi **CORRIGIDO**.

## 🔧 O Que Foi Corrigido

1. ✅ Removido `FORCE_WIZARD = true` que forçava sempre mostrar o wizard
2. ✅ Adicionado verificação para matar gateway existente antes de iniciar novo
3. ✅ Adicionado verificação se porta está em uso
4. ✅ Garantido que apenas 1 gateway roda por vez

## 🚀 Como Usar Agora

### Primeira Vez (Sem Configuração)

```bash
# 1. Matar todos os processos node existentes
node kill-all-gateways.cjs

# 2. Deletar configuração antiga (se existir)
del %USERPROFILE%\.openclaw\openclaw.json

# 3. Iniciar o app
npm start
```

**Resultado:** O wizard de configuração será mostrado.

### Execuções Normais (Com Configuração)

```bash
# Apenas iniciar o app
npm start
```

**Resultado:** O chat será carregado diretamente, sem mostrar o wizard.

### Se Quiser Reconfigurar

```bash
# 1. Deletar a configuração
del %USERPROFILE%\.openclaw\openclaw.json

# 2. Reiniciar o app
npm start
```

**Resultado:** O wizard será mostrado novamente.

## 🧪 Como Testar

### Teste 1: Verificar Estado Atual

```bash
node test-gateway-fix.cjs
```

Este script verifica:
- ✅ Se FORCE_WIZARD foi removido
- ✅ Se handlers foram adicionados
- ✅ Se há múltiplos gateways rodando
- ✅ Se a porta está livre

### Teste 2: Matar Todos os Gateways

```bash
node kill-all-gateways.cjs
```

Este script mata todos os processos node/gateway rodando.

### Teste 3: Verificar Porta

```bash
# Windows
netstat -ano | findstr :18789

# Se não retornar nada = porta livre ✅
# Se retornar algo = porta em uso ❌
```

## 📋 Fluxo Correto Agora

### Primeira Execução
```
App Inicia
    ↓
Verifica ~/.openclaw/openclaw.json
    ↓
Não existe?
    ↓
Mostra Wizard
    ↓
Usuário Configura
    ↓
Salva Config
    ↓
Inicia Gateway (1x)
    ↓
Carrega Chat UI
```

### Execuções Subsequentes
```
App Inicia
    ↓
Verifica ~/.openclaw/openclaw.json
    ↓
Existe?
    ↓
Lê Config
    ↓
Inicia Gateway (1x)
    ↓
Carrega Chat UI Diretamente
    ↓
(Sem Wizard)
```

## 🛡️ Garantias Implementadas

### 1. Apenas 1 Gateway
```javascript
// main.js - linha ~250
if (gatewayProcess) {
  console.log('[Gateway] ⚠️ Gateway já está rodando! Encerrando...');
  gatewayProcess.kill();
  gatewayProcess = null;
  await new Promise(resolve => setTimeout(resolve, 1500));
}
```

### 2. Verificação de Porta
```javascript
// main.js - linha ~280
const portInUse = await isPortInUse(config.OPENCLAW_GATEWAY_PORT);
if (portInUse) {
  return {
    success: false,
    message: `Porta ${config.OPENCLAW_GATEWAY_PORT} já está em uso.`
  };
}
```

### 3. Matar Antes de Iniciar
```javascript
// renderer.js - linha ~870
await ipcRenderer.invoke('kill-existing-gateway');
console.log('✓ Gateways existentes encerrados');
```

## 🐛 Se Ainda Houver Problemas

### Problema: Múltiplos Gateways Rodando

```bash
# 1. Matar todos
node kill-all-gateways.cjs

# 2. Verificar se matou
netstat -ano | findstr :18789

# 3. Se ainda houver, reiniciar o computador
```

### Problema: Porta em Uso

```bash
# 1. Descobrir qual processo está usando
netstat -ano | findstr :18789

# 2. Matar o processo pelo PID
taskkill /F /PID <PID>

# 3. Verificar novamente
netstat -ano | findstr :18789
```

### Problema: Wizard Não Aparece

```bash
# 1. Verificar se configuração existe
dir %USERPROFILE%\.openclaw\openclaw.json

# 2. Se existir, deletar
del %USERPROFILE%\.openclaw\openclaw.json

# 3. Reiniciar app
npm start
```

### Problema: Chat Não Carrega

```bash
# 1. Verificar logs do console (DevTools)
# 2. Procurar por erros de WebSocket
# 3. Verificar se gateway está rodando
netstat -ano | findstr :18789

# 4. Verificar token no localStorage
# Abrir DevTools > Application > Local Storage
# Procurar por: openclaw.control.settings.v1
```

## 📝 Logs Importantes

### Logs do Main Process (Console do Electron)

```
=== CONFIGURAÇÃO ENCONTRADA ===
Iniciando gateway automaticamente...
[Gateway] Iniciando com args: [...]
[Gateway] ✓ Porta 18789 está livre
[Gateway] ✓ Gateway iniciado com sucesso!
```

### Logs do Renderer Process (DevTools)

```
=== ABRINDO CHAT ===
Gateway Port: 18789
Gateway Token (primeiros 16 chars): abc123...
✓ Token lido do arquivo de configuração
✓ Evento load-chat-ui enviado
```

### Logs do Gateway (stdout)

```
[Gateway STDOUT] Gateway listening on port 18789
[Gateway STDOUT] WebSocket server started
[Gateway STDOUT] Ready to accept connections
```

## 🎯 Checklist de Verificação

Antes de reportar um problema, verifique:

- [ ] Todos os processos node foram mortos
- [ ] Porta 18789 está livre
- [ ] Configuração existe (ou não, dependendo do teste)
- [ ] DevTools está aberto para ver logs
- [ ] Apenas 1 gateway está rodando após iniciar

## 📞 Suporte

Se o problema persistir após seguir este guia:

1. Execute `node test-gateway-fix.cjs` e copie a saída
2. Abra DevTools e copie os logs do console
3. Verifique os logs do gateway em `gateway-out.log` e `gateway-err.log`
4. Reporte com todas essas informações

## ✨ Melhorias Futuras

Possíveis melhorias para considerar:

1. **Auto-kill de processos órfãos** ao iniciar o app
2. **Detecção automática de porta alternativa** se 18789 estiver ocupada
3. **Botão "Reconfigurar"** na UI do chat
4. **Status visual do gateway** na UI (conectado/desconectado)
5. **Logs em arquivo** para debug mais fácil
