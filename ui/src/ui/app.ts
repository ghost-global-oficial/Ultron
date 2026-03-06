import { LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { EventLogEntry } from "./app-events";
import type { DevicePairingList } from "./controllers/devices";
import type { ExecApprovalRequest } from "./controllers/exec-approval";
import type { ExecApprovalsFile, ExecApprovalsSnapshot } from "./controllers/exec-approvals";
import type { GatewayBrowserClient, GatewayHelloOk } from "./gateway";
import type { Tab } from "./navigation";
import type { ResolvedTheme, ThemeMode } from "./theme";
import type {
  AgentsListResult,
  ConfigSnapshot,
  ConfigUiHints,
  CronJob,
  CronRunLogEntry,
  CronStatus,
  HealthSnapshot,
  LogEntry,
  LogLevel,
  PresenceEntry,
  ChannelsStatusSnapshot,
  SessionsListResult,
  SkillStatusReport,
  StatusSummary,
  NostrProfile,
} from "./types";
import type { NostrProfileFormState } from "./views/channels.nostr-profile-form";
import {
  handleChannelConfigReload as handleChannelConfigReloadInternal,
  handleChannelConfigSave as handleChannelConfigSaveInternal,
  handleNostrProfileCancel as handleNostrProfileCancelInternal,
  handleNostrProfileEdit as handleNostrProfileEditInternal,
  handleNostrProfileFieldChange as handleNostrProfileFieldChangeInternal,
  handleNostrProfileImport as handleNostrProfileImportInternal,
  handleNostrProfileSave as handleNostrProfileSaveInternal,
  handleNostrProfileToggleAdvanced as handleNostrProfileToggleAdvancedInternal,
  handleWhatsAppLogout as handleWhatsAppLogoutInternal,
  handleWhatsAppStart as handleWhatsAppStartInternal,
  handleWhatsAppWait as handleWhatsAppWaitInternal,
} from "./app-channels";
import {
  handleAbortChat as handleAbortChatInternal,
  handleSendChat as handleSendChatInternal,
  removeQueuedMessage as removeQueuedMessageInternal,
} from "./app-chat";
import { DEFAULT_CRON_FORM, DEFAULT_LOG_LEVEL_FILTERS } from "./app-defaults";
import { connectGateway as connectGatewayInternal } from "./app-gateway";
import {
  handleConnected,
  handleDisconnected,
  handleFirstUpdated,
  handleUpdated,
} from "./app-lifecycle";
import { renderApp } from "./app-render";
import {
  exportLogs as exportLogsInternal,
  handleChatScroll as handleChatScrollInternal,
  handleLogsScroll as handleLogsScrollInternal,
  resetChatScroll as resetChatScrollInternal,
} from "./app-scroll";
import {
  applySettings as applySettingsInternal,
  loadCron as loadCronInternal,
  loadOverview as loadOverviewInternal,
  setTab as setTabInternal,
  setTheme as setThemeInternal,
  onPopState as onPopStateInternal,
} from "./app-settings";
import {
  resetToolStream as resetToolStreamInternal,
  type ToolStreamEntry,
} from "./app-tool-stream";
import { resolveInjectedAssistantIdentity } from "./assistant-identity";
import { loadAssistantIdentity as loadAssistantIdentityInternal } from "./controllers/assistant-identity";
import { loadSettings, type UiSettings } from "./storage";
import { type ChatAttachment, type ChatQueueItem, type CronFormState } from "./ui-types";
import type { Agent } from "./views/agents-page";

declare global {
  interface Window {
    __OPENCLAW_CONTROL_UI_BASE_PATH__?: string;
  }
}

const injectedAssistantIdentity = resolveInjectedAssistantIdentity();

function resolveOnboardingMode(): boolean {
  if (!window.location.search) {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("onboarding");
  if (!raw) {
    return false;
  }
  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

@customElement("ultron-app")
export class UltronApp extends LitElement {
  @state() settings: UiSettings = loadSettings();
  @state() password = "";
  @state() tab: Tab = "chat";
  @state() onboarding = resolveOnboardingMode();
  @state() connected = false;
  @state() theme: ThemeMode = this.settings.theme ?? "system";
  @state() themeResolved: ResolvedTheme = "dark";
  @state() hello: GatewayHelloOk | null = null;
  @state() lastError: string | null = null;
  @state() eventLog: EventLogEntry[] = [];
  private eventLogBuffer: EventLogEntry[] = [];
  private toolStreamSyncTimer: number | null = null;
  private sidebarCloseTimer: number | null = null;

  @state() assistantName = injectedAssistantIdentity.name;
  @state() assistantAvatar = injectedAssistantIdentity.avatar;
  @state() assistantAgentId = injectedAssistantIdentity.agentId ?? null;

  // Sempre inicia com uma nova sess├úo vazia para mostrar a tela de boas-vindas
  @state() sessionKey = `agent:main:chat:${Date.now()}:${Math.random().toString(36).slice(2, 11)}`;
  @state() chatLoading = false;
  @state() chatSending = false;
  @state() chatMessage = "";
  @state() chatMessages: unknown[] = [];
  @state() chatToolMessages: unknown[] = [];
  @state() chatStream: string | null = null;
  @state() chatModelMenuOpen = false;
  @state() chatCurrentModel = "Claude Sonnet 4.5";
  @state() chatStreamStartedAt: number | null = null;
  @state() chatRunId: string | null = null;
  @state() compactionStatus: import("./app-tool-stream").CompactionStatus | null = null;
  @state() chatAvatarUrl: string | null = null;
  @state() chatThinkingLevel: string | null = null;
  @state() chatQueue: ChatQueueItem[] = [];
  @state() chatAttachments: ChatAttachment[] = [];
  // Sidebar state for tool output viewing
  @state() sidebarOpen = false;
  @state() sidebarContent: string | null = null;
  @state() sidebarError: string | null = null;
  @state() splitRatio = this.settings.splitRatio;

  @state() nodesLoading = false;
  @state() nodes: Array<Record<string, unknown>> = [];
  @state() devicesLoading = false;
  @state() devicesError: string | null = null;
  @state() devicesList: DevicePairingList | null = null;
  @state() execApprovalsLoading = false;
  @state() execApprovalsSaving = false;
  @state() execApprovalsDirty = false;
  @state() execApprovalsSnapshot: ExecApprovalsSnapshot | null = null;
  @state() execApprovalsForm: ExecApprovalsFile | null = null;
  @state() execApprovalsSelectedAgent: string | null = null;
  @state() execApprovalsTarget: "gateway" | "node" = "gateway";
  @state() execApprovalsTargetNodeId: string | null = null;
  @state() execApprovalQueue: ExecApprovalRequest[] = [];
  @state() execApprovalBusy = false;
  @state() execApprovalError: string | null = null;
  @state() pendingGatewayUrl: string | null = null;

  @state() configLoading = false;
  @state() configRaw = "{\n}\n";
  @state() configRawOriginal = "";
  @state() configValid: boolean | null = null;
  @state() configIssues: unknown[] = [];
  @state() configSaving = false;
  @state() configApplying = false;
  @state() updateRunning = false;
  @state() applySessionKey = this.settings.lastActiveSessionKey;
  @state() configSnapshot: ConfigSnapshot | null = null;
  @state() configSchema: unknown = null;
  @state() configSchemaVersion: string | null = null;
  @state() configSchemaLoading = false;
  @state() configUiHints: ConfigUiHints = {};
  @state() configForm: Record<string, unknown> | null = null;
  @state() configFormOriginal: Record<string, unknown> | null = null;
  @state() configFormDirty = false;
  @state() configFormMode: "form" | "raw" = "form";
  @state() configSearchQuery = "";
  @state() configActiveSection: string | null = null;
  @state() configActiveSubsection: string | null = null;

  @state() channelsLoading = false;
  @state() channelsSnapshot: ChannelsStatusSnapshot | null = null;
  @state() channelsError: string | null = null;
  @state() channelsLastSuccess: number | null = null;
  @state() whatsappLoginMessage: string | null = null;
  @state() whatsappLoginQrDataUrl: string | null = null;
  @state() whatsappLoginConnected: boolean | null = null;
  @state() whatsappBusy = false;
  @state() nostrProfileFormState: NostrProfileFormState | null = null;
  @state() nostrProfileAccountId: string | null = null;

  @state() presenceLoading = false;
  @state() presenceEntries: PresenceEntry[] = [];
  @state() presenceError: string | null = null;
  @state() presenceStatus: string | null = null;

  @state() agentsLoading = false;
  @state() agentsList: AgentsListResult | null = {
    defaultId: "main",
    mainKey: "agent:main:main",
    scope: "gateway",
    agents: [
      {
        id: "main",
        name: "ULTRON",
        identity: {
          name: "ULTRON",
          emoji: "­ƒñû",
          avatar: undefined,
          avatarUrl: undefined,
        },
      },
      {
        id: "assistant",
        name: "Assistant",
        identity: {
          name: "Assistant",
          emoji: "­ƒÆí",
          avatar: undefined,
          avatarUrl: undefined,
        },
      },
    ],
  };
  @state() agentsError: string | null = null;

  @state() sessionsLoading = false;
  @state() sessionsResult: SessionsListResult | null = null;
  @state() sessionsError: string | null = null;
  @state() sessionsFilterActive = "";
  @state() sessionsFilterLimit = "120";
  @state() sessionsIncludeGlobal = true;
  @state() sessionsIncludeUnknown = true; // Mudado para true para mostrar todas as tarefas
  
  // Rastrear sess├Áes que precisam de nome autom├ítico
  private sessionsNeedingName = new Set<string>();

  @state() cronLoading = false;
  @state() cronJobs: CronJob[] = [];
  @state() cronStatus: CronStatus | null = null;
  @state() cronError: string | null = null;
  @state() cronForm: CronFormState = { ...DEFAULT_CRON_FORM };
  @state() cronRunsJobId: string | null = null;
  @state() cronRuns: CronRunLogEntry[] = [];
  @state() cronBusy = false;

  @state() skillsLoading = false;
  @state() skillsReport: SkillStatusReport | null = null;
  @state() skillsError: string | null = null;
  @state() skillsFilter = "";
  @state() skillEdits: Record<string, string> = {};
  @state() skillsBusyKey: string | null = null;
  @state() skillMessages: Record<string, SkillMessage> = {};

  @state() debugLoading = false;
  @state() debugStatus: StatusSummary | null = null;
  @state() debugHealth: HealthSnapshot | null = null;
  @state() debugModels: unknown[] = [];
  @state() debugHeartbeat: unknown = null;
  @state() debugCallMethod = "";
  @state() debugCallParams = "{}";
  @state() debugCallResult: string | null = null;
  @state() debugCallError: string | null = null;

  @state() logsLoading = false;
  @state() logsError: string | null = null;
  @state() logsFile: string | null = null;
  @state() logsEntries: LogEntry[] = [];
  @state() logsFilterText = "";
  @state() logsLevelFilters: Record<LogLevel, boolean> = {
    ...DEFAULT_LOG_LEVEL_FILTERS,
  };
  @state() logsAutoFollow = true;
  @state() logsTruncated = false;
  @state() logsCursor: number | null = null;
  @state() logsLastFetchAt: number | null = null;
  @state() logsLimit = 500;
  @state() logsMaxBytes = 250_000;
  @state() logsAtBottom = true;

  // Nova barra lateral e menu de configura├º├Áes
  @state() settingsMenuOpen = false;
  @state() showClawbotSettings = false;
  @state() showUltronSettings = false;
  @state() ultronSettingsSection: "account" | "scheduled-tasks" | "data-control" | "personalization" | "skills" | "connectors" | "integrations" | "help" = "personalization";
  @state() settingsMenuPosition: { top: number; left: number } | null = null;
  
  // Menu de contexto das tarefas
  @state() taskMenuOpen: string | null = null;
  @state() taskMenuPosition: { top: number; left: number } | null = null;
  @state() ultronSettingsData = {
    theme: this.settings.theme ?? "system",
    language: "pt",
    chatFocusMode: this.settings.chatFocusMode ?? false,
    chatShowThinking: this.settings.chatShowThinking ?? false,
    navCollapsed: this.settings.navCollapsed ?? false,
    autoSave: true,
    notifications: true,
    soundEffects: false,
  };

  // Menu de conectores
  @state() connectorsMenuOpen = false;
  @state() connectorsMenuPosition: { top: number; left: number } | null = null;
  @state() connectors = [
    { id: "chrome", name: "O Meu Navegador", icon: "chrome", enabled: true, requiresAuth: false, description: "Controle e automatize seu navegador Chrome" },
    { id: "supabase", name: "Supabase", icon: "supabase", enabled: true, requiresAuth: false, description: "Banco de dados e autentica├º├úo em tempo real" },
    { id: "github", name: "GitHub", icon: "github", enabled: false, requiresAuth: true, description: "Integre com reposit├│rios e issues do GitHub" },
    { id: "gmail", name: "Gmail", icon: "gmail", enabled: false, requiresAuth: true, description: "Acesse e gerencie seus e-mails do Gmail" },
    { id: "outlook", name: "Outlook Mail", icon: "outlook", enabled: false, requiresAuth: true, description: "Acesse e gerencie seus e-mails do Outlook" },
    { id: "calendar", name: "Google Calendar", icon: "calendar", enabled: false, requiresAuth: true, description: "Gerencie seus eventos e compromissos" },
  ];

  // Modal de gerenciamento de conectores
  @state() manageConnectorsModalOpen = false;
  @state() manageConnectorsSearchQuery = "";
  @state() manageConnectorsActiveTab: "applications" | "custom-api" | "custom-mcp" = "applications";
  @state() connectorApps = [
    { id: "gmail", name: "Gmail", description: "Acesse e gerencie seus e-mails do Gmail", icon: "gmail", enabled: false, category: "recommended" as const },
    { id: "calendar", name: "Google Calendar", description: "Gerencie seus eventos e compromissos", icon: "calendar", enabled: false, category: "recommended" as const },
    { id: "drive", name: "Google Drive", description: "Acesse e gerencie seus arquivos no Drive", icon: "drive", enabled: false, category: "recommended" as const },
    { id: "outlook", name: "Outlook Mail", description: "Acesse e gerencie seus e-mails do Outlook", icon: "outlook", enabled: false, category: "applications" as const },
    { id: "github", name: "GitHub", description: "Integre com reposit├│rios e issues do GitHub", icon: "github", enabled: false, category: "applications" as const },
    { id: "slack", name: "Slack", description: "Conecte-se aos seus workspaces do Slack", icon: "slack", enabled: false, category: "applications" as const },
    { id: "notion", name: "Notion", description: "Acesse e edite suas p├íginas do Notion", icon: "notion", enabled: false, category: "applications" as const },
  ];

  // Menu de configura├º├Áes de conectores
  @state() manageConnectorsSettingsOpen = false;
  @state() manageConnectorsSettingsSection: "account" | "scheduled-tasks" | "data-control" | "personalization" | "skills" | "connectors" | "integrations" | "help" = "connectors";

  // Painel de agendamento de tarefas
  @state() scheduleTaskPanelOpen = false;
  @state() scheduleTaskSelectedDate: Date | null = null;
  @state() scheduleTaskSelectedTime = "09:00";
  @state() scheduleTaskRepeatType: "once" | "daily" | "weekly" | "monthly" = "once";
  @state() scheduleTaskRepeatCount = 1;

  client: GatewayBrowserClient | null = null;
  private chatScrollFrame: number | null = null;
  private chatScrollTimeout: number | null = null;
  private chatHasAutoScrolled = false;
  private chatUserNearBottom = true;
  private nodesPollInterval: number | null = null;
  private logsPollInterval: number | null = null;
  private debugPollInterval: number | null = null;
  private logsScrollFrame: number | null = null;
  private toolStreamById = new Map<string, ToolStreamEntry>();
  private toolStreamOrder: string[] = [];
  refreshSessionsAfterChat = new Set<string>();
  basePath = "";
  private popStateHandler = () =>
    onPopStateInternal(this as unknown as Parameters<typeof onPopStateInternal>[0]);
  private themeMedia: MediaQueryList | null = null;
  private themeMediaHandler: ((event: MediaQueryListEvent) => void) | null = null;
  private topbarObserver: ResizeObserver | null = null;

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    handleConnected(this as unknown as Parameters<typeof handleConnected>[0]);
  }

  protected firstUpdated() {
    handleFirstUpdated(this as unknown as Parameters<typeof handleFirstUpdated>[0]);
  }

  disconnectedCallback() {
    handleDisconnected(this as unknown as Parameters<typeof handleDisconnected>[0]);
    super.disconnectedCallback();
  }

  protected updated(changed: Map<PropertyKey, unknown>) {
    handleUpdated(this as unknown as Parameters<typeof handleUpdated>[0], changed);
  }

  connect() {
    connectGatewayInternal(this as unknown as Parameters<typeof connectGatewayInternal>[0]);
  }

  handleChatScroll(event: Event) {
    handleChatScrollInternal(
      this as unknown as Parameters<typeof handleChatScrollInternal>[0],
      event,
    );
  }

  handleLogsScroll(event: Event) {
    handleLogsScrollInternal(
      this as unknown as Parameters<typeof handleLogsScrollInternal>[0],
      event,
    );
  }

  exportLogs(lines: string[], label: string) {
    exportLogsInternal(lines, label);
  }

  resetToolStream() {
    resetToolStreamInternal(this as unknown as Parameters<typeof resetToolStreamInternal>[0]);
  }

  resetChatScroll() {
    resetChatScrollInternal(this as unknown as Parameters<typeof resetChatScrollInternal>[0]);
  }

  async loadAssistantIdentity() {
    await loadAssistantIdentityInternal(this);
  }

  applySettings(next: UiSettings) {
    applySettingsInternal(this as unknown as Parameters<typeof applySettingsInternal>[0], next);
  }

  setTab(next: Tab) {
    setTabInternal(this as unknown as Parameters<typeof setTabInternal>[0], next);
  }

  setTheme(next: ThemeMode, context?: Parameters<typeof setThemeInternal>[2]) {
    setThemeInternal(this as unknown as Parameters<typeof setThemeInternal>[0], next, context);
  }

  async loadOverview() {
    await loadOverviewInternal(this as unknown as Parameters<typeof loadOverviewInternal>[0]);
  }

  async loadCron() {
    await loadCronInternal(this as unknown as Parameters<typeof loadCronInternal>[0]);
  }

  async handleAbortChat() {
    await handleAbortChatInternal(this as unknown as Parameters<typeof handleAbortChatInternal>[0]);
  }

  removeQueuedMessage(id: string) {
    removeQueuedMessageInternal(
      this as unknown as Parameters<typeof removeQueuedMessageInternal>[0],
      id,
    );
  }
  
  // Gera um nome descritivo para a tarefa baseado na primeira mensagem
  private async generateTaskName(sessionKey: string, firstMessage: string): Promise<string> {
    // Limitar a mensagem a 100 caracteres para o nome
    const truncated = firstMessage.trim().substring(0, 100);
    
    // Remover quebras de linha e m├║ltiplos espa├ºos
    const cleaned = truncated.replace(/\s+/g, ' ');
    
    // Se a mensagem for muito curta, usar ela inteira
    if (cleaned.length <= 50) {
      return cleaned;
    }
    
    // Caso contr├írio, tentar encontrar um ponto de quebra natural
    const breakPoints = ['. ', '? ', '! ', ', '];
    for (const breakPoint of breakPoints) {
      const index = cleaned.indexOf(breakPoint);
      if (index > 20 && index < 50) {
        return cleaned.substring(0, index + 1).trim();
      }
    }
    
    // Se n├úo encontrar ponto de quebra, truncar em 50 caracteres
    return cleaned.substring(0, 50).trim() + '...';
  }
  
  // Atualiza o label da sess├úo
  private async updateSessionLabel(sessionKey: string, label: string) {
    if (!this.client || !this.connected) {
      return;
    }
    
    try {
      await this.client.request('sessions.patch', {
        key: sessionKey,
        label: label,
      });
      
      // Recarregar a lista de sess├Áes para mostrar o novo nome
      await loadSessions(this);
    } catch (error) {
      console.error('[DEBUG] Error updating session label:', error);
    }
  }

  async handleSendChat(
    messageOverride?: string,
    opts?: Parameters<typeof handleSendChatInternal>[2],
  ) {
    // Marcar esta sess├úo como precisando de nome se for uma nova tarefa sem label
    const session = this.sessionsResult?.sessions?.find(s => s.key === this.sessionKey);
    const isNewTask = this.sessionKey.startsWith('agent:main:chat:') && !session?.label;
    
    if (isNewTask && !this.sessionsNeedingName.has(this.sessionKey)) {
      this.sessionsNeedingName.add(this.sessionKey);
    }
    
    await handleSendChatInternal(
      this as unknown as Parameters<typeof handleSendChatInternal>[0],
      messageOverride,
      opts,
    );
  }

  async handleWhatsAppStart(force: boolean) {
    await handleWhatsAppStartInternal(this, force);
  }

  async handleWhatsAppWait() {
    await handleWhatsAppWaitInternal(this);
  }

  async handleWhatsAppLogout() {
    await handleWhatsAppLogoutInternal(this);
  }

  async handleChannelConfigSave() {
    await handleChannelConfigSaveInternal(this);
  }

  async handleChannelConfigReload() {
    await handleChannelConfigReloadInternal(this);
  }

  handleNostrProfileEdit(accountId: string, profile: NostrProfile | null) {
    handleNostrProfileEditInternal(this, accountId, profile);
  }

  handleNostrProfileCancel() {
    handleNostrProfileCancelInternal(this);
  }

  handleNostrProfileFieldChange(field: keyof NostrProfile, value: string) {
    handleNostrProfileFieldChangeInternal(this, field, value);
  }

  async handleNostrProfileSave() {
    await handleNostrProfileSaveInternal(this);
  }

  async handleNostrProfileImport() {
    await handleNostrProfileImportInternal(this);
  }

  handleNostrProfileToggleAdvanced() {
    handleNostrProfileToggleAdvancedInternal(this);
  }

  async handleExecApprovalDecision(decision: "allow-once" | "allow-always" | "deny") {
    const active = this.execApprovalQueue[0];
    if (!active || !this.client || this.execApprovalBusy) {
      return;
    }
    this.execApprovalBusy = true;
    this.execApprovalError = null;
    try {
      await this.client.request("exec.approval.resolve", {
        id: active.id,
        decision,
      });
      this.execApprovalQueue = this.execApprovalQueue.filter((entry) => entry.id !== active.id);
    } catch (err) {
      this.execApprovalError = `Exec approval failed: ${String(err)}`;
    } finally {
      this.execApprovalBusy = false;
    }
  }

  handleGatewayUrlConfirm() {
    const nextGatewayUrl = this.pendingGatewayUrl;
    if (!nextGatewayUrl) {
      return;
    }
    this.pendingGatewayUrl = null;
    applySettingsInternal(this as unknown as Parameters<typeof applySettingsInternal>[0], {
      ...this.settings,
      gatewayUrl: nextGatewayUrl,
    });
    this.connect();
  }

  handleGatewayUrlCancel() {
    this.pendingGatewayUrl = null;
  }

  // Sidebar handlers for tool output viewing
  handleOpenSidebar(content: string) {
    if (this.sidebarCloseTimer != null) {
      window.clearTimeout(this.sidebarCloseTimer);
      this.sidebarCloseTimer = null;
    }
    this.sidebarContent = content;
    this.sidebarError = null;
    this.sidebarOpen = true;
  }

  handleCloseSidebar() {
    this.sidebarOpen = false;
    // Clear content after transition
    if (this.sidebarCloseTimer != null) {
      window.clearTimeout(this.sidebarCloseTimer);
    }
    this.sidebarCloseTimer = window.setTimeout(() => {
      if (this.sidebarOpen) {
        return;
      }
      this.sidebarContent = null;
      this.sidebarError = null;
      this.sidebarCloseTimer = null;
    }, 200);
  }

  handleSplitRatioChange(ratio: number) {
    const newRatio = Math.max(0.4, Math.min(0.7, ratio));
    this.splitRatio = newRatio;
    this.applySettings({ ...this.settings, splitRatio: newRatio });
  }

  // M├®todos da nova barra lateral
  handleNewTask() {
    // Gera uma nova chave de sess├úo no formato correto: agent:main:chat:timestamp:randomId
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).slice(2, 11);
    const newSessionKey = `agent:main:chat:${timestamp}:${randomId}`;
    
    // Limpa o estado do chat
    this.sessionKey = newSessionKey;
    this.chatMessage = "";
    this.chatMessages = [];
    this.chatToolMessages = [];
    this.chatAttachments = [];
    this.chatStream = null;
    this.chatStreamStartedAt = null;
    this.chatRunId = null;
    this.chatQueue = [];
    this.resetToolStream();
    
    // Atualiza as configura├º├Áes
    this.applySettings({
      ...this.settings,
      sessionKey: newSessionKey,
      lastActiveSessionKey: newSessionKey,
    });
    
    // Carrega a identidade do assistente
    void this.loadAssistantIdentity();
    
    // Navega para a aba de chat se n├úo estiver nela
    if (this.tab !== "chat") {
      this.setTab("chat");
    }
  }

  handleAgents() {
    this.setTab("agents");
  }

  handleCreateAgent() {
    // TODO: Implementar cria├º├úo de agent
    console.log("Create agent clicked");
  }

  handleEditAgent(id: string) {
    // TODO: Implementar edi├º├úo de agent
    console.log("Edit agent:", id);
  }

  handleDeleteAgent(id: string) {
    // TODO: Implementar exclus├úo de agent
    console.log("Delete agent:", id);
  }

  handleToggleAgent(id: string) {
    // TODO: Implementar toggle de agent
    console.log("Toggle agent:", id);
  }

  handleSearch() {
    // TODO: Implementar busca
    console.log("Search clicked");
  }

  handleNewProject() {
    // TODO: Implementar novo projeto
    console.log("New project clicked");
  }

  handleSettingsClick(event?: MouseEvent) {
    if (event && event.currentTarget instanceof HTMLElement) {
      const rect = event.currentTarget.getBoundingClientRect();
      this.settingsMenuPosition = {
        top: rect.top,
        left: rect.right + 8,
      };
    }
    this.settingsMenuOpen = !this.settingsMenuOpen;
  }

  handleCloseUltronSettings() {
    this.showUltronSettings = false;
  }
  
  handleUltronSettingsSection(section: "account" | "scheduled-tasks" | "data-control" | "personalization" | "skills" | "connectors" | "integrations" | "help") {
    this.ultronSettingsSection = section;
  }

  handleUltronSettingChange(key: string, value: any) {
    this.ultronSettingsData = {
      ...this.ultronSettingsData,
      [key]: value,
    };
  }

  handleSaveUltronSettings() {
    // Aplicar configura├º├Áes
    this.applySettings({
      ...this.settings,
      theme: this.ultronSettingsData.theme as ThemeMode,
      chatFocusMode: this.ultronSettingsData.chatFocusMode,
      chatShowThinking: this.ultronSettingsData.chatShowThinking,
      navCollapsed: this.ultronSettingsData.navCollapsed,
    });
    
    // Fechar modal
    this.showUltronSettings = false;
  }

  handleClawbotSettings() {
    this.settingsMenuOpen = false;
    this.showClawbotSettings = true;
  }

  handleCloseClawbotSettings() {
    this.showClawbotSettings = false;
  }

  handleSettingsMenuClose() {
    this.settingsMenuOpen = false;
  }

  handleTaskMenuOpen(event: MouseEvent, sessionKey: string) {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    this.taskMenuPosition = {
      top: rect.bottom + 4,
      left: rect.left,
    };
    this.taskMenuOpen = sessionKey;
  }

  handleTaskMenuClose() {
    this.taskMenuOpen = null;
    this.taskMenuPosition = null;
  }

  handlePinTask(sessionKey: string) {
    // TODO: Implementar fixar tarefa
    console.log("Pin task:", sessionKey);
  }

  handleDeleteTask(sessionKey: string) {
    // TODO: Implementar deletar tarefa
    console.log("Delete task:", sessionKey);
  }

  handleArchiveTask(sessionKey: string) {
    // TODO: Implementar arquivar tarefa
    console.log("Archive task:", sessionKey);
  }

  handleRenameTask(sessionKey: string) {
    // TODO: Implementar renomear tarefa
    console.log("Rename task:", sessionKey);
  }

  handleShareTask(sessionKey: string) {
    // TODO: Implementar partilhar tarefa
    console.log("Share task:", sessionKey);
  }

  handleConnectorsMenuOpen(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    this.connectorsMenuPosition = {
      top: rect.bottom + 8, // Posiciona abaixo do bot├úo
      left: rect.left,
    };
    this.connectorsMenuOpen = true;
  }

  handleConnectorsMenuClose() {
    this.connectorsMenuOpen = false;
  }

  handleToggleConnector(id: string) {
    this.connectors = this.connectors.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
  }

  handleConnectConnector(id: string) {
    // TODO: Implementar l├│gica de autentica├º├úo
    console.log("Connect connector:", id);
    // Por enquanto, apenas habilita o conector
    this.connectors = this.connectors.map((c) =>
      c.id === id ? { ...c, enabled: true } : c
    );
  }

  handleAddConnectors() {
    this.connectorsMenuOpen = false;
    this.manageConnectorsModalOpen = true;
  }

  handleManageConnectors() {
    this.connectorsMenuOpen = false;
    this.manageConnectorsSettingsOpen = true;
  }

  handleManageConnectorsIntegrations() {
    this.connectorsMenuOpen = false;
    this.manageConnectorsSettingsOpen = true;
    this.manageConnectorsSettingsSection = "integrations";
  }

  handleManageConnectorsSettingsClose() {
    this.manageConnectorsSettingsOpen = false;
  }

  handleManageConnectorsSettingsSection(section: "account" | "scheduled-tasks" | "data-control" | "personalization" | "skills" | "connectors" | "integrations" | "help") {
    this.manageConnectorsSettingsSection = section;
  }

  handleConnectorSettingsClick(id: string) {
    // Fecha o modal de gerenciamento
    this.manageConnectorsSettingsOpen = false;
    
    // Encontra o conector
    const connector = this.connectors.find(c => c.id === id);
    if (!connector) {
      console.error("Connector not found:", id);
      return;
    }
    
    // Se o conector requer autentica├º├úo e n├úo est├í habilitado, abre o modal de adicionar
    if (connector.requiresAuth && !connector.enabled) {
      this.manageConnectorsModalOpen = true;
      return;
    }
    
    // Se j├í est├í habilitado, mostra op├º├Áes de configura├º├úo
    console.log("Opening settings for connector:", connector.name);
    // TODO: Abrir modal de configura├º├Áes espec├¡ficas do conector
  }

  handleManageConnectorsClose() {
    this.manageConnectorsModalOpen = false;
    this.manageConnectorsSearchQuery = "";
  }

  handleManageConnectorsSearchChange(query: string) {
    this.manageConnectorsSearchQuery = query;
  }

  handleManageConnectorsTabChange(tab: "applications" | "custom-api" | "custom-mcp") {
    this.manageConnectorsActiveTab = tab;
  }

  handleToggleConnectorApp(id: string) {
    this.connectorApps = this.connectorApps.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
  }

  handleOpenScheduleTask() {
    this.scheduleTaskPanelOpen = true;
  }

  handleCloseScheduleTask() {
    this.scheduleTaskPanelOpen = false;
  }

  handleScheduleTaskDateSelect(date: Date) {
    this.scheduleTaskSelectedDate = date;
  }

  handleScheduleTaskTimeChange(time: string) {
    this.scheduleTaskSelectedTime = time;
  }

  handleScheduleTaskRepeatTypeChange(type: "once" | "daily" | "weekly" | "monthly") {
    this.scheduleTaskRepeatType = type;
  }

  handleScheduleTaskRepeatCountChange(count: number) {
    this.scheduleTaskRepeatCount = count;
  }

  handleScheduleTask() {
    // TODO: Implementar l├│gica de agendamento
    console.log("Schedule task:", {
      date: this.scheduleTaskSelectedDate,
      time: this.scheduleTaskSelectedTime,
      repeatType: this.scheduleTaskRepeatType,
      repeatCount: this.scheduleTaskRepeatCount,
    });
    this.scheduleTaskPanelOpen = false;
  }

  handleChatModelMenuToggle() {
    console.log('[DEBUG] handleChatModelMenuToggle called, current state:', this.chatModelMenuOpen);
    this.chatModelMenuOpen = !this.chatModelMenuOpen;
    console.log('[DEBUG] New state:', this.chatModelMenuOpen);
    this.requestUpdate();
  }

  handleChatModelMenuClose() {
    console.log('[DEBUG] handleChatModelMenuClose called');
    this.chatModelMenuOpen = false;
    this.requestUpdate();
  }

  handleChatModelChange(model: string) {
    console.log('[DEBUG] handleChatModelChange called with:', model);
    this.chatCurrentModel = model;
    this.chatModelMenuOpen = false;
    this.requestUpdate();
    // TODO: Implementar mudan├ºa de modelo no backend
    console.log("Model changed to:", model);
  }

  render() {
    return renderApp(this);
  }
}
