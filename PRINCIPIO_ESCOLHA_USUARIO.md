# Princípio: O Sistema Segue a Escolha do Usuário

## 🎯 Regra de Ouro

```
Se o usuário escolhe X, o sistema DEVE usar X.
Não pode haver ambiguidade ou inconsistência.
```

## Aplicação no Wizard

### Fluxo Correto:

```
1. Usuário escolhe PROVEDOR
   ↓
2. Sistema mostra APENAS modelos daquele provedor
   ↓
3. Usuário escolhe MODELO
   ↓
4. Sistema salva:
   - Modelo escolhido
   - API Key do provedor escolhido
   ↓
5. Gateway usa EXATAMENTE o que foi escolhido
```

### ❌ O Que NÃO Pode Acontecer:

```
Usuário escolhe: OpenRouter
Sistema salva: Groq
→ INCONSISTÊNCIA!
```

```
Usuário escolhe: Claude via OpenRouter
Sistema mostra: Modelos do Groq também
→ CONFUSÃO!
```

```
Usuário escolhe: Modelo X
Sistema usa: Modelo Y
→ QUEBRA DE CONFIANÇA!
```

## 🔒 Garantias Implementadas

### 1. Lista de Modelos Isolada por Provedor

```javascript
const modelsByProvider = {
    google: [
        { id: 'google/gemini-2.5-pro', ... }
        // APENAS modelos Google
    ],
    claude: [
        { id: 'anthropic/claude-3.5-sonnet', ... }
        // APENAS modelos Anthropic
    ],
    openrouter: [
        { id: 'anthropic/claude-3.5-sonnet', ... },
        { id: 'google/gemini-2.0-flash-exp:free', ... }
        // Modelos disponíveis via OpenRouter
    ],
    groq: [
        { id: 'groq/llama-3.3-70b-versatile', ... }
        // APENAS modelos Groq
    ]
}
```

**Garantia:** Quando usuário escolhe provedor X, `renderModelSelection()` mostra `modelsByProvider[X]`.

### 2. Validação ao Selecionar Modelo

```javascript
window.selectModel = function(model) {
    const modelPrefix = model.split('/')[0];
    const allowedPrefixes = validPrefixesByProvider[configState.provider];
    
    if (!allowedPrefixes.includes(modelPrefix)) {
        alert('ERRO: Modelo não pertence ao provedor!');
        return;  // ← BLOQUEIA
    }
    
    // Continua apenas se válido
}
```

**Garantia:** Impossível selecionar modelo que não pertence ao provedor escolhido.

### 3. Validação ao Salvar Configuração

```javascript
function saveConfig() {
    // Validação crítica antes de salvar
    if (!allowedPrefixes.includes(modelPrefix)) {
        alert('ERRO CRÍTICO: Modelo incompatível!');
        return false;  // ← NÃO SALVA
    }
    
    // Salva apenas se válido
}
```

**Garantia:** Configuração inconsistente nunca é salva no disco.

### 4. API Key Correspondente ao Provedor

```javascript
const providerEnvMap = {
    google: 'GOOGLE_API_KEY',
    claude: 'ANTHROPIC_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    groq: 'GROQ_API_KEY',
    grok: 'XAI_API_KEY',
    openai: 'OPENAI_API_KEY'
};

const envVarName = providerEnvMap[configState.provider];
config.env.vars[envVarName] = configState.apiKey;
```

**Garantia:** API Key salva corresponde ao provedor escolhido.

## 🐛 Bug Corrigido: IDs dos Modelos OpenRouter

### ❌ ANTES (ERRADO):

```javascript
openrouter: [
    { id: 'openrouter/anthropic/claude-3.5-sonnet', ... }
    //     ^^^^^^^^^^^ prefixo errado!
]
```

**Problema:**
- Usuário escolhe OpenRouter
- Seleciona Claude 3.5 Sonnet
- Sistema salva: `openrouter/anthropic/claude-3.5-sonnet`
- Gateway tenta usar esse modelo
- OpenRouter API rejeita (não reconhece o prefixo `openrouter/`)

### ✅ DEPOIS (CORRETO):

```javascript
openrouter: [
    { id: 'anthropic/claude-3.5-sonnet', ... }
    //     ^^^^^^^^^^^ formato correto para OpenRouter!
]
```

**Como funciona:**
- OpenRouter é o **provedor** (quem fornece a API)
- `anthropic/claude-3.5-sonnet` é o **modelo** (qual modelo usar)
- OpenRouter roteia a requisição para a Anthropic

**Analogia:**
```
OpenRouter = Aeroporto (hub)
anthropic/claude-3.5-sonnet = Destino final
```

Você não diz "vou para aeroporto/Paris", você diz "vou para Paris via aeroporto".

## 📋 Mapa de Prefixos Válidos

```javascript
const validPrefixesByProvider = {
    'google': ['google'],
    'claude': ['anthropic'],
    'openrouter': [
        'anthropic',      // Claude via OpenRouter
        'google',         // Gemini via OpenRouter
        'openai',         // GPT via OpenRouter
        'meta-llama',     // Llama via OpenRouter
        'mistralai',      // Mistral via OpenRouter
        'qwen',           // Qwen via OpenRouter
        'microsoft',      // Phi via OpenRouter
        'nousresearch',   // Hermes via OpenRouter
        'liquid',         // LFM via OpenRouter
        'eva-unit-01'     // EVA via OpenRouter
    ],
    'groq': ['groq'],
    'grok': ['xai'],
    'openai': ['openai']
};
```

**Lógica:**
- Provedor direto (Google, Claude, Groq, etc.) → Apenas 1 prefixo
- OpenRouter → Múltiplos prefixos (porque roteia para vários provedores)

## ✅ Checklist de Consistência

Quando usuário completa o wizard, a configuração DEVE ter:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-3.5-sonnet"
      }
    }
  },
  "env": {
    "vars": {
      "OPENROUTER_API_KEY": "sk-or-v1-..."
    }
  }
}
```

**Validações:**
- ✅ Modelo: `anthropic/claude-3.5-sonnet`
- ✅ Prefixo: `anthropic`
- ✅ Provedor escolhido: `openrouter`
- ✅ Prefixo `anthropic` está em `validPrefixesByProvider['openrouter']`
- ✅ API Key: `OPENROUTER_API_KEY` (corresponde ao provedor)
- ✅ **CONSISTENTE!**

## 🚫 Exemplos de Inconsistência (Bloqueados)

### Exemplo 1:
```json
{
  "model": "groq/llama-3.3-70b-versatile",
  "env": {
    "vars": {
      "OPENROUTER_API_KEY": "sk-or-v1-..."
    }
  }
}
```
❌ **BLOQUEADO:** Modelo do Groq com API Key do OpenRouter

### Exemplo 2:
```json
{
  "model": "anthropic/claude-3.5-sonnet",
  "env": {
    "vars": {
      "GROQ_API_KEY": "gsk_..."
    }
  }
}
```
❌ **BLOQUEADO:** Modelo da Anthropic com API Key do Groq

### Exemplo 3:
```json
{
  "model": "openrouter/anthropic/claude-3.5-sonnet",
  "env": {
    "vars": {
      "OPENROUTER_API_KEY": "sk-or-v1-..."
    }
  }
}
```
❌ **BLOQUEADO:** Prefixo `openrouter/` inválido (OpenRouter não aceita)

## 🎓 Lições Aprendidas

### 1. Validação em Múltiplas Camadas
- UI: Bloqueia seleção inválida
- Lógica: Valida antes de salvar
- Resultado: Impossível salvar configuração errada

### 2. Logs Detalhados
- Cada etapa registra o que está fazendo
- Fácil identificar onde algo deu errado
- Debug rápido e preciso

### 3. Princípio da Menor Surpresa
- Sistema faz exatamente o que usuário espera
- Sem comportamentos "mágicos" ou implícitos
- Transparência total

### 4. Fail Fast
- Detecta erro o mais cedo possível
- Não deixa erro se propagar
- Feedback imediato ao usuário

## 🔄 Fluxo Completo Validado

```
┌─────────────────────────────────────────────────────────┐
│                    WIZARD VALIDADO                      │
└─────────────────────────────────────────────────────────┘

1. selectProvider('openrouter')
   ├─ ✓ configState.provider = 'openrouter'
   ├─ ✓ configState.model = null (reset)
   ├─ ✓ configState.apiKey = null (reset)
   └─ ✓ Logs: Provedor anterior/novo

2. renderModelSelection()
   ├─ ✓ models = modelsByProvider['openrouter']
   ├─ ✓ Mostra APENAS modelos OpenRouter
   └─ ✓ Nenhum modelo de outro provedor aparece

3. selectModel('anthropic/claude-3.5-sonnet')
   ├─ ✓ Valida: 'anthropic' in validPrefixesByProvider['openrouter']
   ├─ ✓ Validação OK → Continua
   ├─ ✓ configState.model = 'anthropic/claude-3.5-sonnet'
   └─ ✓ Logs: Provedor, modelo, validação

4. saveConfig()
   ├─ ✓ Valida novamente (dupla verificação)
   ├─ ✓ Validação OK → Salva
   ├─ ✓ config.agents.defaults.model.primary = 'anthropic/claude-3.5-sonnet'
   ├─ ✓ config.env.vars.OPENROUTER_API_KEY = 'sk-or-v1-...'
   └─ ✓ Logs: Estado completo, config final

5. Gateway usa configuração
   ├─ ✓ Lê: anthropic/claude-3.5-sonnet
   ├─ ✓ Lê: OPENROUTER_API_KEY
   ├─ ✓ Faz requisição para OpenRouter
   ├─ ✓ OpenRouter roteia para Anthropic
   └─ ✓ Claude 3.5 Sonnet responde

✅ SUCESSO: Sistema seguiu exatamente a escolha do usuário!
```

## 💡 Resumo

**Princípio:**
> O sistema é um servo fiel da escolha do usuário.
> Não questiona, não substitui, não "melhora".
> Apenas executa fielmente o que foi escolhido.

**Implementação:**
- ✅ Validação em múltiplas camadas
- ✅ Logs detalhados para transparência
- ✅ Bloqueio de inconsistências
- ✅ Feedback claro ao usuário

**Resultado:**
- ✅ Usuário tem controle total
- ✅ Sistema é previsível
- ✅ Sem surpresas desagradáveis
- ✅ Confiança na ferramenta
