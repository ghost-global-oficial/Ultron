const ipcRenderer = window.require('electron').ipcRenderer;
const { Terminal } = window.require('xterm');
const { FitAddon } = window.require('xterm-addon-fit');

const term = new Terminal({
    cursorBlink: true,
    theme: {
        background: '#000000'
    }
});
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

term.open(document.getElementById('terminal-container'));
fitAddon.fit();

term.write('Bem-vindo ao Ultron Terminal\r\n');
term.write('A carregar configuração do Moltbot...\r\n');

ipcRenderer.send('terminal.shell');

ipcRenderer.on('terminal.incomingData', (event, data) => {
    term.write(data);
});

term.onData(data => {
    ipcRenderer.send('terminal.keystroke', data);
});

window.addEventListener('resize', () => {
    fitAddon.fit();
});
