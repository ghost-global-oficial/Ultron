# 🎯 Instruções para Testar a Correção dos Tool Cards

**Problema Resolvido**: Tool cards agora mostram "Opening Blender" em vez de "exec ⚙"

---

## ⚡ PASSOS RÁPIDOS

### 1. Fechar o App Completamente

No terminal onde o app está rodando:
```bash
Ctrl+C
```

Ou feche a janela do app.

### 2. Limpar Cache (IMPORTANTE!)

O Electron/navegador pode estar usando cache antigo. Escolha uma opção:

**Opção A: Dentro do App (antes de fechar)**
- Pressione `Ctrl+Shift+Delete`
- Ou `Ctrl+F5` para hard refresh

**Opção B: Manualmente (mais garantido)**

Delete estas pastas:
```
%APPDATA%\ultron\Cache
%APPDATA%\ultron\Code Cache
%APPDATA%\ultron\GPUCache
```

Ou via PowerShell:
```powershell
Remove-Item "$env:APPDATA\ultron\Cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\ultron\Code Cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\ultron\GPUCache" -Recurse -Force -ErrorAction SilentlyContinue
```

### 3. Reiniciar o App

```bash
npm start
```

Aguarde o gateway iniciar (porta 18789).

### 4. Testar

Digite no chat:
```
Abra o Blender
```

---

## ✅ RESULTADO ESPERADO

### Antes (Problema)
```
exec ⚙
Command still running (session clear-willow, pid 20420)...
```

### Depois (Corrigido)
```
Opening Blender ⚙
```

**Características**:
- ✅ Mostra "Opening Blender" (não "exec")
- ✅ Ícone ⚙ (wrench)
- ✅ Sem detalhes técnicos (session, pid)
- ✅ Blender abre normalmente

---

## 🔍 DEBUG (Se Não Funcionar)

### 1. Abrir DevTools

Pressione `F12` no app.

### 2. Ir para Console

Procure por estas mensagens:

```
[TOOL-DISPLAY] Tool called: exec Args: {command: "start blender"}
[DEBUG] bash/exe/exec tool args: {"command":"start blender"}
[DEBUG] extracted command: start blender
```

### 3. Verificar Build

No console, execute:
```javascript
// Verificar se o build está atualizado
console.log(document.querySelector('script[src*="index-"]')?.src);
```

Deve mostrar: `index-B-lFUPzw.js`

Se mostrar outro nome, o cache não foi limpo!

---

## 🐛 TROUBLESHOOTING

### Problema 1: Ainda mostra "exec"

**Causa**: Cache não foi limpo

**Solução**:
1. Feche o app
2. Delete as pastas de cache (ver Passo 2 acima)
3. Reinicie o app
4. Teste novamente

### Problema 2: Não aparece nada no console

**Causa**: DevTools não estava aberto quando testou

**Solução**:
1. Abra DevTools (F12)
2. Vá para aba Console
3. Teste novamente: "Abra o Blender"
4. Veja as mensagens [DEBUG]

### Problema 3: Mostra "Running command" genérico

**Causa**: Comando não foi reconhecido

**Solução**:
1. Veja no console qual comando foi usado
2. Procure por: `[DEBUG] extracted command:`
3. Me avise qual comando apareceu
4. Posso adicionar suporte para esse padrão

### Problema 4: Múltiplos cards aparecem

**Causa**: Comportamento normal da IA

**Explicação**: A IA executa várias ações:
- Verificar se app existe
- Preparar comando
- Executar comando
- Verificar status

Isso é **esperado** e mostra transparência!

Se quiser ocultar alguns cards, edite `ui/src/styles/chat/tool-cards.css`:

```css
/* Ocultar cards de read e process */
.chat-tool-card[data-tool="read"],
.chat-tool-card[data-tool="process"] {
  display: none !important;
}
```

---

## 📊 COMANDOS QUE DEVEM FUNCIONAR

### Windows
```
Abra o Blender → "Opening Blender"
Abra o Notepad → "Opening Notepad"
Abra a Calculadora → "Opening Calc"
Abra o Paint → "Opening Mspaint"
```

### Outros Apps
```
Abra o Chrome → "Opening Chrome"
Abra o VSCode → "Opening Code"
Abra o Discord → "Opening Discord"
```

---

## 🎉 SUCESSO!

Se você ver:
```
Opening Blender ⚙
```

E o Blender abrir, **está funcionando perfeitamente!** 🎉

---

## 📝 MUDANÇAS FEITAS

1. ✅ Adicionado suporte para ferramenta "exec" no JSON
2. ✅ Adicionado "exec" na lógica TypeScript
3. ✅ Build recompilado (index-B-lFUPzw.js)
4. ✅ Extração de nome de app funciona para bash/exe/exec

---

## 💡 DICA

Se quiser ver menos cards, você pode ocultar ferramentas específicas editando o CSS (ver Problema 4 acima).

Mas recomendo deixar visível para ter transparência do que a IA está fazendo!

---

**Qualquer problema, me avise!** 🚀
