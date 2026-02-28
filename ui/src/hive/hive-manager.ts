/**
 * Sistema de gerenciamento de Colmeia (Hive)
 * Permite que múltiplos ULTRONs trabalhem em conjunto
 */

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
  };
  private ws: WebSocket | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
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

  // Criar colmeia
  createHive(): void {
    this.state = {
      created: true,
      createdAt: new Date().toISOString(),
    };
    this.saveToStorage();
    this.notifyListeners();
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

  // Conectar à colmeia
  async connectToHive(address: string, accessKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Fechar conexão existente
        if (this.ws) {
          this.ws.close();
        }

        // Criar nova conexão WebSocket
        this.ws = new WebSocket(address);

        this.ws.onopen = () => {
          // Enviar autenticação
          this.ws?.send(JSON.stringify({
            type: 'auth',
            accessKey: accessKey,
          }));
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'auth_success') {
              this.connection = {
                address,
                accessKey,
                connected: true,
              };
              this.saveToStorage();
              this.notifyListeners();
              resolve();
            } else if (data.type === 'auth_failed') {
              reject(new Error('Autenticação falhou'));
            } else if (data.type === 'members_update') {
              this.members = data.members;
              this.saveToStorage();
              this.notifyListeners();
            }
          } catch (error) {
            console.error('Erro ao processar mensagem:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Erro na conexão WebSocket:', error);
          reject(new Error('Erro na conexão'));
        };

        this.ws.onclose = () => {
          if (this.connection) {
            this.connection.connected = false;
            this.saveToStorage();
            this.notifyListeners();
          }
        };

        // Timeout de 10 segundos
        setTimeout(() => {
          if (!this.connection?.connected) {
            reject(new Error('Timeout na conexão'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Desconectar da colmeia
  disconnectFromHive(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connection = null;
    localStorage.removeItem('hive_connection');
    this.notifyListeners();
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
