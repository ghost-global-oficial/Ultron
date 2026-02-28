# Nova Barra Lateral - Implementação

## Arquivos Criados

### 1. `ui/src/ui/views/new-sidebar.ts`
- Componente da nova barra lateral com:
  - Botões: Nova Tarefa, Agents, Procurar, Novo Projeto
  - Lista de tarefas (chats/sessões)
  - Botão de configurações no rodapé
- Componente das configurações do Clawbot (barra lateral antiga)

### 2. `ui/src/ui/views/settings-menu.ts`
- Menu dropdown que aparece ao clicar em configurações
- Opções: "Configurações do ULTRON" e "Configurações do Clawbot"

### 3. `ui/src/styles/new-sidebar.css`
- Estilos para a nova barra lateral
- Estilos para o menu de configurações
- Estilos para as configurações do Clawbot

## Arquivos Modificados

### 1. `ui/src/styles.css`
- Adicionado import do `new-sidebar.css`

### 2. `ui/src/styles/layout.css`
- Atualizado grid layout para 3 colunas: nova barra lateral + nav + content
- Adicionada área `new-sidebar-area`
- Ajustados estados collapsed e focus

### 3. `ui/src/ui/app.ts`
- Adicionados estados:
  - `settingsMenuOpen`: controla visibilidade do menu
  - `showClawbotSettings`: controla exibição das configurações do Clawbot
- Adicionados métodos:
  - `handleNewTask()`: cria nova tarefa
  - `handleAgents()`: navega para agents
  - `handleSearch()`: busca (TODO)
  - `handleNewProject()`: novo projeto (TODO)
  - `handleSettingsClick()`: abre/fecha menu
  - `handleUltronSettings()`: abre configurações do ULTRON
  - `handleClawbotSettings()`: abre configurações do Clawbot
  - `handleCloseClawbotSettings()`: fecha configurações do Clawbot
  - `handleSettingsMenuClose()`: fecha menu

### 4. `ui/src/ui/app-render.ts`
- Adicionados imports dos novos componentes
- **PENDENTE**: Adicionar renderização da nova barra lateral e menu no template

## Próximos Passos

### 1. Finalizar app-render.ts
Adicionar após o `<header class="topbar">` e antes do `<aside class="nav">`:

```typescript
<!-- Nova barra lateral -->
<div class="new-sidebar-area">
  ${renderNewSidebar({
    showClawbotSettings: state.showClawbotSettings,
    sessions: state.sessionsResult,
    sessionKey: state.sessionKey,
    onNewTask: () => state.handleNewTask(),
    onAgents: () => state.handleAgents(),
    onSearch: () => state.handleSearch(),
    onNewProject: () => state.handleNewProject(),
    onSessionSelect: (key) => {
      state.sessionKey = key;
      state.chatMessage = "";
      state.chatAttachments = [];
      state.chatStream = null;
      state.chatStreamStartedAt = null;
      state.chatRunId = null;
      state.chatQueue = [];
      state.resetToolStream();
      state.resetChatScroll();
      state.applySettings({
        ...state.settings,
        sessionKey: key,
        lastActiveSessionKey: key,
      });
      void state.loadAssistantIdentity();
      void loadChatHistory(state);
      void refreshChatAvatar(state);
    },
    onSettingsClick: () => state.handleSettingsClick(),
    onCloseClawbotSettings: () => state.handleCloseClawbotSettings(),
  })}
</div>

<!-- Menu de configurações -->
${renderSettingsMenu({
  isOpen: state.settingsMenuOpen,
  onUltronSettings: () => state.handleUltronSettings(),
  onClawbotSettings: () => state.handleClawbotSettings(),
  onClose: () => state.handleSettingsMenuClose(),
})}
```

### 2. Integrar Barra Lateral Antiga
Na função `renderClawbotSettings` em `new-sidebar.ts`, substituir o placeholder pelo conteúdo real da barra lateral antiga (nav groups).

### 3. Compilar e Testar
```bash
cd ui
npm run build
```

### 4. Limpar Cache e Reiniciar
```powershell
.\limpar-e-reiniciar.ps1
```

## Funcionalidades

### Nova Barra Lateral
- **Nova Tarefa**: Cria uma nova sessão de chat
- **Agents**: Navega para a página de agents/skills
- **Procurar**: Busca (a implementar)
- **Novo Projeto**: Cria novo projeto (a implementar)
- **Lista de Tarefas**: Mostra todas as sessões de chat, permite selecionar
- **Botão de Configurações**: Abre menu dropdown

### Menu de Configurações
- **Configurações do ULTRON**: Abre a página de configurações (config)
- **Configurações do Clawbot**: Mostra a barra lateral antiga com todas as opções originais

### Configurações do Clawbot
- Mostra a barra lateral antiga (nav groups)
- Botão de fechar no topo para voltar à nova barra lateral

## Layout

```
┌─────────────────────────────────────────────────────────┐
│                      TOPBAR                              │
├──────────────┬──────────────┬──────────────────────────┤
│              │              │                           │
│  Nova Barra  │  Nav Groups  │       Content            │
│  Lateral     │  (antiga)    │                           │
│              │              │                           │
│  - Nova      │  - Chat      │                           │
│    Tarefa    │  - Control   │                           │
│  - Agents    │  - Agent     │                           │
│  - Procurar  │  - Settings  │                           │
│  - Novo      │              │                           │
│    Projeto   │              │                           │
│              │              │                           │
│  Tarefas:    │              │                           │
│  - Chat 1    │              │                           │
│  - Chat 2    │              │                           │
│              │              │                           │
│  [⚙️]        │              │                           │
└──────────────┴──────────────┴──────────────────────────┘
```

Quando clica em "Configurações do Clawbot":

```
┌─────────────────────────────────────────────────────────┐
│                      TOPBAR                              │
├──────────────┬──────────────┬──────────────────────────┤
│              │              │                           │
│  Clawbot     │  Nav Groups  │       Content            │
│  Settings    │  (antiga)    │                           │
│              │              │                           │
│  [X] Voltar  │  - Chat      │                           │
│              │  - Control   │                           │
│  (Conteúdo   │  - Agent     │                           │
│   da barra   │  - Settings  │                           │
│   antiga)    │              │                           │
│              │              │                           │
└──────────────┴──────────────┴──────────────────────────┘
```
