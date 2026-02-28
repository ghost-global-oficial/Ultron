# Instruções para Testar e Diagnosticar o Problema do Chat

## Problema
Quando a IA termina de responder, o chat fecha e não é possível reabrir.

## Logs de Diagnóstico Adicionados
Adicionei logs de diagnóstico no código para identificar exatamente onde o problema está ocorrendo:

1. **loadChatHistory** (ui/src/ui/controllers/chat.ts)
   - Mostra qual sessão está sendo carregada
   - Mostra quantas mensagens foram retornadas
   - Mostra o conteúdo das mensagens

2. **handleChatEvent** (ui/src/ui/controllers/chat.ts)
   - Mostra quando eventos de chat são recebidos
   - Mostra o estado do evento (delta, final, error, aborted)
   - Mostra quantas mensagens existem no estado

3. **buildChatItems** (ui/src/ui/views/chat.ts)
   - Mostra quantas mensagens estão sendo renderizadas
   - Mostra se o chat está vazio

4. **renderChat** (ui/src/ui/views/chat.ts)
   - Mostra o estado completo do chat antes de renderizar

## Como Testar

### 1. Limpar Cache do Navegador
```powershell
# Pressione Ctrl+Shift+Delete no navegador
# OU
# Pressione Ctrl+F5 para recarregar sem cache
```

### 2. Abrir DevTools
1. Pressione F12 no navegador
2. Vá para a aba "Console"
3. Limpe o console (ícone de lixeira ou Ctrl+L)

### 3. Iniciar o Gateway
```powershell
pnpm openclaw gateway run --bind loopback --port 18789
```

### 4. Abrir a UI
Abra o navegador em: http://localhost:18789

### 5. Enviar uma Mensagem de Teste
1. Digite uma mensagem simples no chat (ex: "olá")
2. Pressione Enter para enviar
3. Aguarde a IA responder

### 6. Observar os Logs no Console
Quando a IA terminar de responder, você verá logs como:

```
[DEBUG] Chat event received: { state: "final", runId: "...", ... }
[DEBUG] Chat final event, clearing stream state
[DEBUG] Loading chat history for session: chat:...
[DEBUG] Chat history response: { sessionKey: "...", messagesCount: X, messages: [...] }
[DEBUG] Building chat items: { historyCount: X, toolsCount: 0, loading: false, stream: false }
[DEBUG] Chat items built: { itemsCount: X, groupedCount: Y }
[DEBUG] Chat render state: { chatItemsCount: Y, isEmpty: false/true, loading: false, messagesCount: X, sessionKey: "..." }
```

### 7. Analisar os Logs

#### Se `messagesCount` for 0:
O problema está no backend - as mensagens não estão sendo salvas ou retornadas.

**Solução**: Verificar logs do gateway para erros ao salvar mensagens.

#### Se `messagesCount` for > 0 mas `isEmpty` for true:
O problema está na lógica de renderização - as mensagens existem mas não estão sendo mostradas.

**Solução**: Verificar a lógica de `buildChatItems` e `isEmpty`.

#### Se `isEmpty` for false mas o chat ainda fechar:
O problema está em outro lugar - talvez a sessão esteja sendo trocada.

**Solução**: Verificar se `sessionKey` está mudando.

## Possíveis Causas e Soluções

### Causa 1: Backend não salva mensagens
**Sintoma**: `messagesCount: 0` nos logs

**Solução**:
1. Verificar logs do gateway
2. Procurar por erros ao salvar mensagens
3. Verificar se o diretório `~/.openclaw/sessions/` existe e tem permissões corretas

### Causa 2: loadChatHistory usa sessionKey errado
**Sintoma**: `sessionKey` diferente nos logs

**Solução**:
1. Verificar se `sessionKey` está sendo mantido corretamente
2. Verificar se não há código que troca a sessão após a resposta

### Causa 3: Lógica isEmpty incorreta
**Sintoma**: `messagesCount > 0` mas `isEmpty: true`

**Solução**:
1. Verificar a lógica de `buildChatItems`
2. Verificar se mensagens estão sendo filtradas incorretamente

### Causa 4: Estado sendo limpo
**Sintoma**: `messagesCount` começa > 0 mas depois fica 0

**Solução**:
1. Procurar por código que limpa `chatMessages`
2. Verificar se há algum efeito colateral ao receber evento "final"

## Próximos Passos

Após executar o teste e coletar os logs:

1. **Copie todos os logs do console** (clique com botão direito no console e selecione "Save as...")
2. **Tire um screenshot** do estado do chat quando ele fecha
3. **Compartilhe os logs** para análise

Com essas informações, poderei identificar exatamente onde o problema está e aplicar a correção apropriada.

## Comandos Úteis

### Reiniciar tudo
```powershell
# Parar o gateway (Ctrl+C)
# Limpar cache do navegador (Ctrl+Shift+Delete)
# Recompilar UI
cd ui
npm run build
cd ..
# Reiniciar gateway
pnpm openclaw gateway run --bind loopback --port 18789
```

### Ver logs do gateway
Os logs do gateway aparecem no terminal onde você executou o comando `pnpm openclaw gateway run`.

### Limpar sessões antigas
```powershell
# CUIDADO: Isso apaga todas as sessões salvas
Remove-Item -Recurse -Force ~/.openclaw/sessions/*
```
