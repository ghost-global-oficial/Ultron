#!/usr/bin/env node

// Script para debug do menu de modelo
// Execute: node debug-menu-modelo.cjs

console.log(`
=== DEBUG: Menu de Seleção de Modelo ===

Instruções:
1. Abra o Ultron
2. Abra o DevTools (F12)
3. Vá para a aba Chat
4. Cole o seguinte código no Console:

// Verificar se o componente existe
const app = document.querySelector('ultron-app');
console.log('App component:', app);
console.log('chatModelMenuOpen:', app?.chatModelMenuOpen);
console.log('chatCurrentModel:', app?.chatCurrentModel);

// Verificar se o botão existe
const button = document.querySelector('.chat-model-selector__button');
console.log('Button exists:', !!button);
console.log('Button text:', button?.textContent);

// Adicionar listener para debug
if (button) {
  button.addEventListener('click', () => {
    console.log('=== BUTTON CLICKED ===');
    setTimeout(() => {
      console.log('After click - menuOpen:', app?.chatModelMenuOpen);
      const menu = document.querySelector('.chat-model-selector__menu');
      console.log('Menu exists in DOM:', !!menu);
      if (menu) {
        const styles = window.getComputedStyle(menu);
        console.log('Menu styles:', {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          position: styles.position,
          zIndex: styles.zIndex,
          top: styles.top,
          left: styles.left,
        });
      }
    }, 100);
  });
  console.log('✅ Listener adicionado. Clique no botão agora.');
}

5. Clique no botão do seletor de modelo
6. Observe os logs no console
7. Reporte os resultados
`);
