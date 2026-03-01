import { html } from "lit";
import { icons } from "../icons";

export type UltronSettingsPageProps = {
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
  onSettingChange: (key: string, value: any) => void;
  onSave: () => void;
};

export function renderUltronSettingsPage(props: UltronSettingsPageProps) {
  return html`
    <div class="ultron-settings-page">
      <!-- Aparência -->
      <section class="ultron-settings-page__section card">
        <h3 class="ultron-settings-page__section-title">
          ${icons.palette}
          Aparência
        </h3>
        
        <div class="ultron-settings-page__item">
          <div class="ultron-settings-page__item-info">
            <label class="ultron-settings-page__label">Tema</label>
            <span class="ultron-settings-page__description">
              Escolha entre tema claro, escuro ou automático
            </span>
          </div>
          <select
            class="ultron-settings-page__select"
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

        <div class="ultron-settings-page__item">
          <div class="ultron-settings-page__item-info">
            <label class="ultron-settings-page__label">Idioma</label>
            <span class="ultron-settings-page__description">
              Idioma da interface do ULTRON
            </span>
          </div>
          <select
            class="ultron-settings-page__select"
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

        <div class="ultron-settings-page__item">
          <div class="ultron-settings-page__item-info">
            <label class="ultron-settings-page__label">Barra lateral recolhida</label>
            <span class="ultron-settings-page__description">
              Recolher a barra lateral por padrão
            </span>
          </div>
          <label class="ultron-settings-page__toggle">
            <input
              type="checkbox"
              .checked=${props.settings.navCollapsed}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                props.onSettingChange("navCollapsed", target.checked);
              }}
            />
            <span class="ultron-settings-page__toggle-slider"></span>
          </label>
        </div>
      </section>

      <!-- Chat -->
      <section class="ultron-settings-page__section card">
        <h3 class="ultron-settings-page__section-title">
          ${icons.messageSquare}
          Chat
        </h3>

        <div class="ultron-settings-page__item">
          <div class="ultron-settings-page__item-info">
            <label class="ultron-settings-page__label">Modo foco</label>
            <span class="ultron-settings-page__description">
              Ocultar elementos da interface para focar no chat
            </span>
          </div>
          <label class="ultron-settings-page__toggle">
            <input
              type="checkbox"
              .checked=${props.settings.chatFocusMode}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                props.onSettingChange("chatFocusMode", target.checked);
              }}
            />
            <span class="ultron-settings-page__toggle-slider"></span>
          </label>
        </div>

        <div class="ultron-settings-page__item">
          <div class="ultron-settings-page__item-info">
            <label class="ultron-settings-page__label">Mostrar raciocínio</label>
            <span class="ultron-settings-page__description">
              Exibir o processo de raciocínio da IA
            </span>
          </div>
          <label class="ultron-settings-page__toggle">
            <input
              type="checkbox"
              .checked=${props.settings.chatShowThinking}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                props.onSettingChange("chatShowThinking", target.checked);
              }}
            />
            <span class="ultron-settings-page__toggle-slider"></span>
          </label>
        </div>
      </section>

      <!-- Sistema -->
      <section class="ultron-settings-page__section card">
        <h3 class="ultron-settings-page__section-title">
          ${icons.cpu}
          Sistema
        </h3>

        <div class="ultron-settings-page__item">
          <div class="ultron-settings-page__item-info">
            <label class="ultron-settings-page__label">Salvamento automático</label>
            <span class="ultron-settings-page__description">
              Salvar configurações automaticamente
            </span>
          </div>
          <label class="ultron-settings-page__toggle">
            <input
              type="checkbox"
              .checked=${props.settings.autoSave}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                props.onSettingChange("autoSave", target.checked);
              }}
            />
            <span class="ultron-settings-page__toggle-slider"></span>
          </label>
        </div>

        <div class="ultron-settings-page__item">
          <div class="ultron-settings-page__item-info">
            <label class="ultron-settings-page__label">Notificações</label>
            <span class="ultron-settings-page__description">
              Receber notificações do sistema
            </span>
          </div>
          <label class="ultron-settings-page__toggle">
            <input
              type="checkbox"
              .checked=${props.settings.notifications}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                props.onSettingChange("notifications", target.checked);
              }}
            />
            <span class="ultron-settings-page__toggle-slider"></span>
          </label>
        </div>

        <div class="ultron-settings-page__item">
          <div class="ultron-settings-page__item-info">
            <label class="ultron-settings-page__label">Efeitos sonoros</label>
            <span class="ultron-settings-page__description">
              Reproduzir sons de notificação
            </span>
          </div>
          <label class="ultron-settings-page__toggle">
            <input
              type="checkbox"
              .checked=${props.settings.soundEffects}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                props.onSettingChange("soundEffects", target.checked);
              }}
            />
            <span class="ultron-settings-page__toggle-slider"></span>
          </label>
        </div>
      </section>

      <!-- Atualizações -->
      <section class="ultron-settings-page__section card">
        <h3 class="ultron-settings-page__section-title">
          ${icons.download}
          Atualizações do ULTRON
        </h3>

        <div class="ultron-settings-page__item">
          <div class="ultron-settings-page__item-info">
            <label class="ultron-settings-page__label">Sistema de atualizações</label>
            <span class="ultron-settings-page__description">
              Verifique e instale atualizações automaticamente do GitHub
            </span>
          </div>
          <button class="btn btn-primary" @click=${() => {
            // Abrir painel de atualizações
            window.dispatchEvent(new CustomEvent('open-updates-panel'));
          }}>
            ${icons.download}
            Gerenciar atualizações
          </button>
        </div>

        <div class="ultron-settings-page__update-info">
          <p class="ultron-settings-page__update-status">
            ${icons.info}
            Clique em "Gerenciar atualizações" para verificar novas versões
          </p>
        </div>
      </section>

      <!-- Informações -->
      <section class="ultron-settings-page__section card">
        <h3 class="ultron-settings-page__section-title">
          ${icons.info}
          Sobre
        </h3>

        <div class="ultron-settings-page__info">
          <div class="ultron-settings-page__info-item">
            <span class="ultron-settings-page__info-label">Versão</span>
            <span class="ultron-settings-page__info-value">1.0.0</span>
          </div>
          <div class="ultron-settings-page__info-item">
            <span class="ultron-settings-page__info-label">Desenvolvido por</span>
            <span class="ultron-settings-page__info-value">GHOST</span>
          </div>
          <div class="ultron-settings-page__info-item">
            <span class="ultron-settings-page__info-label">Powered by</span>
            <span class="ultron-settings-page__info-value">Moltbot</span>
          </div>
        </div>
      </section>

      <!-- Botão de salvar -->
      <div class="ultron-settings-page__actions">
        <button class="btn btn-primary" @click=${props.onSave}>
          ${icons.check}
          Salvar alterações
        </button>
      </div>
    </div>
  `;
}
