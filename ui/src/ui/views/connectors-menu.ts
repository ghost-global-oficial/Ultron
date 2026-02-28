import { html } from "lit";
import { icons } from "../icons";

export type Connector = {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  requiresAuth: boolean;
};

export type ConnectorsMenuProps = {
  isOpen: boolean;
  position: { top: number; left: number } | null;
  connectors: Connector[];
  onClose: () => void;
  onToggleConnector: (id: string) => void;
  onConnectConnector: (id: string) => void;
  onAddConnectors: () => void;
  onManageConnectors: () => void;
};

export function renderConnectorsMenu(props: ConnectorsMenuProps) {
  if (!props.isOpen || !props.position) {
    return html``;
  }

  return html`
    <div
      class="connectors-menu-overlay"
      @click=${props.onClose}
    ></div>
    <div
      class="connectors-menu"
      style="top: ${props.position.top}px; left: ${props.position.left}px;"
      @click=${(e: Event) => e.stopPropagation()}
    >
      <div class="connectors-menu__list">
        ${props.connectors.map(
          (connector) => html`
            <div class="connectors-menu__item">
              <div class="connectors-menu__item-left">
                <div class="connectors-menu__icon">
                  ${connector.icon === "chrome"
                    ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>`
                    : html`<img src="/${connector.icon}.png" alt="${connector.name}" />`}
                </div>
                <span class="connectors-menu__name">${connector.name}</span>
              </div>
              <div class="connectors-menu__item-right">
                ${connector.requiresAuth && !connector.enabled
                  ? html`
                      <button
                        class="connectors-menu__connect-btn"
                        @click=${() => props.onConnectConnector(connector.id)}
                      >
                        Conectar
                      </button>
                    `
                  : html`
                      <label class="connectors-menu__toggle">
                        <input
                          type="checkbox"
                          .checked=${connector.enabled}
                          @change=${() => props.onToggleConnector(connector.id)}
                        />
                        <span class="connectors-menu__toggle-slider"></span>
                      </label>
                    `}
              </div>
            </div>
          `,
        )}
      </div>

      <div class="connectors-menu__footer">
        <button
          class="connectors-menu__footer-btn"
          @click=${props.onAddConnectors}
        >
          ${icons.plus}
          Adicionar conectores
        </button>
        <button
          class="connectors-menu__footer-btn"
          @click=${props.onManageConnectors}
        >
          ${icons.sliders}
          Gerir conectores
        </button>
      </div>
    </div>
  `;
}
