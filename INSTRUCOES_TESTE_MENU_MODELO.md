# Instruções para Testar o Menu de Seleção de Modelo

## Passo 1: Limpar Cache (se ainda não fez)

```powershell
.\limpar-cache-electron.ps1
```

## Passo 2: Iniciar o Ultron

Inicie o Ultron normalmente.

## Passo 3: Abrir DevTools

Pressione **F12** para abrir o DevTools.

## Passo 4: Ir para a Aba Chat

Clique na aba "Chat" no Ultron.

## Passo 5: Executar Script de Debug no Console

Cole o seguinte código no Console do DevTools:

```javascript
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
```

## Passo 6: Clicar no Botão

Clique no botão do seletor de modelo (deve estar no lado esquerdo, abaixo do título "Chat").

## Passo 7: Observar os Logs

Observe os logs no console. Você deve ver:

```
=== BUTTON CLICKED ===
After click - menuOpen: true
Menu exists in DOM: true (ou false)
```

## Passo 8: Reportar os Resultados

Por favor, me informe:

1. **O botão existe?** (Button exists: true/false)
2. **O texto do botão está correto?** (deve ser "Claude Sonnet 4.5")
3. **Após clicar, o menuOpen muda para true?** (After click - menuOpen: true/false)
4. **O menu aparece no DOM?** (Menu exists in DOM: true/false)
5. **Se o menu existe, ele está visível?** (verifique os estilos)
6. **Há algum erro no console?**

## Informações Importantes

- O botão deve estar no **lado esquerdo**, onde estava o subtítulo "Direct gateway chat session..."
- O menu deve aparecer **abaixo do botão**, alinhado à esquerda
- O menu deve ter um **overlay escuro** cobrindo o resto da tela
- O menu deve ter **6 modelos de IA** listados

## Se o Menu Não Aparecer

Se após clicar o menu não aparecer, mas `menuOpen` está `true`, o problema pode ser:

1. **CSS**: O menu está sendo renderizado mas não é visível
2. **Z-index**: O menu está atrás de outros elementos
3. **Position**: O menu está fora da tela
4. **Display**: O menu tem `display: none`

Nesse caso, verifique os estilos computados do menu (se ele existir no DOM).
