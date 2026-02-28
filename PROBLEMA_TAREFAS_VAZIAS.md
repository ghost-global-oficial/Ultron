# Problema: Tarefas Vazias e Dificuldade de Navegação

## Situação Atual

Analisando os logs do console, identifiquei:

### ✅ O que está funcionando:
- O clique nas tarefas está funcionando
- A mudança de aba para "chat" está funcionando  
- O carregamento do histórico está sendo chamado
- A primeira tarefa abre corretamente

### ❌ O problema:
- **Todas as tarefas retornam 0 mensagens** (`messagesCount: 0`)
- Isso significa que as tarefas foram criadas mas estão vazias
- Não há histórico de conversas salvo nessas sessões

## Por que isso acontece?

Existem duas possibilidades:

### 1. As tarefas realmente estão vazias
Você criou várias tarefas (clicando em "Nova Tarefa") mas não enviou mensagens nelas. Quando você tenta abrir uma tarefa vazia, ela abre mas não mostra nada porque não há mensagens.

### 2. Problema de persistência
O histórico das conversas não está sendo salvo corretamente no backend/gateway.

## Logs Analisados

```
[DEBUG] Chat history response: {
  sessionKey: 'agent:main:chat:1771802532207:xj7vdua50', 
  messagesCount: 0, 
  messages: Array(0)
}
```

Todas as sessões testadas retornaram 0 mensagens:
- `chat:1771802532207:xj7vdua50` → 0 mensagens
- `agent:main:chat:1771802230951:dfi6bfp1x` → 0 mensagens

## Teste para Confirmar

Para confirmar qual é o problema real, faça este teste:

1. **Crie uma nova tarefa** (botão "Nova Tarefa")
2. **Envie uma mensagem** (ex: "olá")
3. **Aguarde a resposta da IA**
4. **Crie outra tarefa nova**
5. **Envie uma mensagem diferente** (ex: "teste")
6. **Aguarde a resposta**
7. **Tente voltar para a primeira tarefa** (clique nela na sidebar)

### Resultado esperado:
- ✅ Você deve ver as mensagens da primeira conversa
- ✅ Deve conseguir alternar entre as duas tarefas
- ✅ Cada tarefa deve manter seu histórico

### Se não funcionar:
Então o problema é de persistência no backend. Precisaremos verificar:
- Logs do gateway
- Arquivo de sessões (`~/.openclaw/sessions.json`)
- Configuração do banco de dados/storage

## Solução Temporária

Enquanto investigamos, você pode:

1. **Usar apenas uma tarefa por vez**
2. **Não criar múltiplas tarefas vazias**
3. **Sempre enviar pelo menos uma mensagem ao criar uma tarefa**

## Próximos Passos

Se o teste acima confirmar que é um problema de persistência:

1. Verificar logs do gateway
2. Verificar se o arquivo de sessões existe e tem dados
3. Verificar configuração de storage
4. Verificar se há erros no backend ao salvar mensagens

## Nota sobre o Formato das Chaves

O prefixo `agent:main:` que aparece nas chaves é **normal** e faz parte do sistema de roteamento do OpenClaw. Não é um bug.

Formato: `agent:<agentId>:chat:<timestamp>:<randomId>`
