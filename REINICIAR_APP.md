# ✅ CORREÇÃO APLICADA - REINICIE O APP

## O que foi corrigido

Adicionei a flag `--allow-unconfigured` ao comando de inicialização do gateway em `main.js`:

```javascript
const args = [entryPath, 'gateway', 'run', '--allow-unconfigured', '--force', '--port', config.ULTRON_GATEWAY_PORT.toString()];
```

Esta flag permite que o gateway inicie mesmo com os avisos do "doctor", que estavam bloqueando a inicialização.

## ⚠️ IMPORTANTE: Você precisa REINICIAR o app

O Electron está usando a versão antiga do `main.js` em cache. Para aplicar a correção:

### Opção 1: Fechar completamente e reabrir
1. Feche COMPLETAMENTE o ULTRON (não apenas a janela, mas saia do app)
2. Abra o ULTRON novamente
3. O gateway deve iniciar sem erros

### Opção 2: Limpar cache e reiniciar
1. Feche o ULTRON
2. Execute: `npm run clean-cache` (se disponível)
3. Ou delete manualmente:
   - `%APPDATA%\ultron`
   - `%LOCALAPPDATA%\ultron`
4. Abra o ULTRON novamente

## Como verificar se funcionou

Quando o gateway iniciar com sucesso, você verá:
- ✓ Gateway iniciado
- ✓ Conectado ao gateway
- A interface do chat estará disponível

Se ainda mostrar erro "Doctor warnings", o app não foi reiniciado corretamente.

## Detalhes técnicos

O erro anterior era:
```
Doctor warnings: set gateway.mode=local (or pass --allow-unconfigured)
```

Mesmo com `gateway.mode=local` configurado corretamente no `ultron.json`, o OpenClaw CLI estava sendo muito restritivo. A flag `--allow-unconfigured` diz ao CLI para ignorar esses avisos e iniciar o gateway de qualquer forma.
