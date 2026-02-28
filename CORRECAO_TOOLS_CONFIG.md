# Correção da Configuração de Tools

## Problema Identificado
O gateway estava falhando ao iniciar com o erro:
```
Invalid config at C:\Users\guilh\.openclaw\openclaw.json:
- tools: Unrecognized keys: "security", "ask"
```

## Causa
A configuração de tools estava incorreta. As chaves `security` e `ask` estavam sendo colocadas diretamente em `tools` ao invés de dentro de `tools.exec`.

## Estrutura Incorreta (ANTES)
```json
{
  "tools": {
    "exec": {
      "host": "gateway"
    },
    "security": "full",
    "ask": "off"
  }
}
```

## Estrutura Correta (DEPOIS)
```json
{
  "tools": {
    "exec": {
      "host": "gateway",
      "security": "full",
      "ask": "off"
    }
  }
}
```

## Correção Aplicada
Modificado o arquivo `renderer.js` na função `saveConfig()` para colocar `security` e `ask` dentro de `tools.exec`:

### Host Mode (PC do Usuário)
```javascript
config.tools = {
    exec: {
        host: 'gateway',
        security: 'full',
        ask: 'off'
    }
};
```

### Sandbox Mode (Docker)
```javascript
config.tools = {
    exec: {
        host: 'docker',
        security: 'full',
        ask: 'on'
    }
};
```

## Próximos Passos
1. Deletar arquivos de configuração antigos (já feito)
2. Abrir o aplicativo ULTRON novamente
3. Refazer a configuração completa
4. Verificar se o gateway inicia corretamente

## Arquivos Modificados
- `renderer.js` - Função `saveConfig()` corrigida

## Como Testar
1. Abra o aplicativo ULTRON
2. Complete o wizard de configuração
3. Selecione o modo de execução (Host ou Sandbox)
4. Continue até o final
5. Verifique se o gateway inicia sem erros
6. Confirme que o chat consegue conectar ao WebSocket
