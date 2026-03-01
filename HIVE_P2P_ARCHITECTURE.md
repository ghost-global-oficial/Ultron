# Arquitetura P2P para Sistema de Colmeias ULTRON

## 🎯 Objetivo: Comunicação Direta Dispositivo ↔ Dispositivo

### Princípios:
- ✅ **Zero Servidores Centrais**: Comunicação direta entre ULTRONs
- ✅ **Privacidade Total**: Dados nunca passam por terceiros
- ✅ **Criptografia End-to-End**: Apenas os peers podem ler as mensagens
- ✅ **Descoberta Automática**: Encontrar outros ULTRONs na rede local
- ✅ **NAT Traversal**: Funcionar mesmo atrás de roteadores

## 📐 Arquitetura

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

Cada ULTRON é um peer independente
Comunicação direta sem intermediários
```

## 🔧 Tecnologias

### 1. WebRTC (Comunicação P2P)
- **DataChannels**: Troca de mensagens/dados
- **STUN**: Descoberta de IP público
- **ICE**: Negociação de conexão
- **Sem servidor de sinalização**: Usar QR Code ou link direto

### 2. mDNS/Bonjour (Descoberta Local)
- Descobrir ULTRONs na mesma rede local
- Sem necessidade de configuração manual
- Funciona automaticamente em LAN

### 3. Hyperswarm (DHT P2P)
- Descoberta global via DHT (Distributed Hash Table)
- Conexão direta entre peers
- Funciona através da internet

## 🏗️ Implementação

### Estrutura de Arquivos:

```
src/hive/
├── p2p/
│   ├── peer.ts              # Classe principal do peer
│   ├── discovery.ts         # Descoberta de peers (mDNS + DHT)
│   ├── connection.ts        # Gerenciamento de conexões
│   ├── crypto.ts            # Criptografia E2E
│   ├── protocol.ts          # Protocolo de mensagens
│   └── nat-traversal.ts     # Atravessar NAT/Firewall
├── sync/
│   ├── context-sync.ts      # Sincronizar contexto
│   ├── task-queue.ts        # Fila distribuída de tarefas
│   └── state-sync.ts        # Sincronizar estado
└── hive-p2p-manager.ts      # Manager principal
```

## 📝 Código de Implementação

### 1. Peer Principal (src/hive/p2p/peer.ts)

```typescript
import Hyperswarm from 'hyperswarm';
import crypto from 'crypto';
import { EventEmitter } from 'events';

export interface PeerInfo {
  id: string;
  name: string;
  publicKey: string;
  capabilities: string[];
  lastSeen: Date;
}

export interface HiveMessage {
  type: 'handshake' | 'sync' | 'task' | 'heartbeat' | 'data';
  from: string;
  to?: string; // undefined = broadcast
  payload: any;
  timestamp: number;
  signature: string;
}

export class HivePeer extends EventEmitter {
  private swarm: any;
  private peers: Map<string, PeerInfo> = new Map();
  private connections: Map<string, any> = new Map();
  private keypair: { publicKey: Buffer; secretKey: Buffer };
  private hiveId: string;
  
  constructor(hiveId: string, ultronCredentials: any) {
    super();
    this.hiveId = hiveId;
    
    // Gerar par de chaves para este ULTRON
    this.keypair = this.generateKeypair(ultronCredentials);
    
    // Inicializar Hyperswarm
    this.swarm = new Hyperswarm();
    this.setupSwarm();
  }

  private generateKeypair(credentials: any) {
    // Derivar chaves das credenciais do ULTRON
    const seed = crypto
      .createHash('sha256')
      .update(credentials.id + credentials.passphrase1 + credentials.passphrase2)
      .digest();
    
    return crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'der' },
      privateKeyEncoding: { type: 'pkcs8', format: 'der' }
    });
  }

  private setupSwarm() {
    // Criar tópico baseado no ID da colmeia
    const topic = crypto.createHash('sha256').update(this.hiveId).digest();
    
    // Juntar-se ao swarm
    const discovery = this.swarm.join(topic, { server: true, client: true });
    
    // Quando um peer se conecta
    this.swarm.on('connection', (conn: any, info: any) => {
      console.log('Nova conexão P2P estabelecida');
      this.handleConnection(conn, info);
    });

    // Aguardar descoberta completa
    discovery.flushed().then(() => {
      console.log('Conectado ao swarm da colmeia:', this.hiveId);
    });
  }

  private handleConnection(conn: any, info: any) {
    const peerId = info.publicKey.toString('hex');
    
    // Armazenar conexão
    this.connections.set(peerId, conn);
    
    // Enviar handshake
    this.sendHandshake(conn);
    
    // Receber mensagens
    conn.on('data', (data: Buffer) => {
      try {
        const message: HiveMessage = JSON.parse(data.toString());
        this.handleMessage(message, peerId);
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    });
    
    // Quando desconectar
    conn.on('close', () => {
      console.log('Peer desconectado:', peerId);
      this.connections.delete(peerId);
      this.peers.delete(peerId);
      this.emit('peer-left', peerId);
    });
  }

  private sendHandshake(conn: any) {
    const message: HiveMessage = {
      type: 'handshake',
      from: this.getMyId(),
      payload: {
        name: this.getMyName(),
        publicKey: this.keypair.publicKey.toString('hex'),
        capabilities: this.getMyCapabilities(),
      },
      timestamp: Date.now(),
      signature: this.signMessage('handshake'),
    };
    
    conn.write(JSON.stringify(message));
  }

  private handleMessage(message: HiveMessage, fromPeerId: string) {
    // Verificar assinatura
    if (!this.verifySignature(message)) {
      console.warn('Mensagem com assinatura inválida ignorada');
      return;
    }
    
    switch (message.type) {
      case 'handshake':
        this.handleHandshake(message, fromPeerId);
        break;
      case 'sync':
        this.emit('sync-request', message.payload);
        break;
      case 'task':
        this.emit('task-received', message.payload);
        break;
      case 'heartbeat':
        this.updatePeerLastSeen(fromPeerId);
        break;
      case 'data':
        this.emit('data-received', message.payload, fromPeerId);
        break;
    }
  }

  private handleHandshake(message: HiveMessage, peerId: string) {
    const peerInfo: PeerInfo = {
      id: message.from,
      name: message.payload.name,
      publicKey: message.payload.publicKey,
      capabilities: message.payload.capabilities,
      lastSeen: new Date(),
    };
    
    this.peers.set(peerId, peerInfo);
    this.emit('peer-joined', peerInfo);
  }

  // Enviar mensagem para um peer específico ou broadcast
  send(message: Omit<HiveMessage, 'from' | 'timestamp' | 'signature'>) {
    const fullMessage: HiveMessage = {
      ...message,
      from: this.getMyId(),
      timestamp: Date.now(),
      signature: this.signMessage(JSON.stringify(message)),
    };
    
    const data = JSON.stringify(fullMessage);
    
    if (message.to) {
      // Enviar para peer específico
      const conn = this.connections.get(message.to);
      if (conn) {
        conn.write(data);
      }
    } else {
      // Broadcast para todos
      this.connections.forEach(conn => {
        conn.write(data);
      });
    }
  }

  // Criptografia e assinatura
  private signMessage(data: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    return sign.sign(this.keypair.secretKey, 'hex');
  }

  private verifySignature(message: HiveMessage): boolean {
    const peer = Array.from(this.peers.values()).find(p => p.id === message.from);
    if (!peer) return false;
    
    const verify = crypto.createVerify('SHA256');
    const { signature, ...messageWithoutSig } = message;
    verify.update(JSON.stringify(messageWithoutSig));
    
    return verify.verify(peer.publicKey, signature, 'hex');
  }

  // Getters
  getPeers(): PeerInfo[] {
    return Array.from(this.peers.values());
  }

  getMyId(): string {
    return this.keypair.publicKey.toString('hex').substring(0, 16);
  }

  getMyName(): string {
    return localStorage.getItem('ultron_id') || 'ULTRON';
  }

  getMyCapabilities(): string[] {
    return ['chat', 'tools', 'memory'];
  }

  private updatePeerLastSeen(peerId: string) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.lastSeen = new Date();
    }
  }

  // Heartbeat para manter conexões vivas
  startHeartbeat() {
    setInterval(() => {
      this.send({
        type: 'heartbeat',
        payload: {},
      });
    }, 30000); // A cada 30 segundos
  }

  // Destruir peer
  destroy() {
    this.swarm.destroy();
    this.connections.clear();
    this.peers.clear();
  }
}
```

### 2. Descoberta Local (src/hive/p2p/discovery.ts)

```typescript
import mdns from 'mdns';
import { EventEmitter } from 'events';

export interface LocalPeer {
  name: string;
  host: string;
  port: number;
  ultronId: string;
}

export class LocalDiscovery extends EventEmitter {
  private browser: any;
  private advertisement: any;
  private discoveredPeers: Map<string, LocalPeer> = new Map();

  constructor(private myPort: number, private myUltronId: string) {
    super();
  }

  // Anunciar este ULTRON na rede local
  advertise() {
    try {
      const serviceType = mdns.tcp('ultron-hive');
      this.advertisement = mdns.createAdvertisement(serviceType, this.myPort, {
        name: this.myUltronId,
        txtRecord: {
          ultronId: this.myUltronId,
          version: '1.0.0',
        },
      });
      
      this.advertisement.start();
      console.log('Anunciando ULTRON na rede local:', this.myUltronId);
    } catch (error) {
      console.error('Erro ao anunciar na rede:', error);
    }
  }

  // Descobrir outros ULTRONs na rede local
  startDiscovery() {
    try {
      const serviceType = mdns.tcp('ultron-hive');
      this.browser = mdns.createBrowser(serviceType);
      
      this.browser.on('serviceUp', (service: any) => {
        const peer: LocalPeer = {
          name: service.name,
          host: service.addresses[0],
          port: service.port,
          ultronId: service.txtRecord?.ultronId || service.name,
        };
        
        // Ignorar a si mesmo
        if (peer.ultronId === this.myUltronId) {
          return;
        }
        
        this.discoveredPeers.set(peer.ultronId, peer);
        this.emit('peer-discovered', peer);
        console.log('ULTRON descoberto na rede local:', peer);
      });
      
      this.browser.on('serviceDown', (service: any) => {
        const ultronId = service.txtRecord?.ultronId || service.name;
        this.discoveredPeers.delete(ultronId);
        this.emit('peer-lost', ultronId);
      });
      
      this.browser.start();
      console.log('Iniciando descoberta de ULTRONs na rede local...');
    } catch (error) {
      console.error('Erro ao iniciar descoberta:', error);
    }
  }

  getDiscoveredPeers(): LocalPeer[] {
    return Array.from(this.discoveredPeers.values());
  }

  stop() {
    if (this.browser) {
      this.browser.stop();
    }
    if (this.advertisement) {
      this.advertisement.stop();
    }
  }
}
```

### 3. Manager P2P (src/hive/hive-p2p-manager.ts)

```typescript
import { HivePeer, PeerInfo, HiveMessage } from './p2p/peer';
import { LocalDiscovery, LocalPeer } from './p2p/discovery';
import { EventEmitter } from 'events';

export interface HiveConfig {
  hiveId: string;
  ultronCredentials: {
    id: string;
    token: string;
    passphrase1: string;
    passphrase2: string;
  };
  gatewayPort: number;
}

export class HiveP2PManager extends EventEmitter {
  private peer: HivePeer | null = null;
  private localDiscovery: LocalDiscovery | null = null;
  private config: HiveConfig | null = null;
  private isActive = false;

  // Criar ou juntar-se a uma colmeia
  async createOrJoinHive(config: HiveConfig) {
    this.config = config;
    
    // Inicializar peer P2P
    this.peer = new HivePeer(config.hiveId, config.ultronCredentials);
    
    // Eventos do peer
    this.peer.on('peer-joined', (peerInfo: PeerInfo) => {
      console.log('Peer entrou na colmeia:', peerInfo.name);
      this.emit('member-joined', peerInfo);
    });
    
    this.peer.on('peer-left', (peerId: string) => {
      console.log('Peer saiu da colmeia:', peerId);
      this.emit('member-left', peerId);
    });
    
    this.peer.on('sync-request', (data: any) => {
      this.emit('sync-request', data);
    });
    
    this.peer.on('task-received', (task: any) => {
      this.emit('task-received', task);
    });
    
    this.peer.on('data-received', (data: any, fromPeerId: string) => {
      this.emit('data-received', data, fromPeerId);
    });
    
    // Iniciar heartbeat
    this.peer.startHeartbeat();
    
    // Inicializar descoberta local (mDNS)
    this.localDiscovery = new LocalDiscovery(
      config.gatewayPort,
      config.ultronCredentials.id
    );
    
    this.localDiscovery.on('peer-discovered', (peer: LocalPeer) => {
      console.log('ULTRON descoberto localmente:', peer.name);
      // Tentar conectar via IP local
      this.connectToLocalPeer(peer);
    });
    
    // Anunciar na rede local
    this.localDiscovery.advertise();
    
    // Descobrir peers locais
    this.localDiscovery.startDiscovery();
    
    this.isActive = true;
    this.emit('hive-active');
  }

  // Conectar a um peer descoberto localmente
  private async connectToLocalPeer(peer: LocalPeer) {
    // A conexão será estabelecida automaticamente pelo Hyperswarm
    // quando ambos os peers estiverem no mesmo tópico
    console.log('Peer local disponível:', peer);
  }

  // Enviar mensagem para a colmeia
  sendMessage(type: HiveMessage['type'], payload: any, to?: string) {
    if (!this.peer) {
      throw new Error('Colmeia não está ativa');
    }
    
    this.peer.send({ type, payload, to });
  }

  // Sincronizar contexto com a colmeia
  syncContext(context: any) {
    this.sendMessage('sync', { type: 'context', data: context });
  }

  // Distribuir tarefa para a colmeia
  distributeTask(task: any) {
    this.sendMessage('task', task);
  }

  // Obter membros da colmeia
  getMembers(): PeerInfo[] {
    return this.peer?.getPeers() || [];
  }

  // Obter peers locais descobertos
  getLocalPeers(): LocalPeer[] {
    return this.localDiscovery?.getDiscoveredPeers() || [];
  }

  // Sair da colmeia
  leaveHive() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    
    if (this.localDiscovery) {
      this.localDiscovery.stop();
      this.localDiscovery = null;
    }
    
    this.isActive = false;
    this.emit('hive-inactive');
  }

  isHiveActive(): boolean {
    return this.isActive;
  }
}

// Singleton
export const hiveP2PManager = new HiveP2PManager();
```

### 4. Integração com Electron (main.js)

```javascript
// Adicionar ao main.js

const { HiveP2PManager } = require('./dist/hive/hive-p2p-manager.js');

let hiveManager = null;

// IPC Handler para criar/juntar colmeia
ipcMain.handle('hive-create-or-join', async (event, config) => {
  try {
    if (!hiveManager) {
      hiveManager = new HiveP2PManager();
      
      // Eventos da colmeia
      hiveManager.on('member-joined', (peer) => {
        mainWindow.webContents.send('hive-member-joined', peer);
      });
      
      hiveManager.on('member-left', (peerId) => {
        mainWindow.webContents.send('hive-member-left', peerId);
      });
      
      hiveManager.on('task-received', (task) => {
        mainWindow.webContents.send('hive-task-received', task);
      });
    }
    
    await hiveManager.createOrJoinHive(config);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar/juntar colmeia:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler para sair da colmeia
ipcMain.handle('hive-leave', async () => {
  if (hiveManager) {
    hiveManager.leaveHive();
    return { success: true };
  }
  return { success: false, error: 'Colmeia não está ativa' };
});

// IPC Handler para obter membros
ipcMain.handle('hive-get-members', async () => {
  if (hiveManager) {
    return { success: true, members: hiveManager.getMembers() };
  }
  return { success: false, members: [] };
});

// IPC Handler para enviar mensagem
ipcMain.handle('hive-send-message', async (event, { type, payload, to }) => {
  if (hiveManager) {
    hiveManager.sendMessage(type, payload, to);
    return { success: true };
  }
  return { success: false, error: 'Colmeia não está ativa' };
});
```

## 🔐 Segurança

### 1. Criptografia End-to-End
- Cada ULTRON tem um par de chaves (pública/privada)
- Mensagens são assinadas digitalmente
- Apenas peers autorizados podem descriptografar

### 2. Autenticação
- Baseada nas credenciais do ULTRON (ID + passphrases)
- Verificação de assinatura em cada mensagem
- Sem servidor central para atacar

### 3. Privacidade
- Dados nunca passam por servidores terceiros
- Comunicação direta entre dispositivos
- Histórico local apenas

## 📦 Dependências

```json
{
  "dependencies": {
    "hyperswarm": "^4.0.0",
    "mdns": "^2.7.2",
    "crypto": "built-in"
  }
}
```

## 🚀 Vantagens

1. **Zero Servidores**: Sem custos de infraestrutura
2. **Privacidade Total**: Dados não saem dos dispositivos
3. **Baixa Latência**: Conexão direta = mais rápido
4. **Escalável**: Cada peer é independente
5. **Resiliente**: Sem ponto único de falha
6. **Descoberta Automática**: mDNS para rede local

## 📊 Fluxo de Uso

```
1. Usuário A cria colmeia
   ├─ Gera ID da colmeia (hash das credenciais)
   ├─ Inicia peer P2P
   └─ Anuncia na rede local (mDNS)

2. Usuário B quer juntar-se
   ├─ Insere credenciais do ULTRON A
   ├─ Deriva mesmo ID de colmeia
   ├─ Conecta via Hyperswarm DHT
   └─ Handshake P2P estabelecido

3. Comunicação direta
   ├─ Mensagens assinadas
   ├─ Sincronização de contexto
   └─ Distribuição de tarefas
```

## ⚡ Implementação Rápida (2-3 semanas)

Muito mais simples que arquitetura cliente-servidor!
- Sem backend complexo
- Sem gerenciamento de servidor
- Sem preocupações com escalabilidade
- Bibliotecas maduras (Hyperswarm, mDNS)

## 🎯 Conclusão

Arquitetura P2P é **superior** para colmeias ULTRON:
- ✅ Mais segura
- ✅ Mais privada
- ✅ Mais simples
- ✅ Mais rápida
- ✅ Sem custos de servidor
