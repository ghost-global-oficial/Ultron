import { HivePeer, PeerInfo, HiveMessage } from './p2p/peer.js';
import { LocalDiscovery, LocalPeer } from './p2p/discovery.js';
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
    
    // Inicializar descoberta local (Bonjour)
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
