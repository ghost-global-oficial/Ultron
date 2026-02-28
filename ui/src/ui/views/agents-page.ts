import { html } from "lit";
import { icons } from "../icons";
import type { GatewayAgentRow } from "../types";

export type Agent = {
  id: string;
  name: string;
  description: string;
  model: string;
  provider: string;
  status: "active" | "inactive" | "error";
  avatar?: string;
  capabilities: string[];
  lastUsed?: Date;
  messagesCount?: number;
};

export type AgentsPageProps = {
  agents: GatewayAgentRow[];
  onCreateAgent: () => void;
  onEditAgent: (id: string) => void;
  onDeleteAgent: (id: string) => void;
  onToggleAgent: (id: string) => void;
};

// Converte GatewayAgentRow para Agent
function gatewayAgentToAgent(gatewayAgent: GatewayAgentRow): Agent {
  return {
    id: gatewayAgent.id,
    name: gatewayAgent.identity?.name || gatewayAgent.name || gatewayAgent.id,
    description: `Agent ${gatewayAgent.id}`,
    model: "GPT-4",
    provider: "OpenAI",
    status: "active",
    avatar: gatewayAgent.identity?.avatarUrl || gatewayAgent.identity?.avatar,
    capabilities: ["Chat", "Tools", "Memory"],
    lastUsed: new Date(),
    messagesCount: 0,
  };
}

export function renderAgentsPage(props: AgentsPageProps) {
  // Converte GatewayAgentRow para Agent
  const agents = props.agents.map(gatewayAgentToAgent);
  
  return html`
    <div class="agents-page">
      <!-- Header -->
      <div class="agents-page__header">
        <div class="agents-page__header-content">
          <h1 class="agents-page__title">Agents</h1>
          <p class="agents-page__description">
            Gerencie seus agentes de IA e suas configurações
          </p>
        </div>
        <button class="btn btn-primary" @click=${props.onCreateAgent}>
          ${icons.plus}
          Criar Agent
        </button>
      </div>

      <!-- Stats -->
      <div class="agents-page__stats">
        <div class="agents-page__stat-card">
          <div class="agents-page__stat-icon agents-page__stat-icon--primary">
            ${icons.bot}
          </div>
          <div class="agents-page__stat-content">
            <span class="agents-page__stat-value">${agents.length}</span>
            <span class="agents-page__stat-label">Total de Agents</span>
          </div>
        </div>

        <div class="agents-page__stat-card">
          <div class="agents-page__stat-icon agents-page__stat-icon--success">
            ${icons.check}
          </div>
          <div class="agents-page__stat-content">
            <span class="agents-page__stat-value">
              ${agents.filter(a => a.status === "active").length}
            </span>
            <span class="agents-page__stat-label">Ativos</span>
          </div>
        </div>

        <div class="agents-page__stat-card">
          <div class="agents-page__stat-icon agents-page__stat-icon--warning">
            ${icons.zap}
          </div>
          <div class="agents-page__stat-content">
            <span class="agents-page__stat-value">
              ${agents.reduce((sum, a) => sum + (a.messagesCount || 0), 0)}
            </span>
            <span class="agents-page__stat-label">Mensagens</span>
          </div>
        </div>
      </div>

      <!-- Agents Grid -->
      <div class="agents-page__grid">
        ${agents.length === 0
          ? renderEmptyState(props)
          : agents.map(agent => renderAgentCard(agent, props))
        }
      </div>
    </div>
  `;
}

function renderEmptyState(props: AgentsPageProps) {
  return html`
    <div class="agents-page__empty">
      <div class="agents-page__empty-icon">${icons.bot}</div>
      <h3 class="agents-page__empty-title">Nenhum agent criado</h3>
      <p class="agents-page__empty-description">
        Crie seu primeiro agent para começar a usar o ULTRON
      </p>
      <button class="btn btn-primary" @click=${props.onCreateAgent}>
        ${icons.plus}
        Criar primeiro Agent
      </button>
    </div>
  `;
}

function renderAgentCard(agent: Agent, props: AgentsPageProps) {
  const statusClass = `agents-page__agent-status--${agent.status}`;
  const statusLabel = {
    active: "Ativo",
    inactive: "Inativo",
    error: "Erro"
  }[agent.status];

  return html`
    <div class="agents-page__agent-card">
      <!-- Header -->
      <div class="agents-page__agent-header">
        <div class="agents-page__agent-avatar">
          ${agent.avatar 
            ? html`<img src=${agent.avatar} alt=${agent.name} />`
            : html`<span>${agent.name.charAt(0).toUpperCase()}</span>`
          }
        </div>
        <div class="agents-page__agent-info">
          <h3 class="agents-page__agent-name">${agent.name}</h3>
          <span class="agents-page__agent-status ${statusClass}">
            ${statusLabel}
          </span>
        </div>
        <div class="agents-page__agent-actions">
          <button 
            class="agents-page__agent-action-btn"
            @click=${() => props.onEditAgent(agent.id)}
            title="Editar"
          >
            ${icons.edit}
          </button>
          <button 
            class="agents-page__agent-action-btn agents-page__agent-action-btn--danger"
            @click=${() => props.onDeleteAgent(agent.id)}
            title="Deletar"
          >
            ${icons.trash}
          </button>
        </div>
      </div>

      <!-- Description -->
      <p class="agents-page__agent-description">${agent.description}</p>

      <!-- Model Info -->
      <div class="agents-page__agent-model">
        <div class="agents-page__agent-model-item">
          <span class="agents-page__agent-model-label">Modelo</span>
          <span class="agents-page__agent-model-value">${agent.model}</span>
        </div>
        <div class="agents-page__agent-model-item">
          <span class="agents-page__agent-model-label">Provedor</span>
          <span class="agents-page__agent-model-value">${agent.provider}</span>
        </div>
      </div>

      <!-- Capabilities -->
      ${agent.capabilities.length > 0 ? html`
        <div class="agents-page__agent-capabilities">
          ${agent.capabilities.slice(0, 3).map(cap => html`
            <span class="agents-page__agent-capability">${cap}</span>
          `)}
          ${agent.capabilities.length > 3 ? html`
            <span class="agents-page__agent-capability">
              +${agent.capabilities.length - 3}
            </span>
          ` : ''}
        </div>
      ` : ''}

      <!-- Stats -->
      <div class="agents-page__agent-stats">
        ${agent.messagesCount !== undefined ? html`
          <div class="agents-page__agent-stat">
            ${icons.messageSquare}
            <span>${agent.messagesCount} mensagens</span>
          </div>
        ` : ''}
        ${agent.lastUsed ? html`
          <div class="agents-page__agent-stat">
            ${icons.clock}
            <span>${formatRelativeTime(agent.lastUsed)}</span>
          </div>
        ` : ''}
      </div>

      <!-- Toggle -->
      <div class="agents-page__agent-footer">
        <label class="agents-page__agent-toggle">
          <input 
            type="checkbox" 
            .checked=${agent.status === "active"}
            @change=${() => props.onToggleAgent(agent.id)}
          />
          <span class="agents-page__agent-toggle-slider"></span>
          <span class="agents-page__agent-toggle-label">
            ${agent.status === "active" ? "Ativo" : "Inativo"}
          </span>
        </label>
      </div>
    </div>
  `;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
  if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'agora mesmo';
}
