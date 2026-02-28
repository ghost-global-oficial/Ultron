# Problema: Histórico Não Está Sendo Persistido

## Problema Identificado

As mensagens das novas tarefas não estão sendo salvas. Quando você:
1. Cria uma nova tarefa
2. Envia uma mensagem
3. Recebe a resposta da IA
4. O sistema recarrega o histórico

**Resultado:** As mensagens desaparecem porque o histórico retorna vazio.

## Evidência nos Logs

### Sessão Principal (funciona):
```
[DEBUG] Chat history response: {
  sessionKey: 'agent:main:main', 
  messagesCount: 8, 
  messages: Array(8)
}
```
✅ 8 mensagens salvas e carregadas corretamente

### Novas Sessões (não funcionam):
```
[DEBUG] Chat history response: {
  sessionKey: 'chat:1771802848554:5g3r7vk0u', 
  messagesCount: 0, 
  messages: Array(0)
}
```
❌ 0 mensagens - histórico vazio mesmo após conversa

## Sequência do Problema

1. **Usuário envia mensagem** → Aparece no chat
2. **IA responde** → Aparece no chat (streaming)
3. **Evento "final" recebido** → Sistema recarrega histórico
4. **Backend retorna 0 mensagens** → Chat fica vazio
5. **Mensagens desaparecem** → Parece que nada foi salvo

## Causa Raiz

O problema está no **backend/gateway**. Possíveis causas:

### 1. Formato da SessionKey
As novas sessões usam formato diferente:
- Principal: `agent:main:main` ✅
- Novas: `chat:1771802848554:5g3r7vk0u` ❌

O backend pode não estar reconhecendo o formato `chat:*` como válido.

### 2. Falta de Inicialização
As novas sessões podem não estar sendo inicializadas corretamente no backend antes de salvar mensagens.

### 3. Problema de Roteamento
O sistema pode estar salvando as mensagens com uma chave diferente da que usa para recuperar.

## Solução Proposta

### Opção 1: Usar Formato Padrão de SessionKey

Modificar `handleNewTask()` para criar sessões no formato correto:

**Arquivo:** `ui/src/ui/app.ts`

```typescript
handleNewTask() {
  // ANTES (formato errado):
  // const newSessionKey = `chat:${Date.now()}:${Math.random().toString(36).slice(2, 11)}`;
  
  // DEPOIS (formato correto):
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).slice(2, 11);
  const newSessionKey = `agent:main:chat:${timestamp}:${randomId}`;
  
  this.sessionKey = newSessionKey;
  this.chatMessage = "";
  this.chatAttachments = [];
  this.chatStream = null;
  this.chatStreamStartedAt = null;
  this.chatRunId = null;
  this.chatQueue = [];
  this.resetToolStream();
  this.resetChatScroll();
  this.applySettings({
    ...this.settings,
    sessionKey: newSessionKey,
    lastActiveSessionKey: newSessionKey,
  });
  this.setTab("chat");
  void this.loadAssistantIdentity();
  void loadChatHistory(this as unknown as UltronApp);
  void refreshChatAvatar(this);
}
```

### Opção 2: Investigar Backend

Se a Opção 1 não funcionar, precisamos verificar:

1. **Logs do gateway** - Ver se há erros ao salvar mensagens
2. **Arquivo de sessões** - `~/.openclaw/sessions.json`
3. **Código do backend** - Como ele trata diferentes formatos de sessionKey

## Como Testar a Correção

1. Aplicar a Opção 1 (mudar formato da sessionKey)
2. Recompilar a UI: `cd ui && npm run build`
3. Reiniciar o Ultron
4. Criar uma nova tarefa
5. Enviar uma mensagem
6. Aguardar resposta
7. **Verificar se as mensagens permanecem após o reload**

## Arquivos Envolvidos

- `ui/src/ui/app.ts` - Função `handleNewTask()` (linha ~535)
- Backend: Código que salva/carrega histórico de sessões
- `~/.openclaw/sessions.json` - Arquivo de persistência

## Notas Técnicas

### Formato de SessionKey no OpenClaw

O formato padrão parece ser:
```
agent:<agentId>:<channel>:<identifier>
```

Exemplos:
- `agent:main:main` - Sessão principal
- `agent:main:chat:1234567890:abc123` - Sessão de chat
- `agent:main:whatsapp:dm:+1234567890` - WhatsApp DM
- `agent:main:telegram:group:123` - Telegram grupo

O formato `chat:*` sem o prefixo `agent:main:` pode não ser reconhecido pelo backend.

## Próximos Passos

1. ✅ Aplicar correção do formato da sessionKey
2. ⏳ Testar se resolve o problema
3. ⏳ Se não resolver, investigar logs do gateway
4. ⏳ Se necessário, verificar código do backend
