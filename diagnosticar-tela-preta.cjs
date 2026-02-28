#!/usr/bin/env node

/**
 * Script para diagnosticar o problema da tela preta após configurar o gateway
 */

console.log("=== DIAGNÓSTICO: Tela Preta Após Configuração do Gateway ===\n");

console.log("POSSÍVEIS CAUSAS:");
console.log("1. Erro no JavaScript que impede a renderização");
console.log("2. CSS com fundo preto sem conteúdo visível");
console.log("3. Componente de chat não está sendo renderizado");
console.log("4. Estado da aplicação inconsistente após onboarding\n");

console.log("VERIFICAÇÕES A FAZER:");
console.log("1. Abra o DevTools do navegador (F12)");
console.log("2. Vá para a aba Console");
console.log("3. Procure por erros em vermelho");
console.log("4. Vá para a aba Elements/Elementos");
console.log("5. Verifique se há elementos HTML renderizados");
console.log("6. Procure por elementos com display:none ou visibility:hidden\n");

console.log("COMANDOS PARA TESTAR:");
console.log("1. Limpar cache e recompilar:");
console.log("   cd ui && npm run build && cd ..");
console.log("   pnpm build\n");

console.log("2. Verificar se o gateway está rodando:");
console.log("   curl http://localhost:18789/health\n");

console.log("3. Verificar logs do gateway:");
console.log("   tail -f ~/.openclaw/logs/gateway.log\n");

console.log("ARQUIVOS RELEVANTES PARA REVISAR:");
console.log("- ui/src/ui/app-gateway.ts (linha 115-130: navegação após onboarding)");
console.log("- ui/src/ui/views/chat.ts (renderização do chat)");
console.log("- ui/src/ui/views/chat-welcome.ts (tela de boas-vindas)");
console.log("- ui/src/styles/chat/layout.css (estilos do chat)\n");

console.log("SOLUÇÃO RÁPIDA:");
console.log("Se a tela ficar preta, tente:");
console.log("1. Pressione F5 para recarregar a página");
console.log("2. Limpe o cache do navegador (Ctrl+Shift+Delete)");
console.log("3. Feche e abra o navegador novamente\n");

console.log("Para mais detalhes, execute este script com o navegador aberto");
console.log("e verifique o console do DevTools.");
