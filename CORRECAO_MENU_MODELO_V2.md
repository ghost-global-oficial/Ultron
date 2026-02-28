# Correção do Menu de Modelo - Versão 2

## Nova Abordagem

Dividi a renderização em duas funções separadas e movi a lógica condicional para o `app-render.ts`:

### Antes (não funcionava):
```typescript
// app-render.helpers.ts
export function renderChatControls(state, menuOpen) {
  return html`
    <div>
      <button>...</button>
      ${menuOpen ? html`<div>Menu</div>` : nothing}
    </div>
  `;
}

// app-render.ts
${renderChatControls(state, state.chatModelMenuOpen)}
```

### Depois (deve funcionar):
```typescript
// app-render.helpers.ts
export function renderChatModelButton(state) {
  return html`<button>...</button>`;
}

export function renderChatModelMenu(state) {
  return html`<div>Menu</div>`;
}

// app-render.ts
<div class="chat-model-selector">
  ${renderChatModelButton(state)}
  ${state.chatModelMenuOpen ? renderChatModelMenu(state) : nothing}
</div>
```

## Por Que Isso Deve Funcionar?

A lógica condicional agora está diretamente no template principal (`app-render.ts`), que é renderizado pelo componente `UltronApp`. Isso significa que quando `state.chatModelMenuOpen` muda, o Lit detecta a mudança no template principal e re-renderiza corretamente.

## Arquivos Modificados

1. **ui/src/ui/app-render.helpers.ts**
   - Removida função `renderChatControls`
   - Adicionada função `renderChatModelButton`
   - Adicionada função `renderChatModelMenu`

2. **ui/src/ui/app-render.ts**
   - Atualizado import
   - Movida lógica condicional para o template principal

## Como Testar

1. **Limpe o cache** (se ainda não fez):
   ```powershell
   .\limpar-cache-electron.ps1
   ```

2. **Inicie o Ultron**

3. **Abra o DevTools** (F12)

4. **Vá para a aba Chat**

5. **Execute o script de debug no Console**:
   ```powershell
   node debug-menu-modelo.cjs
   ```
   
   Ou cole diretamente no console do navegador:
   ```javascript
   const app = document.querySelector('ultron-app');
   console.log('App:', app);
   console.log('menuOpen:', app?.chatModelMenuOpen);
   
   const button = document.querySelector('.chat-model-selector__button');
   console.log('Button:', button);
   
   if (button) {
     button.addEventListener('click', () => {
       console.log('=== CLICKED ===');
       setTimeout(() => {
         console.log('menuOpen after click:', app?.chatModelMenuOpen);
         const menu = document.querySelector('.chat-model-selector__menu');
         console.log('Menu in DOM:', !!menu);
       }, 100);
     });
   }
   ```

6. **Clique no botão do seletor de modelo**

7. **Verifique**:
   - O console deve mostrar `menuOpen after click: true`
   - O console deve mostrar `Menu in DOM: true`
   - O menu deve aparecer visualmente na tela

## Se Ainda Não Funcionar

Se o menu ainda não aparecer, o problema pode ser:

1. **O estado não está mudando**: Verifique se `app.chatModelMenuOpen` realmente muda para `true`
2. **O template não está sendo re-renderizado**: Pode haver um problema com o ciclo de vida do Lit
3. **O menu está sendo renderizado mas não é visível**: Verifique os estilos CSS

Nesse caso, vamos precisar de uma abordagem mais drástica, como:
- Criar um componente Lit separado para o seletor de modelo
- Usar um portal para renderizar o menu fora do fluxo normal
- Forçar re-renderização manual com `this.requestUpdate()` em todos os lugares
