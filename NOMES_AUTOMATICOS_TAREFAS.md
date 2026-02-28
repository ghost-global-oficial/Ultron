# Nomes Automáticos para Tarefas - Implementado ✅

## Funcionalidade

O sistema agora gera automaticamente um nome descritivo para cada nova tarefa baseado na primeira mensagem enviada pelo usuário.

## Como Funciona

### 1. Detecção de Nova Tarefa

Quando você cria uma nova tarefa (botão "+") e envia a primeira mensagem:
- O sistema marca a sessão como "precisando de nome"
- Aguarda a resposta da IA terminar

### 2. Geração do Nome

Após a IA responder, o sistema:
- Extrai a primeira mensagem do usuário
- Gera um nome descritivo baseado nessa mensagem
- Limita o nome a 50 caracteres para melhor visualização

### 3. Regras de Geração

O nome é gerado seguindo estas regras:

1. **Mensagens curtas (≤50 caracteres)**: Usa a mensagem inteira
   - Exemplo: "Como fazer um bolo?" → "Como fazer um bolo?"

2. **Mensagens longas**: Tenta encontrar um ponto de quebra natural
   - Procura por: `. `, `? `, `! `, `, `
   - Exemplo: "Preciso de ajuda com Python. Estou aprendendo..." → "Preciso de ajuda com Python."

3. **Sem ponto de quebra**: Trunca em 50 caracteres e adiciona "..."
   - Exemplo: "Quero criar um sistema muito complexo que faça..." → "Quero criar um sistema muito complexo que faç..."

### 4. Atualização Automática

- O nome é salvo no campo `label` da sessão
- A lista de tarefas é recarregada automaticamente
- O novo nome aparece imediatamente na barra lateral

## Exibição na Sidebar

### Prioridade de Exibição

1. **Label personalizado** (gerado automaticamente ou definido manualmente)
2. **DisplayName** (se disponível)
3. **Timestamp formatado** (fallback)

### Casos Especiais

- **Sessão Principal** (`agent:main:main`): Exibe "Chat Principal"
- **Tarefas sem label**: Exibe "Chat DD/MM HH:MM"

## Código Implementado

### ui/src/ui/app.ts

```typescript
// Rastrear sessões que precisam de nome automático
private sessionsNeedingName = new Set<string>();

// Marcar sessão ao enviar primeira mensagem
async handleSendChat(messageOverride?: string, opts?: ...) {
  const session = this.sessionsResult?.sessions?.find(s => s.key === this.sessionKey);
  const isNewTask = this.sessionKey.startsWith('agent:main:chat:') && !session?.label;
  
  if (isNewTask && !this.sessionsNeedingName.has(this.sessionKey)) {
    this.sessionsNeedingName.add(this.sessionKey);
  }
  // ...
}

// Gerar nome descritivo
private async generateTaskName(sessionKey: string, firstMessage: string): Promise<string> {
  const truncated = firstMessage.trim().substring(0, 100);
  const cleaned = truncated.replace(/\s+/g, ' ');
  
  if (cleaned.length <= 50) {
    return cleaned;
  }
  
  // Procurar ponto de quebra natural
  const breakPoints = ['. ', '? ', '! ', ', '];
  for (const breakPoint of breakPoints) {
    const index = cleaned.indexOf(breakPoint);
    if (index > 20 && index < 50) {
      return cleaned.substring(0, index + 1).trim();
    }
  }
  
  return cleaned.substring(0, 50).trim() + '...';
}

// Atualizar label da sessão
private async updateSessionLabel(sessionKey: string, label: string) {
  await this.client.request('sessions.patch', {
    key: sessionKey,
    label: label,
  });
  
  await loadSessions(this);
}
```

### ui/src/ui/app-gateway.ts

```typescript
if (state === "final") {
  // Gerar nome automático para novas tarefas
  const sessionKey = payload?.sessionKey;
  if (sessionKey && host.sessionsNeedingName?.has(sessionKey)) {
    host.sessionsNeedingName.delete(sessionKey);
    
    // Pegar a primeira mensagem do usuário
    const messages = host.chatMessages || [];
    const firstUserMessage = messages.find(m => m.role === 'user');
    
    if (firstUserMessage) {
      // Extrair texto e gerar nome
      const messageText = extractMessageText(firstUserMessage);
      if (messageText) {
        const taskName = await host.generateTaskName(sessionKey, messageText);
        await host.updateSessionLabel(sessionKey, taskName);
      }
    }
  }
}
```

### ui/src/ui/views/new-sidebar.ts

```typescript
// Usar o label se disponível
let displayName = session.label || session.displayName || session.key;

// Fallback para timestamp formatado
if (!session.label && displayName.includes(':')) {
  // Formatar timestamp como "Chat DD/MM HH:MM"
}

// Sessão principal
if (session.key === 'agent:main:main') {
  displayName = session.label || 'Chat Principal';
}
```

## Como Testar

### 1. Criar Nova Tarefa

```
1. Abrir o Electron
2. Clicar no botão "+" (Nova Tarefa)
3. Enviar uma mensagem: "Como fazer um bolo de chocolate?"
4. Aguardar a resposta da IA
```

### 2. Verificar Nome Gerado

```
5. Olhar na barra lateral (seção "Tarefas")
6. A tarefa deve aparecer com o nome: "Como fazer um bolo de chocolate?"
```

### 3. Testar Mensagens Longas

```
1. Criar outra tarefa
2. Enviar: "Preciso de ajuda com Python. Estou aprendendo a programar e tenho dúvidas sobre listas."
3. Nome gerado: "Preciso de ajuda com Python."
```

### 4. Verificar Persistência

```
1. Fechar o Electron
2. Reabrir
3. Os nomes das tarefas devem permanecer
```

## Backend (sessions.patch)

O backend já suporta atualizar o label de uma sessão via:

```typescript
await client.request('sessions.patch', {
  key: 'agent:main:chat:1771870500000:abc123xyz',
  label: 'Meu nome personalizado'
});
```

Isso atualiza o arquivo de sessão em:
```
~/.openclaw/agents/main/sessions/sessions.json
```

## Benefícios

1. **Organização**: Fácil identificar tarefas na barra lateral
2. **Contexto**: Nome descritivo mostra o assunto da conversa
3. **Automático**: Não precisa nomear manualmente
4. **Persistente**: Nomes são salvos e mantidos entre sessões

## Melhorias Futuras

1. **Edição manual**: Permitir renomear tarefas clicando no nome
2. **IA mais inteligente**: Usar a resposta da IA para gerar um nome ainda melhor
3. **Categorização**: Agrupar tarefas por categoria/projeto
4. **Busca**: Buscar tarefas pelo nome

## Arquivos Modificados

- ✅ `ui/src/ui/app.ts` - Lógica de geração de nome
- ✅ `ui/src/ui/app-gateway.ts` - Trigger após resposta da IA
- ✅ `ui/src/ui/views/new-sidebar.ts` - Exibição do nome
- ✅ `dist/control-ui/assets/index-*.js` - Código compilado

## Status

🎉 **FUNCIONALIDADE IMPLEMENTADA E TESTADA!**

Todas as novas tarefas agora recebem automaticamente um nome descritivo baseado na primeira mensagem do usuário.
