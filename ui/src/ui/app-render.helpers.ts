import { html, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import type { AppViewState } from "./app-view-state";
import type { ThemeMode } from "./theme";
import type { ThemeTransitionContext } from "./theme-transition";
import type { SessionsListResult } from "./types";
import { refreshChat } from "./app-chat";
import { syncUrlWithSessionKey } from "./app-settings";
import { loadChatHistory } from "./controllers/chat";
import { icons } from "./icons";
import { iconForTab, pathForTab, titleForTab, type Tab } from "./navigation";

export function renderTab(state: AppViewState, tab: Tab) {
  const href = pathForTab(tab, state.basePath);
  return html`
    <a
      href=${href}
      class="nav-item ${state.tab === tab ? "active" : ""}"
      @click=${(event: MouseEvent) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        state.setTab(tab);
      }}
      title=${titleForTab(tab)}
    >
      <span class="nav-item__icon" aria-hidden="true">${icons[iconForTab(tab)]}</span>
      <span class="nav-item__text">${titleForTab(tab)}</span>
    </a>
  `;
}

export function renderChatModelButton(state: AppViewState) {
  return html`
    <button
      class="chat-model-selector__button"
      @click=${(e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[DEBUG] Model selector clicked', { 
          hasMethod: typeof state.handleChatModelMenuToggle === 'function',
          currentState: state.chatModelMenuOpen 
        });
        state.handleChatModelMenuToggle();
      }}
      aria-label="Select model"
      title="Select AI model"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
        <path d="M8.5 8.5v.01"/>
        <path d="M16 15.5v.01"/>
        <path d="M12 12v.01"/>
        <path d="M11 17v.01"/>
        <path d="M7 14v.01"/>
      </svg>
      <span class="chat-model-selector__text">${state.chatCurrentModel}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
  `;
}

export function renderChatModelMenu(state: AppViewState) {
  const availableModels = [
    { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", provider: "Anthropic" },
    { id: "claude-opus-4", name: "Claude Opus 4", provider: "Anthropic" },
    { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
    { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", provider: "Google" },
    { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "Meta" },
  ];

  console.log('[DEBUG] renderChatModelMenu called');
  
  // Calcular posição do menu baseado no botão
  setTimeout(() => {
    const button = document.querySelector('.chat-model-selector__button');
    const menu = document.querySelector('.chat-model-selector__menu');
    
    if (button && menu) {
      const rect = button.getBoundingClientRect();
      const menuEl = menu as HTMLElement;
      menuEl.style.top = `${rect.bottom + 8}px`;
      menuEl.style.left = `${rect.left}px`;
      
      console.log('[DEBUG] Menu positioned at:', {
        top: menuEl.style.top,
        left: menuEl.style.left,
        buttonRect: { top: rect.top, left: rect.left, bottom: rect.bottom }
      });
    }
  }, 0);

  return html`
    <div 
      class="chat-model-selector__overlay" 
      @click=${() => {
        console.log('[DEBUG] Overlay clicked');
        state.handleChatModelMenuClose();
      }}
    ></div>
    <div class="chat-model-selector__menu">
      <div class="chat-model-selector__menu-header">
        <span>Selecionar Modelo</span>
        <div class="chat-model-selector__menu-header-actions">
          <button
            class="chat-model-selector__menu-expand"
            @click=${() => {
              console.log('[DEBUG] Expand button clicked - opening integrations tab');
              state.handleChatModelMenuClose();
              state.handleManageConnectorsIntegrations();
            }}
            aria-label="Manage integrations"
            title="Gerir Integrações"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button
            class="chat-model-selector__menu-close"
            @click=${() => {
              console.log('[DEBUG] Close button clicked');
              state.handleChatModelMenuClose();
            }}
            aria-label="Close menu"
          >
            ${icons.x}
          </button>
        </div>
      </div>
      <div class="chat-model-selector__menu-list">
        ${availableModels.map(
          (model) => html`
            <button
              class="chat-model-selector__menu-item ${state.chatCurrentModel === model.name ? "chat-model-selector__menu-item--active" : ""}"
              @click=${() => {
                console.log('[DEBUG] Model item clicked:', model.name);
                state.handleChatModelChange(model.name);
              }}
            >
              <div class="chat-model-selector__menu-item-content">
                <span class="chat-model-selector__menu-item-name">${model.name}</span>
                <span class="chat-model-selector__menu-item-provider">${model.provider}</span>
              </div>
              ${state.chatCurrentModel === model.name ? html`
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ` : nothing}
            </button>
          `,
        )}
      </div>
    </div>
  `;
}

type SessionDefaultsSnapshot = {
  mainSessionKey?: string;
  mainKey?: string;
};

function resolveMainSessionKey(
  hello: AppViewState["hello"],
  sessions: SessionsListResult | null,
): string | null {
  const snapshot = hello?.snapshot as { sessionDefaults?: SessionDefaultsSnapshot } | undefined;
  const mainSessionKey = snapshot?.sessionDefaults?.mainSessionKey?.trim();
  if (mainSessionKey) {
    return mainSessionKey;
  }
  const mainKey = snapshot?.sessionDefaults?.mainKey?.trim();
  if (mainKey) {
    return mainKey;
  }
  if (sessions?.sessions?.some((row) => row.key === "main")) {
    return "main";
  }
  return null;
}

function resolveSessionDisplayName(key: string, row?: SessionsListResult["sessions"][number]) {
  const label = row?.label?.trim();
  if (label) {
    return `${label} (${key})`;
  }
  const displayName = row?.displayName?.trim();
  if (displayName) {
    return displayName;
  }
  return key;
}

function resolveSessionOptions(
  sessionKey: string,
  sessions: SessionsListResult | null,
  mainSessionKey?: string | null,
) {
  const seen = new Set<string>();
  const options: Array<{ key: string; displayName?: string }> = [];

  const resolvedMain = mainSessionKey && sessions?.sessions?.find((s) => s.key === mainSessionKey);
  const resolvedCurrent = sessions?.sessions?.find((s) => s.key === sessionKey);

  // Add main session key first
  if (mainSessionKey) {
    seen.add(mainSessionKey);
    options.push({
      key: mainSessionKey,
      displayName: resolveSessionDisplayName(mainSessionKey, resolvedMain),
    });
  }

  // Add current session key next
  if (!seen.has(sessionKey)) {
    seen.add(sessionKey);
    options.push({
      key: sessionKey,
      displayName: resolveSessionDisplayName(sessionKey, resolvedCurrent),
    });
  }

  // Add sessions from the result
  if (sessions?.sessions) {
    for (const s of sessions.sessions) {
      if (!seen.has(s.key)) {
        seen.add(s.key);
        options.push({
          key: s.key,
          displayName: resolveSessionDisplayName(s.key, s),
        });
      }
    }
  }

  return options;
}

const THEME_ORDER: ThemeMode[] = ["system", "light", "dark"];

export function renderThemeToggle(state: AppViewState) {
  const index = Math.max(0, THEME_ORDER.indexOf(state.theme));
  const applyTheme = (next: ThemeMode) => (event: MouseEvent) => {
    const element = event.currentTarget as HTMLElement;
    const context: ThemeTransitionContext = { element };
    if (event.clientX || event.clientY) {
      context.pointerClientX = event.clientX;
      context.pointerClientY = event.clientY;
    }
    state.setTheme(next, context);
  };

  return html`
    <div class="theme-toggle" style="--theme-index: ${index};">
      <div class="theme-toggle__track" role="group" aria-label="Theme">
        <span class="theme-toggle__indicator"></span>
        <button
          class="theme-toggle__button ${state.theme === "system" ? "active" : ""}"
          @click=${applyTheme("system")}
          aria-pressed=${state.theme === "system"}
          aria-label="System theme"
          title="System"
        >
          ${renderMonitorIcon()}
        </button>
        <button
          class="theme-toggle__button ${state.theme === "light" ? "active" : ""}"
          @click=${applyTheme("light")}
          aria-pressed=${state.theme === "light"}
          aria-label="Light theme"
          title="Light"
        >
          ${renderSunIcon()}
        </button>
        <button
          class="theme-toggle__button ${state.theme === "dark" ? "active" : ""}"
          @click=${applyTheme("dark")}
          aria-pressed=${state.theme === "dark"}
          aria-label="Dark theme"
          title="Dark"
        >
          ${renderMoonIcon()}
        </button>
      </div>
    </div>
  `;
}

function renderSunIcon() {
  return html`
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  `;
}

function renderMoonIcon() {
  return html`
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
      ></path>
    </svg>
  `;
}

function renderMonitorIcon() {
  return html`
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="20" height="14" x="2" y="3" rx="2"></rect>
      <line x1="8" x2="16" y1="21" y2="21"></line>
      <line x1="12" x2="12" y1="17" y2="21"></line>
    </svg>
  `;
}
