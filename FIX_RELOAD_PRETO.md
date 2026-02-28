# Fix: Página Preta ao Recarregar

## Problema
Quando o usuário recarregava a página do chat (F5 ou Ctrl+R), a página ficava preta.

## Causa Raiz
O problema ocorria porque:

1. Ao recarregar, o Electron voltava para o `index.html` (wizard de configuração)
2. O `index.html` tem fundo escuro mas não carregava automaticamente o chat UI
3. Não havia lógica para detectar que já existia uma configuração salva após um reload

## Solução Implementada

### 1. Interceptor de Recarregamento (`main.js`)

Adicionado um event listener `did-finish-load` na função `createWindow()`:

```javascript
mainWindow.webContents.on('did-finish-load', () => {
  console.log('=== PÁGINA CARREGADA ===');
  
  // Verificar se há configuração e recarregar chat se necessário
  const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const currentUrl = mainWindow.webContents.getURL();
      
      // Se estamos no index.html mas temos configuração, carregar chat
      if (currentUrl.includes('index.html') && !currentUrl.includes('index-temp.html')) {
        console.log('⚠️ Detectado reload para index.html com configuração existente');
        console.log('🔄 Recarregando chat UI...');
        
        setTimeout(() => {
          loadChatUIFromConfig(config);
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao verificar configuração após load:', error);
    }
  }
});
```

### 2. Simplificação do Fluxo de Inicialização

Removido código duplicado no `app.whenReady()`:

**ANTES:**
```javascript
setTimeout(() => {
  mainWindow.webContents.send('load-chat-ui', {...});
  loadChatUIFromConfig(config);
}, 2000);
```

**DEPOIS:**
```javascript
setTimeout(() => {
  loadChatUIFromConfig(config);
}, 2000);
```

## Como Funciona Agora

### Fluxo Normal (Primeira Vez)
1. App inicia
2. Verifica se existe `~/.openclaw/openclaw.json`
3. Se NÃO existe → Mostra wizard de configuração
4. Se existe → Inicia gateway e carrega chat UI

### Fluxo de Reload (F5 / Ctrl+R)
1. Usuário pressiona F5 no chat
2. Página recarrega para `index.html`
3. Event `did-finish-load` é disparado
4. Detecta que:
   - URL atual é `index.html` (não `index-temp.html`)
   - Existe configuração salva
5. Automaticamente carrega o chat UI novamente
6. Usuário vê o chat, não a tela preta

## Benefícios

✅ **Sem tela preta**: Reload sempre mostra a interface correta
✅ **Experiência fluida**: Usuário não precisa reconfigurar
✅ **Auto-recuperação**: Se algo der errado, o app se recupera automaticamente
✅ **Logs claros**: Console mostra exatamente o que está acontecendo

## Testes Recomendados

1. ✅ Iniciar app pela primeira vez (sem configuração)
2. ✅ Completar wizard de configuração
3. ✅ Verificar se chat abre corretamente
4. ✅ Pressionar F5 no chat
5. ✅ Verificar se chat recarrega (não fica preto)
6. ✅ Fechar e reabrir app
7. ✅ Verificar se chat abre diretamente (pula wizard)

## Arquivos Modificados

- `main.js`: Adicionado interceptor de reload e simplificado inicialização
