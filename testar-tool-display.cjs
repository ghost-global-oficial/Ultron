#!/usr/bin/env node

// Simular a lógica do tool-display.ts para testar

function testExeToolDisplay(command) {
  console.log('\n=== TESTANDO COMANDO ===');
  console.log('Comando:', command);
  
  let appName;
  let label;
  
  // Pattern 1: "start appname" or "open appname"
  const startMatch = command.match(/(?:start|open)\s+([^\s&|;]+)/i);
  if (startMatch && startMatch[1]) {
    appName = startMatch[1];
    console.log('✅ Pattern 1 (start/open) matched:', appName);
  }
  
  // Pattern 2: Direct executable like "blender.exe" or "code.exe"
  if (!appName) {
    const exeMatch = command.match(/([^\s\\\/]+)\.exe/i);
    if (exeMatch && exeMatch[1]) {
      appName = exeMatch[1];
      console.log('✅ Pattern 2 (.exe) matched:', appName);
    }
  }
  
  // Pattern 3: Path to executable like "C:\Program Files\App\app.exe"
  if (!appName) {
    const pathMatch = command.match(/[\\\/]([^\\\/]+)\.exe/i);
    if (pathMatch && pathMatch[1]) {
      appName = pathMatch[1];
      console.log('✅ Pattern 3 (path) matched:', appName);
    }
  }
  
  // Pattern 4: Just the command name (first word)
  if (!appName) {
    const firstWord = command.split(/\s+/)[0];
    if (firstWord && firstWord.length > 0) {
      appName = firstWord;
      console.log('✅ Pattern 4 (first word) matched:', appName);
    }
  }
  
  if (appName) {
    // Clean up the app name
    appName = appName.replace(/['"]/g, '').trim();
    
    // Capitalize first letter
    const cleanName = appName.charAt(0).toUpperCase() + appName.slice(1);
    
    // Generate friendly message
    label = `Opening ${cleanName}`;
    console.log('✅ Label gerado:', label);
  } else {
    label = "Running command";
    console.log('❌ Nenhum padrão matched, usando label genérico');
  }
  
  return label;
}

// Testar vários comandos
const testCommands = [
  'start blender',
  'Start-Process blender',
  'blender.exe',
  'C:\\Program Files\\Blender\\blender.exe',
  '"C:\\Program Files\\Blender\\blender.exe"',
  'notepad',
  'notepad.exe',
  'start notepad',
  'calc',
  'mspaint'
];

console.log('═══════════════════════════════════════════════════');
console.log('TESTANDO LÓGICA DE EXTRAÇÃO DE NOME DE APP');
console.log('═══════════════════════════════════════════════════');

for (const cmd of testCommands) {
  testExeToolDisplay(cmd);
}

console.log('\n═══════════════════════════════════════════════════');
console.log('TESTE COMPLETO');
console.log('═══════════════════════════════════════════════════\n');
