import { html, nothing } from "lit";
import { icons } from "../icons";
import type { SessionsListResult } from "../types";

export type NewSidebarProps = {
  showClawbotSettings: boolean;
  sessions: SessionsListResult | null;
  sessionKey: string;
  onNewTask: () => void;
  onAgents: () => void;
  onSearch: () => void;
  onNewProject: () => void;
  onHive?: () => void;
  onSessionSelect: (key: string) => void;
  onSettingsClick: (event: MouseEvent) => void;
  onCloseClawbotSettings: () => void;
  onTaskMenuOpen?: (event: MouseEvent, sessionKey: string) => void;
  taskMenuOpen?: string | null;
  taskMenuPosition?: { top: number; left: number } | null;
  onTaskMenuClose?: () => void;
  onPinTask?: (sessionKey: string) => void;
  onDeleteTask?: (sessionKey: string) => void;
  onArchiveTask?: (sessionKey: string) => void;
  onRenameTask?: (sessionKey: string) => void;
  onShareTask?: (sessionKey: string) => void;
  hiveCreated?: boolean;
};

// Determina o ícone da tarefa baseado no nome/label
function getTaskIcon(displayName: string) {
  const lowerName = displayName.toLowerCase();
  
  // Ícones específicos baseados em palavras-chave
  if (lowerName.includes('código') || lowerName.includes('code') || lowerName.includes('programar')) {
    return icons.code;
  }
  if (lowerName.includes('bug') || lowerName.includes('erro') || lowerName.includes('error')) {
    return icons.bug;
  }
  if (lowerName.includes('design') || lowerName.includes('ui') || lowerName.includes('interface')) {
    return icons.palette;
  }
  if (lowerName.includes('doc') || lowerName.includes('documento')) {
    return icons.fileText;
  }
  if (lowerName.includes('api') || lowerName.includes('integra')) {
    return icons.plug;
  }
  if (lowerName.includes('teste') || lowerName.includes('test')) {
    return icons.wrench;
  }
  if (lowerName.includes('ideia') || lowerName.includes('idea') || lowerName.includes('brainstorm')) {
    return icons.lightbulb;
  }
  if (lowerName.includes('projeto') || lowerName.includes('project')) {
    return icons.folder;
  }
  if (lowerName.includes('principal') || lowerName.includes('main')) {
    return icons.brain;
  }
  
  // Ícone padrão
  return icons.messageSquare;
}

export function renderNewSidebar(props: NewSidebarProps) {
  if (props.showClawbotSettings) {
    return renderClawbotSettings(props);
  }

  return html`
    <div class="new-sidebar">
      <!-- Botões principais -->
      <div class="new-sidebar__actions">
        <button 
          class="new-sidebar__action-btn" 
          @click=${(e: MouseEvent) => { e.preventDefault(); props.onNewTask(); }} 
          title="Nova Tarefa"
        >
          ${icons.plus}
          <span>Nova Tarefa</span>
        </button>
        <button 
          class="new-sidebar__action-btn" 
          @click=${(e: MouseEvent) => { e.preventDefault(); props.onAgents(); }} 
          title="Agents"
        >
          ${icons.bot}
          <span>Agents</span>
        </button>
        <button 
          class="new-sidebar__action-btn" 
          @click=${(e: MouseEvent) => { e.preventDefault(); props.onSearch(); }} 
          title="Procurar"
        >
          ${icons.search}
          <span>Procurar</span>
        </button>
        <button 
          class="new-sidebar__action-btn" 
          @click=${(e: MouseEvent) => { e.preventDefault(); props.onNewProject(); }} 
          title="Novo Projeto"
        >
          ${icons.folder}
          <span>Novo Projeto</span>
        </button>
        ${props.hiveCreated ? html`
          <button 
            class="new-sidebar__action-btn" 
            @click=${(e: MouseEvent) => { e.preventDefault(); if (props.onHive) props.onHive(); }} 
            title="Colmeia"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 7.5L14.5 9v3L12 13.5 9.5 12V9L12 7.5z"/>
              <path d="M12 2L14.5 3.5v3L12 8 9.5 6.5v-3L12 2z"/>
              <path d="M12 13L14.5 14.5v3L12 19 9.5 17.5v-3L12 13z"/>
              <path d="M6.5 4.75L9 6.25v3L6.5 10.75 4 9.25v-3L6.5 4.75z"/>
              <path d="M17.5 4.75L20 6.25v3L17.5 10.75 15 9.25v-3L17.5 4.75z"/>
              <path d="M6.5 10.25L9 11.75v3L6.5 16.25 4 14.75v-3L6.5 10.25z"/>
              <path d="M17.5 10.25L20 11.75v3L17.5 16.25 15 14.75v-3L17.5 10.25z"/>
            </svg>
            <span>Colmeia</span>
          </button>
        ` : nothing}
        <div style="position: relative;">
          <button 
            class="new-sidebar__action-btn" 
            @click=${(e: MouseEvent) => { e.preventDefault(); props.onSettingsClick(e); }} 
            title="Configurações"
          >
            ${icons.settings}
            <span>Configurações</span>
          </button>
        </div>
      </div>

      <!-- Lista de tarefas (chats) -->
      <div class="new-sidebar__tasks">
        <div class="new-sidebar__tasks-header">
          <span>Tarefas</span>
        </div>
        <div class="new-sidebar__tasks-list">
          ${props.sessions?.sessions?.map(
            (session) => {
              // Usar o label se disponível, caso contrário formatar o timestamp
              let displayName = session.label || session.displayName || session.key;
              
              // Se não tiver label e for uma chave de sessão, formatar o timestamp
              if (!session.label && displayName.includes(':')) {
                const parts = displayName.split(':');
                // Procurar por timestamp (número grande)
                for (const part of parts) {
                  const timestamp = parseInt(part);
                  if (!isNaN(timestamp) && timestamp > 1000000000000) {
                    const date = new Date(timestamp);
                    displayName = `Chat ${date.toLocaleDateString('pt-PT', { 
                      day: '2-digit', 
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}`;
                    break;
                  }
                }
              }
              
              // Se for a sessão principal, usar nome especial
              if (session.key === 'agent:main:main') {
                displayName = session.label || 'Chat Principal';
              }
              
              const taskIcon = getTaskIcon(displayName);
              
              return html`
                <div class="new-sidebar__task-wrapper">
                  <button
                    class="new-sidebar__task-item ${session.key === props.sessionKey
                      ? "new-sidebar__task-item--active"
                      : ""}"
                    @click=${(e: MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('[DEBUG] Task clicked:', session.key);
                      props.onSessionSelect(session.key);
                    }}
                    title=${displayName}
                  >
                    <span class="new-sidebar__task-icon">
                      ${taskIcon}
                    </span>
                    <span class="new-sidebar__task-label">
                      ${displayName}
                    </span>
                  </button>
                  <button
                    class="new-sidebar__task-menu-btn"
                    @click=${(e: MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (props.onTaskMenuOpen) {
                        props.onTaskMenuOpen(e, session.key);
                      }
                    }}
                    title="Mais opções"
                  >
                    ${icons.moreVertical}
                  </button>
                </div>
              `;
            },
          )}
        </div>
      </div>
    </div>
    
    ${props.taskMenuOpen && props.taskMenuPosition ? html`
      <div class="task-menu-overlay" @click=${props.onTaskMenuClose}></div>
      <div 
        class="task-menu" 
        style="top: ${props.taskMenuPosition.top}px; left: ${props.taskMenuPosition.left}px;"
      >
        <button 
          class="task-menu__item"
          @click=${() => {
            if (props.onPinTask && props.taskMenuOpen) {
              props.onPinTask(props.taskMenuOpen);
            }
            if (props.onTaskMenuClose) {
              props.onTaskMenuClose();
            }
          }}
        >
          ${icons.pin}
          <span>Fixar</span>
        </button>
        <button 
          class="task-menu__item"
          @click=${() => {
            if (props.onRenameTask && props.taskMenuOpen) {
              props.onRenameTask(props.taskMenuOpen);
            }
            if (props.onTaskMenuClose) {
              props.onTaskMenuClose();
            }
          }}
        >
          ${icons.edit}
          <span>Mudar nome</span>
        </button>
        <button 
          class="task-menu__item"
          @click=${() => {
            if (props.onArchiveTask && props.taskMenuOpen) {
              props.onArchiveTask(props.taskMenuOpen);
            }
            if (props.onTaskMenuClose) {
              props.onTaskMenuClose();
            }
          }}
        >
          ${icons.archive}
          <span>Arquivar</span>
        </button>
        <button 
          class="task-menu__item"
          @click=${() => {
            if (props.onShareTask && props.taskMenuOpen) {
              props.onShareTask(props.taskMenuOpen);
            }
            if (props.onTaskMenuClose) {
              props.onTaskMenuClose();
            }
          }}
        >
          ${icons.share}
          <span>Partilhar com a colmeia</span>
        </button>
        <div class="task-menu__divider"></div>
        <button 
          class="task-menu__item task-menu__item--danger"
          @click=${() => {
            if (props.onDeleteTask && props.taskMenuOpen) {
              props.onDeleteTask(props.taskMenuOpen);
            }
            if (props.onTaskMenuClose) {
              props.onTaskMenuClose();
            }
          }}
        >
          ${icons.trash}
          <span>Eliminar</span>
        </button>
      </div>
    ` : nothing}
  `;
}

function renderClawbotSettings(props: NewSidebarProps) {
  return html`
    <div class="clawbot-settings">
      <div class="clawbot-settings__header">
        <h3>Configurações do Clawbot</h3>
        <button
          class="clawbot-settings__close"
          @click=${props.onCloseClawbotSettings}
          title="Voltar"
        >
          ${icons.x}
        </button>
      </div>
      <div class="clawbot-settings__content">
        <!-- Aqui vai o conteúdo da barra lateral antiga -->
        <p>Configurações do Clawbot (barra lateral antiga)</p>
      </div>
    </div>
  `;
}
