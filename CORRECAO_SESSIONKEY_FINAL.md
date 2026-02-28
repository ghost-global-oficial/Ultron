# Correção Final: SessionKey Duplicado

## Problema Identificado

As mensagens ficavam "Queued" eternamente porque o `sessionKey` estava configurado incorretamente em **DOIS lugares diferentes** no código:

### Local 1: `loadChatUIFromConfig()` (linha ~140)
- ✅ **JÁ ESTAVA CORRETO**: `sessionKey: 'agent:main:main'`
- Usado quando o app reinicia com configuração existente

### Local 2: Handler `load-chat-ui` (linha ~320)
- ❌ **ESTAVA ERRADO**: `sessionKey: 'main'`
- Usado quando o usuário clica no botão "Abrir Chat" após configuração

## Causa Raiz

O Chat UI envia mensagens para a sessão configurada no `localStorage`. Se o sessionKey estiver errado:
- Chat UI envia para sessão `'main'` (que não existe)
- Gateway espera sessão `'agent:main:main'` (que é a sessão real)
- Resultado: mensagens ficam "Queued" eternamente

## Correção Aplicada

Corrigido o handler `load-chat-ui` em `main.js`:

```javascript
// ANTES (ERRADO)
sessionKey: 'main',
lastActiveSessionKey: 'main',

// DEPOIS (CORRETO)
sessionKey: 'agent:main:main',
lastActiveSessionKey: 'agent:main:main',
```

## Validação

✅ Configuração atual está válida:
- Gateway: porta 18789, token configurado
- Modelo: `openai/gpt-oss-120b:free` via OpenRouter
- API Key: OpenRouter configurada
- SessionKey: `agent:main:main` em AMBOS os lugares

## Próximos Passos

1. **Limpar localStorage do navegador** ou reiniciar o app
2. **Testar envio de mensagem** no chat
3. **Verificar se a IA responde** corretamente

## Arquivos Modificados

- `main.js` (linha ~320): Corrigido sessionKey no handler `load-chat-ui`

## Logs Esperados

Após a correção, você deve ver nos logs do gateway:
```
{"type":"req","method":"chat.send","params":{"sessionKey":"agent:main:main",...}}
{"type":"res","ok":true,"payload":{"runId":"...","status":"started"}}
{"type":"event","event":"agent","payload":{"sessionKey":"agent:main:main",...}}
```

E a mensagem deve sair do estado "Queued" e receber resposta da IA.
