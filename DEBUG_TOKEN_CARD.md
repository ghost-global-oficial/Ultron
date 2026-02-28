# 🔍 Debug: Card de Token Não Aparece

## Passos para Debugar

### 1. Abrir DevTools
Quando o chat abrir, pressione **F12** para abrir o DevTools.

### 2. Verificar Console
No Console, procure por estas mensagens:

#### ✅ Mensagens Esperadas (Sucesso)
```
=== CHAT.JS CARREGADO ===
Timestamp: 2025-...
=== CARREGANDO CONFIG ===
Config path: C:\Users\...\openclaw\openclaw.json
Config existe? true
Config carregada: { gateway: { ... }, ... }
=== VERIFICANDO TOKEN ===
config.gateway: { port: 18789, bind: 'loopback', auth: { ... } }
hasGatewayConfig: true
hasToken: false
✓ Mostrando card de token
=== MOSTRANDO CARD DE TOKEN ===
✓ chat-container encontrado
✓ Card HTML criado
✓ Card inserido após primeira mensagem
✓ Card de token adicionado ao DOM
```

#### ❌ Possíveis Erros

**Erro 1: Config não encontrada**
```
Config não encontrada em: C:\Users\...\openclaw\openclaw.json
```
**Solução**: O arquivo de configuração não existe. Execute a configuração novamente.

**Erro 2: Token já existe**
```
hasToken: true
✗ Card de token não será mostrado
  Motivo: Token já existe: abc123xyz789...
```
**Solução**: O token já foi configurado. Para testar novamente:
1. Abra o arquivo: `%USERPROFILE%\.openclaw\openclaw.json`
2. Remova a linha `"token": "..."` dentro de `gateway.auth`
3. Salve e recarregue o chat

**Erro 3: Gateway não configurado**
```
hasGatewayConfig: false
✗ Card de token não será mostrado
  Motivo: Gateway não configurado
```
**Solução**: O gateway não foi configurado. Execute a configuração completa.

**Erro 4: chat-container não encontrado**
```
❌ chat-container não encontrado!
```
**Solução**: O HTML não carregou corretamente. Verifique se `chat.html` existe.

### 3. Verificar Elementos (Elements Tab)

No DevTools, vá para a aba **Elements** e procure por:

```html
<div id="chat-container">
  <div class="message system">...</div>
  <div class="token-card" id="token-card">  <!-- DEVE ESTAR AQUI -->
    <button class="close-btn">×</button>
    <h3>🔐 Conectar Gateway</h3>
    ...
  </div>
</div>
```

Se o `token-card` não estiver lá, o card não foi criado.

### 4. Verificar Arquivo de Configuração

Abra o arquivo de configuração:
```bash
type %USERPROFILE%\.openclaw\openclaw.json
```

Verifique a estrutura:
```json
{
  "gateway": {
    "mode": "local",
    "port": 18789,
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "abc123..."  // <-- Se esta linha EXISTIR, o card NÃO aparece
    }
  },
  "agents": { ... },
  "env": { ... }
}
```

**Para forçar o card a aparecer:**
1. Remova a linha `"token": "..."` (ou todo o objeto `"auth"`)
2. Salve o arquivo
3. Recarregue o chat (Ctrl+R)

### 5. Testar Manualmente no Console

No Console do DevTools, execute:

```javascript
// Verificar se a função existe
typeof showTokenCard
// Deve retornar: "function"

// Forçar mostrar o card
showTokenCard()
// Deve criar o card na tela

// Verificar se o card foi criado
document.getElementById('token-card')
// Deve retornar: <div id="token-card" class="token-card">...</div>
```

### 6. Verificar CSS

No Console, execute:
```javascript
// Verificar se o card está visível
const card = document.getElementById('token-card');
if (card) {
  console.log('Display:', window.getComputedStyle(card).display);
  console.log('Visibility:', window.getComputedStyle(card).visibility);
  console.log('Opacity:', window.getComputedStyle(card).opacity);
}
```

Todos devem estar visíveis (não `none` ou `hidden`).

## Checklist de Verificação

- [ ] DevTools está aberto (F12)
- [ ] Console mostra "=== CHAT.JS CARREGADO ==="
- [ ] Console mostra "=== CARREGANDO CONFIG ==="
- [ ] Console mostra "=== VERIFICANDO TOKEN ==="
- [ ] `hasGatewayConfig: true`
- [ ] `hasToken: false`
- [ ] Console mostra "✓ Mostrando card de token"
- [ ] Console mostra "✓ Card de token adicionado ao DOM"
- [ ] Elements tab mostra `<div id="token-card">`
- [ ] Card está visível na tela

## Soluções Rápidas

### Solução 1: Limpar Token Existente
```bash
# Abrir arquivo de config
notepad %USERPROFILE%\.openclaw\openclaw.json

# Remover a linha "token": "..." dentro de gateway.auth
# Salvar e fechar

# Recarregar chat (Ctrl+R)
```

### Solução 2: Forçar Card Manualmente
```javascript
// No Console do DevTools
showTokenCard()
```

### Solução 3: Recriar Configuração
```bash
# Deletar arquivo de config
del %USERPROFILE%\.openclaw\openclaw.json

# Reiniciar aplicativo
npm start

# Refazer configuração completa
```

## Teste Completo

Execute este script no Console do DevTools:

```javascript
console.log('=== TESTE COMPLETO ===');

// 1. Verificar config
const fs = require('fs');
const path = require('path');
const os = require('os');
const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

console.log('1. Config path:', configPath);
console.log('2. Config existe?', fs.existsSync(configPath));

if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('3. Gateway configurado?', !!config.gateway);
  console.log('4. Gateway port:', config.gateway?.port);
  console.log('5. Token existe?', !!config.gateway?.auth?.token);
  
  if (config.gateway?.auth?.token) {
    console.log('⚠️ TOKEN JÁ EXISTE! Card não será mostrado.');
    console.log('Token:', config.gateway.auth.token.substring(0, 16) + '...');
  } else {
    console.log('✓ Token não existe. Card DEVE aparecer.');
  }
}

// 2. Verificar DOM
console.log('6. chat-container existe?', !!document.getElementById('chat-container'));
console.log('7. token-card existe?', !!document.getElementById('token-card'));

// 3. Verificar funções
console.log('8. showTokenCard existe?', typeof showTokenCard);
console.log('9. checkGatewayToken existe?', typeof checkGatewayToken);

console.log('=== FIM DO TESTE ===');
```

## Resultado Esperado

Se tudo estiver correto, você deve ver:
```
=== TESTE COMPLETO ===
1. Config path: C:\Users\...\openclaw\openclaw.json
2. Config existe? true
3. Gateway configurado? true
4. Gateway port: 18789
5. Token existe? false
✓ Token não existe. Card DEVE aparecer.
6. chat-container existe? true
7. token-card existe? true
8. showTokenCard existe? function
9. checkGatewayToken existe? function
=== FIM DO TESTE ===
```

E o card deve estar visível na tela! 🎉

---

**Se seguir todos esses passos e ainda não funcionar, copie a saída do Console e me envie para análise.**
