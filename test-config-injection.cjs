// Script de teste para verificar a injeção de configuração
const fs = require('fs');
const path = require('path');

const testData = {
    port: 18789,
    token: 'test-token-123456789'
};

const uiPath = path.join(__dirname, 'dist', 'control-ui', 'index.html');
console.log('Lendo UI de:', uiPath);

if (!fs.existsSync(uiPath)) {
    console.error('❌ UI não encontrada!');
    process.exit(1);
}

let html = fs.readFileSync(uiPath, 'utf8');
console.log('✓ HTML lido, tamanho:', html.length, 'bytes');

const wsUrl = `ws://localhost:${testData.port}`;
console.log('WebSocket URL:', wsUrl);

const config = `
  <script>
    // Configuração do Gateway Ultron
    window.__OPENCLAW_GATEWAY_URL__ = '${wsUrl}';
    window.__OPENCLAW_GATEWAY_TOKEN__ = '${testData.token}';
    window.__OPENCLAW_CONTROL_UI_BASE_PATH__ = '';
    window.__OPENCLAW_ASSISTANT_NAME__ = 'Ultron';
    window.__OPENCLAW_ASSISTANT_AVATAR__ = '🦞';
    
    console.log('=== ULTRON CONFIG INJECTED ===');
    console.log('Gateway URL:', window.__OPENCLAW_GATEWAY_URL__);
    console.log('Gateway Token:', window.__OPENCLAW_GATEWAY_TOKEN__);
  </script>
`;

const firstScriptIndex = html.indexOf('<script');
console.log('Índice do primeiro <script>:', firstScriptIndex);

if (firstScriptIndex !== -1) {
    html = html.slice(0, firstScriptIndex) + config + html.slice(firstScriptIndex);
    console.log('✓ Config injetada antes do primeiro <script>');
} else {
    html = html.replace('</head>', config + '</head>');
    console.log('✓ Config injetada antes do </head>');
}

const tempPath = path.join(__dirname, 'dist', 'control-ui', 'index-temp-test.html');
fs.writeFileSync(tempPath, html);
console.log('✓ Arquivo de teste salvo em:', tempPath);

// Verificar se a config foi injetada corretamente
const savedHtml = fs.readFileSync(tempPath, 'utf8');
const hasConfig = savedHtml.includes('__OPENCLAW_GATEWAY_URL__');
console.log('✓ Config presente?', hasConfig);

if (hasConfig) {
    const urlMatch = savedHtml.match(/window\.__OPENCLAW_GATEWAY_URL__\s*=\s*'([^']+)'/);
    if (urlMatch) {
        console.log('✓ URL extraída:', urlMatch[1]);
        if (urlMatch[1] === wsUrl) {
            console.log('✅ TESTE PASSOU! URL correta.');
        } else {
            console.error('❌ TESTE FALHOU! URL incorreta.');
            console.error('Esperado:', wsUrl);
            console.error('Obtido:', urlMatch[1]);
        }
    } else {
        console.error('❌ TESTE FALHOU! URL não encontrada no padrão esperado.');
    }
} else {
    console.error('❌ TESTE FALHOU! Config não foi injetada.');
}
