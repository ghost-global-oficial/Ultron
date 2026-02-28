# Streaming em Tempo Real - Debug Implementado

## Problema Identificado

O usuário reportou que não consegue ver a resposta da IA em tempo real no chat. O streaming já estava implementado, mas pode não estar funcionando corretamente.

## Análise do Código

### Como o Streaming Funciona

1. **Backend envia eventos "delta"**: Quando a IA está gerando uma resposta, o backend envia eventos WebSocket com `state: "delta"` contendo o texto parcial.

2. **Gateway recebe eventos**: O `GatewayBrowserClient` recebe os eventos e chama `handleGatewayEvent` em `app-gateway.ts`.

3. **Processamento do evento**: O evento "chat" é processado por `handleChatEvent` em `controllers/chat.ts`, que:
   - Extrai o texto da mensagem usando `extractText()`
   - Atualiza `state.chatStream` com o novo texto
   - O estado é uma propriedade `@state()` do Lit, então deveria re-renderizar automaticamente

4. **Renderização**: O componente `renderChat` em `views/chat.ts`:
   - Chama `buildChatItems()` que verifica se `props.stream !== null`
   - Se houver stream, adiciona um item do tipo "stream"
   - Renderiza usando `renderStreamingGroup()` que mostra o texto em tempo real

### Arquivos Envolvidos

- `ui/src/ui/app-gateway.ts` - Recebe eventos WebSocket
- `ui/src/ui/controllers/chat.ts` - Processa eventos de chat e atualiza `chatStream`
- `ui/src/ui/views/chat.ts` - Renderiza o chat e constrói os itens
- `ui/src/ui/chat/grouped-render.ts` - Renderiza o grupo de streaming

## Mudanças Implementadas

### 1. Logs de Debug Adicionados

Adicionei logs detalhados em pontos-chave para diagnosticar o problema:

#### Em `app-gateway.ts`:
```typescript
console.log('[DEBUG] Gateway chat event:', {
  state: payload?.state,
  runId: payload?.runId,
  sessionKey: payload?.sessionKey,
  hasMessage: !!payload?.message,
});
```

#### Em `controllers/chat.ts`:
```typescript
// No handleChatEvent
console.log('[DEBUG] Chat event received:', {
  state: payload.state,
  runId: payload.runId,
  currentRunId: state.chatRunId,
  sessionKey: payload.sessionKey,
  messagesCount: state.chatMessages.length,
  hasMessage: !!payload.message,
});

// No processamento de delta
console.log('[DEBUG] Delta event - extracted text:', {
  textLength: next?.length ?? 0,
  currentStreamLength: state.chatStream?.length ?? 0,
  text: next?.substring(0, 100),
});

console.log('[DEBUG] Stream updated:', {
  newLength: next.length,
  preview: next.substring(0, 100),
});
```

#### Em `views/chat.ts`:
```typescript
console.log('[DEBUG] Building chat items:', {
  historyCount: history.length,
  toolsCount: tools.length,
  loading: props.loading,
  hasStream: props.stream !== null,
  streamLength: props.stream?.length ?? 0,
  streamPreview: props.stream?.substring(0, 100),
});

console.log('[DEBUG] Adding stream item:', {
  key,
  streamLength: props.stream.length,
  hasContent: props.stream.trim().length > 0,
});
```

#### Em `chat/grouped-render.ts`:
```typescript
console.log('[DEBUG] renderStreamingGroup called:', {
  textLength: text.length,
  preview: text.substring(0, 100),
  startedAt,
});
```

## Como Testar

### 1. Abrir o Console do Navegador

1. Abra o ULTRON
2. Pressione `F12` ou `Ctrl+Shift+I` para abrir as ferramentas de desenvolvedor
3. Vá para a aba "Console"

### 2. Enviar uma Mensagem

1. Digite uma mensagem no chat (ex: "Explique o que é inteligência artificial")
2. Envie a mensagem
3. Observe os logs no console

### 3. O Que Esperar nos Logs

Se o streaming estiver funcionando corretamente, você verá:

```
[DEBUG] Gateway chat event: { state: "delta", runId: "...", sessionKey: "...", hasMessage: true }
[DEBUG] Chat event received: { state: "delta", runId: "...", ... }
[DEBUG] Delta event - extracted text: { textLength: 50, currentStreamLength: 0, text: "..." }
[DEBUG] Stream updated: { newLength: 50, preview: "..." }
[DEBUG] Building chat items: { ..., hasStream: true, streamLength: 50, ... }
[DEBUG] Adding stream item: { key: "...", streamLength: 50, hasContent: true }
[DEBUG] renderStreamingGroup called: { textLength: 50, preview: "...", ... }
```

E você verá múltiplos eventos "delta" conforme o texto vai sendo gerado.

### 4. Possíveis Problemas

#### Problema 1: Nenhum evento "delta" aparece
- **Causa**: O backend não está enviando eventos de streaming
- **Solução**: Verificar configuração do modelo/provedor no backend

#### Problema 2: Eventos "delta" aparecem mas o texto não atualiza
- **Causa**: Problema na extração do texto ou na atualização do estado
- **Solução**: Verificar os logs de "Delta event - extracted text" e "Stream updated"

#### Problema 3: Stream atualiza mas não renderiza
- **Causa**: Problema no componente Lit ou na renderização
- **Solução**: Verificar se "Building chat items" mostra `hasStream: true` e se "renderStreamingGroup" é chamado

#### Problema 4: Renderiza mas não aparece na tela
- **Causa**: Problema de CSS ou scroll
- **Solução**: Verificar se o elemento está sendo criado no DOM e se está visível

## Próximos Passos

Após testar e verificar os logs, podemos:

1. **Se os eventos delta não chegam**: Investigar o backend e a configuração do modelo
2. **Se os eventos chegam mas não atualizam**: Verificar a lógica de extração de texto
3. **Se atualiza mas não renderiza**: Verificar o ciclo de vida do Lit e o re-render
4. **Se renderiza mas não aparece**: Verificar CSS e posicionamento

## Arquivos Modificados

- `ui/src/ui/app-gateway.ts` - Adicionado log de eventos de chat
- `ui/src/ui/controllers/chat.ts` - Adicionados logs detalhados de processamento
- `ui/src/ui/views/chat.ts` - Adicionados logs de construção de itens
- `ui/src/ui/chat/grouped-render.ts` - Adicionado log de renderização

## Compilação

A aplicação foi recompilada com sucesso:
```
npm run build (no diretório ui)
```

Agora é necessário reiniciar o ULTRON para testar as mudanças.
