# Correção: WebSocket URL Vazia

## Problema

Chat UI tentava conectar com URL vazia:

```
Uncaught DOMException: Failed to construct 'WebSocket': The URL 'ws://' is invalid.
```

## Causa Raiz

O Chat UI compilado do OpenClaw lê as configurações do `localStorage` **ANTES** das variáveis globais serem definidas.

### Fluxo do Problema

1. Script injeta variáveis globais: `window.__OPENCLAW_GATEWAY_URL__`
2. Script agenda salvamento no localStorage para `DOMContentLoaded`
3. **Chat UI carrega e lê localStorage ANTES de `DOMContentLoaded`**
4. localStorage ainda não tem `gatewayUrl`
5. Chat UI tenta conectar com URL vazia `'ws://'`
6. **Erro**: WebSocket URL inválida

## Solução Aplicada

Mudamos a ordem: **salvar no localStorage IMEDIATAMENTE** em vez de aguardar `DOMContentLoaded`.

### Antes (ERRADO)

```javascript
// 1. Definir variáveis globais
window.__OPENCLAW_GATEWAY_URL__ = 'ws://localhost:18789';

// 2. Aguardar DOM carregar
window.addEventListener('DOMContentLoaded', function() {
  // 3. Salvar no localStorage (TARDE DEMAIS!)
  localStorage.setItem('openclaw.control.settings.v1', ...);
});
```

### Depois (CORRETO)

```javascript
// 1. Limpar localStorage
localStorage.clear();

// 2. Salvar configurações IMEDIATAMENTE
const settings = {
  gatewayUrl: 'ws://localhost:18789',
  token: '...',
  sessionKey: 'agent:main:main',
  // ...
};
localStorage.setItem('openclaw.control.settings.v1', JSON.stringify(settings));

// 3. Definir variáveis globais (fallback)
window.__OPENCLAW_GATEWAY_URL__ = 'ws://localhost:18789';
```

## Validação

Após a correção, os logs devem mostrar:

```
=== LIMPANDO LOCALSTORAGE ===
✓ localStorage limpo
✓ Settings saved to localStorage BEFORE page load
✓ SessionKey: agent:main:main
✓ Token: hi21628pjl70zbsx...
✓ Gateway URL: ws://localhost:18789
=== ULTRON CONFIG INJECTED ===
```

E o Chat UI deve conectar com sucesso:

```
[Gateway STDOUT] [ws] webchat connected
```

## Arquivos Modificados

- `main.js` (linhas ~100 e ~267): Salvamento no localStorage movido para ANTES do carregamento da página

## Ordem Correta de Execução

1. ✅ Limpar localStorage
2. ✅ Salvar configurações no localStorage
3. ✅ Definir variáveis globais
4. ✅ Chat UI carrega
5. ✅ Chat UI lê localStorage (agora tem dados!)
6. ✅ Chat UI conecta com gateway

## Próximos Passos

1. **Reiniciar o app** (para aplicar a correção)
2. **Configurar novamente** com o wizard
3. **Verificar logs** - deve mostrar "Settings saved BEFORE page load"
4. **Testar conexão** - deve conectar com sucesso
5. **Enviar mensagem** - IA deve responder

## Status

✅ Correção aplicada em ambos os lugares
⏳ Aguardando teste após reiniciar o app
