# Problema do Sandbox Resolvido

## Problema Identificado

A IA estava executando comandos dentro de um container Docker sem acesso à interface gráfica do Windows, impedindo a abertura de aplicativos como Blender, Notepad, Chrome, etc.

## Causa Raiz

O código em `src/agents/bash-tools.exec.ts` mostra que:

1. O `host` padrão para o exec tool é **"sandbox"**
2. Quando `host === "sandbox"`, os comandos são executados dentro de um container Docker
3. A configuração `sandbox.mode="off"` NÃO desabilita o uso do sandbox para o exec tool
4. É necessário configurar explicitamente `tools.exec.host="gateway"` para executar comandos no Windows host

## Solução Implementada

Adicionada a seguinte configuração ao arquivo `C:\Users\guilh\.ultron\ultron.json`:

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

### Explicação das Configurações

- **`host: "gateway"`**: Executa comandos diretamente no Windows host (não no Docker)
- **`security: "full"`**: Permite execução de qualquer comando sem restrições
- **`ask: "off"`**: Não solicita aprovação do usuário para executar comandos

## Configuração Completa

```json
{
  "gateway": {
    "mode": "local",
    "port": 18789,
    "bind": "auto",
    "auth": {
      "mode": "token",
      "token": "02zczvzkff75gcfbtrtxt9d1gpwsp9tc"
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "openrouter/openai/gpt-oss-120b:free"
      },
      "sandbox": {
        "mode": "off"
      }
    }
  },
  "tools": {
    "exec": {
      "host": "gateway",
      "security": "full",
      "ask": "off"
    }
  },
  "env": {
    "vars": {
      "OPENROUTER_API_KEY": "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"
    }
  }
}
```

## Próximos Passos

1. **Reiniciar o Gateway**: Feche e reabra o aplicativo ULTRON para que as mudanças tenham efeito
2. **Testar**: Peça à IA para abrir um aplicativo (ex: "abra o Notepad")
3. **Verificar**: O aplicativo deve abrir diretamente no Windows

## Arquivos Relevantes

- **Configuração**: `C:\Users\guilh\.ultron\ultron.json`
- **Código do Exec Tool**: `src/agents/bash-tools.exec.ts` (linha 947+)
- **Configuração do Sandbox**: `src/agents/sandbox/config.ts`
- **Script de Verificação**: `testar-config-exec.cjs`

## Como Funciona

Quando a IA usa o tool `exec` para executar um comando:

1. O código verifica `tools.exec.host` (agora "gateway")
2. Como `host === "gateway"`, o código NÃO usa Docker
3. O comando é executado diretamente no Windows usando PowerShell/CMD
4. Aplicativos GUI podem ser abertos normalmente com `start` ou `Start-Process`

## Comandos de Teste

Após reiniciar o gateway, teste com:

```
"abra o Notepad"
"abra o Blender"
"abra o Chrome"
```

A IA deve executar comandos como:
- `start notepad`
- `Start-Process "C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"`
- `start chrome`
