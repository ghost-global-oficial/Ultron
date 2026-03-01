// @ts-ignore - Bonjour types
import Bonjour from 'bonjour-service';
import { EventEmitter } from 'events';

export interface LocalPeer {
  name: string;
  host: string;
  port: number;
  ultronId: string;
}

export class LocalDiscovery extends EventEmitter {
  private bonjour: any;
  private browser: any;
  private service: any;
  private discoveredPeers: Map<string, LocalPeer> = new Map();

  constructor(private myPort: number, private myUltronId: string) {
    super();
    // @ts-ignore - Bonjour constructor
    this.bonjour = new Bonjour();
  }

  // Anunciar este ULTRON na rede local
  advertise() {
    try {
      // @ts-ignore - Bonjour instance
      this.service = this.bonjour.publish({
        name: this.myUltronId,
        type: 'ultron-hive',
        port: this.myPort,
        txt: {
          ultronId: this.myUltronId,
          version: '1.0.0',
        },
      });
      
      console.log('Anunciando ULTRON na rede local:', this.myUltronId);
    } catch (error) {
      console.error('Erro ao anunciar na rede:', error);
    }
  }

  // Descobrir outros ULTRONs na rede local
  startDiscovery() {
    try {
      this.browser = this.bonjour.find({ type: 'ultron-hive' });
      
      this.browser.on('up', (service: any) => {
        const peer: LocalPeer = {
          name: service.name,
          host: service.referer?.address || service.host,
          port: service.port,
          ultronId: service.txt?.ultronId || service.name,
        };
        
        // Ignorar a si mesmo
        if (peer.ultronId === this.myUltronId) {
          return;
        }
        
        this.discoveredPeers.set(peer.ultronId, peer);
        this.emit('peer-discovered', peer);
        console.log('ULTRON descoberto na rede local:', peer);
      });
      
      this.browser.on('down', (service: any) => {
        const ultronId = service.txt?.ultronId || service.name;
        this.discoveredPeers.delete(ultronId);
        this.emit('peer-lost', ultronId);
      });
      
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
    if (this.service) {
      this.bonjour.unpublishAll();
    }
    if (this.bonjour) {
      this.bonjour.destroy();
    }
  }
}
