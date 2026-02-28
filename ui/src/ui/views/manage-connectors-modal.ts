import { html, nothing } from "lit";
import { icons } from "../icons";

export type ConnectorApp = {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: "recommended" | "applications";
};

export type ManageConnectorsModalProps = {
  isOpen: boolean;
  connectors: ConnectorApp[];
  searchQuery: string;
  activeTab: "applications" | "custom-api" | "custom-mcp";
  onClose: () => void;
  onSearchChange: (query: string) => void;
  onTabChange: (tab: "applications" | "custom-api" | "custom-mcp") => void;
  onToggleConnector: (id: string) => void;
};

export function renderManageConnectorsModal(props: ManageConnectorsModalProps) {
  if (!props.isOpen) {
    return html``;
  }

  const filteredConnectors = props.connectors.filter((connector) =>
    connector.name.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
    connector.description.toLowerCase().includes(props.searchQuery.toLowerCase())
  );

  const recommendedConnectors = filteredConnectors.filter((c) => c.category === "recommended");
  const applicationConnectors = filteredConnectors.filter((c) => c.category === "applications");

  return html`
    <div class="manage-connectors-overlay" @click=${props.onClose}></div>
    <div class="manage-connectors-modal" @click=${(e: Event) => e.stopPropagation()}>
      <div class="manage-connectors-modal__header">
        <h2 class="manage-connectors-modal__title">Conectores</h2>
        <button class="manage-connectors-modal__close" @click=${props.onClose}>
          ${icons.x}
        </button>
      </div>

      <div class="manage-connectors-modal__toolbar">
        <div class="manage-connectors-modal__tabs">
          <button
            class="manage-connectors-modal__tab ${props.activeTab === "applications" ? "manage-connectors-modal__tab--active" : ""}"
            @click=${() => props.onTabChange("applications")}
          >
            Aplicações
          </button>
          <button
            class="manage-connectors-modal__tab ${props.activeTab === "custom-api" ? "manage-connectors-modal__tab--active" : ""}"
            @click=${() => props.onTabChange("custom-api")}
          >
            API personalizada
          </button>
          <button
            class="manage-connectors-modal__tab ${props.activeTab === "custom-mcp" ? "manage-connectors-modal__tab--active" : ""}"
            @click=${() => props.onTabChange("custom-mcp")}
          >
            MCP personalizado
          </button>
        </div>

        <div class="manage-connectors-modal__search">
          <span class="manage-connectors-modal__search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </span>
          <input
            type="text"
            class="manage-connectors-modal__search-input"
            placeholder="Procurar"
            .value=${props.searchQuery}
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              props.onSearchChange(target.value);
            }}
          />
        </div>
      </div>

      <div class="manage-connectors-modal__content">
        ${props.activeTab === "applications"
          ? html`
              ${recommendedConnectors.length > 0
                ? html`
                    <div class="manage-connectors-modal__section">
                      <h3 class="manage-connectors-modal__section-title">Recomendar</h3>
                      <div class="manage-connectors-modal__grid">
                        ${recommendedConnectors.map(
                          (connector) => html`
                            <div class="manage-connectors-modal__card">
                              <div class="manage-connectors-modal__card-icon">
                                <img src="/${connector.icon}.png" alt="${connector.name}" />
                              </div>
                              <div class="manage-connectors-modal__card-content">
                                <h4 class="manage-connectors-modal__card-title">${connector.name}</h4>
                                <p class="manage-connectors-modal__card-description">
                                  ${connector.description}
                                </p>
                              </div>
                            </div>
                          `,
                        )}
                      </div>
                    </div>
                  `
                : nothing}

              ${applicationConnectors.length > 0
                ? html`
                    <div class="manage-connectors-modal__section">
                      <h3 class="manage-connectors-modal__section-title">Aplicações</h3>
                      <div class="manage-connectors-modal__grid">
                        ${applicationConnectors.map(
                          (connector) => html`
                            <div class="manage-connectors-modal__card">
                              <div class="manage-connectors-modal__card-icon">
                                <img src="/${connector.icon}.png" alt="${connector.name}" />
                              </div>
                              <div class="manage-connectors-modal__card-content">
                                <h4 class="manage-connectors-modal__card-title">${connector.name}</h4>
                                <p class="manage-connectors-modal__card-description">
                                  ${connector.description}
                                </p>
                              </div>
                            </div>
                          `,
                        )}
                      </div>
                    </div>
                  `
                : nothing}
            `
          : props.activeTab === "custom-api"
          ? html`
              <div class="manage-connectors-modal__api-intro">
                <span class="manage-connectors-modal__api-intro-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="7.5" cy="15.5" r="5.5"/>
                    <path d="m21 2-9.6 9.6"/>
                    <path d="m15.5 7.5 3 3L22 7l-3-3"/>
                  </svg>
                </span>
                <p class="manage-connectors-modal__api-intro-text">
                  Conecte o Manus programaticamente a qualquer serviço de terceiros usando as suas próprias chaves de API.
                </p>
              </div>

              <button class="manage-connectors-modal__add-api-btn">
                ${icons.plus}
                Adicionar API personalizada
              </button>

              <div class="manage-connectors-modal__api-list">
                ${[
                  { name: "OpenAI", description: "Aproveite a série de modelos GPT para geração e processamento inteligente de texto", icon: "chatgpt" },
                  { name: "Perplexity", description: "Pesquise informações em tempo real e obtenha respostas precisas com citações confiáveis", icon: "perplexity" },
                  { name: "Google Gemini", description: "Processar conteúdos multimodais, incluindo texto, imagens e código, de forma integrada.", icon: "google-gemini" },
                  { name: "Grok", description: "Acesse informações em tempo real e participe de conversas inteligentes", icon: "grok" },
                  { name: "OpenRouter", description: "Acesse vários modelos de IA e gerencie chamadas de API através de uma interface...", icon: "open-router" },
                  { name: "Ahrefs", description: "Otimize estratégias de SEO, analise palavras-chave e monitore o desempenho de backlinks", icon: "ahrefs" },
                  { name: "Stripe", description: "Processe pagamentos online e gerencie transações financeiras de forma segura", icon: "stripe" },
                  { name: "PayPal", description: "Integre pagamentos e transferências financeiras com segurança e facilidade", icon: "paypal" },
                  { name: "Cloudflare", description: "Proteja e acelere aplicações web com CDN e segurança avançada", icon: "cloudflare" },
                  { name: "Vercel", description: "Implante e hospede aplicações web com performance otimizada", icon: "vercel" },
                ].map(
                  (api) => html`
                    <div class="manage-connectors-modal__api-card">
                      <div class="manage-connectors-modal__api-card-icon">
                        <img src="/${api.icon}.png" alt="${api.name}" />
                      </div>
                      <div class="manage-connectors-modal__api-card-content">
                        <h4 class="manage-connectors-modal__api-card-title">${api.name}</h4>
                        <p class="manage-connectors-modal__api-card-description">${api.description}</p>
                      </div>
                    </div>
                  `,
                )}
              </div>
            `
          : html`
              <div class="manage-connectors-modal__api-intro">
                <span class="manage-connectors-modal__api-intro-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </span>
                <p class="manage-connectors-modal__api-intro-text">
                  Conecte servidores MCP (Model Context Protocol) para estender as capacidades do Manus com ferramentas e contextos personalizados.
                </p>
              </div>

              <button class="manage-connectors-modal__add-api-btn">
                ${icons.plus}
                Adicionar servidor MCP
              </button>

              <div class="manage-connectors-modal__api-list">
                ${[
                  { name: "Filesystem", description: "Acesse e manipule arquivos e diretórios do sistema de forma segura", icon: "n8n" },
                  { name: "Database", description: "Conecte-se a bancos de dados SQL e NoSQL para consultas e operações", icon: "prisma" },
                  { name: "Git", description: "Integre com repositórios Git para controle de versão e colaboração", icon: "github" },
                  { name: "Web Search", description: "Pesquise informações na web em tempo real com múltiplos provedores", icon: "perplexity" },
                  { name: "Browser", description: "Controle navegadores web para automação e scraping de dados", icon: "cloudflare" },
                  { name: "Email", description: "Envie e receba e-mails através de diferentes provedores", icon: "gmail" },
                  { name: "Calendar", description: "Gerencie eventos e compromissos em calendários", icon: "calendar" },
                  { name: "Slack", description: "Integre com workspaces do Slack para mensagens e notificações", icon: "slack" },
                  { name: "Notion", description: "Acesse e edite páginas e bancos de dados do Notion", icon: "notion" },
                  { name: "Airtable", description: "Conecte-se a bases do Airtable para gerenciar dados estruturados", icon: "airtable" },
                ].map(
                  (mcp) => html`
                    <div class="manage-connectors-modal__api-card">
                      <div class="manage-connectors-modal__api-card-icon">
                        <img src="/${mcp.icon}.png" alt="${mcp.name}" />
                      </div>
                      <div class="manage-connectors-modal__api-card-content">
                        <h4 class="manage-connectors-modal__api-card-title">${mcp.name}</h4>
                        <p class="manage-connectors-modal__api-card-description">${mcp.description}</p>
                      </div>
                    </div>
                  `,
                )}
              </div>
            `}
      </div>
    </div>
  `;
}
