# Plano de Testes Detalhado: Projeto Ultron

Este documento descreve a estratégia de testes para garantir que o **Ultron** mantém a integridade do motor **Moltbot (OpenClaw)** e que as novas funcionalidades de interface e IA funcionam conforme esperado.

---

## 1. Testes de Regressão (Core Moltbot)
*Objetivo: Garantir que as funcionalidades originais não foram quebradas.*

| ID | Caso de Teste | Procedimento | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **REG-01** | Execução do Motor | Correr `node openclaw.mjs --help` | Lista de comandos original deve aparecer sem erros. |
| **REG-02** | Gestão de Skills | Verificar pasta `skills/` e carregar uma skill básica. | As skills devem ser reconhecidas e carregadas pelo gateway. |
| **REG-03** | Conectividade de Canais | Iniciar o gateway e tentar emparelhar um canal (ex: WhatsApp). | O sistema deve gerar o QR Code e manter a ligação estável. |
| **REG-04** | Persistência de Dados | Configurar um agente e reiniciar a aplicação. | As configurações em `~/.openclaw` devem ser mantidas. |

---

## 2. Testes de Interface e Terminal (Electron)
*Objetivo: Validar a experiência do utilizador na aplicação Windows.*

| ID | Caso de Teste | Procedimento | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **UI-01** | Inicialização da App | Abrir o executável do Ultron. | A janela deve abrir com o tema escuro e o terminal ativo. |
| **UI-02** | Terminal Interno | Digitar comandos no terminal integrado. | O terminal deve responder com a mesma latência de uma consola nativa. |
| **UI-03** | Auto-Onboarding | Abrir a app pela primeira vez. | O assistente de configuração deve iniciar automaticamente no terminal. |
| **UI-04** | Redimensionamento | Alterar o tamanho da janela. | O terminal (xterm.js) deve ajustar o número de colunas/linhas dinamicamente. |

---

## 3. Testes de Novas Integrações (OpenRouter & Groq)
*Objetivo: Validar os novos provedores e a seleção de modelos.*

| ID | Caso de Teste | Procedimento | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **IA-01** | Auth OpenRouter | Inserir uma chave válida do OpenRouter no onboarding. | A chave deve ser validada e guardada no perfil `openrouter:default`. |
| **IA-02** | Auth Groq | Inserir uma chave válida do Groq no onboarding. | A chave deve ser validada e guardada no perfil `groq:default`. |
| **IA-03** | Seleção de Modelo | Escolher um modelo específico (ex: `groq/llama-3.3-70b`) no prompt. | O ficheiro de configuração deve refletir o modelo escolhido como `primary`. |
| **IA-04** | Resposta de IA | Enviar uma mensagem via canal conectado usando Groq. | A resposta deve ser ultra-rápida, confirmando o uso do motor Groq. |

---

## 4. Testes de Stress e Erros
*Objetivo: Garantir a resiliência do sistema.*

- **ERRO-01**: Inserir uma API Key inválida e verificar se o Ultron permite a correção sem crashar.
- **ERRO-02**: Tentar iniciar o gateway sem internet e validar a mensagem de erro no terminal.
- **STRESS-01**: Manter o Ultron aberto por 24h em segundo plano e monitorizar o consumo de memória do processo Electron.

---

## 5. Critérios de Aceitação
O Ultron será considerado estável quando:
1. 100% dos testes de Regressão passarem.
2. As chaves de Groq e OpenRouter forem aceites e funcionais.
3. O instalador `.exe` for gerado sem erros de dependências.
