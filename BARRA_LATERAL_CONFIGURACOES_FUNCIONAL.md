# Barra Lateral de Configurações Funcional

## Resumo

A barra lateral do modal "Gerir conectores" foi tornada completamente funcional com navegação entre 8 seções diferentes, cada uma com seu próprio conteúdo e funcionalidades.

## Seções Implementadas

### 1. ✅ Conta
- Informações da conta (nome, email)
- Botão para alterar senha
- Toggle de sincronização na nuvem

### 2. ✅ Tarefas Agendadas
- Estado vazio com mensagem
- Botão para criar nova tarefa agendada
- Ícone de calendário

### 3. ✅ Controlo de Dados
- Barra de progresso de armazenamento (2.4 GB / 10 GB)
- Toggle de análise de uso
- Zona de perigo com botões:
  - Exportar dados
  - Eliminar todos os dados (vermelho)

### 4. ✅ Personalização
- Seletor de tema (Sistema/Claro/Escuro)
- Seletor de idioma (Português/English/Español)
- Toggle de modo foco
- Toggle de notificações

### 5. ✅ Habilidades
- Grid de cards de habilidades
- 3 habilidades de exemplo:
  - Pesquisa Web (ativa)
  - Execução de Código (ativa)
  - Análise de Imagens (inativa)
- Cada card tem toggle para ativar/desativar

### 6. ✅ Conectores
- Lista de conectores instalados
- Cada conector mostra:
  - Ícone
  - Nome
  - Descrição
  - Seta para detalhes
- Botão "Adicionar conectores"

### 7. ✅ Integrações
- Grid de cards de integrações
- 3 integrações de exemplo:
  - Slack
  - Notion
  - Zapier
- Cada card tem botão "Conectar"

### 8. ✅ Obter Ajuda
- Links para recursos:
  - Documentação
  - Comunidade
  - FAQ
- Informações sobre:
  - Versão (1.0.0)
  - Build (2024.02.26)

## Arquivos Criados

### 1. `ui/src/ui/views/manage-connectors-sections.ts`
Arquivo separado com todas as funções de renderização das seções:
- `renderSectionContent()` - Router principal
- `renderAccountSection()` - Seção de conta
- `renderScheduledTasksSection()` - Tarefas agendadas
- `renderDataControlSection()` - Controlo de dados
- `renderPersonalizationSection()` - Personalização
- `renderSkillsSection()` - Habilidades
- `renderConnectorsSection()` - Conectores
- `renderIntegrationsSection()` - Integrações
- `renderHelpSection()` - Ajuda

## Arquivos Modificados

### 1. `ui/src/ui/views/manage-connectors-settings.ts`
- Adicionado prop `activeSection`
- Adicionado prop `onSectionChange`
- Importado `renderSectionContent` do arquivo de seções
- Atualizada navegação da sidebar para ser clicável
- Cada item da nav agora tem classe `--active` quando selecionado

### 2. `ui/src/ui/app.ts`
- Adicionado estado `manageConnectorsSettingsSection`
- Valor padrão: `"connectors"`
- Adicionado handler `handleManageConnectorsSettingsSection()`
- Adicionadas descrições aos conectores

### 3. `ui/src/ui/app-render.ts`
- Passado `activeSection` para o componente
- Passado `onSectionChange` handler

### 4. `ui/src/styles/manage-connectors-settings.css`
Adicionados estilos para todos os novos componentes:
- `.settings-section` - Container de seção
- `.settings-field` - Campos de formulário
- `.settings-toggle` - Toggle switches
- `.toggle-switch` - Switch animado
- `.storage-bar` - Barra de progresso
- `.empty-state` - Estado vazio
- `.skills-grid` - Grid de habilidades
- `.skill-card` - Card de habilidade
- `.integrations-grid` - Grid de integrações
- `.integration-card` - Card de integração
- `.help-section` - Seção de ajuda
- `.help-link` - Link de ajuda
- `.about-info` - Informações sobre
- `.btn` - Botões genéricos

## Funcionalidades

### Navegação
- Clique em qualquer item da sidebar muda a seção
- Item ativo tem classe `--active` (fundo diferente)
- Transição suave entre seções
- Header e botão de fechar sempre visíveis

### Componentes Interativos

#### Toggle Switches
- Animação suave ao alternar
- Estado visual claro (azul quando ativo)
- Funciona em todos os tamanhos (normal e pequeno)

#### Campos de Formulário
- Inputs de texto com foco visual
- Selects estilizados
- Botões com hover effects

#### Cards
- Hover effect (elevação)
- Layout responsivo em grid
- Ícones coloridos

#### Barra de Progresso
- Gradiente azul/roxo
- Animação de preenchimento
- Porcentagem exibida

### Estados

#### Estado Vazio (Tarefas Agendadas)
- Ícone grande centralizado
- Título e descrição
- Botão de ação primário

#### Estado com Conteúdo
- Layout organizado em seções
- Espaçamento consistente
- Hierarquia visual clara

## Design

### Cores
- Background: `#1a1a1a`
- Cards: `#252525`
- Borders: `#333333`
- Text: `#ffffff` / `#9ca3af`
- Primary: `#4a9eff`
- Danger: `#ff4444`

### Espaçamento
- Padding seção: `24px 32px`
- Gap entre elementos: `16px`
- Margin entre seções: `32px`

### Tipografia
- Títulos: `16-20px`, weight `600`
- Labels: `13-14px`, weight `500`
- Descrições: `13px`, color `#9ca3af`

### Animações
- Transitions: `0.15s ease`
- Hover: `translateY(-2px)`
- Toggle: `0.3s`

## Tema Claro

Todos os componentes têm suporte completo para tema claro:
- Backgrounds brancos
- Borders cinza claro
- Texto escuro
- Mesma estrutura e funcionalidade

## Como Testar

### 1. Compilar UI
```bash
cd ui
pnpm build
```

### 2. Reiniciar Gateway
```bash
pnpm openclaw gateway run
```

### 3. Abrir ULTRON Desktop
1. Clique no ícone de conectores no chat
2. Clique em "Gerir conectores"
3. Modal abre com sidebar à esquerda

### 4. Testar Navegação
- Clique em cada item da sidebar
- Verifique se o conteúdo muda
- Verifique se o item fica destacado
- Teste todos os 8 itens

### 5. Testar Componentes
- **Conta**: Digite nos campos, clique em "Alterar senha"
- **Tarefas**: Clique em "Criar tarefa agendada"
- **Dados**: Veja a barra de progresso, toggle de privacidade
- **Personalização**: Mude tema e idioma, teste toggles
- **Habilidades**: Ative/desative habilidades
- **Conectores**: Clique em um conector
- **Integrações**: Clique em "Conectar"
- **Ajuda**: Clique nos links (abrirão em nova aba)

## Funcionalidades Pendentes (TODO)

### 🔲 Conta
- Salvar informações da conta
- Implementar mudança de senha
- Conectar com API de sincronização

### 🔲 Tarefas Agendadas
- Modal de criação de tarefa
- Lista de tarefas existentes
- Editar/deletar tarefas

### 🔲 Controlo de Dados
- Calcular armazenamento real
- Implementar exportação de dados
- Confirmação para eliminar dados

### 🔲 Personalização
- Salvar preferências
- Aplicar tema selecionado
- Aplicar idioma selecionado

### 🔲 Habilidades
- Carregar habilidades reais
- Salvar estado ativo/inativo
- Configurações por habilidade

### 🔲 Conectores
- Já funcional (abre detalhes)
- Adicionar mais conectores

### 🔲 Integrações
- Fluxo de autenticação OAuth
- Gerenciar integrações conectadas
- Desconectar integrações

### 🔲 Ajuda
- Links funcionais para docs
- Sistema de FAQ
- Chat de suporte

## Estrutura de Código

```
ui/src/ui/views/
├── manage-connectors-settings.ts    # Componente principal + navegação
└── manage-connectors-sections.ts    # Renderização de cada seção

ui/src/styles/
└── manage-connectors-settings.css   # Estilos completos

ui/src/ui/
├── app.ts                           # Estado + handlers
└── app-render.ts                    # Integração
```

## Notas Técnicas

- Cada seção é uma função separada para melhor organização
- Router central (`renderSectionContent`) decide qual seção renderizar
- Props são passadas para todas as seções
- Estilos são modulares e reutilizáveis
- Suporte completo para tema claro/escuro
- Componentes são responsivos
- Animações suaves em todas as interações

## Próximos Passos

1. Implementar salvamento de configurações
2. Conectar com APIs reais
3. Adicionar validação de formulários
4. Implementar modais de confirmação
5. Adicionar feedback visual (toasts)
6. Implementar busca em conectores/integrações
7. Adicionar paginação se necessário
8. Implementar filtros e ordenação
9. Adicionar atalhos de teclado
10. Melhorar acessibilidade (ARIA labels)
