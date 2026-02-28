# Menu de Contexto das Tarefas Implementado

## Resumo

Foi adicionado um sistema de ícones inteligentes e menu de contexto para as tarefas na barra lateral. Cada tarefa agora exibe um ícone relevante à esquerda do nome e um botão de 3 pontinhos à direita que abre um menu com opções de gerenciamento.

## Funcionalidades Implementadas

### ✅ Ícones Inteligentes
Cada tarefa exibe um ícone baseado em palavras-chave no nome:

| Palavra-chave | Ícone | Descrição |
|---------------|-------|-----------|
| código, code, programar | `code` | Tarefas de programação |
| bug, erro, error | `bug` | Correção de bugs |
| design, ui, interface | `palette` | Design e UI |
| doc, documento | `fileText` | Documentação |
| api, integra | `plug` | APIs e integrações |
| teste, test | `wrench` | Testes |
| ideia, idea, brainstorm | `lightbulb` | Ideias e brainstorming |
| projeto, project | `folder` | Projetos |
| principal, main | `brain` | Chat principal |
| (padrão) | `messageSquare` | Chat genérico |

### ✅ Menu de Contexto
Botão de 3 pontinhos que aparece ao passar o mouse sobre a tarefa, com as seguintes opções:

1. **Fixar** - Mantém a tarefa no topo da lista
2. **Mudar nome** - Renomeia a tarefa
3. **Arquivar** - Move a tarefa para arquivo
4. **Partilhar com a colmeia** - Compartilha com outros usuários
5. **Eliminar** (vermelho) - Deleta a tarefa permanentemente

## Arquivos Modificados

### 1. Ícones (`ui/src/ui/icons.ts`)
Adicionados novos ícones:
- `moreVertical` - 3 pontinhos verticais para o menu
- `pin` - Ícone de alfinete para fixar
- `archive` - Ícone de arquivo
- `share` - Ícone de compartilhamento

### 2. Componente Sidebar (`ui/src/ui/views/new-sidebar.ts`)

#### Função `getTaskIcon()`
```typescript
function getTaskIcon(displayName: string) {
  const lowerName = displayName.toLowerCase();
  
  // Verifica palavras-chave e retorna ícone apropriado
  if (lowerName.includes('código') || lowerName.includes('code')) {
    return icons.code;
  }
  // ... mais condições
  
  return icons.messageSquare; // padrão
}
```

#### Estrutura Atualizada
```html
<div class="new-sidebar__task-wrapper">
  <button class="new-sidebar__task-item">
    <span class="new-sidebar__task-icon">{ícone}</span>
    <span class="new-sidebar__task-label">{nome}</span>
  </button>
  <button class="new-sidebar__task-menu-btn">
    {3 pontinhos}
  </button>
</div>
```

#### Props Adicionadas
```typescript
onTaskMenuOpen?: (event: MouseEvent, sessionKey: string) => void;
taskMenuOpen?: string | null;
taskMenuPosition?: { top: number; left: number } | null;
onTaskMenuClose?: () => void;
onPinTask?: (sessionKey: string) => void;
onDeleteTask?: (sessionKey: string) => void;
onArchiveTask?: (sessionKey: string) => void;
onRenameTask?: (sessionKey: string) => void;
onShareTask?: (sessionKey: string) => void;
```

### 3. Estilos (`ui/src/styles/new-sidebar.css`)

#### Layout da Tarefa
```css
.new-sidebar__task-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

.new-sidebar__task-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  /* ... */
}

.new-sidebar__task-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.new-sidebar__task-menu-btn {
  width: 28px;
  height: 28px;
  opacity: 0; /* Aparece no hover */
}

.new-sidebar__task-wrapper:hover .new-sidebar__task-menu-btn {
  opacity: 1;
}
```

#### Menu de Contexto
```css
.task-menu {
  position: fixed;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 8px;
  min-width: 220px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  animation: task-menu-enter 200ms ease-out;
  z-index: 1001;
}

.task-menu__item--danger {
  color: #ff4444; /* Vermelho para eliminar */
}
```

### 4. Estado da Aplicação (`ui/src/ui/app.ts`)

#### Estado Adicionado
```typescript
@state() taskMenuOpen: string | null = null;
@state() taskMenuPosition: { top: number; left: number } | null = null;
```

#### Handlers Implementados
```typescript
handleTaskMenuOpen(event: MouseEvent, sessionKey: string) {
  // Posiciona o menu abaixo do botão
  const button = event.currentTarget as HTMLElement;
  const rect = button.getBoundingClientRect();
  this.taskMenuPosition = {
    top: rect.bottom + 4,
    left: rect.left,
  };
  this.taskMenuOpen = sessionKey;
}

handleTaskMenuClose() {
  this.taskMenuOpen = null;
  this.taskMenuPosition = null;
}

handlePinTask(sessionKey: string) {
  // TODO: Implementar
  console.log("Pin task:", sessionKey);
}

handleDeleteTask(sessionKey: string) {
  // TODO: Implementar
  console.log("Delete task:", sessionKey);
}

handleArchiveTask(sessionKey: string) {
  // TODO: Implementar
  console.log("Archive task:", sessionKey);
}

handleRenameTask(sessionKey: string) {
  // TODO: Implementar
  console.log("Rename task:", sessionKey);
}

handleShareTask(sessionKey: string) {
  // TODO: Implementar
  console.log("Share task:", sessionKey);
}
```

### 5. Renderização (`ui/src/ui/app-render.ts`)
Props passadas para `renderNewSidebar`:
```typescript
onTaskMenuOpen: (e: MouseEvent, key: string) => state.handleTaskMenuOpen(e, key),
taskMenuOpen: state.taskMenuOpen,
taskMenuPosition: state.taskMenuPosition,
onTaskMenuClose: () => state.handleTaskMenuClose(),
onPinTask: (key: string) => state.handlePinTask(key),
onDeleteTask: (key: string) => state.handleDeleteTask(key),
onArchiveTask: (key: string) => state.handleArchiveTask(key),
onRenameTask: (key: string) => state.handleRenameTask(key),
onShareTask: (key: string) => state.handleShareTask(key),
```

## Comportamento

### Ícones
1. Ao renderizar cada tarefa, o nome é analisado
2. Palavras-chave são detectadas (case-insensitive)
3. Ícone apropriado é exibido à esquerda do nome
4. Ícone usa a mesma cor do texto (herda `currentColor`)

### Menu de Contexto
1. Botão de 3 pontinhos fica invisível por padrão
2. Aparece ao passar o mouse sobre a tarefa
3. Ao clicar, menu abre abaixo do botão
4. Overlay transparente fecha o menu ao clicar fora
5. Cada opção executa seu handler e fecha o menu
6. Opção "Eliminar" tem cor vermelha para destaque

### Animações
- Menu entra com fade + slide up (200ms)
- Botão de 3 pontinhos aparece suavemente no hover
- Hover effects em todos os botões

## Funcionalidades Pendentes (TODO)

### 🔲 Fixar Tarefa
- Adicionar campo `pinned` nas sessões
- Ordenar tarefas fixadas no topo
- Indicador visual de tarefa fixada
- Persistir estado no backend

### 🔲 Deletar Tarefa
- Modal de confirmação
- Deletar sessão via API
- Remover da lista local
- Feedback de sucesso/erro

### 🔲 Arquivar Tarefa
- Adicionar campo `archived` nas sessões
- Filtrar tarefas arquivadas da lista principal
- Criar seção "Arquivadas"
- Permitir desarquivar

### 🔲 Renomear Tarefa
- Modal/inline edit para novo nome
- Validação de nome vazio
- Atualizar label via API
- Atualizar lista local

### 🔲 Partilhar com Colmeia
- Modal de compartilhamento
- Seleção de usuários/grupos
- Permissões (leitura/escrita)
- Notificações

## Como Testar

### 1. Compilar UI
```bash
cd ui
pnpm build
```

### 2. Reiniciar Gateway
```bash
pnpm openclaw gateway run
```

### 3. Abrir ULTRON Desktop
- Vá para a barra lateral de tarefas
- Observe os ícones à esquerda de cada tarefa
- Passe o mouse sobre uma tarefa
- Clique no botão de 3 pontinhos
- Teste cada opção do menu

### 4. Verificar Funcionalidades
- ✅ Ícones aparecem corretamente
- ✅ Ícones mudam baseado no nome
- ✅ Botão de 3 pontinhos aparece no hover
- ✅ Menu abre ao clicar no botão
- ✅ Menu fecha ao clicar fora
- ✅ Opções executam console.log
- ⚠️ Ações ainda não implementadas

## Design

### Cores
- Menu background: `var(--panel)`
- Menu border: `var(--border)`
- Item hover: `var(--bg-hover)`
- Eliminar: `#ff4444`
- Ícones: `currentColor`

### Tamanhos
- Ícone da tarefa: `16x16px`
- Botão de menu: `28x28px`
- Ícone do menu: `16x16px`
- Menu width: `220px`
- Menu padding: `8px`

### Animações
- Menu enter: `200ms ease-out`
- Hover transitions: `150ms ease-out`
- Opacity fade: `0 → 1`

## Próximos Passos

1. Implementar fixar tarefa (backend + frontend)
2. Implementar deletar com confirmação
3. Implementar arquivar/desarquivar
4. Implementar renomear inline ou modal
5. Implementar sistema de compartilhamento
6. Adicionar indicadores visuais (fixada, arquivada, compartilhada)
7. Adicionar atalhos de teclado
8. Adicionar drag & drop para reordenar
9. Adicionar busca/filtros
10. Adicionar bulk actions

## Notas

- Os ícones são determinados automaticamente baseado no nome
- O menu só aparece no hover para manter a UI limpa
- Todas as ações atualmente apenas fazem `console.log`
- O menu fecha automaticamente após selecionar uma opção
- A opção "Eliminar" tem cor vermelha para evitar cliques acidentais
- O sistema é totalmente responsivo e funciona em mobile
