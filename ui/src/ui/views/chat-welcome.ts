import { html } from "lit";
import { ref } from "lit/directives/ref.js";
import { icons } from "../icons";

export type ChatWelcomeProps = {
  draft: string;
  connected: boolean;
  sending: boolean;
  onDraftChange: (text: string) => void;
  onSend: () => void;
  onSuggestionClick: (text: string) => void;
  onConnectorsMenuOpen?: (event: MouseEvent) => void;
  onScheduleTask?: () => void;
};

const suggestions = [
  {
    icon: "lightbulb",
    text: "Criar slides",
    description: "sobre um tópico específico",
  },
  {
    icon: "code",
    text: "Construir website",
    description: "com HTML, CSS e JavaScript",
  },
  {
    icon: "smartphone",
    text: "Desenvolver aplicações",
    description: "mobile ou desktop",
  },
  {
    icon: "wand",
    text: "Design",
    description: "criar interfaces modernas",
  },
];

function adjustTextareaHeight(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function renderChatWelcome(props: ChatWelcomeProps) {
  return html`
    <div class="chat-welcome">
      <div class="chat-welcome__content">
        <h1 class="chat-welcome__title">O que posso fazer por si?</h1>
        
        <!-- Input do prompt -->
        <div class="chat-welcome__input-container">
          <div class="chat-compose__row">
            <div class="chat-welcome__textarea-wrapper">
              <textarea
                ${ref((el) => {
                  if (el) {
                    adjustTextareaHeight(el as HTMLTextAreaElement);
                  }
                })}
                .value=${props.draft}
                ?disabled=${!props.connected}
                placeholder="Atribua uma tarefa ou pergunte qualquer coisa"
                @input=${(e: Event) => {
                  const target = e.target as HTMLTextAreaElement;
                  props.onDraftChange(target.value);
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
                  if (props.draft.trim() && props.connected) {
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
                    <button class="chat-compose__menu-item" type="button">
                      ${icons.cloud} Adicionar a partir do Drive
                    </button>
                    <button class="chat-compose__menu-item" type="button">
                      ${icons.cloud} Adicionar a partir do OneDrive
                    </button>
                    <button class="chat-compose__menu-item" type="button">
                      ${icons.bot} Modelo predefinido da IA
                    </button>
                    <button class="chat-compose__menu-item" type="button">
                      ${icons.zap} Competências
                    </button>
                    <button class="chat-compose__menu-item" type="button" @click=${() => {
                      // Fecha o menu
                      const menu = document.querySelector('.chat-compose__menu--open') as HTMLElement;
                      if (menu) {
                        menu.classList.remove('chat-compose__menu--open');
                      }
                      // Abre o painel de agendamento
                      if (props.onScheduleTask) {
                        props.onScheduleTask();
                      }
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Agendar tarefa
                    </button>
                    <button class="chat-compose__menu-item chat-compose__menu-item--puzzle" type="button" @click=${(e: MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Fecha o menu de "mais"
                      const menu = (e.currentTarget as HTMLElement).closest('.chat-compose__menu') as HTMLElement;
                      if (menu) {
                        menu.classList.remove('chat-compose__menu--open');
                      }
                      // Abre o menu de conectores
                      if (props.onConnectorsMenuOpen) {
                        props.onConnectorsMenuOpen(e);
                      }
                    }}>
                      ${icons.puzzle} Conectores
                    </button>
                    <button class="chat-compose__menu-item chat-compose__menu-item--paperclip" type="button">
                      ${icons.paperclip} Adicionar do local
                    </button>
                  </div>
                </div>
                <button
                  class="chat-welcome__connectors-btn"
                  type="button"
                  title="Conectores"
                  aria-label="Conectores"
                  @click=${(e: MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (props.onConnectorsMenuOpen) {
                      props.onConnectorsMenuOpen(e);
                    }
                  }}
                >
                  ${icons.puzzle}
                </button>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button
                  class="btn btn-icon chat-compose__mic-btn chat-welcome__mic-btn"
                  type="button"
                  title="Voz"
                  aria-label="Voz"
                  ?disabled=${!props.connected}
                >
                  ${icons.mic}
                </button>
                <button
                  class="btn btn-icon chat-compose__send-btn ${props.draft.trim() ? 'chat-compose__send-btn--active' : ''} ${props.sending ? 'chat-compose__send-btn--loading' : ''}"
                  type="button"
                  ?disabled=${!props.connected || !props.draft.trim() || props.sending}
                  @click=${() => {
                    if (props.draft.trim() && props.connected && !props.sending) {
                      props.onSend();
                    }
                  }}
                  title="Enviar mensagem"
                  aria-label="Enviar mensagem"
                >
                  ${props.sending
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
        <div class="chat-welcome__suggestions">
          ${suggestions.map(
            (suggestion) => html`
              <button
                class="chat-welcome__suggestion"
                @click=${() => props.onSuggestionClick(suggestion.text)}
              >
                <span class="chat-welcome__suggestion-icon">
                  ${suggestion.icon === "lightbulb"
                    ? icons.lightbulb
                    : suggestion.icon === "code"
                      ? icons.code
                      : suggestion.icon === "smartphone"
                        ? icons.smartphone
                        : icons.wand}
                </span>
                <div class="chat-welcome__suggestion-text">
                  <div class="chat-welcome__suggestion-title">${suggestion.text}</div>
                  <div class="chat-welcome__suggestion-desc">${suggestion.description}</div>
                </div>
              </button>
            `,
          )}
        </div>
      </div>
    </div>
  `;
}
