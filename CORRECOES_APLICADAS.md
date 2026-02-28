# Correções Aplicadas no Wizard

## ✅ Correção #1: Forçar Wizard Sempre (Modo de Teste)

### Arquivo: `main.js`

**Mudança:**
```javascript
const FORCE_WIZARD = true;  // ← Nova linha

if (fs.existsSync(configPath) && !FORCE_WIZARD) {
  // Carregar configuração existente
} else {
  // Mostrar wizard
}
```

**Efeito:**
- ✅ App sempre mostra o wizard ao iniciar
- ✅ Permite testar o fluxo completo repetidamente
- ✅ Facilita identificar e corrigir bugs

**Para desativar depois dos testes:**
```javascript
const FORCE_WIZARD = false;  // ← Mudar para false
```

---

## ✅ Correção #2: Validação de Modelo no `selectModel()`

### Arquivo: `renderer.js`

**Mudança:**
```javascript
window.selectModel = function(model) {
    // VALIDAÇÃO: Garantir que o modelo pertence ao provedor
    const modelPrefix = model.split('/')[0];
    
    const validPrefixesByProvider = {
        'google': ['google'],
        'claude': ['anthropic'],
        'openrouter': ['openrouter', 'anthropic', 'google', ...],
        'groq': ['groq'],
        'grok': ['xai'],
        'openai': ['openai']
    };
    
    const allowedPrefixes = validPrefixesByProvider[configState.provider] || [];
    
    if (!allowedPrefixes.includes(modelPrefix)) {
        alert('ERRO: Modelo não pertence ao provedor!');
        return;  // ← Bloqueia seleção inválida
    }
    
    // Continuar normalmente...
}
```

**Efeito:**
- ✅ Impede selecionar modelo de provedor errado
- ✅ Mostra alerta claro ao usuário
- ✅ Logs detalhados no console
- ✅ Previne configuração inconsistente

**Exemplo de bloqueio:**
```
Provedor: openrouter
Modelo tentado: groq/llama-3.3-70b-versatile
Prefixo: groq
Permitidos: [openrouter, anthropic, google, ...]
→ ❌ BLOQUEADO!
```

---

## ✅ Correção #3: Validação Crítica no `saveConfig()`

### Arquivo: `renderer.js`

**Mudança:**
```javascript
function saveConfig() {
    // VALIDAÇÃO CRÍTICA antes de salvar
    if (configState.model && configState.provider) {
        const modelPrefix = configState.model.split('/')[0];
        const allowedPrefixes = validPrefixesByProvider[configState.provider];
        
        if (!allowedPrefixes.includes(modelPrefix)) {
            alert('ERRO CRÍTICO: Modelo incompatível!');
            return false;  // ← NÃO salva configuração inválida
        }
    }
    
    // Salvar configuração...
}
```

**Efeito:**
- ✅ **Última linha de defesa** contra configuração errada
- ✅ Impede salvar se modelo não pertence ao provedor
- ✅ Mostra alerta crítico ao usuário
- ✅ Logs detalhados para debug

**Camadas de validação:**
1. `selectModel()` - Valida ao clicar no modelo
2. `saveConfig()` - Valida antes de salvar (backup)

---

## ✅ Correção #4: Logs Detalhados

### Arquivo: `renderer.js`

**Mudanças:**

**`selectProvider()`:**
```javascript
console.log('=== SELECT PROVIDER ===');
console.log('Provedor anterior:', configState.provider);
console.log('Novo provedor:', provider);
console.log('✓ Estado resetado');
```

**`selectModel()`:**
```javascript
console.log('=== SELECT MODEL ===');
console.log('Provedor:', configState.provider);
console.log('Modelo selecionado:', model);
console.log('✓ Validação OK: Modelo pertence ao provedor');
```

**`saveConfig()`:**
```javascript
console.log('=== SAVE CONFIG ===');
console.log('Estado completo:', JSON.stringify(configState, null, 2));
console.log('✓ API Key configurada:', envVarName);
console.log('✓ Config salvo com sucesso em:', configPath);
```

**Efeito:**
- ✅ Fácil rastrear o fluxo no console
- ✅ Identificar onde algo dá errado
- ✅ Ver estado completo em cada etapa

---

## Mapa de Validações

```
┌─────────────────────────────────────────────────────────┐
│                    FLUXO DO WIZARD                      │
└─────────────────────────────────────────────────────────┘

1. selectProvider('openrouter')
   ├─ ✓ Logs: Provedor anterior/novo
   ├─ ✓ Reset: model = null, apiKey = null
   └─ ✓ Render

2. updateApiKey('sk-or-v1-...')
   ├─ ✓ Trim da chave
   └─ ✓ Habilita botão continuar

3. selectModel('anthropic/claude-3.5-sonnet')
   ├─ ✓ VALIDAÇÃO #1: Modelo pertence ao provedor?
   │  ├─ Prefixo: anthropic
   │  ├─ Permitidos: [openrouter, anthropic, google, ...]
   │  └─ ✓ OK → Continua
   ├─ ✓ Logs: Provedor, modelo, validação
   └─ ✓ Vai para api-test

4. continueAfterTest() → starting

5. saveConfig()
   ├─ ✓ VALIDAÇÃO #2: Modelo pertence ao provedor?
   │  ├─ Prefixo: anthropic
   │  ├─ Permitidos: [openrouter, anthropic, google, ...]
   │  └─ ✓ OK → Salva
   ├─ ✓ Logs: Estado completo, config final
   ├─ ✓ Salva em ~/.openclaw/openclaw.json
   └─ ✓ Retorna true

6. startGatewayProcess()
   └─ ✓ Inicia gateway com config válida
```

---

## Testes Recomendados

### Teste 1: Fluxo Normal (OpenRouter)
1. ✅ Abrir app → Wizard aparece
2. ✅ Selecionar "OpenRouter"
3. ✅ Inserir chave API do OpenRouter
4. ✅ Selecionar "Claude 3.5 Sonnet"
5. ✅ Verificar logs no console
6. ✅ Configuração salva corretamente
7. ✅ Gateway inicia

**Resultado esperado:**
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

### Teste 2: Tentativa de Modelo Errado (Deve Bloquear)
1. ✅ Selecionar "OpenRouter"
2. ✅ Inserir chave API
3. ❌ Tentar selecionar modelo do Groq manualmente
4. ✅ **Deve mostrar alerta e bloquear**

**Resultado esperado:**
```
❌ ERRO: O modelo "groq/llama-3.3-70b-versatile" não pertence ao provedor "openrouter"!
```

### Teste 3: Trocar de Provedor
1. ✅ Selecionar "Groq"
2. ✅ Inserir chave API do Groq
3. ✅ Selecionar modelo do Groq
4. ✅ Voltar e selecionar "OpenRouter"
5. ✅ Verificar que modelo foi resetado (null)
6. ✅ Inserir chave do OpenRouter
7. ✅ Selecionar modelo do OpenRouter
8. ✅ Salvar

**Resultado esperado:**
- Estado limpo ao trocar provedor
- Modelo correto salvo

### Teste 4: Logs no Console
1. ✅ Abrir DevTools (F12)
2. ✅ Seguir fluxo completo
3. ✅ Verificar logs em cada etapa:
   - `=== SELECT PROVIDER ===`
   - `=== SELECT MODEL ===`
   - `=== SAVE CONFIG ===`

---

## Bugs Corrigidos

| Bug | Status | Correção |
|-----|--------|----------|
| Modelo de provedor errado salvo | ✅ CORRIGIDO | Validação em `selectModel()` e `saveConfig()` |
| Falta de logs para debug | ✅ CORRIGIDO | Logs detalhados em todas as funções |
| Difícil testar repetidamente | ✅ CORRIGIDO | `FORCE_WIZARD = true` |

## Bugs Pendentes

| Bug | Status | Prioridade |
|-----|--------|------------|
| Dois fluxos conflitantes (botão "Finalizar") | ⏳ PENDENTE | 🔴 ALTA |
| Estado não persiste entre reloads | ⏳ PENDENTE | 🟡 MÉDIA |

---

## Próximos Passos

1. ✅ Testar fluxo completo com as correções
2. ⏳ Remover botão "Finalizar e Iniciar Gateway" da tela `model-selection`
3. ⏳ Implementar carregamento de estado ao reabrir app
4. ⏳ Mudar `FORCE_WIZARD = false` quando terminar testes

---

## Como Testar Agora

```bash
# 1. Fechar o Ultron se estiver aberto

# 2. Iniciar o app
npm start

# 3. Seguir o wizard:
#    - Escolher provedor (ex: OpenRouter)
#    - Inserir chave API
#    - Escolher modelo
#    - Verificar logs no console

# 4. Verificar configuração salva
node check-current-config.cjs

# 5. Fechar e reabrir o app
#    → Deve mostrar wizard novamente (FORCE_WIZARD = true)
```

---

## Configuração Válida Esperada

```json
{
  "gateway": {
    "mode": "local",
    "port": 18789,
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "..."
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
      "OPENROUTER_API_KEY": "sk-or-v1-..."
    }
  }
}
```

**Validação:**
- ✅ Modelo: `anthropic/claude-3.5-sonnet`
- ✅ API Key: `OPENROUTER_API_KEY`
- ✅ Prefixo `anthropic` está em `validPrefixesByProvider['openrouter']`
- ✅ Configuração consistente!
