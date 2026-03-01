# 📦 Guia de Distribuição do ULTRON

## 🎯 Objetivo

Criar instaladores executáveis do ULTRON para distribuição fácil para usuários não-técnicos.

## 📋 Tipos de Instaladores

### 1. Instalador NSIS (Recomendado)
- **Arquivo**: `Ultron-Setup-1.0.0.exe`
- **Tamanho**: ~200-300 MB
- **Características**:
  - Instalador tradicional do Windows
  - Permite escolher pasta de instalação
  - Cria atalhos no Desktop e Menu Iniciar
  - Desinstalador incluído
  - Atualização automática (futuro)

### 2. Versão Portátil
- **Arquivo**: `Ultron-Portable-1.0.0.exe`
- **Tamanho**: ~200-300 MB
- **Características**:
  - Não requer instalação
  - Executa direto do pendrive/pasta
  - Ideal para testar sem instalar
  - Configurações ficam na pasta do executável

## 🚀 Como Gerar os Instaladores

### Pré-requisitos

1. **Node.js 22+** instalado
2. **npm** instalado
3. Todas as dependências instaladas

### Passo a Passo

```bash
# 1. Instalar dependências (se ainda não instalou)
npm install

# 2. Instalar dependências da UI
cd ui
npm install
cd ..

# 3. Gerar instalador NSIS (recomendado)
npm run package:win

# OU gerar versão portátil
npm run package:portable

# OU gerar ambos
npm run dist
```

### Resultado

Os instaladores serão criados na pasta `release/`:

```
release/
├── Ultron-Setup-1.0.0.exe        # Instalador NSIS (~250 MB)
└── Ultron-Portable-1.0.0.exe     # Versão portátil (~250 MB)
```

## 📤 Distribuição

### Opção 1: GitHub Releases (Recomendado)

1. **Criar Release no GitHub**:
   ```bash
   # Tag da versão
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Upload dos Instaladores**:
   - Ir para: https://github.com/seu-usuario/ultron/releases
   - Clicar em "Draft a new release"
   - Escolher a tag `v1.0.0`
   - Fazer upload dos arquivos da pasta `release/`
   - Publicar

3. **Link de Download**:
   ```
   https://github.com/seu-usuario/ultron/releases/download/v1.0.0/Ultron-Setup-1.0.0.exe
   ```

### Opção 2: Site Próprio

1. **Hospedar os Instaladores**:
   - Upload para seu servidor/CDN
   - Exemplo: `https://seusite.com/downloads/Ultron-Setup-1.0.0.exe`

2. **Página de Download**:
   ```html
   <a href="https://seusite.com/downloads/Ultron-Setup-1.0.0.exe" 
      class="download-button">
     Download ULTRON para Windows
   </a>
   ```

### Opção 3: Google Drive / Dropbox

1. Upload do instalador
2. Gerar link público
3. Compartilhar o link

## 🌐 Página de Download (Exemplo)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Download ULTRON</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
        }
        .download-section {
            background: #f5f5f5;
            padding: 40px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .download-button {
            display: inline-block;
            background: #0066cc;
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 18px;
            margin: 10px;
        }
        .download-button:hover {
            background: #0052a3;
        }
        .version-info {
            color: #666;
            margin-top: 20px;
        }
        .requirements {
            text-align: left;
            margin: 30px auto;
            max-width: 600px;
        }
    </style>
</head>
<body>
    <h1>🤖 Download ULTRON</h1>
    <p>Seu Assistente de IA Pessoal</p>

    <div class="download-section">
        <h2>Instalador para Windows</h2>
        <a href="https://github.com/seu-usuario/ultron/releases/download/v1.0.0/Ultron-Setup-1.0.0.exe" 
           class="download-button">
            📥 Download Instalador (250 MB)
        </a>
        <br>
        <a href="https://github.com/seu-usuario/ultron/releases/download/v1.0.0/Ultron-Portable-1.0.0.exe" 
           class="download-button">
            💾 Download Versão Portátil (250 MB)
        </a>
        
        <div class="version-info">
            <p>Versão: 1.0.0 | Windows 10/11 (64-bit)</p>
        </div>
    </div>

    <div class="requirements">
        <h3>📋 Requisitos do Sistema</h3>
        <ul>
            <li>Windows 10 ou 11 (64-bit)</li>
            <li>4 GB de RAM (8 GB recomendado)</li>
            <li>500 MB de espaço em disco</li>
            <li>Conexão com a internet</li>
        </ul>

        <h3>🚀 Como Instalar</h3>
        <ol>
            <li>Baixe o instalador</li>
            <li>Execute o arquivo .exe</li>
            <li>Siga o assistente de instalação</li>
            <li>Pronto! ULTRON está instalado</li>
        </ol>

        <h3>🔑 Primeira Configuração</h3>
        <ol>
            <li>Escolha o idioma (Português ou Inglês)</li>
            <li>Selecione seu provedor de IA (Google, Claude, etc.)</li>
            <li>Insira sua chave API</li>
            <li>Configure o gateway (porta 18789)</li>
            <li>Comece a usar!</li>
        </ol>
    </div>

    <div class="download-section">
        <h3>❓ Precisa de Ajuda?</h3>
        <p>
            <a href="https://github.com/seu-usuario/ultron">Documentação</a> | 
            <a href="https://github.com/seu-usuario/ultron/issues">Reportar Problema</a>
        </p>
    </div>
</body>
</html>
```

## 🔧 Configuração Avançada

### Personalizar Ícone

1. Criar ícone 256x256 PNG
2. Salvar em `assets/icon.png`
3. Rebuild: `npm run package:win`

### Personalizar Instalador

Editar `package.json` seção `build.nsis`:

```json
"nsis": {
  "oneClick": false,
  "allowToChangeInstallationDirectory": true,
  "installerLanguages": ["pt_BR", "en_US"],
  "license": "LICENSE.txt",
  "warningsAsErrors": false
}
```

### Auto-Update (Futuro)

```json
"publish": {
  "provider": "github",
  "owner": "seu-usuario",
  "repo": "ultron"
}
```

## 📊 Checklist de Release

Antes de distribuir:

- [ ] Testar instalador em máquina limpa
- [ ] Verificar se todos os arquivos estão incluídos
- [ ] Testar desinstalação
- [ ] Verificar atalhos (Desktop + Menu Iniciar)
- [ ] Testar primeira execução
- [ ] Verificar tamanho do instalador (< 500 MB)
- [ ] Criar release notes
- [ ] Atualizar README com link de download
- [ ] Testar em Windows 10 e 11

## 🐛 Troubleshooting

### Erro: "electron-builder not found"
```bash
npm install --save-dev electron-builder
```

### Erro: "Cannot find module"
```bash
npm run build:all
```

### Instalador muito grande (> 500 MB)
- Remover node_modules desnecessários
- Usar `asar` para compactar
- Excluir arquivos de desenvolvimento

### Erro ao executar instalador
- Verificar antivírus
- Executar como administrador
- Verificar Windows Defender

## 📈 Estatísticas

### Tamanho dos Arquivos

- **Instalador NSIS**: ~250 MB
- **Versão Portátil**: ~250 MB
- **Instalado**: ~400 MB (com node_modules)

### Tempo de Build

- **Build TypeScript**: ~30 segundos
- **Build UI**: ~20 segundos
- **Package Electron**: ~2-3 minutos
- **Total**: ~4 minutos

## 🎯 Próximos Passos

### Curto Prazo
- [ ] Adicionar assinatura digital (code signing)
- [ ] Implementar auto-update
- [ ] Criar instalador para macOS (.dmg)
- [ ] Criar instalador para Linux (.deb, .rpm, .AppImage)

### Longo Prazo
- [ ] Microsoft Store
- [ ] Chocolatey (Windows package manager)
- [ ] Winget (Windows Package Manager)
- [ ] Snap Store (Linux)

## 🔗 Links Úteis

- [Electron Builder Docs](https://www.electron.build/)
- [NSIS Documentation](https://nsis.sourceforge.io/Docs/)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Auto Update Guide](https://www.electron.build/auto-update)

## 📝 Exemplo de Release Notes

```markdown
# ULTRON v1.0.0

## 🎉 Novidades

- Sistema de Colmeia P2P para colaboração entre ULTRONs
- Suporte a 5 provedores de IA (Google, Claude, OpenRouter, Grok, OpenAI)
- Vault criptografado para senhas e chaves API
- Interface moderna e intuitiva
- Suporte a múltiplos agentes

## 📥 Download

- [Instalador Windows (250 MB)](link)
- [Versão Portátil (250 MB)](link)

## 📋 Requisitos

- Windows 10/11 (64-bit)
- 4 GB RAM
- 500 MB espaço em disco

## 🐛 Correções

- Primeira versão estável

## 🙏 Agradecimentos

Baseado em OpenClaw por Peter Steinberger
```

---

**Pronto para distribuição!** 🚀
