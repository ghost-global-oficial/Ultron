# Correção: Token Mismatch

## Problema

Gateway rejeitava conexões do Chat UI com erro:

```
[Gateway STDERR] [ws] unauthorized reason=token_mismatch
[Gateway STDERR] reason=unauthorized: gateway token mismatch
```

## Causa Raiz

O Chat UI estava usando um **token antigo** salvo no `localStorage` do navegador Electron, enquanto o gateway esperava o **token novo** que foi gerado na configuração atual.

### Fluxo do Problema

1. Usuário configura o app → token `ABC123` é gerado
2. Token é salvo no `localStorage` do navegador
3. Usuário fecha o app → configuração é deletada
4. Usuário abre o app novamente → novo token `XYZ789` é gerado
5. Chat UI carrega e lê token antigo `ABC123` do `localStorage`
6. Gateway espera token novo `XYZ789`
7. **Resultado**: Token mismatch, conexão rejeitada

## Solução Aplicada

Adicionado `localStorage.clear()` **ANTES** de injetar as novas configurações em **DOIS lugares**:

### 1. Função `loadChatUIFromConfig()` (linha ~100)

```javascript
const configScript = `
  <script>
    // LIMPAR TUDO DO LOCALSTORAGE PRIMEIRO
    console.log('=== LIMPANDO LOCALSTORAGE ===');
    localStorage.clear();
    console.log('✓ localStorage limpo');
    
    // Depois injetar configurações novas...
    window.__OPENCLAW_GATEWAY_TOKEN__ = '${config.gateway.auth.token}';
    // ...
  </script>
`;
```

### 2. Handler `load-chat-ui` (linha ~267)

```javascript
const config = `
  <script>
    // LIMPAR TUDO DO LOCALSTORAGE PRIMEIRO
    console.log('=== LIMPANDO LOCALSTORAGE ===');
    localStorage.clear();
    console.log('✓ localStorage limpo');
    
    // Depois injetar configurações novas...
    window.__OPENCLAW_GATEWAY_TOKEN__ = '${data.token}';
    // ...
  </script>
`;
```

## Validação

Após a correção, os logs devem mostrar:

```
=== LIMPANDO LOCALSTORAGE ===
✓ localStorage limpo
=== ULTRON CONFIG INJECTED ===
Gateway Token: aeg1ctlsm6xrklwm...
✓ Settings saved to localStorage
✓ Token: aeg1ctlsm6xrklwm...
```

E o gateway deve aceitar a conexão:

```
[Gateway STDOUT] [ws] webchat connected conn=... client=openclaw-control-ui
```

## Arquivos Modificados

- `main.js` (linhas ~100 e ~267): Adicionado `localStorage.clear()` antes de injetar configurações

## Próximos Passos

1. **Reiniciar o app** (para aplicar a correção)
2. **Configurar novamente** com o wizard
3. **Verificar logs** - deve mostrar "localStorage limpo"
4. **Testar conexão** - gateway deve aceitar a conexão
5. **Enviar mensagem** - IA deve responder

## Prevenção

Esta correção garante que:
- Sempre que o Chat UI carregar, o localStorage será limpo
- Token antigo nunca será usado
- Sempre usará o token da configuração atual
- Não haverá mais token mismatch

## Status

✅ Correção aplicada em ambos os lugares
⏳ Aguardando teste após reiniciar o app
