# 🧹 Como Limpar o Cache do Ultron

**Problema**: `Ctrl+Shift+Delete` e `Ctrl+Shift+R` não funcionam no Electron

**Solução**: Usar scripts PowerShell para limpar o cache manualmente

---

## 🚀 MÉTODO RÁPIDO (Recomendado)

### Opção 1: Limpar e Reiniciar Automaticamente

```powershell
.\limpar-e-reiniciar.ps1
```

**O que faz**:
1. Para todos os processos do Ultron/Electron/Node
2. Limpa todas as pastas de cache
3. Reinicia o app automaticamente

### Opção 2: Apenas Limpar Cache

```powershell
.\limpar-cache.ps1
```

**O que faz**:
1. Limpa todas as pastas de cache
2. Você inicia o app manualmente depois

---

## 📋 MÉTODO MANUAL

### 1. Fechar o App

Pressione `Ctrl+C` no terminal onde o app está rodando.

### 2. Deletar Pastas de Cache

Abra o PowerShell e execute:

```powershell
Remove-Item "$env:APPDATA\ultron\Cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\ultron\Code Cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\ultron\GPUCache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\ultron\DawnCache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\ultron\Session Storage" -Recurse -Force -ErrorAction SilentlyContinue
```

### 3. Reiniciar o App

```bash
npm start
```

---

## 🗂️ LOCALIZAÇÕES DO CACHE

O cache do Electron fica em:

```
%APPDATA%\ultron\Cache
%APPDATA%\ultron\Code Cache
%APPDATA%\ultron\GPUCache
%APPDATA%\ultron\DawnCache
%APPDATA%\ultron\Session Storage
%APPDATA%\ultron\Local Storage
```

Caminho completo (exemplo):
```
C:\Users\guilh\AppData\Roaming\ultron\Cache
```

---

## ❓ POR QUE CTRL+SHIFT+DELETE NÃO FUNCIONA?

O Electron não implementa automaticamente as funcionalidades de desenvolvedor do Chrome como:
- `Ctrl+Shift+Delete` (Limpar dados de navegação)
- `Ctrl+Shift+R` (Hard refresh)
- `F12` (DevTools) - pode funcionar se implementado

Essas funcionalidades precisam ser implementadas manualmente no código do Electron.

---

## 🔧 SOBRE A TELA PRETA (CTRL+SHIFT+R)

Quando você pressiona `Ctrl+Shift+R`, o Electron tenta recarregar a página, mas:
- O cache ainda está presente
- Pode causar conflitos
- A tela fica preta porque o app não carrega corretamente

**Solução**: Use os scripts PowerShell em vez de atalhos de teclado.

---

## 🎯 FLUXO RECOMENDADO

### Para Testar Mudanças no UI

1. **Fechar o app**: `Ctrl+C` no terminal
2. **Limpar cache**: `.\limpar-cache.ps1`
3. **Reiniciar**: `npm start`
4. **Aguardar**: Gateway iniciar (porta 18789)
5. **Testar**: Usar o app normalmente

### Para Desenvolvimento Rápido

Use o script automático:
```powershell
.\limpar-e-reiniciar.ps1
```

Isso faz tudo automaticamente!

---

## 💡 DICAS

### Verificar se o Cache Foi Limpo

```powershell
Test-Path "$env:APPDATA\ultron\Cache"
```

Se retornar `False`, o cache foi limpo com sucesso.

### Verificar Tamanho do Cache

```powershell
Get-ChildItem "$env:APPDATA\ultron" -Recurse | Measure-Object -Property Length -Sum
```

### Matar Processos Manualmente

```powershell
Get-Process | Where-Object { $_.ProcessName -like "*electron*" } | Stop-Process -Force
```

---

## 🚨 TROUBLESHOOTING

### Problema: Script não executa

**Erro**: "Execução de scripts está desabilitada"

**Solução**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problema: Pastas não são deletadas

**Causa**: App ainda está rodando

**Solução**:
1. Feche o app completamente
2. Mate processos: `taskkill /F /IM electron.exe`
3. Tente novamente

### Problema: App não inicia após limpar cache

**Causa**: Gateway não foi compilado

**Solução**:
```bash
npm run build
npm start
```

---

## ✅ RESUMO

**Não use**:
- ❌ `Ctrl+Shift+Delete` (não funciona)
- ❌ `Ctrl+Shift+R` (causa tela preta)

**Use**:
- ✅ `.\limpar-e-reiniciar.ps1` (automático)
- ✅ `.\limpar-cache.ps1` (manual)
- ✅ Deletar pastas manualmente

---

**Criado por**: Kiro AI  
**Data**: 20 de Fevereiro de 2026  
**Status**: ✅ **DOCUMENTADO**

🧹 **CACHE LIMPO = APP ATUALIZADO!** 🧹
