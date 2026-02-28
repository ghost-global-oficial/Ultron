# Problema: Modelo Não Reconhecido pelo Gateway

## Erro

```
[Gateway STDERR] Embedded agent failed before reply: Unknown model: openai/gpt-oss-120b:free
```

## Causa

O gateway do OpenClaw tem uma **lista interna de modelos suportados**. O modelo `openai/gpt-oss-120b:free` não está nessa lista.

## Solução

Use um modelo que o gateway reconheça. Modelos conhecidos do OpenRouter:

### Modelos Gratuitos Suportados

```
anthropic/claude-3.5-sonnet
anthropic/claude-3-haiku
google/gemini-2.0-flash-exp:free
google/gemini-exp-1206:free
meta-llama/llama-3.3-70b-instruct:free
meta-llama/llama-3.2-3b-instruct:free
qwen/qwen-2.5-7b-instruct:free
mistralai/mistral-7b-instruct:free
```

### Modelos Pagos Suportados

```
anthropic/claude-opus-4.6
anthropic/claude-opus-4.5
anthropic/claude-sonnet-4
openai/gpt-4o
openai/gpt-4o-mini
google/gemini-2.5-pro
```

## Como Corrigir

### Opção 1: Reconfigurar com Modelo Válido

```bash
# 1. Fechar o app
# 2. Limpar configurações
node clean-all-configs.cjs

# 3. Reiniciar
npm start

# 4. Configurar com um modelo válido
# Escolher: anthropic/claude-3.5-sonnet
# ou: google/gemini-2.0-flash-exp:free
```

### Opção 2: Editar Configuração Manualmente

```bash
# Editar ~/.openclaw/openclaw.json
# Mudar:
#   "primary": "openai/gpt-oss-120b:free"
# Para:
#   "primary": "anthropic/claude-3.5-sonnet"
```

## Modelos Recomendados

### Para Uso Gratuito
1. **`google/gemini-2.0-flash-exp:free`** - Rápido e bom
2. **`meta-llama/llama-3.3-70b-instruct:free`** - Potente
3. **`anthropic/claude-3-haiku`** - Rápido da Anthropic

### Para Melhor Qualidade (Pago)
1. **`anthropic/claude-opus-4.6`** - Melhor qualidade
2. **`anthropic/claude-3.5-sonnet`** - Excelente equilíbrio
3. **`openai/gpt-4o`** - Muito bom

## Por Que Isso Acontece?

O gateway do OpenClaw mantém uma lista de modelos conhecidos para:
- Validar configurações
- Aplicar configurações específicas por modelo
- Garantir compatibilidade

Modelos novos ou menos comuns podem não estar na lista.

## Status

❌ Modelo atual não é suportado
✅ Solução: usar modelo da lista acima
⏳ Aguardando reconfiguração
