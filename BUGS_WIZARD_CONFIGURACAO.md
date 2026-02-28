# Bugs no Wizard de Configuração

## 🐛 Bug #1: Dois Fluxos Conflitantes (CRÍTICO)

### Problema
Existem **dois fluxos diferentes** na tela de seleção de modelo:

**Fluxo A (via clique no modelo):**
```
selectModel() → configState.step = 'api-test' → render()
```

**Fluxo B (via botão "Finalizar"):**
```
finishAndStart() → saveConfig() → configState.step = 'starting'
```

### Código Problemático

**renderer.js linha 756:**
```javascript
window.selectModel = function(model) {
    configState.model = model;
    configState.step = 'api-test';  // ← Muda para api-test
    render();
};
```

**renderer.js linha 525:**
```html
<button onclick="finishAndStart()" ${!configState.model ? 'disabled' : ''}>
    ✅ Finalizar e Iniciar Gateway
</button>
```

### Consequência
- Usuário clica no modelo → vai para `api-test`
- Mas o botão "Finalizar" ainda está visível
- Se clicar no botão, pula o teste de API
- Configuração é salva sem validação

### Solução
Remover o botão "Finalizar e Iniciar Gateway" da tela `model-selection`:

```javascript
function renderModelSelection(content) {
    // ... código existente ...
    
    content.innerHTML = `
        <div class="terminal-line">
            <div class="question">🎯 Escolha o Modelo de IA</div>
            <p style="color: #888; margin: 15px 0;">
                Selecione qual modelo do <strong style="color: #00ff41;">${providerNames[configState.provider]}</strong> você deseja usar:
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 10px;">
                💡 Clique em um modelo para continuar
            </p>
        </div>
        
        ${modelOptions}
        
        <div style="margin-top: 20px;">
            <button class="secondary" onclick="previousStep('api-key')">← Voltar</button>
        </div>
    `;
}
```

---

## 🐛 Bug #2: Estado Não Persiste Entre Reloads

### Problema
Quando o usuário:
1. Configura o wizard
2. Fecha o app
3. Reabre o app

O `configState` é resetado para valores padrão, mas a configuração salva em `~/.openclaw/openclaw.json` não é carregada no `configState`.

### Código Problemático

**renderer.js linha 10:**
```javascript
let configState = {
    step: 'welcome',
    gatewayMode: 'local',
    gatewayPort: 18789,
    gatewayBind: null,
    authMode: 'token',
    authToken: null,
    provider: null,  // ← Sempre null ao iniciar
    apiKey: null,
    model: null
};
```

**renderer.js linha 113:**
```javascript
function loadExistingConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            currentConfig = JSON.parse(data);  // ← Carrega em currentConfig
            updateStatus('Configuração existente carregada');
            // ❌ MAS NÃO ATUALIZA configState!
        }
    } catch (error) {
        console.error('Erro ao carregar config:', error);
    }
}
```

### Consequência
- `currentConfig` tem os dados salvos
- `configState` tem valores vazios
- Se o usuário voltar ao wizard, os campos estão vazios

### Solução
Atualizar `configState` ao carregar configuração existente:

```javascript
function loadExistingConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            currentConfig = JSON.parse(data);
            
            // Atualizar configState com valores salvos
            if (currentConfig.gateway) {
                configState.gatewayMode = currentConfig.gateway.mode || 'local';
                configState.gatewayPort = currentConfig.gateway.port || 18789;
                configState.gatewayBind = currentConfig.gateway.bind || null;
                configState.customBindHost = currentConfig.gateway.customBindHost || null;
                
                if (currentConfig.gateway.auth) {
                    configState.authMode = currentConfig.gateway.auth.mode || 'token';
                    configState.authToken = currentConfig.gateway.auth.token || null;
                }
            }
            
            if (currentConfig.agents?.defaults?.model?.primary) {
                configState.model = currentConfig.agents.defaults.model.primary;
                
                // Detectar provedor do modelo
                const modelPrefix = configState.model.split('/')[0];
                const providerMap = {
                    'google': 'google',
                    'anthropic': 'claude',
                    'openrouter': 'openrouter',
                    'groq': 'groq',
                    'xai': 'grok',
                    'openai': 'openai'
                };
                configState.provider = providerMap[modelPrefix] || null;
            }
            
            // Carregar API key
            if (currentConfig.env?.vars) {
                const apiKeyMap = {
                    'GOOGLE_API_KEY': 'google',
                    'ANTHROPIC_API_KEY': 'claude',
                    'OPENROUTER_API_KEY': 'openrouter',
                    'GROQ_API_KEY': 'groq',
                    'XAI_API_KEY': 'grok',
                    'OPENAI_API_KEY': 'openai'
                };
                
                for (const [envVar, provider] of Object.entries(apiKeyMap)) {
                    if (currentConfig.env.vars[envVar]) {
                        configState.apiKey = currentConfig.env.vars[envVar];
                        break;
                    }
                }
            }
            
            updateStatus('Configuração existente carregada');
        }
    } catch (error) {
        console.error('Erro ao carregar config:', error);
    }
}
```

---

## 🐛 Bug #3: Validação de Modelo Ausente

### Problema
Não há validação para garantir que o modelo selecionado pertence ao provedor escolhido.

### Código Problemático

**renderer.js linha 127:**
```javascript
function saveConfig() {
    // ... código ...
    
    const config = {
        agents: {
            defaults: {
                model: {
                    primary: configState.model  // ← Salva sem validar
                }
            }
        }
    };
    
    // ... resto do código ...
}
```

### Consequência
- Usuário pode ter `provider: 'openrouter'` mas `model: 'groq/llama-3.3-70b-versatile'`
- Configuração inconsistente é salva
- Gateway usa modelo errado

### Solução
Adicionar validação antes de salvar:

```javascript
function saveConfig() {
    console.log('saveConfig iniciado');
    
    // VALIDAÇÃO: Verificar se modelo pertence ao provedor
    if (configState.model && configState.provider) {
        const modelPrefix = configState.model.split('/')[0];
        
        // Mapa de prefixos válidos por provedor
        const validPrefixes = {
            'google': ['google'],
            'claude': ['anthropic'],
            'openrouter': ['openrouter', 'anthropic', 'google', 'openai', 'meta-llama', 'mistralai', 'qwen', 'microsoft', 'nousresearch', 'liquid', 'eva-unit-01'],
            'groq': ['groq'],
            'grok': ['xai'],
            'openai': ['openai']
        };
        
        const allowedPrefixes = validPrefixes[configState.provider] || [];
        
        if (!allowedPrefixes.includes(modelPrefix)) {
            console.error('❌ VALIDAÇÃO FALHOU: Modelo não pertence ao provedor!');
            console.error('  Provedor:', configState.provider);
            console.error('  Modelo:', configState.model);
            console.error('  Prefixo do modelo:', modelPrefix);
            console.error('  Prefixos permitidos:', allowedPrefixes);
            
            updateStatus('Erro: Modelo incompatível com o provedor selecionado', 'error');
            return false;
        }
        
        console.log('✓ Validação OK: Modelo pertence ao provedor');
    }
    
    // ... resto do código de salvamento ...
}
```

---

## 🐛 Bug #4: Logs Insuficientes

### Problema
Não há logs suficientes para debug quando algo dá errado.

### Solução
Adicionar logs em pontos críticos:

```javascript
window.selectProvider = function(provider) {
    console.log('=== SELECT PROVIDER ===');
    console.log('Provedor anterior:', configState.provider);
    console.log('Novo provedor:', provider);
    
    configState.provider = provider;
    configState.model = null;
    configState.apiKey = null;
    
    console.log('Estado resetado:', configState);
    render();
};

window.selectModel = function(model) {
    console.log('=== SELECT MODEL ===');
    console.log('Provedor:', configState.provider);
    console.log('Modelo selecionado:', model);
    
    configState.model = model;
    configState.step = 'api-test';
    
    console.log('Indo para api-test...');
    render();
};

function saveConfig() {
    console.log('=== SAVE CONFIG ===');
    console.log('Estado completo:', JSON.stringify(configState, null, 2));
    
    // ... resto do código ...
    
    console.log('Config a ser salvo:', JSON.stringify(config, null, 2));
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✓ Config salvo em:', configPath);
}
```

---

## 🐛 Bug #5: Botão "Voltar" Pode Causar Estado Inconsistente

### Problema
Se o usuário:
1. Seleciona provedor A
2. Insere API key
3. Seleciona modelo
4. Clica "Voltar"
5. Seleciona provedor B

O `configState.model` ainda tem o modelo do provedor A.

### Solução
Já está implementado (linha 736):
```javascript
configState.model = null; // Reset model quando mudar provider
```

✅ Este bug já está corrigido!

---

## Resumo dos Bugs

| # | Bug | Severidade | Status |
|---|-----|------------|--------|
| 1 | Dois fluxos conflitantes | 🔴 CRÍTICO | ❌ Não corrigido |
| 2 | Estado não persiste | 🟡 MÉDIO | ❌ Não corrigido |
| 3 | Validação ausente | 🔴 CRÍTICO | ❌ Não corrigido |
| 4 | Logs insuficientes | 🟢 BAIXO | ❌ Não corrigido |
| 5 | Botão voltar | 🟡 MÉDIO | ✅ Já corrigido |

## Prioridade de Correção

1. **Bug #3** (Validação) - Evita salvar configuração errada
2. **Bug #1** (Dois fluxos) - Remove ambiguidade no fluxo
3. **Bug #4** (Logs) - Facilita debug futuro
4. **Bug #2** (Estado) - Melhora UX ao reabrir app

## Impacto no Seu Caso

O bug que causou o problema no seu caso foi o **Bug #3** (falta de validação):

1. Você selecionou OpenRouter
2. Mas de alguma forma o modelo do Groq foi salvo
3. Não houve validação para detectar a inconsistência
4. Configuração errada foi salva
5. Gateway tentou usar Groq com limite de 12k tokens
6. Erro 413 (Request too large)

## Próximos Passos

1. ✅ Corrigir sua configuração com `node add-openrouter-key.cjs`
2. ⏳ Implementar correções dos bugs #1, #3, #4
3. ⏳ Testar wizard completo novamente
