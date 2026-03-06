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
  draft?: string;
  connected: boolean;
  sending: boolean;
  canSend: boolean;
  messages?: unknown[];
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
  const hasMessages = props.messages && props.messages.length > 0;

  return html`
    <div class="agents-page-wrapper">
      <section class="card chat agents-chat">
        <!-- Chat Thread (Messages Area) -->
        <div class="chat-thread" ${ref((el?: Element) => {
          if (el) {
            const messagesEl = el as HTMLElement;
            // Auto-scroll to bottom
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
        })}>
          ${hasMessages ? renderChatMessages(props) : renderAgentsChatWelcome(props)}
        </div>
      </section>
    </div>
  `;
}

const agentSuggestions = [
  {
    icon: "bot",
    text: "Criar agent personalizado",
    description: "com capacidades específicas",
  },
  {
    icon: "code",
    text: "Agent de desenvolvimento",
    description: "para auxiliar na programação",
  },
  {
    icon: "wand",
    text: "Agent criativo",
    description: "para design e conteúdo",
  },
  {
    icon: "zap",
    text: "Agent de automação",
    description: "para tarefas repetitivas",
  },
];

function renderAgentsChatWelcome(props: AgentsPageProps) {
  const draft = props?.draft || '';
  const connected = props?.connected ?? false;
  const sending = props?.sending ?? false;
  
  return html`
    <div class="agents-welcome">
      <div class="agents-welcome__content">
        <h1 class="agents-welcome__title">Que Agente gostaria de criar hoje?</h1>
        
        <!-- Input do prompt -->
        <div class="agents-welcome__input-container">
          <div class="chat-compose__row">
            <div class="agents-welcome__textarea-wrapper">
              <textarea
                ${ref((el) => {
                  if (el) {
                    adjustTextareaHeight(el as HTMLTextAreaElement);
                  }
                })}
                .value=${draft}
                ?disabled=${!connected}
                placeholder="Pergunte sobre agents ou peça para criar um novo"
                @input=${(e: Event) => {
                  const target = e.target as HTMLTextAreaElement;
                  if (props?.onDraftChange) {
                    props.onDraftChange(target.value);
                  }
                  adjustTextareaHeight(target);
                }}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key !== "Enter") {
                    return;
                  }
                  if (e.isComposing || e.keyCode === 229) {
                    return;
                  }
                  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
                    return;
                  }
                  e.preventDefault();
                  if (draft.trim() && connected && props?.onSend) {
                    props.onSend();
                  }
                }}
              ></textarea>
            </div>
            <div class="chat-compose__bottom">
              <div style="display: flex; align-items: center; gap: 4px;">
                <div class="chat-compose__add-menu">
                  <button
                    class="btn chat-compose__add-btn"
                    type="button"
                    title="Adicionar"
                    aria-label="Adicionar"
                    @click=${(e: Event) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const button = e.currentTarget as HTMLElement;
                      const menu = button.parentElement?.querySelector('.chat-compose__menu') as HTMLElement;
                      if (menu) {
                        menu.classList.toggle('chat-compose__menu--open');
                      }
                    }}
                  >
                    ${icons.plus}
                  </button>
                  <div class="chat-compose__menu">
                    <button class="chat-compose__menu-item" type="button" @click=${() => {
                      const menu = document.querySelector('.chat-compose__menu--open') as HTMLElement;
                      if (menu) {
                        menu.classList.remove('chat-compose__menu--open');
                      }
                      if (props?.onCreateAgent) {
                        props.onCreateAgent();
                      }
                    }}>
                      ${icons.bot} Criar novo Agent
                    </button>
                    <button class="chat-compose__menu-item" type="button" @click=${() => {
                      const menu = document.querySelector('.chat-compose__menu--open') as HTMLElement;
                      if (menu) {
                        menu.classList.remove('chat-compose__menu--open');
                      }
                      if (props?.onRefresh) {
                        props.onRefresh();
                      }
                    }}>
                      ${icons.loader} Atualizar lista
                    </button>
                  </div>
                </div>
                <div class="agents-welcome__bot-menu">
                  <button
                    class="agents-welcome__connectors-btn"
                    type="button"
                    title="Configurações do Agente"
                    aria-label="Configurações do Agente"
                    @click=${(e: MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const button = e.currentTarget as HTMLElement;
                      const menu = button.parentElement?.querySelector('.agents-welcome__bot-menu-dropdown') as HTMLElement;
                      if (menu) {
                        menu.classList.toggle('agents-welcome__bot-menu-dropdown--open');
                      }
                    }}
                  >
                    ${icons.bot}
                  </button>
                  <div class="agents-welcome__bot-menu-dropdown">
                    <div class="agents-welcome__bot-menu-header">
                      <span class="agents-welcome__bot-menu-title">Configurações do Agente</span>
                    </div>
                    <button class="agents-welcome__bot-menu-item" type="button" @click=${() => {
                      const menu = document.querySelector('.agents-welcome__bot-menu-dropdown--open') as HTMLElement;
                      if (menu) {
                        menu.classList.remove('agents-welcome__bot-menu-dropdown--open');
                      }
                      // TODO: Abrir modal de adicionar à colmeia
                      console.log('Adicionar à colmeia');
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
                        <polyline points="7.5 19.79 7.5 14.6 3 12"/>
                        <polyline points="21 12 16.5 14.6 16.5 19.79"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                      Adicionar à Colmeia
                    </button>
                    <button class="agents-welcome__bot-menu-item" type="button" @click=${() => {
                      const menu = document.querySelector('.agents-welcome__bot-menu-dropdown--open') as HTMLElement;
                      if (menu) {
                        menu.classList.remove('agents-welcome__bot-menu-dropdown--open');
                      }
                      // TODO: Abrir modal de configurar modelo
                      console.log('Configurar modelo');
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      Configurar Modelo
                    </button>
                    <button class="agents-welcome__bot-menu-item" type="button" @click=${() => {
                      const menu = document.querySelector('.agents-welcome__bot-menu-dropdown--open') as HTMLElement;
                      if (menu) {
                        menu.classList.remove('agents-welcome__bot-menu-dropdown--open');
                      }
                      // TODO: Abrir modal de definir capacidades
                      console.log('Definir capacidades');
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                      Definir Capacidades
                    </button>
                    <button class="agents-welcome__bot-menu-item" type="button" @click=${() => {
                      const menu = document.querySelector('.agents-welcome__bot-menu-dropdown--open') as HTMLElement;
                      if (menu) {
                        menu.classList.remove('agents-welcome__bot-menu-dropdown--open');
                      }
                      // TODO: Abrir modal de configurar memória
                      console.log('Configurar memória');
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                      Configurar Memória
                    </button>
                    <div class="agents-welcome__bot-menu-divider"></div>
                    <button class="agents-welcome__bot-menu-item" type="button" @click=${() => {
                      const menu = document.querySelector('.agents-welcome__bot-menu-dropdown--open') as HTMLElement;
                      if (menu) {
                        menu.classList.remove('agents-welcome__bot-menu-dropdown--open');
                      }
                      if (props?.onCreateAgent) {
                        props.onCreateAgent();
                      }
                    }}>
                      ${icons.plus}
                      Criar Novo Agente
                    </button>
                  </div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button
                  class="btn btn-icon chat-compose__mic-btn agents-welcome__mic-btn"
                  type="button"
                  title="Voz"
                  aria-label="Voz"
                  ?disabled=${!connected}
                >
                  ${icons.mic}
                </button>
                <button
                  class="btn btn-icon chat-compose__send-btn ${draft.trim() ? 'chat-compose__send-btn--active' : ''} ${sending ? 'chat-compose__send-btn--loading' : ''}"
                  type="button"
                  ?disabled=${!connected || !draft.trim() || sending}
                  @click=${() => {
                    if (draft.trim() && connected && !sending && props?.onSend) {
                      props.onSend();
                    }
                  }}
                  title="Enviar mensagem"
                  aria-label="Enviar mensagem"
                >
                  ${sending
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
        
        <!-- Sugestões -->
        <div class="agents-welcome__suggestions">
          ${agentSuggestions.map(
            (suggestion) => html`
              <button
                class="agents-welcome__suggestion"
                @click=${() => {
                  if (props?.onDraftChange) {
                    props.onDraftChange(suggestion.text);
                  }
                }}
              >
                <span class="agents-welcome__suggestion-icon">
                  ${suggestion.icon === "bot"
                    ? icons.bot
                    : suggestion.icon === "code"
                      ? icons.code
                      : suggestion.icon === "wand"
                        ? icons.wand
                        : icons.zap}
                </span>
                <div class="agents-welcome__suggestion-text">
                  <div class="agents-welcome__suggestion-title">${suggestion.text}</div>
                  <div class="agents-welcome__suggestion-desc">${suggestion.description}</div>
                </div>
              </button>
            `,
          )}
        </div>
        
        <!-- Agentes Criados -->
        ${renderCreatedAgents(props)}
      </div>
    </div>
  `;
}

function renderCreatedAgents(props: AgentsPageProps) {
  const agents = props.agents.map(gatewayAgentToAgent);
  
  if (agents.length === 0) {
    return html`
      <div class="agents-created">
        <div class="agents-created__empty">
          <div class="agents-created__empty-icon">${icons.bot}</div>
          <p class="agents-created__empty-text">Nenhum agente criado ainda</p>
        </div>
      </div>
    `;
  }
  
  return html`
    <div class="agents-created">
      <div class="agents-created__header">
        <h2 class="agents-created__title">Seus Agentes</h2>
        <span class="agents-created__count">${agents.length} ${agents.length === 1 ? 'agente' : 'agentes'}</span>
      </div>
      
      <div class="agents-created__grid">
        ${agents.map(agent => html`
          <div class="agent-card">
            <div class="agent-card__header">
              <div class="agent-card__avatar">
                ${agent.avatar 
                  ? html`<img src=${agent.avatar} alt=${agent.name} />`
                  : html`<span>${agent.name.charAt(0).toUpperCase()}</span>`
                }
              </div>
              <div class="agent-card__info">
                <h3 class="agent-card__name">${agent.name}</h3>
                <span class="agent-card__status agent-card__status--${agent.status}">
                  ${agent.status === 'active' ? 'Ativo' : agent.status === 'inactive' ? 'Inativo' : 'Erro'}
                </span>
              </div>
              <div class="agent-card__actions">
                <button 
                  class="agent-card__action-btn"
                  @click=${() => props?.onEditAgent?.(agent.id)}
                  title="Editar"
                  aria-label="Editar agente"
                >
                  ${icons.edit}
                </button>
                <button 
                  class="agent-card__action-btn agent-card__action-btn--danger"
                  @click=${() => props?.onDeleteAgent?.(agent.id)}
                  title="Deletar"
                  aria-label="Deletar agente"
                >
                  ${icons.trash}
                </button>
              </div>
            </div>
            
            <p class="agent-card__description">${agent.description}</p>
            
            <div class="agent-card__meta">
              <span class="agent-card__meta-item">
                ${icons.cpu}
                ${agent.model}
              </span>
              <span class="agent-card__meta-item">
                ${icons.cloud}
                ${agent.provider}
              </span>
            </div>
            
            ${agent.capabilities.length > 0 ? html`
              <div class="agent-card__capabilities">
                ${agent.capabilities.slice(0, 3).map(cap => html`
                  <span class="agent-card__capability">${cap}</span>
                `)}
              </div>
            ` : nothing}
            
            <div class="agent-card__footer">
              <label class="agent-card__toggle">
                <input 
                  type="checkbox" 
                  .checked=${agent.status === "active"}
                  @change=${() => props?.onToggleAgent?.(agent.id)}
                />
                <span class="agent-card__toggle-slider"></span>
                <span class="agent-card__toggle-label">
                  ${agent.status === "active" ? "Ativo" : "Inativo"}
                </span>
              </label>
              ${agent.lastUsed ? html`
                <span class="agent-card__time">
                  ${icons.clock}
                  ${formatRelativeTime(agent.lastUsed)}
                </span>
              ` : nothing}
            </div>
          </div>
        `)}
      </div>
    </div>
  `;
}

function renderChatMessages(props: AgentsPageProps) {
  // Renderiza as mensagens do chat aqui
  if (!props.messages || props.messages.length === 0) {
    return renderAgentsChatWelcome(props);
  }

  return html`
    <div class="agents-chat-messages-list">
      ${props.messages.map((msg: any) => html`
        <div class="agents-chat-message">
          <div class="agents-chat-message__content">
            ${msg.content || msg.text || "Mensagem"}
          </div>
        </div>
      `)}
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
