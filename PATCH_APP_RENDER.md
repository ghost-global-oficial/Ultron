# Patch para app-render.ts

## Localização
Arquivo: `ui/src/ui/app-render.ts`
Linha aproximada: 135 (após `</header>` e antes de `<aside class="nav">`)

## Código a adicionar

Encontre esta linha:
```typescript
      </header>
      <aside class="nav ${state.settings.navCollapsed ? "nav--collapsed" : ""}">
```

E substitua por:
```typescript
      </header>
      
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
      
      ${renderSettingsMenu({
        isOpen: state.settingsMenuOpen,
        onUltronSettings: () => state.handleUltronSettings(),
        onClawbotSettings: () => state.handleClawbotSettings(),
        onClose: () => state.handleSettingsMenuClose(),
      })}
      
      <aside class="nav ${state.settings.navCollapsed ? "nav--collapsed" : ""}">
```

## Depois de aplicar o patch

1. Compile a UI:
```bash
cd ui
npm run build
```

2. Limpe o cache e reinicie:
```powershell
.\limpar-e-reiniciar.ps1
```

## Resultado Esperado

Você verá:
- Uma nova barra lateral à esquerda com botões: Nova Tarefa, Agents, Procurar, Novo Projeto
- Lista de tarefas (chats) abaixo dos botões
- Botão de configurações no rodapé
- Ao clicar em configurações, aparece um menu com "Configurações do ULTRON" e "Configurações do Clawbot"
- Ao clicar em "Configurações do Clawbot", a nova barra lateral é substituída pela antiga
