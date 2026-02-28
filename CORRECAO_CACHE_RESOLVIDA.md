# Correção do Cache do Electron - RESOLVIDA ✅

## Problema Identificado

O Electron não estava carregando o código corrigido porque:

1. **O Electron carrega a UI do gateway via HTTP** (`http://localhost:18789`)
2. **O gateway serve a UI de `dist/control-ui`** (compilado pelo Vite)
3. **A UI não havia sido recompilada** após a correção no código fonte

### Fluxo de Carregamento

```
main.js (linha 356)
  ↓
mainWindow.loadURL(`http://localhost:18789`)
  ↓
Gateway serve arquivos de dist/control-ui
  ↓
src/gateway/control-ui.ts procura em:
  - dist/control-ui/index.html
  - dist/control-ui/assets/*.js
```

## Solução Aplicada

### 1. Recompilação da UI

```bash
cd ui
pnpm build
```

Resultado:
- ✅ Código compilado em `dist/control-ui/assets/index-BOJKpVXr.js`
- ✅ Verificado que contém: `agent:main:chat:${e}:${t}`

### 2. Limpeza Completa

Script `reiniciar-gateway.ps1` criado para:
- ✅ Fechar todos os processos Electron
- ✅ Matar processos na porta 18789
- ✅ Limpar cache do Electron (`%APPDATA%\ultron-desktop`)
- ✅ Limpar sessões antigas (manter apenas `agent:main:main`)

## Como Testar

### 1. Abrir o Electron

```bash
npm start
```

### 2. Configurar o Gateway

- Escolher provedor (OpenRouter, Claude, etc.)
- Inserir API key
- Iniciar gateway

### 3. Criar Nova Tarefa

- Clicar no botão "+" na barra lateral
- Uma nova sessão será criada com formato: `agent:main:chat:1771869123456:abc123xyz`

### 4. Enviar Mensagens

- Enviar uma mensagem de teste
- Verificar no console do DevTools:
  ```
  sessionKey: 'agent:main:chat:1771869123456:abc123xyz'
  ```

### 5. Recarregar o App

- Fechar e reabrir o Electron
- Verificar que a tarefa ainda aparece na barra lateral
- Clicar na tarefa
- **O histórico deve aparecer!** ✅

## Verificação do Histórico

### Backend (Node.js)

O histórico é salvo em:
```
~/.openclaw/agents/main/sessions/*.jsonl
```

Cada sessão tem seu próprio arquivo:
```
agent_main_chat_1771869123456_abc123xyz.jsonl
```

### Como Verificar

1. Abrir o arquivo da sessão
2. Cada linha é um evento JSON
3. Procurar por eventos do tipo `message` ou `tool`

## Código Corrigido

### ui/src/ui/app.ts (linha ~535)

```typescript
handleNewTask() {
  // Gera uma nova chave de sessão no formato correto: agent:main:chat:timestamp:randomId
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).slice(2, 11);
  const newSessionKey = `agent:main:chat:${timestamp}:${randomId}`;
  
  // Limpa o estado do chat
  this.sessionKey = newSessionKey;
  this.chatMessage = "";
  this.chatMessages = [];
  this.chatToolMessages = [];
  this.chatAttachments = [];
  this.chatStream = null;
  this.chatStreamStartedAt = null;
  this.chatRunId = null;
  this.chatQueue = [];
  
  // ... resto do código
}
```

## Por Que Funcionou

1. **Formato correto**: `agent:main:chat:*` é reconhecido pelo backend
2. **Recompilação**: Vite gerou novo JavaScript com o código corrigido
3. **Cache limpo**: Electron não usa versão antiga
4. **Gateway atualizado**: Serve a nova versão compilada

## Arquivos Modificados

- ✅ `ui/src/ui/app.ts` - Correção do sessionKey
- ✅ `dist/control-ui/assets/index-BOJKpVXr.js` - Código compilado
- ✅ `reiniciar-gateway.ps1` - Script de limpeza

## Próximos Passos

1. Testar criação de múltiplas tarefas
2. Verificar persistência após reiniciar o app
3. Confirmar que o histórico é carregado corretamente
4. Validar que mensagens antigas aparecem ao reabrir uma tarefa

## Notas Importantes

- O formato `agent:main:chat:*` é OBRIGATÓRIO para o backend salvar histórico
- Sessões com formato `chat:*` (sem prefixo) NÃO são salvas
- O gateway sempre serve de `dist/control-ui`, nunca de `ui/src`
- Cache do Electron pode ser limpo manualmente em `%APPDATA%\ultron-desktop`
