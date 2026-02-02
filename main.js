import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import * as pty from 'node-pty';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    title: "Ultron - Moltbot Powered",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Terminal PTY Setup
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

ipcMain.on('terminal.shell', (event, data) => {
  // Comando para iniciar o onboarding do Moltbot
  const ptyProcess = pty.spawn(shell, ['-c', 'node openclaw.mjs onboard'], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: __dirname,
    env: { ...process.env, OPENCLAW_INTERACTIVE: 'true' }
  });

  ptyProcess.onData((data) => {
    mainWindow.webContents.send('terminal.incomingData', data);
  });

  ipcMain.on('terminal.keystroke', (event, key) => {
    ptyProcess.write(key);
  });
});
