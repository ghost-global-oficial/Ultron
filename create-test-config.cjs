#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
const configDir = path.dirname(configPath);

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

const config = {
  "gateway": {
    "mode": "local",
    "port": 18789,
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "test-token-" + Math.random().toString(36).substring(2, 15)
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "openai/gpt-oss-120b:free"
      }
    }
  },
  "env": {
    "vars": {
      "OPENROUTER_API_KEY": "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"
    }
  }
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('✓ Configuração de teste criada:', configPath);
console.log(JSON.stringify(config, null, 2));
