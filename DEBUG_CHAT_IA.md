# 🔍 Debug: IA Não Responde

## Checklist de Verificação

### 1. Abrir DevTools
Pressione **F12** no chat e vá para a aba **Console**.

### 2. Verificar WebSocket
Procure por estas mensagens:

#### ✅ Conexão OK
```
=== ULTRON CONFIG INJECTED ===
Gateway URL: ws://localhost:18789
Gateway Token: ymkkplp9o6lwpkm2b67kcqqbasu66xvg
✓ Settings saved to localStorage
```

#### ✅ WebSocket Conectado
```
WebSocket connection established
Connected to gateway
```

#### ❌ Erros Possíveis
```
WebSocket disconnected
unauthorized: gateway token mismatch
Failed to send message
```

### 3. Verificar Network (Aba Network → WS)
- Deve haver uma conexão WebSocket ativa
- Status: 101 Switching Protocols
- Frames: Deve mostrar mensagens sendo enviadas/recebidas

### 4. Testar Manualmente no Console

Execute este código no Console do DevTools:

```javascript
// 1. Verificar se há uma sessão ativa
console.log('Sessions:', localStorage.getItem('openclaw.control.settings.v1'));

// 2. Verificar configuração
const settings = JSON.parse(localStorage.getItem('openclaw.control.settings.v1'));
console.log('Gateway URL:', settings.gatewayUrl);
console.log('Token:', settings.token);
console.log('Session Key:', settings.sessionKey);

// 3. Verificar se o WebSocket está conectado
// (Isso depende da implementação da UI do OpenClaw)
```

### 5. Verificar Logs do Gateway

No terminal onde o gateway está rodando, procure por:

#### ✅ Gateway OK
```
Gateway running on port 18789
WebSocket server started
Client connected
```

#### ✅ Mensagem Recebida
```
Received message from client
Processing prompt: "..."
Calling AI provider: groq
```

#### ❌ Erros Possíveis
```
Error: No API key configured
Error: Model not found
Error: Rate limit exceeded
Error: Invalid token
```

## Possíveis Causas

### Causa 1: Sessão Não Criada
A UI do OpenClaw precisa de uma sessão ativa para enviar mensagens.

**Solução**: Criar uma sessão padrão na configuração.

### Causa 2: Modelo Não Configurado Corretamente
O modelo pode não estar no formato correto.

**Verificar**: `agents.defaults.model.primary` deve ser `groq/openai/gpt-oss-120b`

### Causa 3: API Key Inválida
A chave API do Groq pode estar incorreta ou expirada.

**Testar**: Fazer uma chamada direta à API do Groq.

### Causa 4: Gateway Não Está Processando
O gateway pode estar rodando mas não processando mensagens.

**Verificar**: Logs do gateway no terminal.

### Causa 5: WebSocket Não Está Enviando
A UI pode não estar enviando mensagens via WebSocket.

**Verificar**: Aba Network → WS → Frames.

## Teste Rápido

### No Console do DevTools:

```javascript
// Teste 1: Verificar localStorage
console.log('=== TESTE 1: LocalStorage ===');
const settings = JSON.parse(localStorage.getItem('openclaw.control.settings.v1'));
console.log('Settings:', settings);

// Teste 2: Verificar se há erro no console
console.log('=== TESTE 2: Erros ===');
// Procure por mensagens de erro em vermelho

// Teste 3: Verificar elementos da UI
console.log('=== TESTE 3: UI Elements ===');
console.log('Input:', document.querySelector('textarea'));
console.log('Send button:', document.querySelector('button[type="submit"]'));
```

## Solução Temporária

Se a UI do OpenClaw não estiver funcionando, podemos criar uma interface customizada que funcione via IPC (como tínhamos antes com chat.html).

## Próximos Passos

1. **Abrir DevTools** (F12)
2. **Enviar uma mensagem** no chat
3. **Copiar TODOS os logs** do Console
4. **Copiar TODOS os frames** da aba Network → WS
5. **Me enviar** para análise

---

**Aguardando logs para diagnóstico preciso.**
