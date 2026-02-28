# Botão de Expandir no Menu de Modelo

## Funcionalidade Adicionada

Adicionado um botão de expandir no canto superior direito do menu de seleção de modelo que abre o modal de "Gerir Conectores" na seção de Integrações.

## Localização

O botão está posicionado no header do menu, entre o título "Selecionar Modelo" e o botão de fechar (X).

## Comportamento

1. **Clique no botão de expandir**: Fecha o menu de modelo e abre o modal de Gerir Conectores
2. **Ícone**: Seta para baixo (download icon) indicando expansão/mais opções
3. **Hover**: Muda de cor cinza para azul (#4a9eff)
4. **Tooltip**: "Gerir Integrações"

## Arquivos Modificados

### 1. ui/src/ui/app-render.helpers.ts
```typescript
<div class="chat-model-selector__menu-header-actions">
  <button
    class="chat-model-selector__menu-expand"
    @click=${() => {
      state.handleChatModelMenuClose();
      state.handleAddConnectors();
    }}
    aria-label="Manage integrations"
    title="Gerir Integrações"
  >
    <svg>...</svg>
  </button>
  <button class="chat-model-selector__menu-close">...</button>
</div>
```

### 2. ui/src/styles/chat-model-selector.css
```css
.chat-model-selector__menu-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-model-selector__menu-expand {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.chat-model-selector__menu-expand:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #4a9eff;
}
```

### 3. ui/src/ui/app-view-state.ts
```typescript
handleAddConnectors: () => void;
```

## Fluxo de Interação

1. Usuário clica no botão do seletor de modelo
2. Menu de modelos abre
3. Usuário vê o botão de expandir (ícone de seta para baixo)
4. Usuário clica no botão de expandir
5. Menu de modelos fecha
6. Modal de Gerir Conectores abre na seção de Integrações

## Estilos

### Tema Escuro
- Cor padrão: #9ca3af (cinza)
- Cor hover: #4a9eff (azul)
- Background hover: rgba(255, 255, 255, 0.08)

### Tema Claro
- Cor padrão: #6b7280 (cinza escuro)
- Cor hover: #4a9eff (azul)
- Background hover: rgba(0, 0, 0, 0.05)

## Ícone Usado

SVG de seta para baixo (download icon):
```svg
<svg width="16" height="16" viewBox="0 0 24 24">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="7 10 12 15 17 10"/>
  <line x1="12" y1="15" x2="12" y2="3"/>
</svg>
```

## Acessibilidade

- `aria-label="Manage integrations"` - Descrição para leitores de tela
- `title="Gerir Integrações"` - Tooltip ao passar o mouse
- Tamanho de toque adequado (24x24px)
- Contraste de cores adequado

## Como Testar

1. Limpe o cache: `.\limpar-cache-electron.ps1`
2. Inicie o Ultron
3. Vá para a aba Chat
4. Clique no botão do seletor de modelo
5. Observe o botão de expandir no canto superior direito
6. Clique no botão de expandir
7. Verifique se o modal de Gerir Conectores abre

## Resultado Esperado

✅ Botão de expandir aparece no header do menu  
✅ Botão tem ícone de seta para baixo  
✅ Hover muda a cor para azul  
✅ Clique fecha o menu e abre o modal de conectores  
✅ Modal abre na seção de Integrações  
✅ Funciona em tema claro e escuro  
