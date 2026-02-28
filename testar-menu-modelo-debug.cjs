#!/usr/bin/env node
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Interceptar logs do console
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[DEBUG]')) {
      console.log('🔍', text);
    }
  });

  await page.goto('http://localhost:18789');
  await page.waitForTimeout(2000);

  console.log('\n✅ Página carregada');

  // Verificar se o botão existe
  const button = await page.locator('.chat-model-selector__button').first();
  const buttonExists = await button.count() > 0;
  console.log('📍 Botão existe:', buttonExists);

  if (buttonExists) {
    console.log('📍 Texto do botão:', await button.textContent());
    
    // Clicar no botão
    console.log('\n🖱️  Clicando no botão...');
    await button.click();
    await page.waitForTimeout(1000);

    // Verificar se o menu apareceu no DOM
    const menu = await page.locator('.chat-model-selector__menu').first();
    const menuExists = await menu.count() > 0;
    console.log('📍 Menu existe no DOM:', menuExists);

    if (menuExists) {
      console.log('✅ Menu encontrado!');
      const menuVisible = await menu.isVisible();
      console.log('📍 Menu visível:', menuVisible);
      
      if (menuVisible) {
        console.log('✅ Menu está visível na tela!');
      } else {
        console.log('❌ Menu existe no DOM mas não está visível');
        const styles = await menu.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            position: computed.position,
            zIndex: computed.zIndex,
          };
        });
        console.log('📍 Estilos do menu:', styles);
      }
    } else {
      console.log('❌ Menu NÃO foi adicionado ao DOM');
      
      // Verificar o estado do componente
      const state = await page.evaluate(() => {
        const app = document.querySelector('ultron-app');
        return {
          chatModelMenuOpen: app?.chatModelMenuOpen,
          chatCurrentModel: app?.chatCurrentModel,
        };
      });
      console.log('📍 Estado do componente:', state);
    }
  }

  console.log('\n⏸️  Mantendo navegador aberto para inspeção...');
  await page.waitForTimeout(30000);
  await browser.close();
})();
