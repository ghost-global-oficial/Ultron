# Correção: Filtro de Sessões Bloqueando Tarefas

## Problema Identificado

Você só conseguia abrir a tarefa "agent:main:main" (sessão principal). Todas as outras tarefas criadas não apareciam ou não podiam ser abertas.

## Causa Raiz

O filtro `sessionsIncludeUnknown` estava configurado como `false` por padrão no arquivo `ui/src/ui/app.ts`:

```typescript
@state() sessionsIncludeUnknown = false;
```

Isso fazia com que apenas a sessão principal fosse incluída na lista. Todas as outras sessões (tarefas criadas pelo usuário) eram consideradas "desconhecidas" e filtradas.

## Solução Aplicada

Mudei o valor padrão para `true`:

```typescript
@state() sessionsIncludeUnknown = true; // Mudado para true para mostrar todas as tarefas
```

### Arquivo Modificado:
- `ui/src/ui/app.ts` (linha 206)

## O que isso faz?

Com `sessionsIncludeUnknown = true`:
- ✅ Todas as tarefas criadas aparecem na barra lateral
- ✅ Você pode clicar e abrir qualquer tarefa
- ✅ Cada tarefa mantém seu próprio histórico de conversas
- ✅ A navegação entre tarefas funciona corretamente

## Como Testar

1. **Reinicie o aplicativo Ultron**
2. **Verifique a barra lateral** - Agora deve mostrar todas as tarefas
3. **Clique em diferentes tarefas** - Deve conseguir abrir todas elas
4. **Crie uma nova tarefa** - Deve aparecer imediatamente na lista

## Comportamento Esperado

Agora você deve conseguir:
- Ver todas as tarefas na barra lateral (não apenas "agent:main:main")
- Clicar em qualquer tarefa para abri-la
- Alternar entre tarefas livremente
- Cada tarefa mostra seu próprio histórico de mensagens

## Notas Técnicas

### O que é "sessionsIncludeUnknown"?

Este filtro controla se sessões "desconhecidas" devem ser incluídas na lista. Uma sessão é considerada "desconhecida" quando:
- Não é a sessão principal padrão
- Foi criada dinamicamente pelo usuário
- Não tem um rótulo/label específico

### Por que estava como `false`?

Provavelmente era para evitar mostrar sessões temporárias ou de teste. Mas no contexto do Ultron, onde o usuário cria tarefas manualmente, todas as sessões devem ser visíveis.

### Outros Filtros Disponíveis

```typescript
sessionsFilterActive = "";        // Filtro por tempo de atividade (vazio = sem filtro)
sessionsFilterLimit = "120";      // Limite de sessões mostradas (120)
sessionsIncludeGlobal = true;     // Incluir sessões globais
sessionsIncludeUnknown = true;    // Incluir sessões desconhecidas (CORRIGIDO)
```

## Arquivos Relacionados

- `ui/src/ui/app.ts` - Valores padrão dos filtros
- `ui/src/ui/controllers/sessions.ts` - Lógica de carregamento de sessões
- `ui/src/ui/views/new-sidebar.ts` - Renderização da lista de tarefas
- `ui/src/ui/app-render.ts` - Integração dos componentes

## Troubleshooting

Se ainda não funcionar:

1. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
2. **Verifique se a build foi feita** - Deve existir `dist/control-ui/assets/index-*.js`
3. **Reinicie completamente o aplicativo**
4. **Verifique o console** - Não deve haver erros JavaScript
5. **Verifique se o gateway está conectado** - Health deve estar "OK"

## Resumo

A correção foi simples mas crucial: mudar um único valor de `false` para `true` permite que todas as tarefas sejam exibidas na barra lateral, não apenas a sessão principal.
