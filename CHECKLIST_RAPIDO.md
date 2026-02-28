# ✅ Checklist Rápido - Garantir que o Chat Funcione

## Antes de Iniciar

- [ ] Executar `node verify-setup.cjs` → deve mostrar "✅ TUDO PRONTO!"
- [ ] Verificar se porta 18789 está livre: `netstat -ano | findstr 18789`
- [ ] Ter uma chave API válida do provedor escolhido

## Durante a Configuração

- [ ] Escolher IP bind (recomendado: Loopback para segurança)
- [ ] Escolher provedor (Google, Claude, OpenRouter, Groq, Grok, OpenAI)
- [ ] Colar chave API completa (sem espaços extras)
- [ ] Escolher modelo da lista
- [ ] Aguardar mensagem "Gateway iniciado com sucesso!"
- [ ] **COPIAR O TOKEN** exibido na tela (você vai precisar dele!)

## Após Configuração

- [ ] Clicar no botão "🚀 Abrir Chat"
- [ ] Chat deve abrir automaticamente
- [ ] **Card de conexão do gateway deve aparecer**
- [ ] Colar o token copiado no card
- [ ] Clicar em "Conectar"
- [ ] Aguardar mensagem "✅ Gateway conectado com sucesso!"
- [ ] Card deve fechar automaticamente
- [ ] Chat está pronto para uso!

## Verificações no DevTools

### Console
```
✅ === ULTRON CONFIG INJECTED ===
✅ Gateway URL: ws://localhost:18789
✅ ✓ Settings saved to localStorage
❌ Failed to construct 'WebSocket' (NÃO deve aparecer)
```

### Application → Local Storage
```json
✅ openclaw.control.settings.v1 deve existir
✅ gatewayUrl: "ws://localhost:18789"
✅ token: "<seu-token>"
```

### Network → WS
```
✅ WebSocket connection established
✅ Status: 101 Switching Protocols
```

## Se Falhar

### Gateway não inicia
```bash
# Verificar se openclaw.mjs existe
dir openclaw.mjs

# Verificar se porta está livre
netstat -ano | findstr 18789

# Se estiver em uso, matar processo
taskkill /PID <PID> /F
```

### WebSocket não conecta
```javascript
// No DevTools Console, limpar localStorage
localStorage.clear()
// Depois recarregar a página (Ctrl+R)
```

### Tela preta após configuração
```bash
# Verificar logs no Console (F12)
# Procurar por erros em vermelho
# Verificar se gateway realmente iniciou
```

## Comandos Úteis

```bash
# Iniciar aplicativo
npm start

# Verificar setup
node verify-setup.cjs

# Testar injeção de config
node test-config-injection.cjs

# Verificar porta
netstat -ano | findstr 18789

# Matar processo na porta
taskkill /PID <PID> /F

# Ver configuração salva
type %USERPROFILE%\.openclaw\openclaw.json
```

## Resultado Esperado

✅ Gateway inicia em ~5 segundos  
✅ Chat abre automaticamente  
✅ WebSocket conecta em `ws://localhost:18789`  
✅ Interface está pronta para uso  
✅ Pode enviar mensagens para a IA  

## Tempo Total

- Configuração: ~2 minutos
- Inicialização do gateway: ~5-10 segundos
- Carregamento do chat: ~2 segundos
- **Total: ~3 minutos do zero ao chat funcionando**

---

**Se todos os checkboxes estiverem marcados, o chat VAI FUNCIONAR! 🚀**
