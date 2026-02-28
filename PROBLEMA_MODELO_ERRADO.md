# Problema: Modelo Errado Configurado

## Situação Detectada

Você configurou o **OpenRouter** no wizard, mas o sistema está usando o **Groq**:

```json
{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile"
}
```

## Erro Resultante

```
413 Request too large for model `llama-3.3-70b-versatile`
Limit 12000, Requested 12264
```

O modelo do Groq tem limite de **12.000 tokens**, mas o system prompt do OpenClaw usa **12.264 tokens**, causando erro antes mesmo de processar sua mensagem.

## Causa Raiz

Há um bug no wizard de configuração:
1. Você selecionou **OpenRouter** como provedor
2. Você selecionou um modelo OpenRouter
3. Mas a configuração foi salva com o modelo do **Groq**

Isso aconteceu porque:
- O `configState.model` estava com valor de um teste anterior
- O wizard não limpou o estado corretamente ao mudar de provedor

## Solução

### Opção 1: Usar o Script de Correção (RÁPIDO)

```bash
# 1. Adicionar sua chave API do OpenRouter
node add-openrouter-key.cjs

# 2. Reiniciar o Ultron
```

### Opção 2: Editar Manualmente

Edite `~/.openclaw/openclaw.json`:

```json
{
  "gateway": {
    "mode": "local",
    "port": 18789,
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "seu-token-aqui"
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-3.5-sonnet"
      }
    }
  },
  "env": {
    "vars": {
      "OPENROUTER_API_KEY": "sk-or-v1-sua-chave-aqui"
    }
  }
}
```

### Opção 3: Reconfigurar pelo Wizard

1. Feche o Ultron
2. Delete `~/.openclaw/openclaw.json`
3. Abra o Ultron novamente
4. Refaça a configuração com atenção:
   - Selecione **OpenRouter**
   - Cole a chave API do OpenRouter
   - Selecione um modelo OpenRouter (ex: Claude 3.5 Sonnet)

## Modelos OpenRouter Recomendados

### Gratuitos (Free Tier)
- `anthropic/claude-3.5-sonnet` ⭐ **MELHOR** - Mais inteligente
- `google/gemini-2.0-flash-exp:free` - Rápido e bom
- `google/gemini-exp-1206:free` - Experimental
- `openai/gpt-oss-120b:free` - Open source
- `meta-llama/llama-3.3-70b-instruct:free` - Meta
- `qwen/qwq-32b-preview:free` - Qwen

### Pagos (Melhores)
- `anthropic/claude-opus-4.6` - Mais avançado
- `openai/gpt-4o` - GPT-4 Omni
- `google/gemini-2.5-pro` - Gemini Pro

## Como Obter Chave API do OpenRouter

1. Acesse: https://openrouter.ai/keys
2. Faça login ou crie uma conta
3. Clique em "Create Key"
4. Copie a chave (começa com `sk-or-v1-...`)
5. Use no script ou cole no arquivo de configuração

## Verificar Configuração

Após corrigir, verifique:

```bash
# Ver configuração atual
type %USERPROFILE%\.openclaw\openclaw.json

# Deve mostrar:
# - model.primary: anthropic/claude-3.5-sonnet (ou outro OpenRouter)
# - env.vars.OPENROUTER_API_KEY: sk-or-v1-...
```

## Fix Permanente no Código

Para evitar este problema no futuro, o wizard precisa:

1. **Limpar estado ao mudar provedor**:
```javascript
window.selectProvider = function(provider) {
    configState.provider = provider;
    configState.model = null; // ✓ JÁ FAZ ISSO
    configState.apiKey = null; // ✓ JÁ FAZ ISSO
    render();
};
```

2. **Validar modelo antes de salvar**:
```javascript
function saveConfig() {
    // Validar que o modelo pertence ao provedor
    const modelPrefix = configState.model.split('/')[0];
    const expectedPrefix = configState.provider;
    
    if (modelPrefix !== expectedPrefix && 
        !(configState.provider === 'openrouter' && modelPrefix !== 'openrouter')) {
        console.error('Modelo não pertence ao provedor selecionado!');
        return false;
    }
    // ... resto do código
}
```

3. **Mostrar provedor no resumo**:
```javascript
// Na tela "starting", mostrar claramente:
Provedor: OpenRouter
Modelo: anthropic/claude-3.5-sonnet
API Key: sk-or-v1-abc...
```

## Status

- ✅ Problema identificado
- ✅ Scripts de correção criados
- ⏳ Aguardando você adicionar a chave API
- ⏳ Aguardando reiniciar o Ultron
