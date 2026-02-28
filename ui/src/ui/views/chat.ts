import { html, nothing } from "lit";
import { ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import type { SessionsListResult } from "../types";
import type { ChatItem, MessageGroup } from "../types/chat-types";
import type { ChatAttachment, ChatQueueItem } from "../ui-types";
import {
  renderMessageGroup,
  renderReadingIndicatorGroup,
  renderStreamingGroup,
} from "../chat/grouped-render";
import { normalizeMessage, normalizeRoleForGrouping } from "../chat/message-normalizer";
import { icons } from "../icons";
import { renderMarkdownSidebar } from "./markdown-sidebar";
import { renderChatWelcome } from "./chat-welcome";
import { startAnimatedPlaceholder, stopAnimatedPlaceholder, pauseAnimatedPlaceholder, resumeAnimatedPlaceholder } from "../animated-placeholder";
import "../components/resizable-divider";

export type CompactionIndicatorStatus = {
  active: boolean;
  startedAt: number | null;
  completedAt: number | null;
};

export type ChatProps = {
  sessionKey: string;
  onSessionKeyChange: (next: string) => void;
  thinkingLevel: string | null;
  showThinking: boolean;
  loading: boolean;
  sending: boolean;
  canAbort?: boolean;
  compactionStatus?: CompactionIndicatorStatus | null;
  messages: unknown[];
  toolMessages: unknown[];
  stream: string | null;
  streamStartedAt: number | null;
  assistantAvatarUrl?: string | null;
  draft: string;
  queue: ChatQueueItem[];
  connected: boolean;
  canSend: boolean;
  disabledReason: string | null;
  error: string | null;
  sessions: SessionsListResult | null;
  // Focus mode
  focusMode: boolean;
  // Sidebar state
  sidebarOpen?: boolean;
  sidebarContent?: string | null;
  sidebarError?: string | null;
  splitRatio?: number;
  assistantName: string;
  assistantAvatar: string | null;
  // Image attachments
  attachments?: ChatAttachment[];
  onAttachmentsChange?: (attachments: ChatAttachment[]) => void;
  // Event handlers
  onRefresh: () => void;
  onToggleFocusMode: () => void;
  onDraftChange: (next: string) => void;
  onSend: () => void;
  onAbort?: () => void;
  onQueueRemove: (id: string) => void;
  onNewSession: () => void;
  onOpenSidebar?: (content: string) => void;
  onCloseSidebar?: () => void;
  onSplitRatioChange?: (ratio: number) => void;
  onChatScroll?: (event: Event) => void;
  onConnectorsMenuOpen?: (event: MouseEvent) => void;
  onScheduleTask?: () => void;
};

const COMPACTION_TOAST_DURATION_MS = 5000;

function adjustTextareaHeight(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function renderCompactionIndicator(status: CompactionIndicatorStatus | null | undefined) {
  if (!status) {
    return nothing;
  }

  // Show "compacting..." while active
  if (status.active) {
    return html`
      <div class="callout info compaction-indicator compaction-indicator--active">
        ${icons.loader} Compacting context...
      </div>
    `;
  }

  // Show "compaction complete" briefly after completion
  if (status.completedAt) {
    const elapsed = Date.now() - status.completedAt;
    if (elapsed < COMPACTION_TOAST_DURATION_MS) {
      return html`
        <div class="callout success compaction-indicator compaction-indicator--complete">
          ${icons.check} Context compacted
        </div>
      `;
    }
  }

  return nothing;
}

function generateAttachmentId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function handlePaste(e: ClipboardEvent, props: ChatProps) {
  const items = e.clipboardData?.items;
  if (!items || !props.onAttachmentsChange) {
    return;
  }

  const imageItems: DataTransferItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith("image/")) {
      imageItems.push(item);
    }
  }

  if (imageItems.length === 0) {
    return;
  }

  e.preventDefault();

  for (const item of imageItems) {
    const file = item.getAsFile();
    if (!file) {
      continue;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const dataUrl = reader.result as string;
      const newAttachment: ChatAttachment = {
        id: generateAttachmentId(),
        dataUrl,
        mimeType: file.type,
      };
      const current = props.attachments ?? [];
      props.onAttachmentsChange?.([...current, newAttachment]);
    });
    reader.readAsDataURL(file);
  }
}

function renderAttachmentPreview(props: ChatProps) {
  const attachments = props.attachments ?? [];
  if (attachments.length === 0) {
    return nothing;
  }

  return html`
    <div class="chat-attachments">
      ${attachments.map(
        (att) => html`
          <div class="chat-attachment">
            <img
              src=${att.dataUrl}
              alt="Attachment preview"
              class="chat-attachment__img"
            />
            <button
              class="chat-attachment__remove"
              type="button"
              aria-label="Remove attachment"
              @click=${() => {
                const next = (props.attachments ?? []).filter((a) => a.id !== att.id);
                props.onAttachmentsChange?.(next);
              }}
            >
              ${icons.x}
            </button>
          </div>
        `,
      )}
    </div>
  `;
}

export function renderChat(props: ChatProps) {
  const canCompose = props.connected;
  const isBusy = props.sending || props.stream !== null;
  const canAbort = Boolean(props.canAbort && props.onAbort);
  const activeSession = props.sessions?.sessions?.find((row) => row.key === props.sessionKey);
  const reasoningLevel = activeSession?.reasoningLevel ?? "off";
  const showReasoning = props.showThinking && reasoningLevel !== "off";
  const assistantIdentity = {
    name: props.assistantName,
    avatar: props.assistantAvatar ?? props.assistantAvatarUrl ?? null,
  };

  const hasAttachments = (props.attachments?.length ?? 0) > 0;
  const composePlaceholder = props.connected
    ? hasAttachments
      ? "Add a message or paste more images..."
      : "" // Placeholder será gerenciado pela animação
    : "Connect to the gateway to start chatting…";

  const splitRatio = props.splitRatio ?? 0.6;
  const sidebarOpen = Boolean(props.sidebarOpen && props.onCloseSidebar);
  
  // Verifica se o chat está vazio (sem mensagens)
  const chatItems = buildChatItems(props);
  const isEmpty = chatItems.length === 0 && !props.loading;
  
  console.log('[DEBUG] Chat render state:', {
    chatItemsCount: chatItems.length,
    isEmpty,
    loading: props.loading,
    messagesCount: Array.isArray(props.messages) ? props.messages.length : 0,
    sessionKey: props.sessionKey,
  });
  
  const thread = html`
    <div
      class="chat-thread"
      role="log"
      aria-live="polite"
      @scroll=${props.onChatScroll}
    >
      ${
        isEmpty
          ? renderChatWelcome({
              draft: props.draft,
              connected: props.connected,
              sending: props.sending,
              onDraftChange: props.onDraftChange,
              onSend: props.onSend,
              onConnectorsMenuOpen: props.onConnectorsMenuOpen,
              onScheduleTask: props.onScheduleTask,
              onSuggestionClick: (text) => {
                props.onDraftChange(text);
                // Foca no textarea após selecionar sugestão
                setTimeout(() => {
                  const textarea = document.querySelector(".chat-welcome textarea") as HTMLTextAreaElement;
                  if (textarea) {
                    textarea.focus();
                  }
                }, 100);
              },
            })
          : nothing
      }
      ${
        props.loading && !isEmpty
          ? html`
              <div class="muted">Loading chat…</div>
            `
          : nothing
      }
      ${repeat(
        chatItems,
        (item) => item.key,
        (item) => {
          if (item.kind === "reading-indicator") {
            return renderReadingIndicatorGroup(assistantIdentity);
          }

          if (item.kind === "stream") {
            return renderStreamingGroup(
              item.text,
              item.startedAt,
              props.onOpenSidebar,
              assistantIdentity,
            );
          }

          if (item.kind === "group") {
            return renderMessageGroup(item, {
              onOpenSidebar: props.onOpenSidebar,
              showReasoning,
              assistantName: props.assistantName,
              assistantAvatar: assistantIdentity.avatar,
            });
          }

          return nothing;
        },
      )}
    </div>
  `;

  return html`
    <section class="card chat">
      ${props.disabledReason ? html`<div class="callout">${props.disabledReason}</div>` : nothing}

      ${props.error ? html`<div class="callout danger">${props.error}</div>` : nothing}

      ${renderCompactionIndicator(props.compactionStatus)}

      ${
        props.focusMode
          ? html`
            <button
              class="chat-focus-exit"
              type="button"
              @click=${props.onToggleFocusMode}
              aria-label="Exit focus mode"
              title="Exit focus mode"
            >
              ${icons.x}
            </button>
          `
          : nothing
      }

      <div
        class="chat-split-container ${sidebarOpen ? "chat-split-container--open" : ""}"
      >
        <div
          class="chat-main"
          style="flex: ${sidebarOpen ? `0 0 ${splitRatio * 100}%` : "1 1 100%"}"
        >
          ${thread}
        </div>

        ${
          sidebarOpen
            ? html`
              <resizable-divider
                .splitRatio=${splitRatio}
                @resize=${(e: CustomEvent) => props.onSplitRatioChange?.(e.detail.splitRatio)}
              ></resizable-divider>
              <div class="chat-sidebar">
                ${renderMarkdownSidebar({
                  content: props.sidebarContent ?? null,
                  error: props.sidebarError ?? null,
                  onClose: props.onCloseSidebar!,
                  onViewRawText: () => {
                    if (!props.sidebarContent || !props.onOpenSidebar) {
                      return;
                    }
                    props.onOpenSidebar(`\`\`\`\n${props.sidebarContent}\n\`\`\``);
                  },
                })}
              </div>
            `
            : nothing
        }
      </div>

      ${
        props.queue.length
          ? html`
            <div class="chat-queue" role="status" aria-live="polite">
              <div class="chat-queue__title">Queued (${props.queue.length})</div>
              <div class="chat-queue__list">
                ${props.queue.map(
                  (item) => html`
                    <div class="chat-queue__item">
                      <div class="chat-queue__text">
                        ${
                          item.text ||
                          (item.attachments?.length ? `Image (${item.attachments.length})` : "")
                        }
                      </div>
                      <button
                        class="btn chat-queue__remove"
                        type="button"
                        aria-label="Remove queued message"
                        @click=${() => props.onQueueRemove(item.id)}
                      >
                        ${icons.x}
                      </button>
                    </div>
                  `,
                )}
              </div>
            </div>
          `
          : nothing
      }

      ${
        isEmpty
          ? nothing
          : html`
              <div class="chat-compose">
                ${renderAttachmentPreview(props)}
                <div class="chat-compose__row">
                  <label class="field chat-compose__field">
                    <span>Message</span>
                    <textarea
                      ${ref((el) => {
                        if (el) {
                          adjustTextareaHeight(el as HTMLTextAreaElement);
                          // Iniciar animação do placeholder se conectado e sem anexos
                          if (props.connected && !hasAttachments) {
                            startAnimatedPlaceholder(el as HTMLTextAreaElement);
                          }
                        }
                      })}
                      .value=${props.draft}
                      ?disabled=${!props.connected}
                      @focus=${() => {
                        // Pausar animação quando o usuário focar no campo
                        pauseAnimatedPlaceholder();
                      }}
                      @blur=${(e: FocusEvent) => {
                        const target = e.target as HTMLTextAreaElement;
                        // Retomar animação se o campo estiver vazio e conectado
                        if (target.value === "" && props.connected && !hasAttachments) {
                          resumeAnimatedPlaceholder();
                        }
                      }}
                      @keydown=${(e: KeyboardEvent) => {
                        if (e.key !== "Enter") {
                          return;
                        }
                        if (e.isComposing || e.keyCode === 229) {
                          return;
                        }
                        if (e.shiftKey) {
                          return;
                        } // Allow Shift+Enter for line breaks
                        if (!props.connected) {
                          return;
                        }
                        e.preventDefault();
                        if (canCompose) {
                          props.onSend();
                        }
                      }}
                      @input=${(e: Event) => {
                        const target = e.target as HTMLTextAreaElement;
                        adjustTextareaHeight(target);
                        props.onDraftChange(target.value);
                      }}
                      @paste=${(e: ClipboardEvent) => handlePaste(e, props)}
                      placeholder=${composePlaceholder}
                    ></textarea>
                  </label>
                  
                  <!-- Linha inferior com todos os botões -->
                  <div class="chat-compose__bottom">
                    <!-- Botão de Mais (à esquerda) -->
                    <div class="chat-compose__add-menu">
                      <button
                        class="btn btn-icon chat-compose__add-btn"
                        type="button"
                        aria-label="Add content"
                        title="Add content"
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
                    
                    <div class="chat-compose__actions">
                      <button
                        class="btn"
                        ?disabled=${!props.connected || (!canAbort && props.sending)}
                        @click=${canAbort ? props.onAbort : props.onNewSession}
                      >
                        ${canAbort ? "Stop" : "New session"}
                      </button>
                      
                      <!-- Botão de Microfone -->
                      <button
                        class="btn btn-icon chat-compose__mic-btn"
                        type="button"
                        aria-label="Voice input"
                        title="Voice input"
                        ?disabled=${!props.connected}
                      >
                        ${icons.mic}
                      </button>
                      
                      <!-- Botão de Enviar (Seta para cima) -->
                      <button
                        class="btn btn-icon primary chat-compose__send-btn"
                        type="button"
                        aria-label="Send message"
                        title="Send message (Enter)"
                        ?disabled=${!props.connected}
                        @click=${props.onSend}
                      >
                        ${icons.arrowUp}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `
      }
    </section>
  `;
}

const CHAT_HISTORY_RENDER_LIMIT = 200;

function groupMessages(items: ChatItem[]): Array<ChatItem | MessageGroup> {
  const result: Array<ChatItem | MessageGroup> = [];
  let currentGroup: MessageGroup | null = null;

  for (const item of items) {
    if (item.kind !== "message") {
      if (currentGroup) {
        result.push(currentGroup);
        currentGroup = null;
      }
      result.push(item);
      continue;
    }

    const normalized = normalizeMessage(item.message);
    const role = normalizeRoleForGrouping(normalized.role);
    const timestamp = normalized.timestamp || Date.now();

    if (!currentGroup || currentGroup.role !== role) {
      if (currentGroup) {
        result.push(currentGroup);
      }
      currentGroup = {
        kind: "group",
        key: `group:${role}:${item.key}`,
        role,
        messages: [{ message: item.message, key: item.key }],
        timestamp,
        isStreaming: false,
      };
    } else {
      currentGroup.messages.push({ message: item.message, key: item.key });
    }
  }

  if (currentGroup) {
    result.push(currentGroup);
  }
  return result;
}

function buildChatItems(props: ChatProps): Array<ChatItem | MessageGroup> {
  const items: ChatItem[] = [];
  const history = Array.isArray(props.messages) ? props.messages : [];
  const tools = Array.isArray(props.toolMessages) ? props.toolMessages : [];
  
  console.log('[DEBUG] Building chat items:', {
    historyCount: history.length,
    toolsCount: tools.length,
    loading: props.loading,
    hasStream: props.stream !== null,
    streamLength: props.stream?.length ?? 0,
    streamPreview: props.stream?.substring(0, 100),
  });
  
  const historyStart = Math.max(0, history.length - CHAT_HISTORY_RENDER_LIMIT);
  if (historyStart > 0) {
    items.push({
      kind: "message",
      key: "chat:history:notice",
      message: {
        role: "system",
        content: `Showing last ${CHAT_HISTORY_RENDER_LIMIT} messages (${historyStart} hidden).`,
        timestamp: Date.now(),
      },
    });
  }
  for (let i = historyStart; i < history.length; i++) {
    const msg = history[i];
    const normalized = normalizeMessage(msg);

    if (!props.showThinking && normalized.role.toLowerCase() === "toolresult") {
      continue;
    }

    items.push({
      kind: "message",
      key: messageKey(msg, i),
      message: msg,
    });
  }
  if (props.showThinking) {
    for (let i = 0; i < tools.length; i++) {
      items.push({
        kind: "message",
        key: messageKey(tools[i], i + history.length),
        message: tools[i],
      });
    }
  }

  if (props.stream !== null) {
    const key = `stream:${props.sessionKey}:${props.streamStartedAt ?? "live"}`;
    console.log('[DEBUG] Adding stream item:', {
      key,
      streamLength: props.stream.length,
      hasContent: props.stream.trim().length > 0,
    });
    if (props.stream.trim().length > 0) {
      items.push({
        kind: "stream",
        key,
        text: props.stream,
        startedAt: props.streamStartedAt ?? Date.now(),
      });
    } else {
      items.push({ kind: "reading-indicator", key });
    }
  }

  const grouped = groupMessages(items);
  console.log('[DEBUG] Chat items built:', {
    itemsCount: items.length,
    groupedCount: grouped.length,
    lastItemKind: items[items.length - 1]?.kind,
  });
  
  return grouped;
}

function messageKey(message: unknown, index: number): string {
  const m = message as Record<string, unknown>;
  const toolCallId = typeof m.toolCallId === "string" ? m.toolCallId : "";
  if (toolCallId) {
    return `tool:${toolCallId}`;
  }
  const id = typeof m.id === "string" ? m.id : "";
  if (id) {
    return `msg:${id}`;
  }
  const messageId = typeof m.messageId === "string" ? m.messageId : "";
  if (messageId) {
    return `msg:${messageId}`;
  }
  const timestamp = typeof m.timestamp === "number" ? m.timestamp : null;
  const role = typeof m.role === "string" ? m.role : "unknown";
  if (timestamp != null) {
    return `msg:${role}:${timestamp}:${index}`;
  }
  return `msg:${role}:${index}`;
}
