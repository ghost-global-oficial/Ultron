#!/usr/bin/env node

// Script para verificar o menu de modelo visualmente
// Requer: npm install -g playwright

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Verificando menu de modelo...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:18789');
  await page.waitForTimeout(2000);

  console.log('✅ Página carregada\n');

  // Verificar se o botão existe
  const button = await page.locator('.chat-model-selector__button').first();
  const buttonExists = await button.count() > 0;
  
  if (!buttonExists) {
    console.log('❌ Botão não encontrado!');
    await browser.close();
    return;
  }

  console.log('✅ Botão encontrado');
  console.log('📍 Texto do botão:', await button.textContent());

  // Clicar no botão
  console.log('\n🖱️  Clicando no botão...');
  await button.click();
  await page.waitForTimeout(500);

  // Verificar se o menu apareceu
  const menu = await page.locator('.chat-model-selector__menu').first();
  const menuExists = await menu.count() > 0;

  console.log('\n=== RESULTADO ===');
  console.log('Menu existe no DOM:', menuExists);

  if (menuExists) {
    const rect = await menu.boundingBox();
    const isVisible = await menu.isVisible();
    
    console.log('Menu visível:', isVisible);
    console.log('Posição do menu:', {
      top: rect?.y,
      left: rect?.x,
      width: rect?.width,
      height: rect?.height,
    });

    // Verificar estilos
    const styles = await menu.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        position: computed.position,
        zIndex: computed.zIndex,
        background: computed.background,
      };
    });

    console.log('Estilos do menu:', styles);

    // Verificar overlay
    const overlay = await page.locator('.chat-model-selector__overlay').first();
    const overlayExists = await overlay.count() > 0;
    console.log('\nOverlay existe:', overlayExists);

    if (overlayExists) {
      const overlayStyles = await overlay.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          zIndex: computed.zIndex,
          position: computed.position,
        };
      });
      console.log('Overlay z-index:', overlayStyles.zIndex);
    }

    // Tirar screenshot
    await page.screenshot({ path: 'menu-screenshot.png' });
    console.log('\n📸 Screenshot salvo em: menu-screenshot.png');
  } else {
    console.log('❌ Menu NÃO foi adicionado ao DOM');
  }

  console.log('\n⏸️  Mantendo navegador aberto por 10 segundos...');
  await page.waitForTimeout(10000);
  await browser.close();
})();
