#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const os = require('os');

console.log('='.repeat(60));
console.log('TESTE DE EXECUÇÃO DE APPS');
console.log('='.repeat(60));
console.log();

console.log('Sistema:', os.platform());
console.log('Arquitetura:', os.arch());
console.log();

// Teste 1: Verificar se consegue executar comandos simples
console.log('1. TESTE DE COMANDO SIMPLES');
console.log('-'.repeat(60));

exec('echo "Teste de execução"', (error, stdout, stderr) => {
  if (error) {
    console.log('✗ Erro ao executar comando:', error.message);
  } else {
    console.log('✓ Comando executado com sucesso');
    console.log('  Output:', stdout.trim());
  }
  
  // Teste 2: Tentar abrir o Notepad (app simples do Windows)
  console.log();
  console.log('2. TESTE DE ABERTURA DE APP (NOTEPAD)');
  console.log('-'.repeat(60));
  
  const notepad = spawn('notepad.exe', [], {
    detached: true,
    stdio: 'ignore'
  });
  
  notepad.unref();
  
  setTimeout(() => {
    console.log('✓ Notepad foi iniciado (verifique se abriu)');
    console.log('  PID:', notepad.pid);
    
    // Teste 3: Verificar processos em execução
    console.log();
    console.log('3. VERIFICAR PROCESSOS');
    console.log('-'.repeat(60));
    
    exec('tasklist | findstr notepad', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠ Notepad pode não estar rodando');
      } else {
        console.log('✓ Notepad está rodando:');
        console.log(stdout);
      }
      
      // Teste 4: Tentar abrir um app via start
      console.log();
      console.log('4. TESTE COM COMANDO START');
      console.log('-'.repeat(60));
      
      exec('start calc', (error, stdout, stderr) => {
        if (error) {
          console.log('✗ Erro ao abrir calculadora:', error.message);
        } else {
          console.log('✓ Calculadora foi iniciada (verifique se abriu)');
        }
        
        // Teste 5: Verificar permissões
        console.log();
        console.log('5. VERIFICAR PERMISSÕES');
        console.log('-'.repeat(60));
        
        exec('whoami', (error, stdout, stderr) => {
          if (error) {
            console.log('✗ Erro ao verificar usuário:', error.message);
          } else {
            console.log('✓ Usuário atual:', stdout.trim());
          }
          
          console.log();
          console.log('='.repeat(60));
          console.log('TESTE CONCLUÍDO');
          console.log('='.repeat(60));
          console.log();
          console.log('Se o Notepad e a Calculadora não abriram, pode haver');
          console.log('um problema com permissões ou com o spawn/exec.');
          console.log();
          console.log('Feche o Notepad e a Calculadora manualmente se abriram.');
        });
      });
    });
  }, 1000);
});
