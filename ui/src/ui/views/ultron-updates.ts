import { html } from "lit";
import { icons } from "../icons";

export type UpdateInfo = {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string;
  downloadUrl: string;
  publishedAt: string;
};

export type UpdateStatus = 
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'installing'
  | 'uptodate'
  | 'error';

export type UltronUpdatesProps = {
  status: UpdateStatus;
  updateInfo: UpdateInfo | null;
  error: string | null;
  downloadProgress: number;
  onCheckUpdates: () => void;
  onInstallUpdate: () => void;
  onDismiss: () => void;
};

export function renderUltronUpdates(props: UltronUpdatesProps) {
  return html`
    <div class="ultron-updates">
      <!-- Header -->
      <div class="ultron-updates__header">
        <h3 class="ultron-updates__title">
          ${icons.download}
          Atualizações do ULTRON
        </h3>
      </div>

      <!-- Status atual -->
      <div class="ultron-updates__status">
        ${renderStatus(props)}
      </div>

      <!-- Informações da atualização -->
      ${props.updateInfo && props.status === 'available' ? html`
        <div class="ultron-updates__info card">
          <h4 class="ultron-updates__info-title">
            Nova versão disponível: ${props.updateInfo.latestVersion}
          </h4>
          
          <div class="ultron-updates__info-meta">
            <span class="ultron-updates__info-date">
              ${icons.calendar}
              Publicado em ${formatDate(props.updateInfo.publishedAt)}
            </span>
          </div>

          <div class="ultron-updates__release-notes">
            <h5>Novidades:</h5>
            <div class="ultron-updates__release-notes-content">
              ${props.updateInfo.releaseNotes || 'Sem notas de versão disponíveis.'}
            </div>
          </div>

          <div class="ultron-updates__actions">
            <button 
              class="btn btn-primary"
              @click=${props.onInstallUpdate}
              ?disabled=${props.status === 'downloading' || props.status === 'installing'}
            >
              ${props.status === 'downloading' ? icons.loader : icons.download}
              ${props.status === 'downloading' ? 'Baixando...' : 
                props.status === 'installing' ? 'Instalando...' : 
                'Instalar atualização'}
            </button>
            <button 
              class="btn btn-secondary"
              @click=${props.onDismiss}
              ?disabled=${props.status === 'downloading' || props.status === 'installing'}
            >
              Mais tarde
            </button>
          </div>

          ${props.status === 'downloading' ? html`
            <div class="ultron-updates__progress">
              <div class="ultron-updates__progress-bar">
                <div 
                  class="ultron-updates__progress-fill"
                  style="width: ${props.downloadProgress}%"
                ></div>
              </div>
              <span class="ultron-updates__progress-text">
                ${props.downloadProgress}% concluído
              </span>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Erro -->
      ${props.error ? html`
        <div class="ultron-updates__error card">
          ${icons.alertCircle}
          <span>${props.error}</span>
        </div>
      ` : ''}

      <!-- Versão atual -->
      <div class="ultron-updates__current card">
        <div class="ultron-updates__current-item">
          <span class="ultron-updates__current-label">Versão atual:</span>
          <span class="ultron-updates__current-value">
            ${props.updateInfo?.currentVersion || '1.0.0'}
          </span>
        </div>
        <div class="ultron-updates__current-item">
          <span class="ultron-updates__current-label">Repositório:</span>
          <a 
            href="https://github.com/ghost-global-oficial/Ultron" 
            target="_blank"
            class="ultron-updates__current-link"
          >
            ${icons.github}
            GitHub
          </a>
        </div>
      </div>

      <!-- Botão de verificar -->
      ${props.status !== 'available' && props.status !== 'downloading' && props.status !== 'installing' ? html`
        <div class="ultron-updates__check">
          <button 
            class="btn btn-primary"
            @click=${props.onCheckUpdates}
            ?disabled=${props.status === 'checking'}
          >
            ${props.status === 'checking' ? icons.loader : icons.refreshCw}
            ${props.status === 'checking' ? 'Verificando...' : 'Verificar atualizações'}
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderStatus(props: UltronUpdatesProps) {
  switch (props.status) {
    case 'checking':
      return html`
        <div class="ultron-updates__status-item ultron-updates__status-item--checking">
          ${icons.loader}
          <span>Verificando atualizações no GitHub...</span>
        </div>
      `;
    
    case 'available':
      return html`
        <div class="ultron-updates__status-item ultron-updates__status-item--available">
          ${icons.alertCircle}
          <span>Nova atualização disponível!</span>
        </div>
      `;
    
    case 'downloading':
      return html`
        <div class="ultron-updates__status-item ultron-updates__status-item--downloading">
          ${icons.download}
          <span>Baixando atualização...</span>
        </div>
      `;
    
    case 'installing':
      return html`
        <div class="ultron-updates__status-item ultron-updates__status-item--installing">
          ${icons.loader}
          <span>Instalando atualização...</span>
        </div>
      `;
    
    case 'uptodate':
      return html`
        <div class="ultron-updates__status-item ultron-updates__status-item--uptodate">
          ${icons.checkCircle}
          <span>Você está usando a versão mais recente!</span>
        </div>
      `;
    
    case 'error':
      return html`
        <div class="ultron-updates__status-item ultron-updates__status-item--error">
          ${icons.alertCircle}
          <span>Erro ao verificar atualizações</span>
        </div>
      `;
    
    default:
      return html`
        <div class="ultron-updates__status-item">
          ${icons.info}
          <span>Clique em "Verificar atualizações" para buscar novas versões</span>
        </div>
      `;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}
