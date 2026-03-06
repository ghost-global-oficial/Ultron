import { html, render } from "lit";
import { icons } from "../icons";
import type { ManageConnectorsSettingsProps } from "./manage-connectors-settings";
import { hiveManager, type HiveMember } from "../../hive/hive-manager";
import { HiveManager } from "../../hive/hive-manager";

// Funções auxiliares para modais (substituem alert e confirm do Electron)
function showAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    const modalHtml = html`
      <div class="input-modal-overlay" @click=${(e: Event) => {
        if ((e.target as HTMLElement).classList.contains('input-modal-overlay')) {
          (e.target as HTMLElement).remove();
          resolve();
        }
      }}>
        <div class="input-modal">
          <h3 class="input-modal__title">Aviso</h3>
          <p class="input-modal__message">${message}</p>
          <div class="input-modal__actions">
            <button 
              class="input-modal__button input-modal__button--primary"
              @click=${(e: Event) => {
                const modal = (e.target as HTMLElement).closest('.input-modal-overlay');
                modal?.remove();
                resolve();
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    `;
    
    const container = document.createElement('div');
    render(modalHtml, container);
    document.body.appendChild(container.firstElementChild!);
  });
}

function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const modalHtml = html`
      <div class="input-modal-overlay" @click=${(e: Event) => {
        if ((e.target as HTMLElement).classList.contains('input-modal-overlay')) {
          (e.target as HTMLElement).remove();
          resolve(false);
        }
      }}>
        <div class="input-modal">
          <h3 class="input-modal__title">Confirmação</h3>
          <p class="input-modal__message">${message}</p>
          <div class="input-modal__actions">
            <button 
              class="input-modal__button input-modal__button--secondary"
              @click=${(e: Event) => {
                const modal = (e.target as HTMLElement).closest('.input-modal-overlay');
                modal?.remove();
                resolve(false);
              }}
            >
              Cancelar
            </button>
            <button 
              class="input-modal__button input-modal__button--primary"
              @click=${(e: Event) => {
                const modal = (e.target as HTMLElement).closest('.input-modal-overlay');
                modal?.remove();
                resolve(true);
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    `;
    
    const container = document.createElement('div');
    render(modalHtml, container);
    document.body.appendChild(container.firstElementChild!);
  });
}

export function renderSectionContent(props: ManageConnectorsSettingsProps) {
  switch (props.activeSection) {
    case "account":
      return renderAccountSection(props);
    case "scheduled-tasks":
      return renderScheduledTasksSection(props);
    case "data-control":
      return renderDataControlSection(props);
    case "personalization":
      return renderPersonalizationSection(props);
    case "skills":
      return renderSkillsSection(props);
    case "connectors":
      return renderConnectorsSection(props);
    case "integrations":
      return renderIntegrationsSection(props);
    case "hive":
      return renderHiveSection(props);
    case "updates":
      return renderUpdatesSection(props);
    case "help":
      return renderHelpSection(props);
    default:
      return renderConnectorsSection(props);
  }
}

function renderAccountSection(props: ManageConnectorsSettingsProps) {
  // Obter ou gerar credenciais únicas para este ULTRON
  let ultronId = localStorage.getItem('ultron_id');
  let accessToken = localStorage.getItem('ultron_access_token');
  let passphrase1 = localStorage.getItem('ultron_passphrase1');
  let passphrase2 = localStorage.getItem('ultron_passphrase2');
  
  // Se não existirem, gerar e salvar
  if (!ultronId || !accessToken || !passphrase1 || !passphrase2) {
    ultronId = `ULTRON-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    accessToken = `tk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    passphrase1 = generatePassphrase();
    passphrase2 = generatePassphrase();
    
    localStorage.setItem('ultron_id', ultronId);
    localStorage.setItem('ultron_access_token', accessToken);
    localStorage.setItem('ultron_passphrase1', passphrase1);
    localStorage.setItem('ultron_passphrase2', passphrase2);
  }

  return html`
    <div class="manage-connectors-settings__header">
      <h2 class="manage-connectors-settings__title">Conta</h2>
      <button class="manage-connectors-settings__close" @click=${props.onClose}>
        ${icons.x}
      </button>
    </div>
    <div class="manage-connectors-settings__section">
      <div class="settings-section">
        <h3 class="settings-section__title">Credenciais do ULTRON</h3>
        <p class="settings-section__description">
          Estas credenciais identificam este ULTRON de forma única e serão utilizadas no sistema de colmeias.
        </p>
        
        <div class="credential-field">
          <label class="credential-field__label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            ID de Identificação
          </label>
          <div class="credential-field__value-container">
            <input type="text" class="credential-field__value" value="${ultronId}" readonly />
            <button class="credential-field__copy" @click=${() => copyToClipboard(ultronId)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="credential-field">
          <label class="credential-field__label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Token de Acesso
          </label>
          <div class="credential-field__value-container">
            <input type="password" class="credential-field__value credential-field__value--token" value="${accessToken}" readonly />
            <button class="credential-field__toggle" @click=${(e: Event) => togglePasswordVisibility(e)}>
              <svg class="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg class="eye-off-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                <line x1="2" x2="22" y1="2" y2="22"/>
              </svg>
            </button>
            <button class="credential-field__copy" @click=${() => copyToClipboard(accessToken)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="credential-field">
          <label class="credential-field__label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Palavra-passe 1
          </label>
          <div class="credential-field__value-container">
            <input type="text" class="credential-field__value credential-field__value--passphrase" value="${passphrase1}" readonly />
            <button class="credential-field__copy" @click=${() => copyToClipboard(passphrase1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="credential-field">
          <label class="credential-field__label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Palavra-passe 2
          </label>
          <div class="credential-field__value-container">
            <input type="text" class="credential-field__value credential-field__value--passphrase" value="${passphrase2}" readonly />
            <button class="credential-field__copy" @click=${() => copyToClipboard(passphrase2)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="credential-warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>
          <div>
            <strong>Importante:</strong> Guarde estas credenciais em local seguro. Serão necessárias para conectar este ULTRON a uma colmeia.
          </div>
        </div>
      </div>

      <!-- Zona de Perigo -->
      <div class="settings-section settings-section--danger">
        <h3 class="settings-section__title">Zona de Perigo</h3>
        <p class="settings-section__description">
          Ações irreversíveis que afetam permanentemente este ULTRON.
        </p>
        
        <div class="danger-action">
          <div class="danger-action__info">
            <h4 class="danger-action__title">Apagar ULTRON</h4>
            <p class="danger-action__description">
              Remove toda a configuração do gateway, incluindo credenciais, vault e histórico. 
              Você precisará configurar tudo novamente na próxima execução.
            </p>
          </div>
          <button 
            class="btn btn-danger" 
            @click=${async () => {
              const confirmed = await showConfirm(
                'Tem certeza que deseja apagar toda a configuração? Esta ação não pode ser desfeita.'
              );
              
              if (confirmed) {
                try {
                  // Chamar o IPC para deletar a configuração
                  const { ipcRenderer } = (window as any).require('electron');
                  const result = await ipcRenderer.invoke('delete-ultron-config');
                  
                  if (result.success) {
                    await showAlert(
                      'A configuração do ULTRON foi apagada com sucesso. O aplicativo será reiniciado.'
                    );
                    
                    // Recarregar a página para voltar ao wizard
                    window.location.reload();
                  } else {
                    await showAlert(
                      'Erro ao apagar configuração: ' + result.error
                    );
                  }
                } catch (error) {
                  console.error('Erro ao apagar ULTRON:', error);
                  await showAlert(
                    'Erro ao apagar configuração: ' + (error as Error).message
                  );
                }
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" x2="10" y1="11" y2="17"/>
              <line x1="14" x2="14" y1="11" y2="17"/>
            </svg>
            Apagar ULTRON
          </button>
        </div>
      </div>
    </div>
  `;
}

// Funções auxiliares
function generatePassphrase(): string {
  const words = [
    'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel',
    'india', 'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa',
    'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'xray',
    'yankee', 'zulu', 'phoenix', 'dragon', 'falcon', 'eagle', 'hawk', 'raven'
  ];
  const word1 = words[Math.floor(Math.random() * words.length)];
  const word2 = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${word1}-${word2}-${num}`;
}

function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text).then(() => {
    // Feedback visual (pode adicionar toast notification)
    console.log('Copiado para área de transferência:', text);
  });
}

function togglePasswordVisibility(e: Event): void {
  const button = e.currentTarget as HTMLButtonElement;
  const container = button.closest('.credential-field__value-container');
  const input = container?.querySelector('.credential-field__value--token') as HTMLInputElement;
  const eyeIcon = button.querySelector('.eye-icon') as SVGElement;
  const eyeOffIcon = button.querySelector('.eye-off-icon') as SVGElement;
  
  if (input && eyeIcon && eyeOffIcon) {
    if (input.type === 'password') {
      input.type = 'text';
      eyeIcon.style.display = 'none';
      eyeOffIcon.style.display = 'block';
    } else {
      input.type = 'password';
      eyeIcon.style.display = 'block';
      eyeOffIcon.style.display = 'none';
    }
  }
}

function renderScheduledTasksSection(props: ManageConnectorsSettingsProps) {
  return html`
    <div class="manage-connectors-settings__header">
      <h2 class="manage-connectors-settings__title">Tarefas agendadas</h2>
      <button class="manage-connectors-settings__close" @click=${props.onClose}>
        ${icons.x}
      </button>
    </div>
    <div class="manage-connectors-settings__section">
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
          <line x1="16" x2="16" y1="2" y2="6"/>
          <line x1="8" x2="8" y1="2" y2="6"/>
          <line x1="3" x2="21" y1="10" y2="10"/>
        </svg>
        <h3 class="empty-state__title">Nenhuma tarefa agendada</h3>
        <p class="empty-state__description">Crie tarefas automáticas para executar em horários específicos</p>
        <button class="btn btn-primary">
          ${icons.plus}
          Criar tarefa agendada
        </button>
      </div>
    </div>
  `;
}

function renderDataControlSection(props: ManageConnectorsSettingsProps) {
  return html`
    <div class="manage-connectors-settings__header">
      <h2 class="manage-connectors-settings__title">Controlo de dados</h2>
      <button class="manage-connectors-settings__close" @click=${props.onClose}>
        ${icons.x}
      </button>
    </div>
    <div class="manage-connectors-settings__section">
      <div class="settings-section">
        <h3 class="settings-section__title">Armazenamento</h3>
        <div class="storage-bar">
          <div class="storage-bar__info">
            <span>2.4 GB de 10 GB usados</span>
            <span>24%</span>
          </div>
          <div class="storage-bar__progress">
            <div class="storage-bar__fill" style="width: 24%"></div>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <h3 class="settings-section__title">Privacidade</h3>
        <div class="settings-toggle">
          <div class="settings-toggle__info">
            <span class="settings-toggle__label">Análise de uso</span>
            <span class="settings-toggle__description">Ajude-nos a melhorar compartilhando dados anônimos</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked />
            <span class="toggle-switch__slider"></span>
          </label>
        </div>
      </div>
      
      <div class="settings-section settings-section--danger">
        <h3 class="settings-section__title">Zona de perigo</h3>
        <button class="settings-field__button settings-field__button--secondary">Exportar dados</button>
        <button class="settings-field__button settings-field__button--danger">Eliminar todos os dados</button>
      </div>
    </div>
  `;
}

function renderPersonalizationSection(props: ManageConnectorsSettingsProps) {
  return html`
    <div class="manage-connectors-settings__header">
      <h2 class="manage-connectors-settings__title">Personalização</h2>
      <button class="manage-connectors-settings__close" @click=${props.onClose}>
        ${icons.x}
      </button>
    </div>
    <div class="manage-connectors-settings__section">
      <div class="settings-section">
        <h3 class="settings-section__title">Aparência</h3>
        <div class="settings-field">
          <label class="settings-field__label">Tema</label>
          <select class="settings-field__select">
            <option value="system">Sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </div>
        <div class="settings-field">
          <label class="settings-field__label">Idioma</label>
          <select class="settings-field__select">
            <option value="pt">Português</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>
      
      <div class="settings-section">
        <h3 class="settings-section__title">Comportamento</h3>
        <div class="settings-toggle">
          <div class="settings-toggle__info">
            <span class="settings-toggle__label">Modo foco</span>
            <span class="settings-toggle__description">Oculta elementos da interface para melhor concentração</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" />
            <span class="toggle-switch__slider"></span>
          </label>
        </div>
        <div class="settings-toggle">
          <div class="settings-toggle__info">
            <span class="settings-toggle__label">Notificações</span>
            <span class="settings-toggle__description">Receba alertas sobre atividades importantes</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked />
            <span class="toggle-switch__slider"></span>
          </label>
        </div>
      </div>
    </div>
  `;
}

function renderSkillsSection(props: ManageConnectorsSettingsProps) {
  return html`
    <div class="manage-connectors-settings__header">
      <h2 class="manage-connectors-settings__title">Habilidades</h2>
      <button class="manage-connectors-settings__close" @click=${props.onClose}>
        ${icons.x}
      </button>
    </div>
    <div class="manage-connectors-settings__section">
      <div class="skills-grid">
        <div class="skill-card">
          <div class="skill-card__header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <path d="M2 12h20"/>
            </svg>
            <label class="toggle-switch toggle-switch--small">
              <input type="checkbox" checked />
              <span class="toggle-switch__slider"></span>
            </label>
          </div>
          <h4 class="skill-card__title">Pesquisa Web</h4>
          <p class="skill-card__description">Busca informações na internet</p>
        </div>
        
        <div class="skill-card">
          <div class="skill-card__header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            <label class="toggle-switch toggle-switch--small">
              <input type="checkbox" checked />
              <span class="toggle-switch__slider"></span>
            </label>
          </div>
          <h4 class="skill-card__title">Execução de Código</h4>
          <p class="skill-card__description">Executa código em sandbox</p>
        </div>
        
        <div class="skill-card">
          <div class="skill-card__header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            <label class="toggle-switch toggle-switch--small">
              <input type="checkbox" />
              <span class="toggle-switch__slider"></span>
            </label>
          </div>
          <h4 class="skill-card__title">Análise de Imagens</h4>
          <p class="skill-card__description">Processa e analisa imagens</p>
        </div>
      </div>
    </div>
  `;
}

function renderConnectorsSection(props: ManageConnectorsSettingsProps) {
  return html`
    <div class="manage-connectors-settings__header">
      <h2 class="manage-connectors-settings__title">Conectores</h2>
      <button class="manage-connectors-settings__close" @click=${props.onClose}>
        ${icons.x}
      </button>
    </div>

    <div class="manage-connectors-settings__list">
      ${props.connectors.map(
        (connector) => html`
          <div 
            class="manage-connectors-settings__item"
            @click=${() => props.onConnectorClick(connector.id)}
          >
            <div class="manage-connectors-settings__item-icon">
              ${connector.icon === "chrome"
                ? html`<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="4"/>
                    <line x1="21.17" y1="8" x2="12" y2="8"/>
                    <line x1="3.95" y1="6.06" x2="8.54" y2="14"/>
                    <line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
                  </svg>`
                : html`<img src="./${connector.icon}.png" alt="${connector.name}" />`}
            </div>
            <div class="manage-connectors-settings__item-content">
              <h3 class="manage-connectors-settings__item-title">${connector.name}</h3>
              <p class="manage-connectors-settings__item-description">${connector.description}</p>
            </div>
            <svg class="manage-connectors-settings__item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        `,
      )}
    </div>

    <button class="manage-connectors-settings__add-btn" @click=${props.onAddConnectors}>
      ${icons.plus}
      Adicionar conectores
    </button>
  `;
}

function renderIntegrationsSection(props: ManageConnectorsSettingsProps) {
  // Lista completa de modelos individuais
  const allModels = [
    // OpenAI
    { id: "gpt-4", name: "GPT-4", provider: "OpenAI", description: "Modelo mais capaz para tarefas complexas", icon: "chatgpt", connected: false },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI", description: "Versão otimizada do GPT-4 com melhor performance", icon: "chatgpt", connected: false },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI", description: "Rápido e eficiente para tarefas gerais", icon: "chatgpt", connected: false },
    
    // Anthropic
    { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", description: "Modelo mais avançado da Anthropic", icon: "claude", connected: true },
    { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", description: "Excelente para análise e raciocínio", icon: "claude", connected: true },
    { id: "claude-3-sonnet", name: "Claude 3 Sonnet", provider: "Anthropic", description: "Equilíbrio entre performance e custo", icon: "claude", connected: false },
    { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", description: "Rápido e econômico", icon: "claude", connected: false },
    
    // Google
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", description: "Modelo multimodal avançado", icon: "google-gemini", connected: false },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google", description: "Versão rápida e eficiente", icon: "google-gemini", connected: false },
    { id: "gemini-pro", name: "Gemini Pro", provider: "Google", description: "Modelo de propósito geral", icon: "google-gemini", connected: false },
    
    // Perplexity
    { id: "sonar-large", name: "Sonar Large", provider: "Perplexity", description: "Pesquisa avançada com citações", icon: "perplexity", connected: false },
    { id: "sonar-small", name: "Sonar Small", provider: "Perplexity", description: "Pesquisa rápida e eficiente", icon: "perplexity", connected: false },
    
    // xAI
    { id: "grok-2", name: "Grok 2", provider: "xAI", description: "Modelo com acesso a dados em tempo real", icon: "grok", connected: false },
    { id: "grok-2-mini", name: "Grok 2 Mini", provider: "xAI", description: "Versão compacta do Grok 2", icon: "grok", connected: false },
    
    // Ollama (Local)
    { id: "llama-3-70b", name: "Llama 3 70B", provider: "Ollama", description: "Modelo local de alta performance", icon: "ollama", connected: false, local: true },
    { id: "llama-3-8b", name: "Llama 3 8B", provider: "Ollama", description: "Modelo local compacto", icon: "ollama", connected: false, local: true },
    { id: "mistral-7b", name: "Mistral 7B", provider: "Ollama", description: "Modelo local eficiente", icon: "ollama", connected: false, local: true },
    { id: "codellama", name: "Code Llama", provider: "Ollama", description: "Especializado em código", icon: "ollama", connected: false, local: true },
  ];

  return html`
    <div class="manage-connectors-settings__header">
      <h2 class="manage-connectors-settings__title">Modelos</h2>
      <button class="manage-connectors-settings__add-local-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Adicionar modelo local
      </button>
      <div class="manage-connectors-settings__search">
        <svg class="manage-connectors-settings__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          class="manage-connectors-settings__search-input"
          placeholder="Procurar modelos..."
        />
      </div>
      <button class="manage-connectors-settings__close" @click=${props.onClose}>
        ${icons.x}
      </button>
    </div>
    <div class="manage-connectors-settings__section">
      <div class="models-intro">
        <p class="models-intro__text">
          Adicione e configure modelos de IA de diferentes provedores para expandir as capacidades do ULTRON.
        </p>
      </div>

      <div class="models-list">
        ${allModels.map(
          (model) => html`
            <div class="model-item ${model.connected ? 'model-item--connected' : ''}">
              <div class="model-item__icon">
                <img src="./${model.icon}.png" alt="${model.provider}" />
              </div>
              <div class="model-item__content">
                <div class="model-item__header">
                  <h4 class="model-item__name">${model.name}</h4>
                  ${model.local ? html`<span class="model-item__badge model-item__badge--local">Local</span>` : ''}
                  ${model.connected ? html`<span class="model-item__badge model-item__badge--connected">Conectado</span>` : ''}
                </div>
                <p class="model-item__provider">${model.provider}</p>
                <p class="model-item__description">${model.description}</p>
              </div>
              <button class="model-item__button ${model.connected ? 'model-item__button--connected' : ''}">
                ${model.connected ? 'Configurar' : 'Adicionar'}
              </button>
            </div>
          `,
        )}
      </div>

      <button class="models-add-custom">
        ${icons.plus}
        Adicionar modelo personalizado
      </button>
    </div>
  `;
}

function showHiveSetupModal() {
  const modalHtml = html`
    <div class="input-modal-overlay" @click=${(e: Event) => {
      if ((e.target as HTMLElement).classList.contains('input-modal-overlay')) {
        (e.target as HTMLElement).remove();
      }
    }}>
      <div class="input-modal input-modal--large hive-setup-modal">
        <h3 class="input-modal__title">Configurar Colmeia</h3>
        <p class="input-modal__description">
          Configure as definições iniciais da sua colmeia. Estas configurações podem ser alteradas posteriormente.
        </p>
        
        <div class="input-modal__field">
          <label class="input-modal__label">Nome da Colmeia</label>
          <input 
            type="text" 
            class="input-modal__input" 
            placeholder="Ex: Colmeia Principal"
            id="hive-name-input"
            value="Colmeia Principal"
          />
        </div>

        <div class="input-modal__field">
          <label class="input-modal__label">Descrição (opcional)</label>
          <textarea 
            class="input-modal__textarea" 
            placeholder="Descreva o propósito desta colmeia..."
            id="hive-description-input"
            rows="3"
          ></textarea>
        </div>

        <div class="hive-setup-toggles">
          <div class="settings-toggle">
            <div class="settings-toggle__info">
              <span class="settings-toggle__label">Sincronização automática</span>
              <span class="settings-toggle__description">Sincroniza dados e contexto entre todos os ULTRONs</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="hive-autosync-toggle" checked />
              <span class="toggle-switch__slider"></span>
            </label>
          </div>

          <div class="settings-toggle">
            <div class="settings-toggle__info">
              <span class="settings-toggle__label">Compartilhar tela com outros ULTRONs</span>
              <span class="settings-toggle__description">Permite que outros membros vejam sua tela em tempo real</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="hive-screenshare-toggle" />
              <span class="toggle-switch__slider"></span>
            </label>
          </div>

          <div class="settings-toggle">
            <div class="settings-toggle__info">
              <span class="settings-toggle__label">Compartilhamento de memória</span>
              <span class="settings-toggle__description">Permite acesso ao histórico compartilhado</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="hive-memory-toggle" checked />
              <span class="toggle-switch__slider"></span>
            </label>
          </div>
        </div>

        <div class="input-modal__actions">
          <button 
            class="input-modal__button input-modal__button--secondary"
            @click=${(e: Event) => {
              const modal = (e.target as HTMLElement).closest('.input-modal-overlay');
              modal?.remove();
            }}
          >
            Cancelar
          </button>
          <button 
            class="input-modal__button input-modal__button--primary"
            @click=${(e: Event) => {
              const nameInput = document.getElementById('hive-name-input') as HTMLInputElement;
              const descriptionInput = document.getElementById('hive-description-input') as HTMLTextAreaElement;
              const autoSyncToggle = document.getElementById('hive-autosync-toggle') as HTMLInputElement;
              const screenShareToggle = document.getElementById('hive-screenshare-toggle') as HTMLInputElement;
              const memoryToggle = document.getElementById('hive-memory-toggle') as HTMLInputElement;
              
              const name = nameInput?.value.trim() || 'Colmeia Principal';
              const description = descriptionInput?.value.trim() || '';
              
              // Atualizar configurações com os valores do modal
              hiveManager.updateConfig({
                autoSync: autoSyncToggle?.checked ?? true,
                screenSharing: screenShareToggle?.checked ?? false,
                memorySharing: memoryToggle?.checked ?? true,
              });
              
              // Salvar nome e descrição no localStorage
              localStorage.setItem('hive_name', name);
              localStorage.setItem('hive_description', description);
              
              // Criar a colmeia
              hiveManager.createHive();
              
              const modal = (e.target as HTMLElement).closest('.input-modal-overlay');
              modal?.remove();
            }}
          >
            Criar Colmeia
          </button>
        </div>
      </div>
    </div>
  `;
  
  const container = document.createElement('div');
  render(modalHtml, container);
  document.body.appendChild(container.firstElementChild!);
  
  // Focar no input de nome
  setTimeout(() => {
    const input = document.getElementById('hive-name-input') as HTMLInputElement;
    input?.select();
  }, 100);
}

function showMemberInfoCard(member: HiveMember) {
  const modalHtml = html`
    <div class="input-modal-overlay" @click=${(e: Event) => {
      if ((e.target as HTMLElement).classList.contains('input-modal-overlay')) {
        (e.target as HTMLElement).remove();
      }
    }}>
      <div class="input-modal hive-info-card">
        <h3 class="input-modal__title">${member.name}</h3>
        
        <div class="hive-info-field">
          <label>Status</label>
          <div class="hive-info-value">
            <span class="status-badge status-badge--${member.status}">
              ${member.status === 'online' ? 'Online' : member.status === 'offline' ? 'Offline' : 'Conectando'}
            </span>
          </div>
        </div>

        <div class="hive-info-field">
          <label>Função</label>
          <div class="hive-info-value">
            ${member.role === 'coordinator' ? 'Coordenador' : 'Trabalhador'}
          </div>
        </div>

        <div class="hive-info-field">
          <label>ID</label>
          <div class="hive-info-value hive-info-value--mono">${member.id}</div>
        </div>

        <div class="hive-info-field">
          <label>Última atividade</label>
          <div class="hive-info-value">
            ${HiveManager.formatRelativeTime(member.lastSeen)}
          </div>
        </div>

        ${member.address ? html`
          <div class="hive-info-field">
            <label>Endereço</label>
            <div class="hive-info-value hive-info-value--mono">${member.address}</div>
          </div>
        ` : ''}

        <div class="input-modal__actions">
          <button 
            class="input-modal__button input-modal__button--secondary"
            @click=${async () => {
              const confirmed = await showConfirm('Tem certeza que deseja remover este membro da colmeia?');
              if (confirmed) {
                hiveManager.removeMember(member.id);
                const modal = document.querySelector('.input-modal-overlay');
                modal?.remove();
              }
            }}
          >
            Remover
          </button>
          <button 
            class="input-modal__button input-modal__button--primary"
            @click=${(e: Event) => {
              const modal = (e.target as HTMLElement).closest('.input-modal-overlay');
              modal?.remove();
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  `;
  
  const container = document.createElement('div');
  render(modalHtml, container);
  document.body.appendChild(container.firstElementChild!);
}

function showHiveInfoCard(info: { name: string; description: string; createdAt: string; membersCount: number; config: any }) {
  const modalHtml = html`
    <div class="input-modal-overlay" @click=${(e: Event) => {
      if ((e.target as HTMLElement).classList.contains('input-modal-overlay')) {
        (e.target as HTMLElement).remove();
      }
    }}>
      <div class="input-modal hive-info-card">
        <h3 class="input-modal__title">${info.name}</h3>
        
        ${info.description ? html`
          <p class="input-modal__description">${info.description}</p>
        ` : ''}

        <div class="hive-info-field">
          <label>Membros</label>
          <div class="hive-info-value">${info.membersCount} ULTRON${info.membersCount !== 1 ? 's' : ''}</div>
        </div>

        <div class="hive-info-field">
          <label>Criada em</label>
          <div class="hive-info-value">${info.createdAt}</div>
        </div>

        <div class="hive-info-field">
          <label>Sincronização automática</label>
          <div class="hive-info-value">
            ${info.config.autoSync ? 'Ativada' : 'Desativada'}
          </div>
        </div>

        <div class="hive-info-field">
          <label>Compartilhamento de tela</label>
          <div class="hive-info-value">
            ${info.config.screenSharing ? 'Ativado' : 'Desativado'}
          </div>
        </div>

        <div class="hive-info-field">
          <label>Compartilhamento de memória</label>
          <div class="hive-info-value">
            ${info.config.memorySharing ? 'Ativado' : 'Desativado'}
          </div>
        </div>

        <div class="input-modal__actions">
          <button 
            class="input-modal__button input-modal__button--primary"
            @click=${(e: Event) => {
              const modal = (e.target as HTMLElement).closest('.input-modal-overlay');
              modal?.remove();
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  `;
  
  const container = document.createElement('div');
  render(modalHtml, container);
  document.body.appendChild(container.firstElementChild!);
}

function renderHiveSection(props: ManageConnectorsSettingsProps) {
  // Obter dados reais do HiveManager
  const hiveMembers = hiveManager.getMembers();
  const hiveConfig = hiveManager.getConfig();
  const hiveConnection = hiveManager.getConnection();
  const hiveState = hiveManager.getState();

  // Se a colmeia não foi criada, mostrar botão de criar
  if (!hiveState.created) {
    return html`
      <div class="manage-connectors-settings__header">
        <h2 class="manage-connectors-settings__title">Colmeia</h2>
        <button class="manage-connectors-settings__close" @click=${props.onClose}>
          ${icons.x}
        </button>
      </div>
      <div class="manage-connectors-settings__section">
        <div class="hive-create-prompt">
          <div class="hive-create-prompt__icon">
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none" stroke="currentColor" stroke-width="1.8">
              <!-- Colmeia central -->
              <g class="hive-center">
                <!-- Hexágono central -->
                <path d="M90 56.25L93.75 58.5v4.5L90 65.25 86.25 63V58.5L90 56.25z" transform="translate(0, 30)"/>
                <!-- Hexágono superior -->
                <path d="M90 48L93.75 50.25v4.5L90 57 86.25 54.75v-4.5L90 48z" transform="translate(0, 30)"/>
                <!-- Hexágono inferior -->
                <path d="M90 64.5L93.75 66.75v4.5L90 73.5 86.25 71.25v-4.5L90 64.5z" transform="translate(0, 30)"/>
                <!-- Hexágono esquerdo superior -->
                <path d="M81.75 52.125L85.5 54.375v4.5L81.75 61.125 78 58.875v-4.5L81.75 52.125z" transform="translate(0, 30)"/>
                <!-- Hexágono direito superior -->
                <path d="M98.25 52.125L102 54.375v4.5L98.25 61.125 94.5 58.875v-4.5L98.25 52.125z" transform="translate(0, 30)"/>
                <!-- Hexágono esquerdo inferior -->
                <path d="M81.75 60.375L85.5 62.625v4.5L81.75 69.375 78 67.125v-4.5L81.75 60.375z" transform="translate(0, 30)"/>
                <!-- Hexágono direito inferior -->
                <path d="M98.25 60.375L102 62.625v4.5L98.25 69.375 94.5 67.125v-4.5L98.25 60.375z" transform="translate(0, 30)"/>
              </g>

              <!-- Linhas de conexão (animadas) -->
              <!-- Diagonais (X) - encurtadas para não entrar nos círculos -->
              <line class="connection-line connection-line-top-right" x1="131" y1="49" x2="105" y2="75" stroke-width="2" stroke-dasharray="3,3"/>
              <line class="connection-line connection-line-bottom-right" x1="131" y1="131" x2="105" y2="105" stroke-width="2" stroke-dasharray="3,3"/>
              <line class="connection-line connection-line-bottom-left" x1="49" y1="131" x2="75" y2="105" stroke-width="2" stroke-dasharray="3,3"/>
              <line class="connection-line connection-line-top-left" x1="49" y1="49" x2="75" y2="75" stroke-width="2" stroke-dasharray="3,3"/>
              <!-- Cardinais (+) - encurtadas para não entrar nos círculos -->
              <line class="connection-line connection-line-top" x1="90" y1="37" x2="90" y2="70" stroke-width="2" stroke-dasharray="3,3"/>
              <line class="connection-line connection-line-right" x1="143" y1="90" x2="110" y2="90" stroke-width="2" stroke-dasharray="3,3"/>
              <line class="connection-line connection-line-bottom" x1="90" y1="143" x2="90" y2="110" stroke-width="2" stroke-dasharray="3,3"/>
              <line class="connection-line connection-line-left" x1="37" y1="90" x2="70" y2="90" stroke-width="2" stroke-dasharray="3,3"/>

              <!-- Nós com pessoas (animados) -->
              <!-- Diagonais (X) -->
              <!-- Superior Direito -->
              <g class="node node-top-right">
                <circle cx="140" cy="40" r="12" fill="currentColor" opacity="0.1"/>
                <circle cx="140" cy="40" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
                <g transform="translate(140, 40)">
                  <circle cx="0" cy="-3.5" r="3.5" fill="currentColor"/>
                  <path d="M-5 7 Q-5 1.5 0 1.5 Q5 1.5 5 7" fill="currentColor"/>
                </g>
              </g>

              <!-- Inferior Direito -->
              <g class="node node-bottom-right">
                <circle cx="140" cy="140" r="12" fill="currentColor" opacity="0.1"/>
                <circle cx="140" cy="140" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
                <g transform="translate(140, 140)">
                  <circle cx="0" cy="-3.5" r="3.5" fill="currentColor"/>
                  <path d="M-5 7 Q-5 1.5 0 1.5 Q5 1.5 5 7" fill="currentColor"/>
                </g>
              </g>

              <!-- Inferior Esquerdo -->
              <g class="node node-bottom-left">
                <circle cx="40" cy="140" r="12" fill="currentColor" opacity="0.1"/>
                <circle cx="40" cy="140" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
                <g transform="translate(40, 140)">
                  <circle cx="0" cy="-3.5" r="3.5" fill="currentColor"/>
                  <path d="M-5 7 Q-5 1.5 0 1.5 Q5 1.5 5 7" fill="currentColor"/>
                </g>
              </g>

              <!-- Superior Esquerdo -->
              <g class="node node-top-left">
                <circle cx="40" cy="40" r="12" fill="currentColor" opacity="0.1"/>
                <circle cx="40" cy="40" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
                <g transform="translate(40, 40)">
                  <circle cx="0" cy="-3.5" r="3.5" fill="currentColor"/>
                  <path d="M-5 7 Q-5 1.5 0 1.5 Q5 1.5 5 7" fill="currentColor"/>
                </g>
              </g>

              <!-- Cardinais (+) -->
              <!-- Topo -->
              <g class="node node-top">
                <circle cx="90" cy="25" r="12" fill="currentColor" opacity="0.1"/>
                <circle cx="90" cy="25" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
                <g transform="translate(90, 25)">
                  <circle cx="0" cy="-3.5" r="3.5" fill="currentColor"/>
                  <path d="M-5 7 Q-5 1.5 0 1.5 Q5 1.5 5 7" fill="currentColor"/>
                </g>
              </g>

              <!-- Direita -->
              <g class="node node-right">
                <circle cx="155" cy="90" r="12" fill="currentColor" opacity="0.1"/>
                <circle cx="155" cy="90" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
                <g transform="translate(155, 90)">
                  <circle cx="0" cy="-3.5" r="3.5" fill="currentColor"/>
                  <path d="M-5 7 Q-5 1.5 0 1.5 Q5 1.5 5 7" fill="currentColor"/>
                </g>
              </g>

              <!-- Baixo -->
              <g class="node node-bottom">
                <circle cx="90" cy="155" r="12" fill="currentColor" opacity="0.1"/>
                <circle cx="90" cy="155" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
                <g transform="translate(90, 155)">
                  <circle cx="0" cy="-3.5" r="3.5" fill="currentColor"/>
                  <path d="M-5 7 Q-5 1.5 0 1.5 Q5 1.5 5 7" fill="currentColor"/>
                </g>
              </g>

              <!-- Esquerda -->
              <g class="node node-left">
                <circle cx="25" cy="90" r="12" fill="currentColor" opacity="0.1"/>
                <circle cx="25" cy="90" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
                <g transform="translate(25, 90)">
                  <circle cx="0" cy="-3.5" r="3.5" fill="currentColor"/>
                  <path d="M-5 7 Q-5 1.5 0 1.5 Q5 1.5 5 7" fill="currentColor"/>
                </g>
              </g>
            </svg>
          </div>
          <h3 class="hive-create-prompt__title">Criar uma Colmeia</h3>
          <p class="hive-create-prompt__description">
            Uma colmeia permite que múltiplos ULTRONs trabalhem em conjunto, compartilhando recursos, 
            distribuindo tarefas e colaborando de forma inteligente. Crie sua colmeia para começar.
          </p>
          <button class="hive-create-prompt__button" @click=${() => showHiveSetupModal()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
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
            Criar Colmeia
          </button>
        </div>
      </div>
    `;
  }

  // Handlers para ações
  const handleAddMember = () => {
    // Criar um modal customizado para input com todas as credenciais
    const modalHtml = html`
      <div class="input-modal-overlay" @click=${(e: Event) => {
        if ((e.target as HTMLElement).classList.contains('input-modal-overlay')) {
          (e.target as HTMLElement).remove();
        }
      }}>
        <div class="input-modal input-modal--large">
          <h3 class="input-modal__title">Adicionar ULTRON à Colmeia</h3>
          <p class="input-modal__description">
            Insira as credenciais do ULTRON que deseja adicionar. Estas informações podem ser encontradas na seção "Conta" do ULTRON remoto.
          </p>
          
          <div class="input-modal__field">
            <label class="input-modal__label">ID de Identificação</label>
            <input 
              type="text" 
              class="input-modal__input" 
              placeholder="ULTRON-XXXXXXXX"
              id="ultron-id-input"
            />
          </div>

          <div class="input-modal__field">
            <label class="input-modal__label">Token de Acesso</label>
            <input 
              type="password" 
              class="input-modal__input" 
              placeholder="tk_xxxxxxxxxxxxxxxxxxxxx"
              id="ultron-token-input"
            />
          </div>

          <div class="input-modal__field">
            <label class="input-modal__label">Palavra-passe 1</label>
            <input 
              type="text" 
              class="input-modal__input" 
              placeholder="palavra-palavra-1234"
              id="ultron-pass1-input"
            />
          </div>

          <div class="input-modal__field">
            <label class="input-modal__label">Palavra-passe 2</label>
            <input 
              type="text" 
              class="input-modal__input" 
              placeholder="palavra-palavra-5678"
              id="ultron-pass2-input"
            />
          </div>

          <div class="input-modal__actions">
            <button 
              class="input-modal__button input-modal__button--secondary"
              @click=${(e: Event) => {
                const modal = (e.target as HTMLElement).closest('.input-modal-overlay');
                modal?.remove();
              }}
            >
              Cancelar
            </button>
            <button 
              class="input-modal__button input-modal__button--primary"
              @click=${async (e: Event) => {
                const idInput = document.getElementById('ultron-id-input') as HTMLInputElement;
                const tokenInput = document.getElementById('ultron-token-input') as HTMLInputElement;
                const pass1Input = document.getElementById('ultron-pass1-input') as HTMLInputElement;
                const pass2Input = document.getElementById('ultron-pass2-input') as HTMLInputElement;
                
                const id = idInput?.value.trim();
                const token = tokenInput?.value.trim();
                const pass1 = pass1Input?.value.trim();
                const pass2 = pass2Input?.value.trim();
                
                if (!id || !token || !pass1 || !pass2) {
                  await showAlert('Por favor, preencha todos os campos');
                  return;
                }
                
                // Validar formato do ID
                if (!id.startsWith('ULTRON-')) {
                  await showAlert('ID inválido. Deve começar com "ULTRON-"');
                  return;
                }
                
                // Validar formato do token
                if (!token.startsWith('tk_')) {
                  await showAlert('Token inválido. Deve começar com "tk_"');
                  return;
                }
                
                // Adicionar membro com as credenciais
                hiveManager.addMember({
                  name: id, // Usar o ID como nome inicialmente
                  status: 'connecting',
                  role: 'worker',
                  address: '',
                  capabilities: [],
                });
                
                const modal = (e.target as HTMLElement).closest('.input-modal-overlay');
                modal?.remove();
                
                await showAlert('ULTRON adicionado com sucesso! Aguardando conexão...');
              }}
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Renderizar o modal no body
    const container = document.createElement('div');
    render(modalHtml, container);
    document.body.appendChild(container.firstElementChild!);
    
    // Focar no primeiro input
    setTimeout(() => {
      const input = document.getElementById('ultron-id-input') as HTMLInputElement;
      input?.focus();
    }, 100);
  };

  const handleRemoveMember = async (id: string) => {
    const confirmed = await showConfirm('Tem certeza que deseja remover este membro da colmeia?');
    if (confirmed) {
      hiveManager.removeMember(id);
    }
  };

  const handleConfigChange = (key: keyof typeof hiveConfig, value: boolean) => {
    hiveManager.updateConfig({ [key]: value });
  };

  const handleConnect = async () => {
    const addressInput = document.querySelector('.hive-connect-address') as HTMLInputElement;
    const keyInput = document.querySelector('.hive-connect-key') as HTMLInputElement;

    if (!addressInput || !keyInput) return;

    const address = addressInput.value.trim();
    const accessKey = keyInput.value.trim();

    if (!address || !accessKey) {
      await showAlert('Por favor, preencha todos os campos');
      return;
    }

    try {
      await hiveManager.connectToHive(address, accessKey);
      await showAlert('Conectado à colmeia com sucesso!');
      addressInput.value = '';
      keyInput.value = '';
    } catch (error) {
      await showAlert(`Erro ao conectar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDisconnect = async () => {
    const confirmed = await showConfirm('Deseja desconectar desta colmeia?');
    if (confirmed) {
      hiveManager.disconnectFromHive();
    }
  };

  return html`
    <div class="manage-connectors-settings__header">
      <h2 class="manage-connectors-settings__title">Colmeia</h2>
      <button class="manage-connectors-settings__close" @click=${props.onClose}>
        ${icons.x}
      </button>
    </div>
    <div class="manage-connectors-settings__section">
      ${hiveConnection?.connected ? html`
        <div class="hive-connection-status">
          <div class="hive-connection-status__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="hive-connection-status__content">
            <strong>Conectado à colmeia</strong>
            <span>${hiveConnection.address}</span>
          </div>
          <button class="hive-connection-status__disconnect" @click=${handleDisconnect}>
            Desconectar
          </button>
        </div>
      ` : ''}

      <div class="settings-section">
        <div class="settings-section__header">
          <div>
            <h3 class="settings-section__title">Membros da Colmeia</h3>
            <p class="settings-section__description">
              ${hiveMembers.length === 0 
                ? 'Nenhum membro na colmeia. Adicione ULTRONs para começar a colaborar.'
                : `${hiveMembers.length} membro${hiveMembers.length > 1 ? 's' : ''} na colmeia. Gerencie e monitore todos os ULTRONs conectados.`
              }
            </p>
          </div>
          <button class="btn-add-member" @click=${handleAddMember}>
            ${icons.plus}
            Adicionar ULTRON
          </button>
        </div>

        ${hiveMembers.length > 0 ? html`
          <div class="hive-mind-map">
            <svg class="hive-mind-map__svg" viewBox="0 0 600 400">
              <!-- Linhas de conexão -->
              ${hiveMembers.map((member, index) => {
                const angle = (index / hiveMembers.length) * 2 * Math.PI - Math.PI / 2;
                const x = 300 + Math.cos(angle) * 150;
                const y = 200 + Math.sin(angle) * 120;
                return html`
                  <line 
                    class="hive-mind-map__connection ${member.status === 'online' ? 'hive-mind-map__connection--active' : ''}"
                    x1="300" 
                    y1="200" 
                    x2="${x}" 
                    y2="${y}"
                    stroke-dasharray="4,4"
                  />
                `;
              })}
              
              <!-- Colmeia central (clicável) -->
              <g 
                class="hive-mind-map__node hive-mind-map__node--center"
                @click=${() => {
                  // Mostrar card com informações da colmeia
                  const hiveName = localStorage.getItem('hive_name') || 'Colmeia Principal';
                  const hiveDescription = localStorage.getItem('hive_description') || 'Sem descrição';
                  const createdAt = hiveManager.getState().createdAt;
                  const formattedDate = createdAt ? new Date(createdAt).toLocaleString('pt-PT') : 'Desconhecido';
                  
                  showHiveInfoCard({
                    name: hiveName,
                    description: hiveDescription,
                    createdAt: formattedDate,
                    membersCount: hiveMembers.length,
                    config: hiveConfig,
                  });
                }}
              >
                <circle cx="300" cy="200" r="40" class="hive-mind-map__node-bg"/>
                <circle cx="300" cy="200" r="40" class="hive-mind-map__node-border"/>
                <!-- Ícone da colmeia -->
                <g transform="translate(300, 200) scale(1.2)">
                  <path d="M0 -7.5L2.5 -6v3L0 -1.5 -2.5 -3v-3L0 -7.5z" fill="currentColor"/>
                  <path d="M0 -13L2.5 -11.5v3L0 -7 -2.5 -8.5v-3L0 -13z" fill="currentColor"/>
                  <path d="M0 -2L2.5 -0.5v3L0 4 -2.5 2.5v-3L0 -2z" fill="currentColor"/>
                  <path d="M-6.5 -10.25L-4 -8.75v3L-6.5 -4.25 -9 -5.75v-3L-6.5 -10.25z" fill="currentColor"/>
                  <path d="M6.5 -10.25L9 -8.75v3L6.5 -4.25 4 -5.75v-3L6.5 -10.25z" fill="currentColor"/>
                  <path d="M-6.5 -4.75L-4 -3.25v3L-6.5 1.25 -9 -0.25v-3L-6.5 -4.75z" fill="currentColor"/>
                  <path d="M6.5 -4.75L9 -3.25v3L6.5 1.25 4 -0.25v-3L6.5 -4.75z" fill="currentColor"/>
                </g>
              </g>
              
              <!-- Nós dos ULTRONs (clicáveis) -->
              ${hiveMembers.map((member, index) => {
                const angle = (index / hiveMembers.length) * 2 * Math.PI - Math.PI / 2;
                const x = 300 + Math.cos(angle) * 150;
                const y = 200 + Math.sin(angle) * 120;
                return html`
                  <g 
                    class="hive-mind-map__node hive-mind-map__node--member hive-mind-map__node--${member.status}"
                    @click=${() => showMemberInfoCard(member)}
                  >
                    <circle cx="${x}" cy="${y}" r="30" class="hive-mind-map__node-bg"/>
                    <circle cx="${x}" cy="${y}" r="30" class="hive-mind-map__node-border"/>
                    <!-- Ícone de pessoa -->
                    <g transform="translate(${x}, ${y})">
                      <circle cx="0" cy="-5" r="6" fill="currentColor"/>
                      <path d="M-8 12 Q-8 2 0 2 Q8 2 8 12" fill="currentColor"/>
                    </g>
                    <!-- Indicador de status -->
                    <circle 
                      cx="${x + 20}" 
                      cy="${y - 20}" 
                      r="6" 
                      class="hive-mind-map__status-indicator hive-mind-map__status-indicator--${member.status}"
                    />
                  </g>
                `;
              })}
            </svg>
          </div>
        ` : html`
          <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
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
            <h3 class="empty-state__title">Nenhum membro na colmeia</h3>
            <p class="empty-state__description">
              Adicione ULTRONs para começar a trabalhar em colaboração
            </p>
          </div>
        `}
      </div>

      <div class="settings-section">
        <h3 class="settings-section__title">Configurações da Colmeia</h3>
        <p class="settings-section__description">
          Configure como os ULTRONs da colmeia se comunicam e colaboram entre si.
        </p>
        
        <div class="settings-toggle">
          <div class="settings-toggle__info">
            <span class="settings-toggle__label">Sincronização automática</span>
            <span class="settings-toggle__description">Sincroniza dados e contexto entre todos os ULTRONs da colmeia</span>
          </div>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              .checked=${hiveConfig.autoSync}
              @change=${(e: Event) => handleConfigChange('autoSync', (e.target as HTMLInputElement).checked)}
            />
            <span class="toggle-switch__slider"></span>
          </label>
        </div>

        <div class="settings-toggle">
          <div class="settings-toggle__info">
            <span class="settings-toggle__label">Compartilhar tela com outros ULTRONs</span>
            <span class="settings-toggle__description">Permite que outros membros vejam sua tela em tempo real</span>
          </div>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              .checked=${hiveConfig.screenSharing}
              @change=${(e: Event) => handleConfigChange('screenSharing', (e.target as HTMLInputElement).checked)}
            />
            <span class="toggle-switch__slider"></span>
          </label>
        </div>

        <div class="settings-toggle">
          <div class="settings-toggle__info">
            <span class="settings-toggle__label">Compartilhamento de memória</span>
            <span class="settings-toggle__description">Permite que todos os membros acessem o histórico compartilhado</span>
          </div>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              .checked=${hiveConfig.memorySharing}
              @change=${(e: Event) => handleConfigChange('memorySharing', (e.target as HTMLInputElement).checked)}
            />
            <span class="toggle-switch__slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-section settings-section--danger">
        <h3 class="settings-section__title">Zona de perigo</h3>
        <p class="settings-section__description">
          Ações irreversíveis que afetam toda a colmeia.
        </p>
        <button 
          class="settings-field__button settings-field__button--danger"
          @click=${async () => {
            const confirmed = await showConfirm('Tem certeza que deseja resetar a colmeia? Todos os membros e configurações serão removidos.');
            if (confirmed) {
              // Limpar localStorage
              localStorage.removeItem('hive_state');
              localStorage.removeItem('hive_members');
              localStorage.removeItem('hive_config');
              localStorage.removeItem('hive_connection');
              // Recarregar página para aplicar mudanças
              location.reload();
            }
          }}
        >
          Resetar Colmeia
        </button>
      </div>
    </div>
  `;
}

function renderUpdatesSection(props: ManageConnectorsSettingsProps) {
  return html`
    <div class="manage-connectors-settings__header">
      <h2 class="manage-connectors-settings__title">Atualizações</h2>
      <button class="manage-connectors-settings__close" @click=${props.onClose}>
        ${icons.x}
      </button>
    </div>
    <div class="manage-connectors-settings__section">
      <div class="updates-section">
        <div class="updates-current">
          <div class="updates-current__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </div>
          <div class="updates-current__info">
            <h3 class="updates-current__title">Versão atual</h3>
            <p class="updates-current__version">ULTRON v1.0.0</p>
            <p class="updates-current__date">Última verificação: Hoje às 14:30</p>
          </div>
        </div>

        <button 
          class="btn btn-primary updates-check-btn"
          @click=${async () => {
            const button = document.querySelector('.updates-check-btn') as HTMLButtonElement;
            if (!button) return;
            
            const originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = `
              <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Verificando...
            `;

            try {
              const { ipcRenderer } = (window as any).require('electron');
              const result = await ipcRenderer.invoke('check-for-updates');
              
              if (result.updateAvailable) {
                await showAlert(
                  `Nova versão disponível: ${result.latestVersion}\\n\\nVisite o repositório para baixar a atualização.`
                );
              } else {
                await showAlert('Você já está usando a versão mais recente do ULTRON!');
              }
            } catch (error) {
              console.error('Erro ao verificar atualizações:', error);
              await showAlert('Erro ao verificar atualizações. Tente novamente mais tarde.');
            } finally {
              button.disabled = false;
              button.innerHTML = originalText;
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Verificar atualizações
        </button>

        <div class="updates-info">
          <h4 class="updates-info__title">Atualizações automáticas</h4>
          <p class="updates-info__description">
            O ULTRON verifica automaticamente por atualizações a cada 24 horas. 
            Você será notificado quando uma nova versão estiver disponível.
          </p>
        </div>

        <div class="updates-changelog">
          <h4 class="updates-changelog__title">Novidades na versão 1.0.0</h4>
          <ul class="updates-changelog__list">
            <li>Sistema de Colmeia P2P com criptografia E2E</li>
            <li>Interface modernizada com novo design</li>
            <li>Suporte para múltiplos modelos de IA</li>
            <li>Sistema de verificação de atualizações via GitHub</li>
            <li>Melhorias de performance e estabilidade</li>
          </ul>
        </div>

        <div class="updates-links">
          <a 
            href="https://github.com/ghost-global-oficial/Ultron/releases" 
            target="_blank" 
            class="updates-link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            </svg>
            Ver todas as versões no GitHub
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderHelpSection(props: ManageConnectorsSettingsProps) {
  return html`
    <div class="manage-connectors-settings__header">
      <h2 class="manage-connectors-settings__title">Obter ajuda</h2>
      <button class="manage-connectors-settings__close" @click=${props.onClose}>
        ${icons.x}
      </button>
    </div>
    <div class="manage-connectors-settings__section">
      <div class="help-section">
        <h3 class="help-section__title">Recursos</h3>
        <div class="help-links">
          <a href="#" class="help-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
            <span>Documentação</span>
          </a>
          <a href="#" class="help-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Comunidade</span>
          </a>
          <a href="#" class="help-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
            <span>FAQ</span>
          </a>
        </div>
      </div>
      
      <div class="help-section">
        <h3 class="help-section__title">Sobre</h3>
        <div class="about-info">
          <div class="about-info__item">
            <span class="about-info__label">Versão</span>
            <span class="about-info__value">1.0.0</span>
          </div>
          <div class="about-info__item">
            <span class="about-info__label">Build</span>
            <span class="about-info__value">2024.02.26</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
