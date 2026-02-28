import { html, nothing } from "lit";
import { icons } from "../icons";

export type UltronSettingsProps = {
  isOpen: boolean;
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
  onClose: () => void;
  onSettingChange: (key: string, value: any) => void;
  onSave: () => void;
};

export function renderUltronSettings(props: UltronSettingsProps) {
  if (!props.isOpen) {
    return nothing;
  }

  return html`
    <div class="ultron-settings-overlay" @click=${props.onClose}>
      <div class="ultron-settings" @click=${(e: Event) => e.stopPropagation()}>
        <!-- Header -->
        <div class="ultron-settings__header">
          <div class="ultron-settings__title">
            ${icons.settings}
            <span>Configurações do ULTRON</span>
          </div>
          <button
            class="ultron-settings__close"
            @click=${props.onClose}
            aria-label="Fechar"
          >
            ${icons.x}
          </button>
        </div>

        <!-- Content -->
        <div class="ultron-settings__content">
          <!-- Aparência -->
          <section class="ultron-settings__section">
            <h3 class="ultron-settings__section-title">
              ${icons.palette}
              Aparência
            </h3>
            
            <div class="ultron-settings__item">
              <div class="ultron-settings__item-info">
                <label class="ultron-settings__label">Tema</label>
                <span class="ultron-settings__description">
                  Escolha entre tema claro, escuro ou automático
                </span>
              </div>
              <select
                class="ultron-settings__select"
                .value=${props.settings.theme}
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

            <div class="ultron-settings__item">
              <div class="ultron-settings__item-info">
                <label class="ultron-settings__label">Idioma</label>
                <span class="ultron-settings__description">
                  Idioma da interface do ULTRON
                </span>
              </div>
              <select
                class="ultron-settings__select"
                .value=${props.settings.language}
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

            <div class="ultron-settings__item">
              <div class="ultron-settings__item-info">
                <label class="ultron-settings__label">Barra lateral recolhida</label>
                <span class="ultron-settings__description">
                  Recolher a barra lateral por padrão
                </span>
              </div>
              <label class="ultron-settings__toggle">
                <input
                  type="checkbox"
                  .checked=${props.settings.navCollapsed}
                  @change=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    props.onSettingChange("navCollapsed", target.checked);
                  }}
                />
                <span class="ultron-settings__toggle-slider"></span>
              </label>
            </div>
          </section>

          <!-- Chat -->
          <section class="ultron-settings__section">
            <h3 class="ultron-settings__section-title">
              ${icons.messageSquare}
              Chat
            </h3>

            <div class="ultron-settings__item">
              <div class="ultron-settings__item-info">
                <label class="ultron-settings__label">Modo foco</label>
                <span class="ultron-settings__description">
                  Ocultar elementos da interface para focar no chat
                </span>
              </div>
              <label class="ultron-settings__toggle">
                <input
                  type="checkbox"
                  .checked=${props.settings.chatFocusMode}
                  @change=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    props.onSettingChange("chatFocusMode", target.checked);
                  }}
                />
                <span class="ultron-settings__toggle-slider"></span>
              </label>
            </div>

            <div class="ultron-settings__item">
              <div class="ultron-settings__item-info">
                <label class="ultron-settings__label">Mostrar raciocínio</label>
                <span class="ultron-settings__description">
                  Exibir o processo de raciocínio da IA
                </span>
              </div>
              <label class="ultron-settings__toggle">
                <input
                  type="checkbox"
                  .checked=${props.settings.chatShowThinking}
                  @change=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    props.onSettingChange("chatShowThinking", target.checked);
                  }}
                />
                <span class="ultron-settings__toggle-slider"></span>
              </label>
            </div>
          </section>

          <!-- Sistema -->
          <section class="ultron-settings__section">
            <h3 class="ultron-settings__section-title">
              ${icons.cpu}
              Sistema
            </h3>

            <div class="ultron-settings__item">
              <div class="ultron-settings__item-info">
                <label class="ultron-settings__label">Salvamento automático</label>
                <span class="ultron-settings__description">
                  Salvar configurações automaticamente
                </span>
              </div>
              <label class="ultron-settings__toggle">
                <input
                  type="checkbox"
                  .checked=${props.settings.autoSave}
                  @change=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    props.onSettingChange("autoSave", target.checked);
                  }}
                />
                <span class="ultron-settings__toggle-slider"></span>
              </label>
            </div>

            <div class="ultron-settings__item">
              <div class="ultron-settings__item-info">
                <label class="ultron-settings__label">Notificações</label>
                <span class="ultron-settings__description">
                  Receber notificações do sistema
                </span>
              </div>
              <label class="ultron-settings__toggle">
                <input
                  type="checkbox"
                  .checked=${props.settings.notifications}
                  @change=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    props.onSettingChange("notifications", target.checked);
                  }}
                />
                <span class="ultron-settings__toggle-slider"></span>
              </label>
            </div>

            <div class="ultron-settings__item">
              <div class="ultron-settings__item-info">
                <label class="ultron-settings__label">Efeitos sonoros</label>
                <span class="ultron-settings__description">
                  Reproduzir sons de notificação
                </span>
              </div>
              <label class="ultron-settings__toggle">
                <input
                  type="checkbox"
                  .checked=${props.settings.soundEffects}
                  @change=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    props.onSettingChange("soundEffects", target.checked);
                  }}
                />
                <span class="ultron-settings__toggle-slider"></span>
              </label>
            </div>
          </section>

          <!-- Informações -->
          <section class="ultron-settings__section">
            <h3 class="ultron-settings__section-title">
              ${icons.info}
              Sobre
            </h3>

            <div class="ultron-settings__info">
              <div class="ultron-settings__info-item">
                <span class="ultron-settings__info-label">Versão</span>
                <span class="ultron-settings__info-value">1.0.0</span>
              </div>
              <div class="ultron-settings__info-item">
                <span class="ultron-settings__info-label">Desenvolvido por</span>
                <span class="ultron-settings__info-value">GHOST</span>
              </div>
              <div class="ultron-settings__info-item">
                <span class="ultron-settings__info-label">Powered by</span>
                <span class="ultron-settings__info-value">Moltbot</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <div class="ultron-settings__footer">
          <button class="btn" @click=${props.onClose}>
            Cancelar
          </button>
          <button class="btn btn-primary" @click=${props.onSave}>
            ${icons.check}
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  `;
}
