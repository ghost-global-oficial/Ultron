import { html, nothing } from "lit";
import { ref } from "lit/directives/ref.js";
import { icons } from "../icons";
import type { GatewayAgentRow } from "../types";
import type { ChatAttachment } from "../ui-types";

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
  // Chat-like props
  draft: string;
  connected: boolean;
  sending: boolean;
  canSend: boolean;
  messages: unknown[];
  stream: string | null;
  attachments?: ChatAttachment[];
  // Event handlers
  onDraftChange: (next: string) => void;
  onSend: () => void;
  onCreateAgent: () => void;
  onEditAgent: (id: string) => void;
  onDeleteAgent: (id: string) => void;
  onToggleAgent: (id: string) => void;
  onAttachmentsChange?: (attachments: ChatAttachment[]) => void;
  onRefresh: () => void;
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

function adjustTextareaHeight(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function renderAgentsPage(props: AgentsPageProps) {
  // Converte GatewayAgentRow para Agent
  const agents = props.agents.map(gatewayAgentToAgent);
  const isEmpty = agents.length === 0;
  const canCompose = props.connected;
  const isBusy = props.sending || props.stream !== null;

  return html`
    <div class="chat-layout">
      <!-- Main Chat Area -->
      <div class="chat-main">
        <!-- Messages Area -->
        <div class="chat-messages" ${ref((el?: Element) => {
          if (el) {
            const messagesEl = el as HTMLElement;
            // Auto-scroll to bottom
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
        })}>
          ${isEmpty ? renderAgentsWelcome(props) : renderAgentsList(agents, props)}
        </div>

        <!-- Compose Area -->
        <div class="chat-compose ${!canCompose ? "chat-compose--disabled" : ""}">
          ${props.attachments && props.attachments.length > 0 ? html`
            <div class="chat-compose__attachments">
              ${props.attachments.map((att, idx) => html`
                <div class="chat-compose__attachment">
                  <img src=${att.dataUrl} alt="attachment" class="chat-compose__attachment-preview" />
                  <button 
                    class="chat-compose__attachment-remove"
                    @click=${() => {
                      if (props.onAttachmentsChange) {
                        const next = [...props.attachments!];
                        next.splice(idx, 1);
                        props.onAttachmentsChange(next);
                      }
                    }}
                  >
                    ${icons.x}
                  </button>
                </div>
              `)}
            </div>
          ` : nothing}

          <div class="chat-compose__input-wrapper">
            <textarea
              class="chat-compose__input"
              placeholder=${canCompose ? "Converse com seus agents..." : "Conectando..."}
              .value=${props.draft}
              ?disabled=${!canCompose || isBusy}
              @input=${(e: Event) => {
                const target = e.target as HTMLTextAreaElement;
                props.onDraftChange(target.value);
                adjustTextareaHeight(target);
              }}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (props.canSend && !isBusy) {
                    props.onSend();
                    const target = e.target as HTMLTextAreaElement;
                    setTimeout(() => adjustTextareaHeight(target), 0);
                  }
                }
              }}
              ${ref((el?: Element) => {
                if (el) {
                  adjustTextareaHeight(el as HTMLTextAreaElement);
                }
              })}
            ></textarea>

            <div class="chat-compose__actions">
              <button
                class="chat-compose__action-btn"
                title="Criar novo agent"
                @click=${props.onCreateAgent}
              >
                ${icons.plus}
              </button>

              <button
                class="chat-compose__action-btn"
                title="Atualizar"
                @click=${props.onRefresh}
              >
                ${icons.loader}
              </button>

              <button
                class="chat-compose__send"
                ?disabled=${!props.canSend || isBusy}
                @click=${props.onSend}
              >
                ${isBusy
                  ? html`
                      <svg class="chat-compose__send-spinner" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    `
                  : icons.arrowUp}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAgentsWelcome(props: AgentsPageProps) {
  return html`
    <div class="chat-welcome">
      <div class="chat-welcome__content">
        <div class="chat-welcome__icon">${icons.bot}</div>
        <h2 class="chat-welcome__title">Bem-vindo aos Agents</h2>
        <p class="chat-welcome__description">
          Gerencie e converse com seus agents de IA. Crie novos agents, configure suas capacidades
          e interaja com eles diretamente.
        </p>

        <div class="chat-welcome__actions">
          <button class="btn btn-primary" @click=${props.onCreateAgent}>
            ${icons.plus}
            Criar primeiro Agent
          </button>
        </div>

        <div class="chat-welcome__features">
          <div class="chat-welcome__feature">
            <div class="chat-welcome__feature-icon">${icons.brain}</div>
            <h3 class="chat-welcome__feature-title">Múltiplos Agents</h3>
            <p class="chat-welcome__feature-description">
              Crie agents especializados para diferentes tarefas
            </p>
          </div>

          <div class="chat-welcome__feature">
            <div class="chat-welcome__feature-icon">${icons.zap}</div>
            <h3 class="chat-welcome__feature-title">Conversação Direta</h3>
            <p class="chat-welcome__feature-description">
              Converse com seus agents em tempo real
            </p>
          </div>

          <div class="chat-welcome__feature">
            <div class="chat-welcome__feature-icon">${icons.sliders}</div>
            <h3 class="chat-welcome__feature-title">Configuração Flexível</h3>
            <p class="chat-welcome__feature-description">
              Personalize modelos, capacidades e comportamentos
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAgentsList(agents: Agent[], props: AgentsPageProps) {
  return html`
    <div class="agents-chat-list">
      <!-- Header com stats -->
      <div class="agents-chat-header">
        <h2 class="agents-chat-title">Seus Agents</h2>
        <div class="agents-chat-stats">
          <span class="agents-chat-stat">
            ${icons.bot}
            ${agents.length} agent${agents.length !== 1 ? 's' : ''}
          </span>
          <span class="agents-chat-stat">
            ${icons.check}
            ${agents.filter(a => a.status === "active").length} ativo${agents.filter(a => a.status === "active").length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <!-- Lista de agents em formato de mensagens -->
      <div class="agents-chat-messages">
        ${agents.map(agent => renderAgentMessage(agent, props))}
      </div>
    </div>
  `;
}

function renderAgentMessage(agent: Agent, props: AgentsPageProps) {
  const statusClass = `agent-message-status--${agent.status}`;
  const statusLabel = {
    active: "Ativo",
    inactive: "Inativo",
    error: "Erro"
  }[agent.status];

  return html`
    <div class="agent-message">
      <div class="agent-message__avatar">
        ${agent.avatar 
          ? html`<img src=${agent.avatar} alt=${agent.name} />`
          : html`<span>${agent.name.charAt(0).toUpperCase()}</span>`
        }
      </div>

      <div class="agent-message__content">
        <div class="agent-message__header">
          <span class="agent-message__name">${agent.name}</span>
          <span class="agent-message__status ${statusClass}">${statusLabel}</span>
          <div class="agent-message__actions">
            <button 
              class="agent-message__action-btn"
              @click=${() => props.onEditAgent(agent.id)}
              title="Editar"
            >
              ${icons.edit}
            </button>
            <button 
              class="agent-message__action-btn agent-message__action-btn--danger"
              @click=${() => props.onDeleteAgent(agent.id)}
              title="Deletar"
            >
              ${icons.trash}
            </button>
          </div>
        </div>

        <p class="agent-message__description">${agent.description}</p>

        <div class="agent-message__meta">
          <span class="agent-message__meta-item">
            ${icons.cpu}
            ${agent.model}
          </span>
          <span class="agent-message__meta-item">
            ${icons.cloud}
            ${agent.provider}
          </span>
          ${agent.messagesCount !== undefined ? html`
            <span class="agent-message__meta-item">
              ${icons.messageSquare}
              ${agent.messagesCount} mensagens
            </span>
          ` : nothing}
        </div>

        ${agent.capabilities.length > 0 ? html`
          <div class="agent-message__capabilities">
            ${agent.capabilities.slice(0, 5).map(cap => html`
              <span class="agent-message__capability">${cap}</span>
            `)}
          </div>
        ` : nothing}

        <div class="agent-message__footer">
          <label class="agent-message__toggle">
            <input 
              type="checkbox" 
              .checked=${agent.status === "active"}
              @change=${() => props.onToggleAgent(agent.id)}
            />
            <span class="agent-message__toggle-slider"></span>
            <span class="agent-message__toggle-label">
              ${agent.status === "active" ? "Ativo" : "Inativo"}
            </span>
          </label>
          ${agent.lastUsed ? html`
            <span class="agent-message__time">
              ${icons.clock}
              ${formatRelativeTime(agent.lastUsed)}
            </span>
          ` : nothing}
        </div>
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
