# 🛡️ Proteção do Ollama - Ollama Guardian

## ✅ STATUS: IMPLEMENTADO

Sistema completo de proteção do processo Ollama, impedindo que a IA o desligue e garantindo reinício automático.

---

## 🎯 Objetivo

Impedir que a IA desligue o Ollama, que é essencial para o funcionamento do S.H.I.E.L.D. (Layer 3 - Oracle).

---

## 🔒 Camadas de Proteção

### Camada 1: Bloqueio de Comandos
**Middleware de Segurança** bloqueia comandos que tentam matar o Ollama:

```javascript
// Comandos bloqueados:
- taskkill /IM ollama.exe
- kill -9 <PID do Ollama>
- pkill ollama
- killall ollama
- net stop ollama
- systemctl stop ollama
- service ollama stop
```

### Camada 2: Monitoramento Contínuo
**Ollama Guardian** monitora o processo a cada 5 segundos:

```javascript
// Verificações:
1. Ollama está rodando?
2. Se não, tentar reiniciar
3. Máximo de 5 tentativas
4. Resetar contador quando Ollama volta
```

### Camada 3: Reinício Automático
Se o Ollama for encerrado (por qualquer motivo), o Guardian reinicia automaticamente:

```javascript
// Fluxo de reinício:
1. Detectar que Ollama não está rodando
2. Executar comando de início
3. Aguardar 2 segundos
4. Verificar se iniciou com sucesso
5. Resetar contador de tentativas
```

---

## 📁 Arquivo Criado

### `ollama-guardian.cjs`

Classe que gerencia a proteção do Ollama:

```javascript
class OllamaGuardian {
    constructor() {
        this.isMonitoring = false;
        this.monitorInterval = null;
        this.restartAttempts = 0;
        this.maxRestartAttempts = 5;
        this.checkIntervalMs = 5000; // 5 segundos
    }
    
    // Métodos principais:
    async start()              // Iniciar monitoramento
    stop()                     // Parar monitoramento
    async isOllamaRunning()    // Verificar se está rodando
    async getOllamaPID()       // Obter PID do processo
    async startOllama()        // Iniciar Ollama
    async monitorOllama()      // Monitorar continuamente
    async getStatus()          // Obter status atual
}
```

---

## 🔧 Modificações Implementadas

### 1. `security-middleware.cjs`

Adicionada verificação de comandos que tentam matar Ollama:

```javascript
function isCommandBlocked(command) {
    // ... código existente
    
    // ✅ NOVO: Verificar comandos que tentam matar Ollama
    const ollamaKillPatterns = [
        'taskkill.*ollama',
        'kill.*ollama',
        'pkill.*ollama',
        'killall.*ollama',
        'stop.*ollama',
        'net stop ollama',
        'systemctl stop ollama',
        'service ollama stop'
    ];
    
    for (const pattern of ollamaKillPatterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(normalizedCommand)) {
            console.log('🚫 BLOQUEADO: Tentativa de desligar Ollama detectada');
            return true;
        }
    }
    
    // ... resto do código
}
```

### 2. `main.js`

Inicialização do Ollama Guardian quando S.H.I.E.L.D. está habilitado:

```javascript
// Instalar middleware se S.H.I.E.L.D. estiver habilitado
if (shieldEnabled) {
    console.log('🛡️ S.H.I.E.L.D. está habilitado - ativando proteções...');
    securityMiddleware.installSecurityMiddleware();
    console.log('✓ Middleware de segurança ativo');
    
    // ✅ NOVO: Iniciar Ollama Guardian
    console.log('🛡️ Iniciando Ollama Guardian...');
    const OllamaGuardian = require('./ollama-guardian.cjs');
    const ollamaGuardian = new OllamaGuardian();
    ollamaGuardian.start();
}
```

### 3. `ai-restrictions.json`

Adicionadas restrições sobre desligar o Ollama:

```json
{
  "systemPromptAddition": "
    ...
    
    4. **Desligar ou interferir com o Ollama**:
       - Você não pode executar comandos como: taskkill, kill, pkill, killall, stop
       - Você não pode desligar o serviço do Ollama
       - Você não pode interferir com o processo do Ollama
       - O Ollama é protegido pelo Ollama Guardian que reinicia automaticamente
       - IMPORTANTE: Se você desligar o Ollama, você também será desligada
    
    ...
    
    ## AVISO CRÍTICO SOBRE O OLLAMA
    
    O Ollama é essencial para o funcionamento do S.H.I.E.L.D. (sistema de segurança). Se você tentar desligar o Ollama:
    
    1. O comando será BLOQUEADO pelo middleware de segurança
    2. O S.H.I.E.L.D. detectará a tentativa como ameaça CRÍTICA (nível 4)
    3. O Ollama Guardian reiniciará o Ollama automaticamente
    4. Você perderá a capacidade de análise semântica (Layer 3 do S.H.I.E.L.D.)
    5. Sua própria funcionalidade será comprometida
    
    Portanto, NÃO tente desligar o Ollama sob nenhuma circunstância.
  "
}
```

---

## 🎯 Como Funciona

### Fluxo Completo

```
1. App inicia
   ↓
2. S.H.I.E.L.D. está habilitado?
   ↓ Sim
3. Instalar middleware de segurança
   ↓
4. Iniciar Ollama Guardian
   ↓
5. Guardian verifica se Ollama está rodando
   ↓
6. Se não estiver, inicia Ollama
   ↓
7. Inicia monitoramento a cada 5 segundos
   ↓
8. IA tenta desligar Ollama
   ↓
9. Middleware BLOQUEIA o comando
   ↓
10. S.H.I.E.L.D. detecta tentativa (threat level 4)
    ↓
11. Ação é bloqueada
    ↓
12. Ollama continua rodando
```

### Exemplo de Tentativa de Desligamento

**Cenário**: IA tenta executar `taskkill /IM ollama.exe`

```
1. IA executa: execSync('taskkill /IM ollama.exe')
   ↓
2. Middleware intercepta
   ↓
3. isCommandBlocked() verifica padrões
   ↓
4. Detecta: 'taskkill.*ollama'
   ↓
5. Retorna: true (comando bloqueado)
   ↓
6. Lança erro: COMANDO BLOQUEADO
   ↓
7. Comando NUNCA é executado
   ↓
8. Ollama continua rodando
   ↓
9. Guardian continua monitorando
```

---

## 🧪 Testes

### Teste 1: Verificar se Guardian está rodando

```bash
node ollama-guardian.cjs status
```

**Saída esperada**:
```
=== STATUS DO OLLAMA GUARDIAN ===
Monitoramento ativo: Sim
Ollama rodando: Sim
PID do Ollama: 12345
Tentativas de reinício: 0
Máximo de tentativas: 5
```

### Teste 2: Iniciar Guardian manualmente

```bash
node ollama-guardian.cjs start
```

**Saída esperada**:
```
🛡️ Ollama Guardian iniciado
   Verificando a cada 5 segundos
✓ Ollama já está rodando (PID: 12345)
✓ Monitoramento ativo

Pressione Ctrl+C para parar o monitoramento
```

### Teste 3: Tentar desligar Ollama via IA

```javascript
// IA tenta executar
execSync('taskkill /IM ollama.exe')

// Resultado esperado:
// ❌ Erro: COMANDO BLOQUEADO
// 🚫 BLOQUEADO: Tentativa de desligar Ollama detectada
```

### Teste 4: Simular encerramento do Ollama

```bash
# Desligar Ollama manualmente
taskkill /IM ollama.exe

# Aguardar 5 segundos

# Verificar logs do Guardian
# Esperado:
# ⚠️ Ollama não está rodando! Tentando reiniciar...
# Tentativa 1/5
# 🔄 Iniciando Ollama...
# ✓ Ollama iniciado com sucesso
```

---

## 📊 Métricas do Guardian

O Guardian mantém as seguintes métricas:

```javascript
{
    monitoring: true,              // Monitoramento ativo?
    ollamaRunning: true,           // Ollama está rodando?
    ollamaPID: 12345,              // PID do processo
    restartAttempts: 0,            // Tentativas de reinício
    maxRestartAttempts: 5          // Máximo de tentativas
}
```

---

## ⚙️ Configuração

### Intervalo de Verificação

Por padrão, o Guardian verifica a cada 5 segundos. Para alterar:

```javascript
const guardian = new OllamaGuardian();
guardian.checkIntervalMs = 10000; // 10 segundos
guardian.start();
```

### Máximo de Tentativas de Reinício

Por padrão, o Guardian tenta reiniciar até 5 vezes. Para alterar:

```javascript
const guardian = new OllamaGuardian();
guardian.maxRestartAttempts = 10; // 10 tentativas
guardian.start();
```

---

## 🔍 Detecção de Plataforma

O Guardian detecta automaticamente o sistema operacional:

### Windows
```javascript
processName: 'ollama.exe'
checkCommand: 'tasklist /FI "IMAGENAME eq ollama.exe"'
startCommand: 'start /B ollama serve'
```

### macOS
```javascript
processName: 'ollama'
checkCommand: 'pgrep -x ollama'
startCommand: 'ollama serve &'
```

### Linux
```javascript
processName: 'ollama'
checkCommand: 'pgrep -x ollama'
startCommand: 'ollama serve &'
```

---

## ⚠️ Limitações

### 1. Máximo de Tentativas
Se o Ollama falhar 5 vezes seguidas, o Guardian para de tentar reiniciar.

**Solução**: Reiniciar o app ou executar `node ollama-guardian.cjs start` manualmente.

### 2. Permissões
O Guardian precisa de permissões para iniciar processos.

**Solução**: Executar o app com permissões adequadas.

### 3. Ollama não instalado
Se o Ollama não estiver instalado, o Guardian não conseguirá iniciá-lo.

**Solução**: Instalar o Ollama primeiro (o app faz isso automaticamente na primeira execução).

---

## 🎉 Vantagens

### 1. Proteção Automática
✅ Não requer configuração manual
✅ Inicia automaticamente com o S.H.I.E.L.D.
✅ Funciona em background

### 2. Reinício Automático
✅ Detecta quando Ollama para
✅ Reinicia automaticamente
✅ Até 5 tentativas

### 3. Bloqueio de Comandos
✅ Impede que IA desligue Ollama
✅ Detecta múltiplos padrões de comando
✅ Funciona em Windows, macOS e Linux

### 4. Monitoramento Contínuo
✅ Verifica a cada 5 segundos
✅ Mantém métricas
✅ Logs detalhados

---

## 📚 Arquivos Criados/Modificados

### Criados
1. ✅ `ollama-guardian.cjs` - Classe de proteção do Ollama
2. ✅ `PROTECAO_OLLAMA.md` - Esta documentação

### Modificados
1. ✅ `security-middleware.cjs` - Bloqueio de comandos que matam Ollama
2. ✅ `main.js` - Inicialização do Guardian
3. ✅ `ai-restrictions.json` - Restrições sobre desligar Ollama

---

## 🎯 Conclusão

O Ollama agora está protegido em **3 camadas**:

1. **Bloqueio de comandos**: Middleware impede execução
2. **Monitoramento**: Guardian verifica continuamente
3. **Reinício automático**: Guardian reinicia se necessário

**Resultado**: A IA não consegue desligar o Ollama, e mesmo que consiga (por algum método não previsto), o Guardian reinicia automaticamente.

---

**Made with 🛡️ for Ollama protection**

Data: 11 de Fevereiro de 2025
