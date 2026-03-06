import { html } from "lit";
import { renderSectionContent } from "./manage-connectors-sections";

export type ConnectorSettings = {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
};

export type ManageConnectorsSettingsProps = {
  isOpen: boolean;
  connectors: ConnectorSettings[];
  activeSection: "account" | "scheduled-tasks" | "data-control" | "personalization" | "skills" | "connectors" | "integrations" | "hive" | "updates" | "help";
  onClose: () => void;
  onSectionChange: (section: "account" | "scheduled-tasks" | "data-control" | "personalization" | "skills" | "connectors" | "integrations" | "hive" | "updates" | "help") => void;
  onConnectorClick: (id: string) => void;
  onAddConnectors: () => void;
};

export function renderManageConnectorsSettings(props: ManageConnectorsSettingsProps) {
  if (!props.isOpen) {
    return html``;
  }

  return html`
    <div class="manage-connectors-settings-overlay" @click=${props.onClose}></div>
    <div class="manage-connectors-settings" @click=${(e: Event) => e.stopPropagation()}>
      <div class="manage-connectors-settings__sidebar">
        <div class="manage-connectors-settings__brand">
          <span>ULTRON</span>
        </div>

        <nav class="manage-connectors-settings__nav">
          <a 
            class="manage-connectors-settings__nav-item ${props.activeSection === "account" ? "manage-connectors-settings__nav-item--active" : ""}"
            @click=${() => props.onSectionChange("account")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Conta
          </a>
          <a 
            class="manage-connectors-settings__nav-item ${props.activeSection === "scheduled-tasks" ? "manage-connectors-settings__nav-item--active" : ""}"
            @click=${() => props.onSectionChange("scheduled-tasks")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            Tarefas agendadas
          </a>
          <a 
            class="manage-connectors-settings__nav-item ${props.activeSection === "data-control" ? "manage-connectors-settings__nav-item--active" : ""}"
            @click=${() => props.onSectionChange("data-control")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
            Controlo de dados
          </a>
          <a 
            class="manage-connectors-settings__nav-item ${props.activeSection === "personalization" ? "manage-connectors-settings__nav-item--active" : ""}"
            @click=${() => props.onSectionChange("personalization")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
            </svg>
            Personalização
          </a>
          <a 
            class="manage-connectors-settings__nav-item ${props.activeSection === "skills" ? "manage-connectors-settings__nav-item--active" : ""}"
            @click=${() => props.onSectionChange("skills")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Habilidades
          </a>
          <a 
            class="manage-connectors-settings__nav-item ${props.activeSection === "connectors" ? "manage-connectors-settings__nav-item--active" : ""}"
            @click=${() => props.onSectionChange("connectors")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            Conectores
          </a>
          <a 
            class="manage-connectors-settings__nav-item ${props.activeSection === "integrations" ? "manage-connectors-settings__nav-item--active" : ""}"
            @click=${() => props.onSectionChange("integrations")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Modelos
          </a>
          <a 
            class="manage-connectors-settings__nav-item ${props.activeSection === "hive" ? "manage-connectors-settings__nav-item--active" : ""}"
            @click=${() => props.onSectionChange("hive")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <!-- Hexágono central -->
              <path d="M12 7.5L14.5 9v3L12 13.5 9.5 12V9L12 7.5z"/>
              <!-- Hexágono superior -->
              <path d="M12 2L14.5 3.5v3L12 8 9.5 6.5v-3L12 2z"/>
              <!-- Hexágono inferior -->
              <path d="M12 13L14.5 14.5v3L12 19 9.5 17.5v-3L12 13z"/>
              <!-- Hexágono esquerdo superior -->
              <path d="M6.5 4.75L9 6.25v3L6.5 10.75 4 9.25v-3L6.5 4.75z"/>
              <!-- Hexágono direito superior -->
              <path d="M17.5 4.75L20 6.25v3L17.5 10.75 15 9.25v-3L17.5 4.75z"/>
              <!-- Hexágono esquerdo inferior -->
              <path d="M6.5 10.25L9 11.75v3L6.5 16.25 4 14.75v-3L6.5 10.25z"/>
              <!-- Hexágono direito inferior -->
              <path d="M17.5 10.25L20 11.75v3L17.5 16.25 15 14.75v-3L17.5 10.25z"/>
            </svg>
            Colmeia
          </a>
          <a 
            class="manage-connectors-settings__nav-item ${props.activeSection === "updates" ? "manage-connectors-settings__nav-item--active" : ""}"
            @click=${() => props.onSectionChange("updates")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Atualizações
          </a>
          <a 
            class="manage-connectors-settings__nav-item ${props.activeSection === "help" ? "manage-connectors-settings__nav-item--active" : ""}"
            @click=${() => props.onSectionChange("help")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
            Obter ajuda
          </a>
        </nav>
      </div>

      <div class="manage-connectors-settings__content">
        ${renderSectionContent(props)}
      </div>
    </div>
  `;
}
