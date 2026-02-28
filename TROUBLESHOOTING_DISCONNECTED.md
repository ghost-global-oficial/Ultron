# Troubleshooting: "Disconnected from gateway"

## 🔍 Diagnóstico

Execute o script de debug:

```bash
node debug-connection.cjs
```

Isso irá verificar:
1. ✅ Se a configuração existe
2. ✅ Se a porta do gateway está aberta
3. ✅ Se as sessões existem
4. ✅ Diagnóstico do problema

---

## 🎯 Causas Possíveis

### 1. Gateway Não Está Rodando

**Sintomas**:
- Porta 18789 está fechada
- Nenhum log do gateway no terminal

**Solução**:
```bash
# Reiniciar o app
# O gateway deve iniciar automaticamente
```

### 2. Token Mismatch (localStorage Antigo)

**Sintomas**:
- Porta 18789 está aberta
- Gateway mostra: `[ws] unauthorized reason=token_mismatch`
- Chat UI desconecta imediatamente

**Solução**:
```bash
# 1. Fechar o app COMPLETAMENTE
# 2. Limpar configurações
node clean-all-configs.cjs

# 3. Reiniciar
npm start

# 4. Configurar novamente
```

### 3. Gateway Reiniciou (Reload de Config)

**Sintomas**:
- Gateway estava funcionando
- Desconectou de repente
- Gateway mostra: `[reload] config change requires gateway restart`

**Solução**:
```bash
# Aguardar alguns segundos
# Gateway reinicia automaticamente
# Chat UI deve reconectar sozinho
```

### 4. App Foi Fechado

**Sintomas**:
- App foi fechado
- Gateway foi encerrado (esperado)

**Solução**:
```bash
# Reiniciar o app
npm start
```

---

## 🚀 Solução Rápida (Funciona em 99% dos casos)

```bash
# 1. Fechar o app completamente
# 2. Limpar tudo
node clean-all-configs.cjs

# 3. Reiniciar
npm start

# 4. Configurar novamente com o wizard
```

---

## 🔧 Verificações Manuais

### Verificar se Gateway Está Rodando

```bash
# Windows
netstat -ano | findstr 18789

# Se retornar algo, gateway está rodando
# Se não retornar nada, gateway não está rodando
```

### Verificar Logs do Gateway

Olhar no terminal onde o app foi iniciado:

**Logs Bons** (gateway funcionando):
```
[Gateway STDOUT] [gateway] listening on ws://127.0.0.1:18789
[Gateway STDOUT] [ws] webchat connected
```

**Logs Ruins** (token mismatch):
```
[Gateway STDERR] [ws] unauthorized reason=token_mismatch
[Gateway STDERR] [ws] closed before connect
```

### Verificar Configuração

```bash
node check-current-config.cjs
```

Deve mostrar:
- ✅ Token configurado
- ✅ Porta 18789
- ✅ Modelo válido

---

## 📋 Checklist de Resolução

- [ ] Gateway está rodando? (verificar porta 18789)
- [ ] Token está correto? (verificar logs)
- [ ] Configuração existe? (`check-current-config.cjs`)
- [ ] localStorage foi limpo? (ver logs do navegador)
- [ ] App foi reiniciado completamente?

Se todos os itens estiverem OK e ainda não funcionar:

```bash
# Solução definitiva
node clean-all-configs.cjs
npm start
# Configurar novamente
```

---

## 💡 Prevenção

Para evitar este problema no futuro:

1. **Sempre** execute `clean-all-configs.cjs` antes de reconfigurar
2. **Sempre** feche o app completamente antes de reiniciar
3. **Nunca** edite a configuração manualmente enquanto o app está rodando
4. **Aguarde** o gateway iniciar completamente antes de usar o chat

---

## 🆘 Ainda Não Funciona?

Se após seguir todos os passos ainda não funcionar:

1. Verificar se há múltiplos processos do gateway rodando:
   ```bash
   # Windows
   tasklist | findstr node
   
   # Matar todos os processos node
   taskkill /F /IM node.exe
   ```

2. Limpar TUDO e começar do zero:
   ```bash
   node clean-all-configs.cjs
   npm start
   ```

3. Verificar logs completos no terminal

4. Executar debug:
   ```bash
   node debug-connection.cjs
   ```

---

## ✅ Sucesso!

Quando tudo estiver funcionando, você verá:

**No Terminal**:
```
[Gateway STDOUT] [gateway] listening on ws://127.0.0.1:18789
[Gateway STDOUT] [ws] webchat connected
```

**No Chat UI**:
- Conexão estabelecida
- Pode enviar mensagens
- IA responde normalmente

🎉 **Ultron funcionando perfeitamente!**
