# Correção Completa: Sistema de Tarefas

## Problemas Identificados e Corrigidos

### 1. ❌ Tarefas não abriam ao clicar
**Causa:** Faltava mudar para a aba "chat" ao selecionar uma tarefa  
**Correção:** Adicionado `state.setTab('chat')` no `onSessionSelect`  
**Arquivo:** `ui/src/ui/app-render.ts`

### 2. ❌ Apenas a tarefa "agent:main:main" aparecia
**Causa:** Filtro `sessionsIncludeUnknown` estava como `false`  
**Correção:** Mudado para `true` para mostrar todas as sessões  
**Arquivo:** `ui/src/ui/app.ts` (linha 206)

### 3. ❌ Histórico não era persistido nas novas tarefas
**Causa:** Formato incorreto da sessionKey (`chat:*` em vez de `agent:main:chat:*`)  
**Correção:** Mudado formato para `agent:main:chat:timestamp:randomId`  
**Arquivo:** `ui/src/ui/app.ts` (função `handleNewTask`)

## Correções Aplicadas

### Correção 1: Mudança de Aba ao Selecionar Tarefa

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

### Correção 2: Incluir Sessões Desconhecidas

**Arquivo:** `ui/src/ui/app.ts`

```typescript
// ANTES:
@state() sessionsIncludeUnknown = false;

// DEPOIS:
@state() sessionsIncludeUnknown = true; // Mudado para true para mostrar todas as tarefas
```

### Correção 3: Formato Correto da SessionKey

**Arquivo:** `ui/src/ui/app.ts`

```typescript
handleNewTask() {
  // ANTES (formato errado):
  // const newSessionKey = `chat:${Date.now()}:${Math.random().toString(36).slice(2, 11)}`;
  
  // DEPOIS (formato correto):
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).slice(2, 11);
  const newSessionKey = `agent:main:chat:${timestamp}:${randomId}`;
  
  // ... resto do código
}
```

## Como Testar

1. **Reinicie o aplicativo Ultron**

2. **Teste 1: Criar Nova Tarefa**
   - Clique em "Nova Tarefa"
   - Envie uma mensagem (ex: "olá")
   - Aguarde a resposta
   - ✅ As mensagens devem permanecer visíveis

3. **Teste 2: Criar Segunda Tarefa**
   - Clique em "Nova Tarefa" novamente
   - Envie outra mensagem (ex: "teste")
   - Aguarde a resposta
   - ✅ As mensagens devem permanecer visíveis

4. **Teste 3: Alternar Entre Tarefas**
   - Clique na primeira tarefa na barra lateral
   - ✅ Deve mostrar as mensagens da primeira conversa
   - Clique na segunda tarefa
   - ✅ Deve mostrar as mensagens da segunda conversa

5. **Teste 4: Voltar para Tarefa Principal**
   - Clique em "agent:main:main" (ou "Main")
   - ✅ Deve mostrar o histórico completo da sessão principal

## Comportamento Esperado

Agora o sistema deve funcionar assim:

✅ **Criar Tarefas:** Botão "Nova Tarefa" cria uma nova conversa vazia  
✅ **Ver Todas as Tarefas:** Barra lateral mostra todas as tarefas criadas  
✅ **Abrir Tarefas:** Clicar em qualquer tarefa abre ela no chat  
✅ **Histórico Persistido:** Mensagens são salvas e carregadas corretamente  
✅ **Alternar Tarefas:** Pode trocar entre tarefas livremente  
✅ **Cada Tarefa Independente:** Cada tarefa mantém seu próprio histórico  

## Arquivos Modificados

1. `ui/src/ui/app-render.ts` - Adicionado `state.setTab('chat')` e logs de debug
2. `ui/src/ui/views/new-sidebar.ts` - Melhorado handler de clique
3. `ui/src/ui/app.ts` - Mudado `sessionsIncludeUnknown` para `true`
4. `ui/src/ui/app.ts` - Corrigido formato da sessionKey em `handleNewTask()`

## Formato de SessionKey

### Formato Correto (usado agora):
```
agent:main:chat:1771802848554:5g3r7vk0u
│     │    │    │            │
│     │    │    │            └─ ID aleatório
│     │    │    └─ Timestamp
│     │    └─ Tipo (chat)
│     └─ Agent ID
└─ Prefixo
```

### Formato Incorreto (usado antes):
```
chat:1771802848554:5g3r7vk0u
│    │            │
│    │            └─ ID aleatório
│    └─ Timestamp
└─ Tipo (sem prefixo agent:main:)
```

O backend do OpenClaw espera o formato completo com `agent:main:` no início.

## Troubleshooting

Se ainda houver problemas:

### Problema: Tarefas não aparecem na sidebar
**Solução:** Verifique se `sessionsIncludeUnknown = true` no código

### Problema: Histórico não é salvo
**Solução:** Verifique se o formato da sessionKey está correto (`agent:main:chat:*`)

### Problema: Não muda para aba chat ao clicar
**Solução:** Verifique se `state.setTab('chat')` está no `onSessionSelect`

### Problema: Erros no console
**Solução:** 
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Reinicie o aplicativo completamente
3. Verifique se o gateway está conectado (Health: OK)

## Logs de Debug

Para verificar se tudo está funcionando, abra o DevTools (F12) e procure por:

```
[DEBUG] Task clicked: agent:main:chat:...
[DEBUG] onSessionSelect called with key: agent:main:chat:...
[DEBUG] Switching to chat tab
[DEBUG] Loading chat history for session: agent:main:chat:...
[DEBUG] Chat history response: {sessionKey: '...', messagesCount: X, messages: Array(X)}
```

Se `messagesCount` for maior que 0 após enviar mensagens, o histórico está sendo salvo corretamente!

## Resumo

Três correções simples mas cruciais:
1. ✅ Mudar para aba chat ao clicar em tarefa
2. ✅ Mostrar todas as tarefas (não apenas a principal)
3. ✅ Usar formato correto de sessionKey para persistência

Agora o sistema de tarefas deve funcionar perfeitamente!
