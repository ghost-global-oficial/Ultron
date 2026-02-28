# Correção: Abertura de Tarefas/Conversas na Barra Lateral

## Problema
Não era possível abrir as conversas (tarefas) que aparecem na barra lateral. Ao clicar nelas, nada acontecia.

## Causa Raiz
O código estava atualizando o `sessionKey` e carregando o histórico, mas **não estava mudando para a aba "chat"**. Isso fazia com que a conversa fosse carregada em background, mas o usuário continuava vendo a aba atual.

## Solução Implementada

### 1. Adicionado `state.setTab('chat')` no `onSessionSelect`
**Arquivo:** `ui/src/ui/app-render.ts`

```typescript
onSessionSelect: (key) => {
  console.log('[DEBUG] onSessionSelect called with key:', key);
  console.log('[DEBUG] Current sessionKey:', state.sessionKey);
  console.log('[DEBUG] Current tab:', state.tab);
  
  state.sessionKey = key;
  state.chatMessage = "";
  state.chatAttachments = [];
  state.chatStream = null;
  state.chatStreamStartedAt = null;
  state.chatRunId = null;
  state.chatQueue = [];
  state.resetToolStream();
  state.resetChatScroll();
  state.applySettings({
    ...state.settings,
    sessionKey: key,
    lastActiveSessionKey: key,
  });
  
  // ✨ CORREÇÃO: Muda para a aba de chat
  console.log('[DEBUG] Switching to chat tab');
  state.setTab('chat');
  
  console.log('[DEBUG] Loading assistant identity and chat history');
  void state.loadAssistantIdentity();
  void loadChatHistory(state);
  void refreshChatAvatar(state);
},
```

### 2. Melhorado o handler de clique na sidebar
**Arquivo:** `ui/src/ui/views/new-sidebar.ts`

```typescript
@click=${(e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  console.log('[DEBUG] Task clicked:', session.key);
  props.onSessionSelect(session.key);
}}
```

### 3. Adicionados logs de debug
Para facilitar o diagnóstico de problemas futuros, foram adicionados logs em pontos-chave:
- Clique na tarefa
- Chamada do `onSessionSelect`
- Mudança de aba
- Carregamento do histórico

## Como Testar

1. **Recompilar a UI:**
   ```bash
   cd ui
   npm run build
   ```

2. **Reiniciar o aplicativo Ultron**

3. **Abrir o DevTools (F12)** e ir para a aba Console

4. **Clicar em uma tarefa** na barra lateral

5. **Verificar os logs:**
   - `[DEBUG] Task clicked: <session-key>`
   - `[DEBUG] onSessionSelect called with key: <session-key>`
   - `[DEBUG] Switching to chat tab`
   - `[DEBUG] Loading chat history for session: <session-key>`

## Comportamento Esperado

Ao clicar em uma tarefa na barra lateral:
1. ✅ A aba muda automaticamente para "chat"
2. ✅ O histórico da conversa é carregado
3. ✅ A tarefa fica destacada (active) na sidebar
4. ✅ O chat mostra as mensagens anteriores

## Arquivos Modificados

- `ui/src/ui/app-render.ts` - Adicionado `state.setTab('chat')` e logs de debug
- `ui/src/ui/views/new-sidebar.ts` - Melhorado handler de clique com preventDefault/stopPropagation

## Notas Técnicas

- A função `setTab()` já existia no código, apenas não estava sendo chamada
- Os logs de debug podem ser removidos após confirmar que tudo funciona
- O `preventDefault()` e `stopPropagation()` garantem que o evento não seja bloqueado por outros handlers

## Troubleshooting

Se ainda não funcionar após a correção:

1. **Verificar se os logs aparecem** - Se sim, o clique funciona
2. **Verificar se há erros no console** - Pode indicar outro problema
3. **Verificar se o gateway está conectado** - Health deve estar "OK"
4. **Limpar o cache do navegador** - Ctrl+Shift+Delete
5. **Verificar se a build foi feita** - Deve existir `dist/control-ui/assets/index-*.js`
