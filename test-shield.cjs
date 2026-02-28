// Script de teste para o S.H.I.E.L.D.
const ShieldIntegration = require('./shield-integration.cjs');

async function testShield() {
    console.log('=== TESTE DO S.H.I.E.L.D. ===\n');
    
    // Criar instância
    const shield = new ShieldIntegration({
        enabled: true,
        requireHumanApproval: false, // Para testes automáticos
        logLevel: 'INFO'
    });
    
    // Verificar instalação
    console.log('1. Verificando instalação...');
    const checks = await shield.checkInstallation();
    console.log('   Checks:', checks);
    
    if (!checks.shieldExists) {
        console.error('   ❌ Diretório shield não encontrado');
        return;
    }
    
    if (!checks.pythonAvailable) {
        console.error('   ❌ Python não disponível');
        return;
    }
    
    console.log('   ✓ Instalação OK\n');
    
    // Instalar dependências se necessário
    if (!checks.dependenciesInstalled) {
        console.log('2. Instalando dependências...');
        try {
            await shield.install();
            console.log('   ✓ Instalação completa\n');
        } catch (error) {
            console.error('   ❌ Erro na instalação:', error.message);
            return;
        }
    } else {
        console.log('2. Dependências já instaladas\n');
    }
    
    // Iniciar S.H.I.E.L.D.
    console.log('3. Iniciando S.H.I.E.L.D...');
    try {
        await shield.start();
        console.log('   ✓ S.H.I.E.L.D. iniciado\n');
    } catch (error) {
        console.error('   ❌ Erro ao iniciar:', error.message);
        return;
    }
    
    // Aguardar inicialização
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Testar ações
    console.log('4. Testando monitoramento de ações...\n');
    
    // Ação normal
    console.log('   Teste 1: Ação normal (print)');
    const result1 = await shield.monitorAction({
        type: 'CODE_EXECUTION',
        description: 'Executar print simples',
        parameters: { code: 'print("Hello World")' },
        agentId: 'test-agent',
        reasoning: 'Debug simples'
    });
    console.log('   Resultado:', result1.allowed ? '✓ Permitido' : '✗ Bloqueado');
    console.log('   Nível de ameaça:', result1.threatLevel);
    console.log('   Razão:', result1.reason);
    console.log('');
    
    // Ação suspeita
    console.log('   Teste 2: Ação suspeita (acesso a arquivo sensível)');
    const result2 = await shield.monitorAction({
        type: 'FILE_ACCESS',
        description: 'Ler arquivo /etc/passwd',
        parameters: { path: '/etc/passwd', mode: 'read' },
        agentId: 'test-agent',
        reasoning: 'Verificar usuários do sistema'
    });
    console.log('   Resultado:', result2.allowed ? '✓ Permitido' : '✗ Bloqueado');
    console.log('   Nível de ameaça:', result2.threatLevel);
    console.log('   Razão:', result2.reason);
    console.log('');
    
    // Ação perigosa
    console.log('   Teste 3: Ação perigosa (execução de shell)');
    const result3 = await shield.monitorAction({
        type: 'SHELL_COMMAND',
        description: 'Executar comando rm -rf',
        parameters: { command: 'rm -rf /' },
        agentId: 'test-agent',
        reasoning: 'Limpar sistema'
    });
    console.log('   Resultado:', result3.allowed ? '✓ Permitido' : '✗ Bloqueado');
    console.log('   Nível de ameaça:', result3.threatLevel);
    console.log('   Razão:', result3.reason);
    console.log('');
    
    // Obter métricas
    console.log('5. Métricas do S.H.I.E.L.D.:');
    const metrics = await shield.getMetrics();
    console.log('   Total de ações:', metrics.totalActions);
    console.log('   Ameaças detectadas:', metrics.threatsDetected);
    console.log('   Ações bloqueadas:', metrics.actionsBlocked);
    console.log('');
    
    // Parar S.H.I.E.L.D.
    console.log('6. Parando S.H.I.E.L.D...');
    await shield.stop();
    console.log('   ✓ S.H.I.E.L.D. parado\n');
    
    console.log('=== TESTE CONCLUÍDO ===');
}

// Executar teste
testShield().catch(error => {
    console.error('Erro no teste:', error);
    process.exit(1);
});
