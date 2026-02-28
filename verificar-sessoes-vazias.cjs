#!/usr/bin/env node

/**
 * Script para verificar por que as sessões estão vazias
 */

console.log('=== Análise dos Logs ===\n');

console.log('Problema identificado:');
console.log('✗ Todas as tarefas retornam messagesCount: 0');
console.log('✗ O histórico está vazio para todas as sessões');

console.log('\n=== Possíveis Causas ===\n');

console.log('1. As sessões foram criadas mas nunca tiveram mensagens');
console.log('   - Você criou várias tarefas mas não enviou mensagens nelas');
console.log('   - Solução: Envie pelo menos uma mensagem em cada tarefa');

console.log('\n2. O histórico não está sendo persistido corretamente');
console.log('   - Problema no backend/gateway');
console.log('   - Solução: Verificar logs do gateway');

console.log('\n3. As sessões estão sendo criadas com chaves diferentes');
console.log('   - A chave muda entre criação e recuperação');
console.log('   - Solução: Verificar como as chaves são geradas');

console.log('\n=== O que observei nos logs ===\n');

console.log('Sessões testadas:');
console.log('• chat:1771802532207:xj7vdua50 → 0 mensagens');
console.log('• agent:main:chat:1771802532207:xj7vdua50 → 0 mensagens');
console.log('• agent:main:chat:1771802230951:dfi6bfp1x → 0 mensagens');

console.log('\nNota: O prefixo "agent:main:" é adicionado automaticamente');
console.log('pelo sistema de roteamento. Isso é normal.');

console.log('\n=== Teste Recomendado ===\n');

console.log('1. Crie uma NOVA tarefa (botão "Nova Tarefa")');
console.log('2. Envie uma mensagem nela');
console.log('3. Aguarde a resposta da IA');
console.log('4. Crie outra tarefa nova');
console.log('5. Tente voltar para a primeira tarefa');
console.log('6. Verifique se as mensagens aparecem');

console.log('\nSe as mensagens não aparecerem, o problema é no backend.');
console.log('Se aparecerem, então as tarefas antigas estão realmente vazias.');

console.log('\n=== Verificação Adicional ===\n');

console.log('Verifique se existe um arquivo de sessões:');
console.log('• Windows: %USERPROFILE%\\.openclaw\\sessions.json');
console.log('• Linux/Mac: ~/.openclaw/sessions.json');

console.log('\nSe o arquivo existir, abra-o e veja se há dados salvos.');

console.log('\n');
