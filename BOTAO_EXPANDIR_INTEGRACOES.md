# Botão Expandir Abre Seção de Integrações

## Mudança Implementada

O botão de expandir no seletor de modelos agora abre o menu de configurações de conectores diretamente na seção "Integrações".

### Comportamento Anterior

Quando o usuário clicava no botão de expandir (ícone de download) no seletor de modelos:
- Abria o menu de configurações de conectores
- Mostrava a seção padrão "Conectores"

### Comportamento Atual

Quando o usuário clica no botão de expandir no seletor de modelos:
- Abre o menu de configurações de conectores
- Mostra diretamente a seção "Integrações"

## Arquivos Modificados

### 1. ui/src/ui/app.ts

Adicionada nova função `handleManageConnectorsIntegrations()`:

```typescript
handleManageConnectorsIntegrations() {
  this.connectorsMenuOpen = false;
  this.manageConnectorsSettingsOpen = true;
  this.manageConnectorsSettingsSection = "integrations";
}
```

Esta função:
- Fecha o menu de conectores se estiver aberto
- Abre o menu de configurações de conectores
- Define a seção ativa como "integrations"

### 2. ui/src/ui/app-render.helpers.ts

Atualizado o botão de expandir para usar a nova função:

```typescript
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
```

## Fluxo de Navegação

### Antes
```
Seletor de Modelo → Botão Expandir → Menu de Conectores (seção "Conectores")
```

### Depois
```
Seletor de Modelo → Botão Expandir → Menu de Conectores (seção "Integrações")
```

## Menu de Configurações de Conectores

O menu que abre tem uma barra lateral com as seguintes seções:

1. **Conta** - Configurações da conta do usuário
2. **Tarefas agendadas** - Gerenciamento de tarefas programadas
3. **Controlo de dados** - Configurações de privacidade e dados
4. **Personalização** - Temas, idiomas e preferências
5. **Habilidades** - Gerenciamento de skills
6. **Conectores** - Gerenciamento de conectores instalados
7. **Integrações** ⭐ - Adicionar novas integrações (API e MCP)
8. **Obter ajuda** - Suporte e documentação

## Benefícios

1. **Acesso direto**: Usuário vai direto para a seção de adicionar integrações
2. **Menos cliques**: Não precisa navegar manualmente para a seção
3. **Contexto claro**: O botão está no seletor de modelos, então faz sentido abrir integrações
4. **Experiência melhorada**: Fluxo mais intuitivo e rápido

## Como Testar

1. Limpe o cache do Electron
2. Recompile a aplicação
3. Abra a aplicação
4. Clique no nome do modelo no chat (abre o seletor de modelos)
5. Clique no botão de expandir (ícone de download no canto superior direito)
6. Verifique que o menu de configurações abre na seção "Integrações"

## Script de Teste

```bash
# Limpar cache
node limpar-cache-electron.ps1

# Recompilar
cd ui
npm run build
cd ..

# Iniciar aplicação
npm start
```

## Seção "Integrações"

A seção de integrações permite ao usuário:
- Ver integrações disponíveis (APIs e servidores MCP)
- Adicionar novas integrações personalizadas
- Configurar chaves de API
- Gerenciar servidores MCP

Esta é a seção mais relevante quando o usuário quer adicionar novos modelos ou provedores de IA.
