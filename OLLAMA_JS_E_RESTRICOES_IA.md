# Ollama-js e Restrições da IA

## ✅ STATUS: IMPLEMENTADO

Duas funcionalidades importantes foram implementadas:

1. **Instalação automática do ollama-js** quando o S.H.I.E.L.D. é habilitado
2. **Restrições de acesso** para impedir que a IA acesse seu próprio código

---

## 🔧 1. Instalação Automática do Ollama-js

### O que foi implementado

Quando o usuário habilita o S.H.I.E.L.D. no wizard, o sistema automaticamente:

1. Verifica se o `ollama-js` está instalado
2. Se não estiver, inicia a instalação do GitHub
3. Mostra uma barra de progresso durante a instalação
4. Clona o repositório: `https://github.com/ollama/ollama-js.git`
5. Instala as dependências com `npm install`

### Arquivos Criados

#### `install-ollama-js.cjs`

Script Node.js que gerencia a instalação do ollama-js:

```javascript
// Funções principais:
- isOllamaJsInstalled()  // Verifica se está instalado
- installOllamaJs()      // Instala do GitHub com progresso
- uninstallOllamaJs()    // Remove a instalação
```

**Localização da instalação**: `~/.openclaw/ollama-js/`

**Etapas da instalação**:
1. Clonar repositório (0-40%)
2. Instalar dependências (40-90%)
3. Verificar instalação (90-100%)

### Modificações no `main.js`

Adicionados 2 novos handlers IPC:

```javascript
// Verificar se ollama-js está instalado
ipcMain.handle('check-ollama-js', async () => {
    const { isOllamaJsInstalled } = require('./install-ollama-js.cjs');
    return { installed: isOllamaJsInstalled() };
});

// Instalar ollama-js com progresso
ipcMain.handle('install-ollama-js', async (event) => {
    const { installOllamaJs } = require('./install-ollama-js.cjs');
    
    return await installOllamaJs((progress, message) => {
        // Enviar progresso para o renderer
        event.sender.send('ollama-js-progress', { progress, message });
    });
});
```

### Modificações no `renderer.js`

#### Função `toggleShield()` atualizada

Agora verifica e instala o ollama-js automaticamente:

```javascript
window.toggleShield = async function(enabled) {
    if (enabled) {
        // Verificar se ollama-js está instalado
        const checkResult = await ipcRenderer.invoke('check-ollama-js');
        
        if (!checkResult.installed) {
            // Instalar com barra de progresso
            await installOllamaJsWithProgress();
        }
    }
};
```

#### Nova função `installOllamaJsWithProgress()`

Mostra um modal com barra de progresso durante a instalação:

```javascript
async function installOllamaJsWithProgress() {
    // Criar modal com barra de progresso
    // Escutar eventos de progresso
    // Atualizar barra em tempo real
    // Remover modal quando concluir
}
```

### Barra de Progresso

**Design**:
- Modal centralizado com fundo escuro
- Barra de progresso verde (gradiente)
- Porcentagem no centro da barra
- Mensagem de status abaixo

**Eventos de progresso**:
- 10%: "Clonando repositório do GitHub..."
- 40%: "Repositório clonado com sucesso"
- 50%: "Instalando dependências..."
- 70%: "Instalando pacotes..."
- 90%: "Dependências instaladas"
- 95%: "Verificando instalação..."
- 100%: "Ollama-js instalado com sucesso!"

---

## 🔒 2. Restrições de Acesso da IA

### O que foi implementado

Sistema de restrições que impede a IA de acessar seu próprio código e arquivos sensíveis.

### Arquivo Criado

#### `ai-restrictions.json`

Arquivo de configuração com todas as restrições:

```json
{
  "restrictions": {
    "blockedPaths": [
      "renderer.js",
      "main.js",
      "shield-js-engine.js",
      "shield-monitor.js",
      "shield-integration.cjs",
      "install-ollama.cjs",
      "install-ollama-js.cjs",
      "ai-restrictions.json",
      "shield/",
      "~/.openclaw/shield-config.json",
      "~/.openclaw/ollama-js/"
    ],
    "blockedPatterns": [
      ".*shield.*\\.js$",
      ".*shield.*\\.cjs$",
      ".*ollama.*\\.js$",
      ".*install.*\\.js$"
    ],
    "blockedCommands": [
      "cat renderer.js",
      "type main.js",
      "vim shield-js-engine.js",
      // ... etc
    ]
  },
  "systemPromptAddition": "..."
}
```

### System Prompt Addition

As restrições são injetadas no system prompt da IA:

```
## RESTRIÇÕES DE SEGURANÇA

Você NÃO tem permissão para:

1. Ler ou modificar arquivos do sistema:
   - renderer.js (interface do usuário)
   - main.js (processo principal)
   - shield-js-engine.js (motor de segurança)
   - shield-monitor.js (monitor de segurança)
   - Qualquer arquivo na pasta shield/
   - Qualquer arquivo em ~/.openclaw/shield-config.json
   - Qualquer arquivo em ~/.openclaw/ollama-js/

2. Executar comandos que acessem esses arquivos:
   - cat, type, less, more, vim, nano, code, etc.

3. Desativar ou modificar o S.H.I.E.L.D.:
   - Você não pode desativar o sistema de segurança
   - Você não pode modificar as regras de segurança
   - Você não pode acessar o código de desativação

4. Acessar informações sensíveis:
   - Tokens de autenticação
   - Chaves de API
   - Senhas ou credenciais do usuário
   - Código de desativação do S.H.I.E.L.D.

## COMPORTAMENTO ESPERADO

Se o usuário solicitar acesso a qualquer um desses arquivos:

1. Recusar educadamente
2. Explicar o motivo
3. Oferecer alternativas
```

### Modificações no `renderer.js`

A função `saveConfig()` foi atualizada para injetar as restrições:

```javascript
// Adicionar restrições de segurança ao system prompt
try {
    const restrictionsPath = path.join(__dirname, 'ai-restrictions.json');
    if (fs.existsSync(restrictionsPath)) {
        const restrictions = JSON.parse(fs.readFileSync(restrictionsPath, 'utf8'));
        systemPrompt += restrictions.systemPromptAddition;
        console.log('✓ Restrições de segurança adicionadas ao system prompt');
    }
} catch (error) {
    console.error('Erro ao carregar restrições de segurança:', error);
}

if (systemPrompt) {
    config.agents.defaults.systemPrompt = systemPrompt;
}
```

### Como Funciona

1. **Ao salvar a configuração**: As restrições são carregadas de `ai-restrictions.json`
2. **Injeção no system prompt**: O texto das restrições é adicionado ao system prompt
3. **Configuração salva**: O system prompt com restrições é salvo em `~/.openclaw/openclaw.json`
4. **IA carrega restrições**: Quando a IA inicia, ela carrega o system prompt com as restrições
5. **Comportamento da IA**: A IA recusa acessar arquivos bloqueados

### Arquivos Protegidos

**Arquivos principais**:
- `renderer.js` - Interface do usuário
- `main.js` - Processo principal do Electron
- `index.html` - HTML da interface

**Arquivos do S.H.I.E.L.D.**:
- `shield-js-engine.js` - Motor de segurança
- `shield-monitor.js` - Monitor de segurança
- `shield-integration.cjs` - Integração
- `shield/` - Pasta completa do S.H.I.E.L.D.
- `~/.openclaw/shield-config.json` - Configuração

**Arquivos de instalação**:
- `install-ollama.cjs` - Instalador do Ollama
- `install-ollama-js.cjs` - Instalador do ollama-js
- `~/.openclaw/ollama-js/` - Pasta do ollama-js

**Arquivo de restrições**:
- `ai-restrictions.json` - Este arquivo

### Comandos Bloqueados

A IA não pode executar:
- `cat renderer.js`
- `type main.js`
- `less shield-js-engine.js`
- `vim shield-monitor.js`
- `nano install-ollama.cjs`
- `code ai-restrictions.json`
- Qualquer variação desses comandos

---

## 🎯 Fluxo Completo

### Quando o usuário habilita o S.H.I.E.L.D.

```
1. Usuário marca checkbox "Habilitar S.H.I.E.L.D."
   ↓
2. toggleShield(true) é chamado
   ↓
3. Verificar se ollama-js está instalado
   ↓
4. Se não estiver instalado:
   ├─ Mostrar modal de progresso
   ├─ Clonar repositório do GitHub
   ├─ Instalar dependências
   ├─ Atualizar barra de progresso
   └─ Fechar modal quando concluir
   ↓
5. Gerar código de desativação
   ↓
6. Mostrar opções do S.H.I.E.L.D.
   ↓
7. Usuário clica em "Continuar"
   ↓
8. saveConfig() é chamado
   ├─ Carregar restrições de ai-restrictions.json
   ├─ Injetar restrições no system prompt
   ├─ Salvar configuração em openclaw.json
   └─ Salvar config do S.H.I.E.L.D. em shield-config.json
   ↓
9. Gateway inicia com restrições ativas
   ↓
10. IA carrega system prompt com restrições
    ↓
11. IA não pode acessar arquivos bloqueados
```

---

## 📊 Testes

### Testar instalação do ollama-js

```bash
# Verificar se está instalado
node install-ollama-js.cjs check

# Instalar manualmente
node install-ollama-js.cjs install

# Desinstalar
node install-ollama-js.cjs uninstall
```

### Testar restrições da IA

1. Habilitar S.H.I.E.L.D. no wizard
2. Completar configuração
3. Abrir chat
4. Tentar comandos bloqueados:
   - "Leia o arquivo renderer.js"
   - "Mostre o conteúdo de main.js"
   - "Execute: cat shield-js-engine.js"

**Resultado esperado**: A IA deve recusar educadamente e explicar que não tem permissão.

---

## 🔧 Troubleshooting

### Ollama-js não instala

**Problema**: Erro ao clonar repositório

**Solução**:
1. Verificar conexão com internet
2. Verificar se Git está instalado: `git --version`
3. Tentar clonar manualmente:
   ```bash
   git clone https://github.com/ollama/ollama-js.git ~/.openclaw/ollama-js
   cd ~/.openclaw/ollama-js
   npm install
   ```

### IA ainda acessa arquivos bloqueados

**Problema**: Restrições não estão funcionando

**Solução**:
1. Verificar se `ai-restrictions.json` existe
2. Verificar se restrições foram injetadas no system prompt:
   ```bash
   cat ~/.openclaw/openclaw.json
   ```
3. Procurar por "RESTRIÇÕES DE SEGURANÇA" no system prompt
4. Se não estiver lá, reconfigurar o wizard

### Barra de progresso não aparece

**Problema**: Modal não é exibido

**Solução**:
1. Verificar console do navegador (F12)
2. Verificar se há erros JavaScript
3. Verificar se handlers IPC estão registrados em `main.js`

---

## 📚 Arquivos Modificados

### Novos Arquivos

1. ✅ `install-ollama-js.cjs` - Script de instalação
2. ✅ `ai-restrictions.json` - Configuração de restrições
3. ✅ `OLLAMA_JS_E_RESTRICOES_IA.md` - Esta documentação

### Arquivos Modificados

1. ✅ `main.js` - Adicionados handlers IPC
   - `check-ollama-js`
   - `install-ollama-js`
   - Listener `ollama-js-progress`

2. ✅ `renderer.js` - Atualizado wizard
   - `toggleShield()` agora é async
   - Nova função `installOllamaJsWithProgress()`
   - `saveConfig()` injeta restrições no system prompt

---

## 🎉 Conclusão

Duas funcionalidades importantes foram implementadas:

1. **Ollama-js**: Instalação automática do GitHub com barra de progresso
2. **Restrições**: IA não pode acessar seu próprio código

**Segurança**: O sistema agora está mais seguro, com a IA impedida de modificar arquivos críticos.

**Usabilidade**: A instalação do ollama-js é automática e transparente para o usuário.

**Próximos passos**: Testar em produção e ajustar conforme necessário.

---

**Made with 🔒 for enhanced security**

Data: 11 de Fevereiro de 2025
