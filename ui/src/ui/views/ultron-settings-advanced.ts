import { html } from "lit";
import { icons } from "../icons";

export type UltronSettingsSection = 
  | "account"
  | "scheduled-tasks"
  | "data-control"
  | "personalization"
  | "skills"
  | "connectors"
  | "integrations"
  | "help";

export type UltronSettingsAdvancedProps = {
  activeSection: UltronSettingsSection;
  settings: {
    theme: string;
    language: string;
    chatFocusMode: boolean;
    chatShowThinking: boolean;
    navCollapsed: boolean;
    autoSave: boolean;
    notifications: boolean;
    soundEffects: boolean;
  };
  onSectionChange: (section: UltronSettingsSection) => void;
  onSettingChange: (key: string, value: any) => void;
  onSave: () => void;
  onClose: () => void;
};

export function renderUltronSettingsAdvanced(props: UltronSettingsAdvancedProps) {
  return html`
    <div class="ultron-settings-advanced">
      <!-- Sidebar de navegação -->
      <div class="ultron-settings-advanced__sidebar">
        <div class="ultron-settings-advanced__sidebar-header">
          <h2>Colmeia</h2>
          <button 
            class="ultron-settings-advanced__close-btn"
            @click=${props.onClose}
            title="Fechar"
          >
            ${icons.x}
          </button>
        </div>
        
        <nav class="ultron-settings-advanced__nav">
          ${renderNavItem({
            section: "account",
            icon: icons.user,
            label: "Conta",
            active: props.activeSection === "account",
            onClick: () => props.onSectionChange("account")
          })}
          
          ${renderNavItem({
            section: "scheduled-tasks",
            icon: icons.clock,
            label: "Tarefas agendadas",
            active: props.activeSection === "scheduled-tasks",
            onClick: () => props.onSectionChange("scheduled-tasks")
          })}
          
          ${renderNavItem({
            section: "data-control",
            icon: icons.database,
            label: "Controlo de dados",
            active: props.activeSection === "data-control",
            onClick: () => props.onSectionChange("data-control")
          })}
          
          ${renderNavItem({
            section: "personalization",
            icon: icons.palette,
            label: "Personalização",
            active: props.activeSection === "personalization",
            onClick: () => props.onSectionChange("personalization")
          })}
          
          ${renderNavItem({
            section: "skills",
            icon: icons.zap,
            label: "Habilidades",
            active: props.activeSection === "skills",
            onClick: () => props.onSectionChange("skills")
          })}
          
          ${renderNavItem({
            section: "connectors",
            icon: icons.link,
            label: "Conectores",
            active: props.activeSection === "connectors",
            onClick: () => props.onSectionChange("connectors")
          })}
          
          ${renderNavItem({
            section: "integrations",
            icon: icons.grid,
            label: "Integrações",
            active: props.activeSection === "integrations",
            onClick: () => props.onSectionChange("integrations")
          })}
          
          ${renderNavItem({
            section: "help",
            icon: icons.helpCircle,
            label: "Obter ajuda",
            active: props.activeSection === "help",
            onClick: () => props.onSectionChange("help")
          })}
        </nav>
      </div>
      
      <!-- Conteúdo principal -->
      <div class="ultron-settings-advanced__content">
        ${renderSectionContent(props)}
      </div>
    </div>
  `;
}

function renderNavItem(params: {
  section: string;
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return html`
    <button
      class="ultron-settings-advanced__nav-item ${params.active ? 'ultron-settings-advanced__nav-item--active' : ''}"
      @click=${params.onClick}
    >
      <span class="ultron-settings-advanced__nav-icon">${params.icon}</span>
      <span class="ultron-settings-advanced__nav-label">${params.label}</span>
    </button>
  `;
}

function renderSectionContent(props: UltronSettingsAdvancedProps) {
  switch (props.activeSection) {
    case "account":
      return renderAccountSection(props);
    case "scheduled-tasks":
      return renderScheduledTasksSection(props);
    case "data-control":
      return renderDataControlSection(props);
    case "personalization":
      return renderPersonalizationSection(props);
    case "skills":
      return renderSkillsSection(props);
    case "connectors":
      return renderConnectorsSection(props);
    case "integrations":
      return renderIntegrationsSection(props);
    case "help":
      return renderHelpSection(props);
    default:
      return html`<div>Seção não encontrada</div>`;
  }
}

// Seção: Conta
function renderAccountSection(props: UltronSettingsAdvancedProps) {
  return html`
    <div class="ultron-settings-section">
      <h2 class="ultron-settings-section__title">Conta</h2>
      <p class="ultron-settings-section__description">
        Gerencie suas informações de conta e preferências
      </p>
      
      <div class="ultron-settings-card">
        <h3>Informações da conta</h3>
        
        <div class="ultron-settings-item">
          <label>Nome de usuário</label>
          <input type="text" placeholder="Seu nome" class="ultron-settings-input" />
        </div>
        
        <div class="ultron-settings-item">
          <label>Email</label>
          <input type="email" placeholder="seu@email.com" class="ultron-settings-input" />
        </div>
        
        <div class="ultron-settings-item">
          <label>Senha</label>
          <button class="btn btn-secondary">Alterar senha</button>
        </div>
      </div>
      
      <div class="ultron-settings-card">
        <h3>Preferências de conta</h3>
        
        <div class="ultron-settings-item">
          <div class="ultron-settings-item-info">
            <label>Sincronização na nuvem</label>
            <span class="ultron-settings-description">
              Sincronizar configurações entre dispositivos
            </span>
          </div>
          <label class="ultron-settings-toggle">
            <input type="checkbox" />
            <span class="ultron-settings-toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  `;
}

// Seção: Tarefas agendadas
function renderScheduledTasksSection(props: UltronSettingsAdvancedProps) {
  return html`
    <div class="ultron-settings-section">
      <h2 class="ultron-settings-section__title">Tarefas agendadas</h2>
      <p class="ultron-settings-section__description">
        Configure tarefas automáticas e agendamentos
      </p>
      
      <div class="ultron-settings-card">
        <div class="ultron-settings-card-header">
          <h3>Suas tarefas agendadas</h3>
          <button class="btn btn-primary btn-sm">
            ${icons.plus}
            Nova tarefa
          </button>
        </div>
        
        <div class="ultron-settings-empty">
          <span class="ultron-settings-empty-icon">${icons.clock}</span>
          <p>Nenhuma tarefa agendada</p>
          <span class="ultron-settings-empty-hint">
            Crie tarefas automáticas para executar em horários específicos
          </span>
        </div>
      </div>
    </div>
  `;
}

// Seção: Controlo de dados
function renderDataControlSection(props: UltronSettingsAdvancedProps) {
  return html`
    <div class="ultron-settings-section">
      <h2 class="ultron-settings-section__title">Controlo de dados</h2>
      <p class="ultron-settings-section__description">
        Gerencie seus dados e privacidade
      </p>
      
      <div class="ultron-settings-card">
        <h3>Armazenamento</h3>
        
        <div class="ultron-settings-storage">
          <div class="ultron-settings-storage-bar">
            <div class="ultron-settings-storage-used" style="width: 35%"></div>
          </div>
          <p class="ultron-settings-storage-text">
            3.5 GB de 10 GB utilizados
          </p>
        </div>
        
        <div class="ultron-settings-item">
          <button class="btn btn-secondary">
            ${icons.trash}
            Limpar cache
          </button>
        </div>
      </div>
      
      <div class="ultron-settings-card">
        <h3>Privacidade</h3>
        
        <div class="ultron-settings-item">
          <div class="ultron-settings-item-info">
            <label>Histórico de conversas</label>
            <span class="ultron-settings-description">
              Salvar histórico de todas as conversas
            </span>
          </div>
          <label class="ultron-settings-toggle">
            <input type="checkbox" checked />
            <span class="ultron-settings-toggle-slider"></span>
          </label>
        </div>
        
        <div class="ultron-settings-item">
          <div class="ultron-settings-item-info">
            <label>Telemetria</label>
            <span class="ultron-settings-description">
              Enviar dados de uso para melhorar o ULTRON
            </span>
          </div>
          <label class="ultron-settings-toggle">
            <input type="checkbox" />
            <span class="ultron-settings-toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="ultron-settings-card ultron-settings-card--danger">
        <h3>Zona de perigo</h3>
        
        <div class="ultron-settings-item">
          <div class="ultron-settings-item-info">
            <label>Exportar dados</label>
            <span class="ultron-settings-description">
              Baixar todos os seus dados
            </span>
          </div>
          <button class="btn btn-secondary">Exportar</button>
        </div>
        
        <div class="ultron-settings-item">
          <div class="ultron-settings-item-info">
            <label>Apagar todos os dados</label>
            <span class="ultron-settings-description">
              Esta ação não pode ser desfeita
            </span>
          </div>
          <button class="btn btn-danger">Apagar tudo</button>
        </div>
      </div>
    </div>
  `;
}

// Seção: Personalização
function renderPersonalizationSection(props: UltronSettingsAdvancedProps) {
  return html`
    <div class="ultron-settings-section">
      <h2 class="ultron-settings-section__title">Personalização</h2>
      <p class="ultron-settings-section__description">
        Personalize a aparência e comportamento do ULTRON
      </p>
      
      <div class="ultron-settings-card">
        <h3>Aparência</h3>
        
        <div class="ultron-settings-item">
          <label>Tema</label>
          <select class="ultron-settings-select" .value=${props.settings.theme}
            @change=${(e: Event) => {
              const target = e.target as HTMLSelectElement;
              props.onSettingChange("theme", target.value);
            }}
          >
            <option value="system">Sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </div>
        
        <div class="ultron-settings-item">
          <label>Idioma</label>
          <select class="ultron-settings-select" .value=${props.settings.language}
            @change=${(e: Event) => {
              const target = e.target as HTMLSelectElement;
              props.onSettingChange("language", target.value);
            }}
          >
            <option value="pt">Português</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>
      
      <div class="ultron-settings-card">
        <h3>Comportamento</h3>
        
        <div class="ultron-settings-item">
          <div class="ultron-settings-item-info">
            <label>Modo foco</label>
            <span class="ultron-settings-description">
              Ocultar elementos da interface para focar no chat
            </span>
          </div>
          <label class="ultron-settings-toggle">
            <input type="checkbox" .checked=${props.settings.chatFocusMode}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                props.onSettingChange("chatFocusMode", target.checked);
              }}
            />
            <span class="ultron-settings-toggle-slider"></span>
          </label>
        </div>
        
        <div class="ultron-settings-item">
          <div class="ultron-settings-item-info">
            <label>Mostrar raciocínio</label>
            <span class="ultron-settings-description">
              Exibir o processo de raciocínio da IA
            </span>
          </div>
          <label class="ultron-settings-toggle">
            <input type="checkbox" .checked=${props.settings.chatShowThinking}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                props.onSettingChange("chatShowThinking", target.checked);
              }}
            />
            <span class="ultron-settings-toggle-slider"></span>
          </label>
        </div>
        
        <div class="ultron-settings-item">
          <div class="ultron-settings-item-info">
            <label>Notificações</label>
            <span class="ultron-settings-description">
              Receber notificações do sistema
            </span>
          </div>
          <label class="ultron-settings-toggle">
            <input type="checkbox" .checked=${props.settings.notifications}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                props.onSettingChange("notifications", target.checked);
              }}
            />
            <span class="ultron-settings-toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  `;
}

// Seção: Habilidades
function renderSkillsSection(props: UltronSettingsAdvancedProps) {
  return html`
    <div class="ultron-settings-section">
      <h2 class="ultron-settings-section__title">Habilidades</h2>
      <p class="ultron-settings-section__description">
        Gerencie as habilidades e capacidades do ULTRON
      </p>
      
      <div class="ultron-settings-card">
        <div class="ultron-settings-card-header">
          <h3>Habilidades ativas</h3>
          <button class="btn btn-primary btn-sm">
            ${icons.plus}
            Adicionar habilidade
          </button>
        </div>
        
        <div class="ultron-settings-skills-grid">
          ${renderSkillCard({
            name: "Análise de código",
            description: "Analisar e revisar código fonte",
            enabled: true,
            icon: icons.code
          })}
          
          ${renderSkillCard({
            name: "Geração de imagens",
            description: "Criar imagens com IA",
            enabled: false,
            icon: icons.image
          })}
          
          ${renderSkillCard({
            name: "Pesquisa web",
            description: "Buscar informações na internet",
            enabled: true,
            icon: icons.search
          })}
        </div>
      </div>
    </div>
  `;
}

function renderSkillCard(params: {
  name: string;
  description: string;
  enabled: boolean;
  icon: any;
}) {
  return html`
    <div class="ultron-settings-skill-card ${params.enabled ? 'ultron-settings-skill-card--enabled' : ''}">
      <div class="ultron-settings-skill-icon">${params.icon}</div>
      <div class="ultron-settings-skill-info">
        <h4>${params.name}</h4>
        <p>${params.description}</p>
      </div>
      <label class="ultron-settings-toggle">
        <input type="checkbox" .checked=${params.enabled} />
        <span class="ultron-settings-toggle-slider"></span>
      </label>
    </div>
  `;
}

// Seção: Conectores
function renderConnectorsSection(props: UltronSettingsAdvancedProps) {
  return html`
    <div class="ultron-settings-section">
      <h2 class="ultron-settings-section__title">Conectores</h2>
      <p class="ultron-settings-section__description">
        Configure conexões com serviços externos
      </p>
      
      <div class="ultron-settings-card">
        <div class="ultron-settings-card-header">
          <h3>Conectores disponíveis</h3>
          <button class="btn btn-primary btn-sm">
            ${icons.plus}
            Adicionar conector
          </button>
        </div>
        
        <div class="ultron-settings-connectors-list">
          ${renderConnectorItem({
            name: "OpenRouter",
            description: "Acesso a múltiplos modelos de IA",
            connected: true,
            icon: icons.zap
          })}
          
          ${renderConnectorItem({
            name: "Google Drive",
            description: "Armazenamento em nuvem",
            connected: false,
            icon: icons.cloud
          })}
          
          ${renderConnectorItem({
            name: "GitHub",
            description: "Repositórios de código",
            connected: false,
            icon: icons.github
          })}
        </div>
      </div>
    </div>
  `;
}

function renderConnectorItem(params: {
  name: string;
  description: string;
  connected: boolean;
  icon: any;
}) {
  return html`
    <div class="ultron-settings-connector-item">
      <div class="ultron-settings-connector-icon">${params.icon}</div>
      <div class="ultron-settings-connector-info">
        <h4>${params.name}</h4>
        <p>${params.description}</p>
      </div>
      <div class="ultron-settings-connector-status">
        ${params.connected 
          ? html`
            <span class="ultron-settings-status-badge ultron-settings-status-badge--success">
              Conectado
            </span>
            <button class="btn btn-secondary btn-sm">Configurar</button>
          `
          : html`
            <button class="btn btn-primary btn-sm">Conectar</button>
          `
        }
      </div>
    </div>
  `;
}

// Seção: Integrações
function renderIntegrationsSection(props: UltronSettingsAdvancedProps) {
  return html`
    <div class="ultron-settings-section">
      <h2 class="ultron-settings-section__title">Integrações</h2>
      <p class="ultron-settings-section__description">
        Integre o ULTRON com outras ferramentas e serviços
      </p>
      
      <div class="ultron-settings-card">
        <h3>Integrações populares</h3>
        
        <div class="ultron-settings-integrations-grid">
          ${renderIntegrationCard({
            name: "Slack",
            description: "Receba notificações no Slack",
            icon: icons.messageSquare
          })}
          
          ${renderIntegrationCard({
            name: "Notion",
            description: "Sincronize notas com Notion",
            icon: icons.fileText
          })}
          
          ${renderIntegrationCard({
            name: "Zapier",
            description: "Automatize workflows",
            icon: icons.zap
          })}
        </div>
      </div>
    </div>
  `;
}

function renderIntegrationCard(params: {
  name: string;
  description: string;
  icon: any;
}) {
  return html`
    <div class="ultron-settings-integration-card">
      <div class="ultron-settings-integration-icon">${params.icon}</div>
      <h4>${params.name}</h4>
      <p>${params.description}</p>
      <button class="btn btn-secondary btn-sm">Configurar</button>
    </div>
  `;
}

// Seção: Obter ajuda
function renderHelpSection(props: UltronSettingsAdvancedProps) {
  return html`
    <div class="ultron-settings-section">
      <h2 class="ultron-settings-section__title">Obter ajuda</h2>
      <p class="ultron-settings-section__description">
        Recursos e suporte para o ULTRON
      </p>
      
      <div class="ultron-settings-card">
        <h3>Recursos</h3>
        
        <div class="ultron-settings-help-links">
          <a href="#" class="ultron-settings-help-link">
            ${icons.book}
            <div>
              <h4>Documentação</h4>
              <p>Guias e tutoriais completos</p>
            </div>
            ${icons.externalLink}
          </a>
          
          <a href="#" class="ultron-settings-help-link">
            ${icons.messageCircle}
            <div>
              <h4>Comunidade</h4>
              <p>Participe das discussões</p>
            </div>
            ${icons.externalLink}
          </a>
          
          <a href="#" class="ultron-settings-help-link">
            ${icons.mail}
            <div>
              <h4>Suporte</h4>
              <p>Entre em contato conosco</p>
            </div>
            ${icons.externalLink}
          </a>
        </div>
      </div>
      
      <div class="ultron-settings-card">
        <h3>Sobre o ULTRON</h3>
        
        <div class="ultron-settings-about">
          <div class="ultron-settings-about-item">
            <span class="ultron-settings-about-label">Versão</span>
            <span class="ultron-settings-about-value">1.0.0</span>
          </div>
          <div class="ultron-settings-about-item">
            <span class="ultron-settings-about-label">Desenvolvido por</span>
            <span class="ultron-settings-about-value">GHOST</span>
          </div>
          <div class="ultron-settings-about-item">
            <span class="ultron-settings-about-label">Powered by</span>
            <span class="ultron-settings-about-value">Moltbot</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
