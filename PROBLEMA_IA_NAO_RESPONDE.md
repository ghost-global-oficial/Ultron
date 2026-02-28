# 🔧 Problema: IA Não Responde

## Diagnóstico

### Problema Identificado
O gateway **não está rodando** quando você tenta enviar mensagens.

### Evidências
```bash
# Verificar porta 18789
netstat -ano | findstr 18789
# Resultado: Nenhuma conexão (gateway não está rodando)
```

### Causa Raiz
O processo do gateway é iniciado durante a configuração, mas:
1. ✅ Inicia com sucesso
2. ✅ UI do chat carrega
3. ❌ **Processo do gateway encerra logo depois**

## Por Que Isso Acontece?

### Fluxo Atual (Problemático)
```
1. Usuário completa configuração
   ↓
2. Gateway inicia (spawn)
   ↓
3. Sistema detecta que gateway iniciou
   ↓
4. UI do chat carrega
   ↓
5. ❌ Processo do gateway encerra (variável local perdida)
   ↓
6. Usuário tenta enviar mensagem
   ↓
7. ❌ Gateway não está rodando
   ↓
8. ❌ Sem resposta
```

### Problema Técnico
```javascript
// ANTES (main.js - handler start-gateway)
const gatewayProcess = spawn('node', args, { ... });
// ❌ Variável LOCAL - perdida após o handler terminar
// ❌ Processo pode ser garbage collected
```

## Solução Aplicada

### 1. Variável Global
```javascript
// main.js - topo do arquivo
let gatewayProcess = null; // ✅ Variável GLOBAL
```

### 2. Salvar Referência
```javascript
// main.js - handler start-gateway
gatewayProcess = spawn('node', args, { ... });
// ✅ Salva na variável global
// ✅ Processo mantido ativo
```

### 3. Cleanup ao Fechar
```javascript
// main.js - app.on('window-all-closed')
if (gatewayProcess) {
  console.log('Encerrando gateway...');
  gatewayProcess.kill();
  gatewayProcess = null;
}
```

### 4. Limpar ao Encerrar
```javascript
// main.js - gatewayProcess.on('exit')
gatewayProcess = null; // ✅ Limpar referência
```

## Fluxo Corrigido

```
1. Usuário completa configuração
   ↓
2. Gateway inicia (spawn)
   ↓
3. ✅ Referência salva em variável GLOBAL
   ↓
4. Sistema detecta que gateway iniciou
   ↓
5. UI do chat carrega
   ↓
6. ✅ Gateway continua rodando (referência mantida)
   ↓
7. Usuário envia mensagem
   ↓
8. ✅ Gateway processa
   ↓
9. ✅ IA responde
   ↓
10. ✅ Resposta exibida no chat
```

## Como Testar

### 1. Reiniciar Aplicativo
```bash
# Fechar aplicativo completamente
# Iniciar novamente
npm start
```

### 2. Verificar Gateway Rodando
```bash
# Em outro terminal
netstat -ano | findstr 18789
# Deve mostrar: TCP 127.0.0.1:18789 ... LISTENING
```

### 3. Testar Mensagem
```bash
# Opcional: testar via script
node test-gateway-message.cjs
```

### 4. Enviar Mensagem no Chat
- Digite uma mensagem
- Pressione Enter
- ✅ Deve receber resposta da IA

## Verificação no DevTools

### Console (F12)
```
=== ULTRON CONFIG INJECTED ===
Gateway URL: ws://localhost:18789
✓ Settings saved to localStorage
WebSocket connection established
Connected to gateway
```

### Network → WS
- Conexão WebSocket ativa
- Status: 101 Switching Protocols
- Frames: Mensagens sendo enviadas/recebidas

## Logs Esperados

### Terminal do Electron
```
[Gateway] Iniciando gateway...
[Gateway STDOUT] Gateway running on port 18789
[Gateway STDOUT] WebSocket server started
[Gateway] ✓ Gateway detectado como iniciado!
```

### Ao Enviar Mensagem
```
[Gateway STDOUT] Client connected
[Gateway STDOUT] Received message: "Olá!"
[Gateway STDOUT] Processing with model: groq/openai/gpt-oss-120b
[Gateway STDOUT] Response generated
```

## Possíveis Problemas Adicionais

### Problema 1: Gateway Encerra Imediatamente
**Sintoma**: Gateway inicia mas encerra em segundos

**Causa**: Erro na configuração ou API key inválida

**Solução**: Verificar logs do gateway no terminal

### Problema 2: WebSocket Não Conecta
**Sintoma**: UI carrega mas não conecta ao gateway

**Causa**: Token incorreto ou gateway não está escutando

**Solução**: Verificar token no localStorage vs arquivo de configuração

### Problema 3: Mensagem Enviada Mas Sem Resposta
**Sintoma**: Mensagem aparece no chat mas IA não responde

**Causa**: Modelo não configurado ou API key inválida

**Solução**: Verificar `agents.defaults.model.primary` e `env.vars.GROQ_API_KEY`

## Comandos de Debug

### Verificar Gateway Rodando
```bash
netstat -ano | findstr 18789
```

### Verificar Configuração
```bash
type %USERPROFILE%\.openclaw\openclaw.json
```

### Testar Conexão
```bash
node test-gateway-message.cjs
```

### Ver Logs do Gateway
```
# No terminal do Electron (onde você executou npm start)
# Procure por linhas começando com [Gateway]
```

## Status

- ✅ Problema identificado
- ✅ Solução implementada
- ⏳ Aguardando teste

## Próximos Passos

1. **Reiniciar aplicativo** (fechar completamente e abrir de novo)
2. **Verificar se gateway está rodando** (`netstat -ano | findstr 18789`)
3. **Enviar mensagem no chat**
4. **Verificar resposta da IA**

---

**Se ainda não funcionar após reiniciar, me envie os logs do terminal do Electron.**
