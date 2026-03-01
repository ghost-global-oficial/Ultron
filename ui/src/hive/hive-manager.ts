/**
 * Sistema de gerenciamento de Colmeia (Hive) - P2P
 * Permite que múltiplos ULTRONs trabalhem em conjunto via comunicação P2P
 */

// @ts-ignore - Electron IPC
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

export interface HiveMember {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'connecting';
  role: 'coordinator' | 'worker';
  lastSeen: string;
  address: string;
  capabilities: string[];
}

export interface HiveConfig {
  autoSync: boolean;
  screenSharing: boolean;
  memorySharing: boolean;
}

export interface HiveConnection {
  address: string;
  accessKey: string;
  connected: boolean;
}

export interface HiveState {
  created: boolean;
  createdAt?: string;
  p2pActive?: boolean;
}

class HiveManager {
  private members: HiveMember[] = [];
  private config: HiveConfig = {
    autoSync: true,
    screenSharing: false,
    memorySharing: true,
  };
  private connection: HiveConnection | null = null;
  private state: HiveState = {
    created: false,
    p2pActive: false,
  };
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.setupIPCListeners();
  }

  // Configurar listeners IPC para eventos P2P
  private setupIPCListeners(): void {
    if (!ipcRenderer) return;

    // Membro entrou na colmeia
    ipcRenderer.on('hive-member-joined', (_event: any, peer: any) => {
      console.log('Membro P2P entrou:', peer);
      
      const member: HiveMember = {
        id: peer.id,
        name: peer.name,
        status: 'online',
        role: 'worker',
        lastSeen: new Date().toISOString(),
        address: 'p2p',
        capabilities: peer.capabilities || [],
      };
      
      this.members.push(member);
      this.saveToStorage();
      this.notifyListeners();
    });

    // Membro saiu da colmeia
    ipcRenderer.on('hive-member-left', (_event: any, peerId: string) => {
      console.log('Membro P2P saiu:', peerId);
      this.members = this.members.filter(m => m.id !== peerId);
      this.saveToStorage();
      this.notifyListeners();
    });

    // Status da colmeia mudou
    ipcRenderer.on('hive-status-changed', (_event: any, { active }: { active: boolean }) => {
      console.log('Status P2P mudou:', active);
      this.state.p2pActive = active;
      this.saveToStorage();
      this.notifyListeners();
    });

    // Tarefa recebida
    ipcRenderer.on('hive-task-received', (_event: any, task: any) => {
      console.log('Tarefa P2P recebida:', task);
      // Emitir evento para a UI processar
      this.notifyListeners();
    });

    // Dados recebidos
    ipcRenderer.on('hive-data-received', (_event: any, { data, fromPeerId }: any) => {
      console.log('Dados P2P recebidos de:', fromPeerId, data);
      this.notifyListeners();
    });
  }

  // Carregar dados do localStorage
  private loadFromStorage(): void {
    try {
      const savedMembers = localStorage.getItem('hive_members');
      if (savedMembers) {
        this.members = JSON.parse(savedMembers);
      }

      const savedConfig = localStorage.getItem('hive_config');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
      }

      const savedConnection = localStorage.getItem('hive_connection');
      if (savedConnection) {
        this.connection = JSON.parse(savedConnection);
      }

      const savedState = localStorage.getItem('hive_state');
      if (savedState) {
        this.state = JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da colmeia:', error);
    }
  }

  // Salvar dados no localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem('hive_members', JSON.stringify(this.members));
      localStorage.setItem('hive_config', JSON.stringify(this.config));
      localStorage.setItem('hive_state', JSON.stringify(this.state));
      if (this.connection) {
        localStorage.setItem('hive_connection', JSON.stringify(this.connection));
      }
    } catch (error) {
      console.error('Erro ao salvar dados da colmeia:', error);
    }
  }

  // Notificar listeners sobre mudanças
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Adicionar listener para mudanças
  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Obter todos os membros
  getMembers(): HiveMember[] {
    return [...this.members];
  }

  // Obter configurações
  getConfig(): HiveConfig {
    return { ...this.config };
  }

  // Obter conexão
  getConnection(): HiveConnection | null {
    return this.connection ? { ...this.connection } : null;
  }

  // Obter estado
  getState(): HiveState {
    return { ...this.state };
  }

  // Criar colmeia P2P
  async createHive(ultronCredentials?: any): Promise<void> {
    this.state = {
      created: true,
      createdAt: new Date().toISOString(),
      p2pActive: false,
    };
    this.saveToStorage();
    this.notifyListeners();

    // Se temos IPC e credenciais, criar colmeia P2P
    if (ipcRenderer && ultronCredentials) {
      try {
        const config = {
          hiveId: ultronCredentials.id,
          ultronCredentials: {
            id: ultronCredentials.id,
            token: ultronCredentials.token,
            passphrase1: ultronCredentials.passphrase1,
            passphrase2: ultronCredentials.passphrase2,
          },
          gatewayPort: ultronCredentials.gatewayPort || 18789,
        };

        const result = await ipcRenderer.invoke('hive-create-or-join', config);
        
        if (result.success) {
          console.log('✓ Colmeia P2P criada com sucesso!');
          this.state.p2pActive = true;
          this.saveToStorage();
          this.notifyListeners();
        } else {
          console.error('❌ Erro ao criar colmeia P2P:', result.error);
        }
      } catch (error) {
        console.error('❌ Exceção ao criar colmeia P2P:', error);
      }
    }
  }

  // Adicionar membro
  addMember(member: Omit<HiveMember, 'id' | 'lastSeen'>): void {
    const newMember: HiveMember = {
      ...member,
      id: `ultron-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      lastSeen: new Date().toISOString(),
    };

    this.members.push(newMember);
    this.saveToStorage();
    this.notifyListeners();
  }

  // Remover membro
  removeMember(id: string): void {
    this.members = this.members.filter(m => m.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  // Atualizar status do membro
  updateMemberStatus(id: string, status: HiveMember['status']): void {
    const member = this.members.find(m => m.id === id);
    if (member) {
      member.status = status;
      member.lastSeen = new Date().toISOString();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // Atualizar configuração
  updateConfig(config: Partial<HiveConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveToStorage();
    this.notifyListeners();
  }

  // Conectar à colmeia (mantido para compatibilidade, mas agora usa P2P)
  async connectToHive(address: string, accessKey: string): Promise<void> {
    // Para P2P, o "address" é o ID do ULTRON e "accessKey" são as credenciais
    if (ipcRenderer) {
      try {
        const config = {
          hiveId: address,
          ultronCredentials: JSON.parse(accessKey), // Credenciais em JSON
          gatewayPort: 18789,
        };

        const result = await ipcRenderer.invoke('hive-create-or-join', config);
        
        if (result.success) {
          this.connection = {
            address,
            accessKey,
            connected: true,
          };
          this.state.p2pActive = true;
          this.saveToStorage();
          this.notifyListeners();
        } else {
          throw new Error(result.error || 'Falha ao conectar');
        }
      } catch (error) {
        console.error('❌ Erro ao conectar à colmeia P2P:', error);
        throw error;
      }
    } else {
      throw new Error('IPC não disponível');
    }
  }

  // Desconectar da colmeia
  async disconnectFromHive(): Promise<void> {
    if (ipcRenderer) {
      try {
        await ipcRenderer.invoke('hive-leave');
      } catch (error) {
        console.error('❌ Erro ao desconectar:', error);
      }
    }
    
    this.connection = null;
    this.state.p2pActive = false;
    localStorage.removeItem('hive_connection');
    this.notifyListeners();
  }

  // Enviar mensagem P2P
  async sendP2PMessage(type: string, payload: any, to?: string): Promise<void> {
    if (ipcRenderer && this.state.p2pActive) {
      try {
        await ipcRenderer.invoke('hive-send-message', { type, payload, to });
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem P2P:', error);
      }
    }
  }

  // Sincronizar contexto via P2P
  async syncContextP2P(context: any): Promise<void> {
    if (ipcRenderer && this.state.p2pActive) {
      try {
        await ipcRenderer.invoke('hive-sync-context', context);
      } catch (error) {
        console.error('❌ Erro ao sincronizar contexto:', error);
      }
    }
  }

  // Distribuir tarefa via P2P
  async distributeTaskP2P(task: any): Promise<void> {
    if (ipcRenderer && this.state.p2pActive) {
      try {
        await ipcRenderer.invoke('hive-distribute-task', task);
      } catch (error) {
        console.error('❌ Erro ao distribuir tarefa:', error);
      }
    }
  }

  // Obter membros P2P
  async getP2PMembers(): Promise<HiveMember[]> {
    if (ipcRenderer && this.state.p2pActive) {
      try {
        const result = await ipcRenderer.invoke('hive-get-members');
        if (result.success) {
          return result.members.map((peer: any) => ({
            id: peer.id,
            name: peer.name,
            status: 'online' as const,
            role: 'worker' as const,
            lastSeen: peer.lastSeen,
            address: 'p2p',
            capabilities: peer.capabilities,
          }));
        }
      } catch (error) {
        console.error('❌ Erro ao obter membros P2P:', error);
      }
    }
    return [];
  }

  // Formatar tempo relativo
  static formatRelativeTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 10) return 'Agora';
    if (diffSecs < 60) return `${diffSecs} seg atrás`;
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  }
}

// Instância singleton
export const hiveManager = new HiveManager();

// Exportar a classe também para acesso aos métodos estáticos
export { HiveManager };
