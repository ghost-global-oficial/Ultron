import { html } from "lit";
import { icons } from "../icons";

export type SettingsMenuProps = {
  isOpen: boolean;
  position: { top: number; left: number } | null;
  onClawbotSettings: () => void;
  onClose: () => void;
};

export function renderSettingsMenu(props: SettingsMenuProps) {
  if (!props.isOpen) {
    return html``;
  }

  const style = props.position
    ? `top: ${props.position.top}px; left: ${props.position.left}px;`
    : "";

  return html`
    <div class="settings-menu-overlay" @click=${props.onClose}>
      <div class="settings-menu" style=${style} @click=${(e: Event) => e.stopPropagation()}>
        <button class="settings-menu__item" @click=${props.onClawbotSettings}>
          ${icons.bot}
          <span>Configurações do Clawbot</span>
        </button>
      </div>
    </div>
  `;
}
