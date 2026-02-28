# Como Limpar Tarefas Antigas

## Problema

As tarefas criadas ANTES da correção ainda usam o formato antigo (`chat:*`) e não funcionam corretamente. Apenas novas tarefas criadas APÓS a correção usarão o formato correto (`agent:main:chat:*`).

## Solução Rápida

1. **Feche o Ultron completamente**

2. **Delete as tarefas antigas manualmente:**
   - Vá para a aba "Sessions" no Ultron
   - Delete todas as sessões que começam com `chat:*`
   - Mantenha apenas `agent:main:main` (sessão principal)

3. **OU delete o arquivo de sessões:**
   - Windows: `%USERPROFILE%\.openclaw\sessions.json`
   - Caminho completo: `C:\Users\guilh\.openclaw\sessions.json`
   - **ATENÇÃO:** Isso apagará TODAS as sessões, incluindo a principal

4. **Reinicie o Ultron**

5. **Crie uma NOVA tarefa** (botão "Nova Tarefa")
   - Agora ela será criada com o formato correto
   - Envie uma mensagem e teste

## Verificar se Funcionou

Após criar uma nova tarefa, abra o DevTools (F12) e procure por:

```
[DEBUG] Chat history response: {
  sessionKey: 'agent:main:chat:...',  ← Deve começar com agent:main:chat
  messagesCount: X,                    ← Deve ser > 0 após enviar mensagens
  messages: Array(X)
}
```

Se `sessionKey` começar com `agent:main:chat:` e `messagesCount` for maior que 0, está funcionando!

## Por Que Isso Acontece?

O código foi corrigido, mas as tarefas que você criou ANTES da correção ainda têm o formato antigo salvo no banco de dados. Apenas novas tarefas usarão o formato correto.

## Alternativa: Manter Tarefas Antigas

Se você quiser manter as tarefas antigas (mesmo que não funcionem perfeitamente):

1. Use apenas a sessão principal `agent:main:main` para conversas importantes
2. Crie novas tarefas para testar o novo formato
3. As tarefas antigas continuarão aparecendo mas podem não salvar histórico

## Comando PowerShell para Backup

Antes de deletar, faça backup:

```powershell
Copy-Item "$env:USERPROFILE\.openclaw\sessions.json" "$env:USERPROFILE\.openclaw\sessions.json.backup"
```

Para restaurar:

```powershell
Copy-Item "$env:USERPROFILE\.openclaw\sessions.json.backup" "$env:USERPROFILE\.openclaw\sessions.json"
```
