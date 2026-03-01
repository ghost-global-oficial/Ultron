# � ULTRON - Personal AI Assistant

<p align="center">
  <strong>Your Personal AI Assistant - Powered by Moltbot</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <a href="https://github.com/openclaw/openclaw"><img src="https://img.shields.io/badge/Based%20on-OpenClaw-orange.svg?style=for-the-badge" alt="Based on OpenClaw"></a>
</p>

**ULTRON** is a personal AI assistant built on top of OpenClaw, designed to run on your own devices with a beautiful Electron-based interface. It provides a seamless experience across multiple AI providers (Google Gemini, Claude, OpenRouter, Grok, OpenAI) with advanced features like P2P collaboration, secure vault, and multi-agent support.

## ✨ Key Features

### 🎯 Core Features
- **Multi-Provider Support**: Google Gemini, Claude (Anthropic), OpenRouter, Grok (xAI), OpenAI
- **Beautiful UI**: Modern Electron-based interface with dark theme
- **Local-First**: Runs entirely on your machine, no cloud dependencies
- **Secure Vault**: Encrypted storage for passwords, API keys, credit cards, and notes
- **Multi-Agent System**: Create and manage multiple AI agents with different personalities

### 🌐 P2P Hive System (NEW!)
- **Zero Servers**: Direct peer-to-peer communication between ULTRONs
- **Global & Local**: Works on same network (mDNS) or across internet (Hyperswarm DHT)
- **Encrypted**: Digital signatures (Ed25519) + optional E2E encryption
- **Auto-Discovery**: Finds other ULTRONs automatically
- **Real-Time Sync**: Share context, distribute tasks, collaborate in real-time

### 🔐 Security
- **Token-Based Auth**: Secure gateway authentication
- **Encrypted Vault**: XOR + Base64 encryption for sensitive data
- **P2P Security**: Digital signatures on all messages
- **No Cloud**: All data stays on your devices

## 📦 Installation

### Prerequisites
- **Node.js**: Version 22 or higher
- **npm**: Comes with Node.js
- **Windows**: Tested on Windows 10/11
- **macOS/Linux**: Should work but not extensively tested

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/ultron.git
cd ultron

# Install dependencies
npm install

# Install UI dependencies and build
cd ui
npm install
npm run build
cd ..

# Build the TypeScript backend
npm run build

# Start ULTRON
npm start
```

### First Run

1. **Language Selection**: Choose your preferred language (English or Portuguese)
2. **AI Provider Setup**: 
   - Select your AI provider (Google, Claude, OpenRouter, Grok, OpenAI)
   - Enter your API key
   - Choose your model
3. **Gateway Configuration**: 
   - Port: 18789 (default)
   - Auth token: Auto-generated
4. **Vault Setup** (Optional):
   - Add passwords, API keys, credit cards, notes
   - Everything is encrypted locally
5. **Start Using**: Chat with your AI assistant!

## 🚀 Usage

### Basic Chat

Once ULTRON is running, you'll see the chat interface where you can:
- Ask questions
- Get help with coding
- Analyze documents
- And much more!

### P2P Hive Collaboration

Connect multiple ULTRONs to work together:

1. **Create a Hive**:
   - Go to Settings → Hive
   - Click "Create New Hive"
   - Set credentials (ID + 2 passphrases)

2. **Join a Hive**:
   - Go to Settings → Hive
   - Click "Join Existing Hive"
   - Enter the same credentials as the creator

3. **Collaborate**:
   - Share context between ULTRONs
   - Distribute tasks
   - Real-time synchronization

### Connecting to Remote ULTRON

You can connect to an existing ULTRON instance:

1. Click "Join Existing ULTRON" on welcome screen
2. Enter:
   - ULTRON ID
   - Access Token
   - Passphrase 1 & 2
   - Gateway address (optional)
3. Connect and start using!

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         Electron App (UI)           │
│  - Chat Interface                   │
│  - Settings                         │
│  - Vault                            │
│  - Agents Management                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Gateway (Node.js Backend)      │
│  - AI Provider Integration          │
│  - Session Management               │
│  - P2P Hive Manager                 │
│  - WebSocket Server                 │
└──────────────┬──────────────────────┘
               │
               ├─ Google Gemini API
               ├─ Claude API
               ├─ OpenRouter API
               ├─ Grok API
               └─ OpenAI API
```

### P2P Hive Architecture

```
┌─────────────┐                    ┌─────────────┐
│  ULTRON A   │◄──────────────────►│  ULTRON B   │
│             │   Direct P2P       │             │
│  Gateway    │   Connection       │  Gateway    │
│  :18789     │                    │  :18789     │
└─────────────┘                    └─────────────┘
       ▲                                  ▲
       │                                  │
       │         ┌─────────────┐         │
       └────────►│  ULTRON C   │◄────────┘
                 │             │
                 │  Gateway    │
                 │  :18789     │
                 └─────────────┘
```

## 📚 Documentation

### P2P Hive System
- [P2P Architecture](HIVE_P2P_ARCHITECTURE.md) - Complete technical architecture
- [Usage Guide](HIVE_P2P_USAGE.md) - How to use the P2P system
- [Security](SEGURANCA_COLMEIA_P2P.md) - Security details and encryption
- [Multiple Gateways](MULTIPLOS_GATEWAYS.md) - Running multiple ULTRONs
- [Testing Guide](TESTE_COLMEIA_P2P.md) - Step-by-step testing
- [Implementation](IMPLEMENTACAO_P2P_COMPLETA.md) - Implementation details
- [Summary](RESUMO_COLMEIA_P2P.md) - Executive summary

### General
- [Contributing](CONTRIBUTING.md) - How to contribute
- [Changelog](CHANGELOG.md) - Version history

## 🛠️ Development

### Project Structure

```
ultron/
├── main.js                 # Electron main process
├── renderer.js             # Setup wizard
├── index.html              # Welcome screen
├── i18n.js                 # Internationalization
├── src/                    # TypeScript backend
│   ├── hive/              # P2P Hive system
│   │   ├── p2p/
│   │   │   ├── peer.ts    # P2P peer implementation
│   │   │   └── discovery.ts # Local discovery (mDNS)
│   │   └── hive-p2p-manager.ts # Main manager
│   └── ...                # Other backend code
├── ui/                     # Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── ui/            # UI components
│   │   ├── styles/        # CSS styles
│   │   └── hive/          # Hive UI integration
│   └── public/            # Static assets
└── dist/                   # Compiled output
```

### Building from Source

```bash
# Install dependencies
npm install

# Build backend (TypeScript)
npm run build

# Build UI
cd ui
npm install
npm run build
cd ..

# Run in development mode
npm start
```

### Technologies Used

- **Frontend**: Vite, TypeScript, Vanilla JS
- **Backend**: Node.js, TypeScript
- **Desktop**: Electron
- **P2P**: Hyperswarm (DHT), Bonjour/mDNS
- **Crypto**: Ed25519 (digital signatures)
- **AI Providers**: REST APIs

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Areas for Contribution

- UI/UX improvements
- New AI provider integrations
- P2P features (E2E encryption, file sharing, etc.)
- Documentation
- Bug fixes
- Testing

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenClaw**: This project is based on [OpenClaw](https://github.com/openclaw/openclaw) by Peter Steinberger
- **Moltbot**: AI assistant framework
- **Hyperswarm**: P2P networking
- **Electron**: Desktop application framework

## 🔗 Links

- [OpenClaw Repository](https://github.com/openclaw/openclaw)
- [OpenClaw Documentation](https://docs.openclaw.ai)
- [Hyperswarm](https://github.com/holepunchto/hyperswarm)

## 📊 Features Comparison

| Feature | ULTRON | OpenClaw |
|---------|--------|----------|
| **Desktop App** | ✅ Electron | ✅ macOS App |
| **Multi-Provider** | ✅ 5+ providers | ✅ Multiple |
| **P2P Hive** | ✅ Built-in | ❌ Not available |
| **Secure Vault** | ✅ Encrypted | ❌ Not available |
| **Multi-Agent** | ✅ Yes | ✅ Yes |
| **Messaging Channels** | ❌ Not yet | ✅ WhatsApp, Telegram, etc. |
| **Voice** | ❌ Not yet | ✅ Voice Wake, Talk Mode |
| **Mobile Apps** | ❌ Not yet | ✅ iOS, Android |

## 🎯 Roadmap

### Short Term
- [ ] Add E2E encryption to P2P messages
- [ ] Implement file sharing in Hive
- [ ] Add voice input/output
- [ ] Mobile apps (iOS/Android)

### Long Term
- [ ] Messaging channel integrations (WhatsApp, Telegram, etc.)
- [ ] Browser extension
- [ ] Plugin system
- [ ] Marketplace for agents and skills

## 💬 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Check the documentation
- Review existing issues

## ⚠️ Disclaimer

ULTRON is a personal project based on OpenClaw. It is not affiliated with or endorsed by the OpenClaw project or its creators. Use at your own risk.

---

**Made with ❤️ by the community**

**Based on OpenClaw by Peter Steinberger**
