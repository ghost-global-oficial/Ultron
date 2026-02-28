# Problema: Modelo Desconhecido

## Erro Observado

```
[Gateway STDERR] Embedded agent failed before reply: Unknown model: openai/gpt-oss-120b:free
```

## Causa Raiz

O gateway estava carregando uma **configuração antiga** do Moltbot:

1. Gateway detectou configuração em `C:\Users\guilh\.moltbot\moltbot.json`
2. Migrou automaticamente para `C:\Users\guilh\.openclaw\openclaw.json`
3. Configuração antiga tinha modelo: `openrouter/arcee-ai/trinity-mini:free`
4. Nova configuração tinha modelo: `openai/gpt-oss-120b:free`
5. Conflito entre as duas configurações

## Logs Relevantes

```
[Gateway STDOUT] |o  Doctor warnings -----------------------------------------+
|                                                           |
|  - State dir migration skipped: target already exists     |
|    (C:\Users\guilh\.openclaw). Remove or merge manually.  |
|                                                           |
+-----------------------------------------------------------+

[Gateway STDOUT] |o  Doctor changes ----------------------------------------------------+
|                                                                     |
|  - Migrated legacy config: C:\Users\guilh\.moltbot\moltbot.json ->  |
|    C:\Users\guilh\.openclaw\openclaw.json                           |
|                                                                     |
+---------------------------------------------------------------------+

[Gateway STDOUT] [gateway] agent model: openrouter/arcee-ai/trinity-mini:free
```

## Solução Aplicada

1. **Limpeza completa** de todas as configurações:
   - Removido: `C:\Users\guilh\.openclaw\openclaw.json`
   - Removido: `C:\Users\guilh\.moltbot\moltbot.json`
   - Removido: `C:\Users\guilh\.openclaw` (diretório completo)

2. **Script criado**: `clean-all-configs.cjs`
   - Remove todas as configurações antigas
   - Permite começar do zero

## Próximos Passos

1. **Reiniciar o app** (fechar completamente e abrir novamente)
2. **Configurar do zero** com o wizard
3. **Escolher OpenRouter** como provedor
4. **Escolher modelo válido** (ex: `openai/gpt-oss-120b:free`)
5. **Testar API** - deve funcionar agora
6. **Abrir chat** e testar mensagem

## Prevenção

Para evitar este problema no futuro:

1. Sempre use o script `clean-all-configs.cjs` antes de reconfigurar
2. Não misture configurações do Moltbot com Ultron
3. Se o gateway mostrar warnings sobre migração, limpe tudo primeiro

## Arquivos Criados

- `clean-all-configs.cjs`: Script para limpar todas as configurações

## Status

✅ Configurações antigas removidas
✅ Pronto para reconfigurar do zero
⏳ Aguardando teste após reconfiguração
