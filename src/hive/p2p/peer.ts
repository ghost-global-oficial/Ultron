// @ts-ignore - Hyperswarm types
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
    // Derivar seed das credenciais do ULTRON
    const seed = crypto
      .createHash('sha256')
      .update(credentials.id + credentials.passphrase1 + credentials.passphrase2)
      .digest();
    
    // Gerar par de chaves RSA para criptografia E2E
    // (Ed25519 é apenas para assinatura, RSA permite criptografia)
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'der' },
      privateKeyEncoding: { type: 'pkcs8', format: 'der' }
    });
    
    return {
      publicKey: keyPair.publicKey as Buffer,
      secretKey: keyPair.privateKey as Buffer
    };
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
    
    // Descriptografar payload
    let decryptedPayload;
    try {
      decryptedPayload = this.decryptPayload(message.payload, message.from);
    } catch (error) {
      console.error('Erro ao descriptografar mensagem:', error);
      return;
    }
    
    switch (message.type) {
      case 'handshake':
        this.handleHandshake({ ...message, payload: decryptedPayload }, fromPeerId);
        break;
      case 'sync':
        this.emit('sync-request', decryptedPayload);
        break;
      case 'task':
        this.emit('task-received', decryptedPayload);
        break;
      case 'heartbeat':
        this.updatePeerLastSeen(fromPeerId);
        break;
      case 'data':
        this.emit('data-received', decryptedPayload, fromPeerId);
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
    // Criptografar payload antes de enviar
    const encryptedPayload = this.encryptPayload(message.payload, message.to);
    
    const fullMessage: HiveMessage = {
      ...message,
      payload: encryptedPayload,
      from: this.getMyId(),
      timestamp: Date.now(),
      signature: this.signMessage(JSON.stringify({ ...message, payload: encryptedPayload })),
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

  // Criptografia End-to-End do payload
  private encryptPayload(payload: any, targetPeerId?: string): string {
    const payloadStr = JSON.stringify(payload);
    
    if (targetPeerId) {
      // Mensagem direta: criptografar com chave pública do destinatário
      const peer = Array.from(this.peers.values()).find(p => p.id === targetPeerId);
      if (!peer) {
        throw new Error('Peer não encontrado para criptografia');
      }
      
      // Usar criptografia híbrida: AES para dados + RSA para chave AES
      const aesKey = crypto.randomBytes(32);
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
      let encrypted = cipher.update(payloadStr, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Criptografar a chave AES com a chave pública do peer
      const publicKey = crypto.createPublicKey({
        key: Buffer.from(peer.publicKey, 'hex'),
        format: 'der',
        type: 'spki'
      });
      
      const encryptedKey = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        aesKey
      );
      
      return JSON.stringify({
        encrypted: true,
        data: encrypted,
        key: encryptedKey.toString('hex'),
        iv: iv.toString('hex'),
        type: 'direct'
      });
    } else {
      // Broadcast: criptografar com chave derivada das credenciais da colmeia
      const sharedKey = crypto.createHash('sha256')
        .update(this.hiveId + 'broadcast-key')
        .digest();
      
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', sharedKey, iv);
      let encrypted = cipher.update(payloadStr, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return JSON.stringify({
        encrypted: true,
        data: encrypted,
        iv: iv.toString('hex'),
        type: 'broadcast'
      });
    }
  }

  private decryptPayload(encryptedPayload: any, fromPeerId: string): any {
    // Se não estiver criptografado (handshake inicial), retornar direto
    if (typeof encryptedPayload !== 'string') {
      return encryptedPayload;
    }
    
    try {
      const parsed = JSON.parse(encryptedPayload);
      
      if (!parsed.encrypted) {
        return parsed;
      }
      
      if (parsed.type === 'direct') {
        // Mensagem direta: descriptografar com chave privada
        const encryptedKey = Buffer.from(parsed.key, 'hex');
        const iv = Buffer.from(parsed.iv, 'hex');
        
        const privateKey = crypto.createPrivateKey({
          key: this.keypair.secretKey,
          format: 'der',
          type: 'pkcs8'
        });
        
        const aesKey = crypto.privateDecrypt(
          {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
          },
          encryptedKey
        );
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
        let decrypted = decipher.update(parsed.data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
      } else {
        // Broadcast: descriptografar com chave compartilhada
        const sharedKey = crypto.createHash('sha256')
          .update(this.hiveId + 'broadcast-key')
          .digest();
        
        const iv = Buffer.from(parsed.iv, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', sharedKey, iv);
        let decrypted = decipher.update(parsed.data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
      }
    } catch (error) {
      console.error('Erro ao descriptografar payload:', error);
      throw error;
    }
  }

  // Getters
  getPeers(): PeerInfo[] {
    return Array.from(this.peers.values());
  }

  getMyId(): string {
    return this.keypair.publicKey.toString('hex').substring(0, 16);
  }

  getMyName(): string {
    return process.env.ULTRON_ID || 'ULTRON';
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
