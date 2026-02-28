# Página de Configurações do ULTRON Removida

## Mudanças Realizadas

A página de configurações do ULTRON foi completamente removida da aplicação. Agora, quando o usuário clica no botão de configurações, apenas a opção "Configurações do Clawbot" é exibida.

### Arquivos Modificados

1. **ui/src/ui/views/settings-menu.ts**
   - Removida a prop `onUltronSettings`
   - Removido o botão "Configurações do ULTRON" do menu
   - Mantido apenas o botão "Configurações do Clawbot"

2. **ui/src/ui/app-render.ts**
   - Removidas as importações:
     - `renderUltronSettings`
     - `renderUltronSettingsPage`
   - Removida a prop `onUltronSettings` do `renderSettingsMenu`
   - Removida a renderização condicional da página `ultron-settings`

3. **ui/src/ui/app.ts**
   - Removida a função `handleUltronSettings()`
   - Mantida apenas `handleCloseUltronSettings()` para compatibilidade

4. **ui/src/ui/navigation.ts**
   - Removida a tab `"ultron-settings"` do tipo `Tab`
   - Removida `"ultron-settings"` do array `TAB_GROUPS`
   - Removido o path `"/ultron-settings"` de `TAB_PATHS`
   - Removidos os cases `"ultron-settings"` das funções:
     - `iconForTab()`
     - `titleForTab()`
     - `subtitleForTab()`

5. **ui/src/ui/app-render.helpers.ts**
   - Atualizado o botão "Gerir Integrações" no seletor de modelo
   - Agora abre o modal de conectores em vez da página de configurações
   - Mudança: `state.setTab('ultron-settings')` → `state.handleManageConnectors()`

### Comportamento Atual

#### Menu de Configurações
Quando o usuário clica no botão de configurações (ícone de engrenagem) na barra lateral:
- Abre um menu dropdown
- Exibe apenas a opção "Configurações do Clawbot"
- Ao clicar, abre a barra lateral de configurações do Clawbot

#### Botão "Gerir Integrações"
No seletor de modelo (dropdown que aparece ao clicar no nome do modelo):
- O botão de expandir (ícone de download) agora abre o modal de conectores
- Permite gerenciar integrações diretamente sem navegar para outra página

### Arquivos Não Utilizados (Podem ser Removidos)

Os seguintes arquivos não são mais utilizados e podem ser deletados:

1. `ui/src/ui/views/ultron-settings.ts`
2. `ui/src/ui/views/ultron-settings-page.ts`
3. `ui/src/styles/ultron-settings.css`
4. `ui/src/styles/ultron-settings-page.css`

**Nota:** A página `ultron-settings-advanced.ts` ainda é utilizada em algum lugar do código, então não deve ser removida ainda.

### Fluxo de Navegação Simplificado

Antes:
```
Botão Configurações → Menu → Configurações do ULTRON → Página completa
                            → Configurações do Clawbot → Barra lateral
```

Depois:
```
Botão Configurações → Menu → Configurações do Clawbot → Barra lateral
```

### Acesso às Integrações

Antes:
```
Seletor de Modelo → Botão Expandir → Página de Configurações do ULTRON → Aba Integrações
```

Depois:
```
Seletor de Modelo → Botão Expandir → Modal de Conectores (direto)
```

## Benefícios

1. **Interface mais limpa**: Menos opções no menu de configurações
2. **Acesso mais rápido**: Modal de conectores abre diretamente
3. **Menos navegação**: Usuário não precisa navegar para outra página
4. **Código mais simples**: Menos componentes e rotas para manter

## Como Testar

1. Limpe o cache do Electron
2. Recompile a aplicação
3. Abra a aplicação
4. Clique no botão de configurações (engrenagem) na barra lateral
5. Verifique que apenas "Configurações do Clawbot" aparece
6. Clique no nome do modelo no chat
7. Clique no botão de expandir (ícone de download)
8. Verifique que o modal de conectores abre diretamente

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

## Próximos Passos (Opcional)

Se desejar limpar completamente o código:

1. Remover os arquivos CSS não utilizados:
   ```bash
   rm ui/src/styles/ultron-settings.css
   rm ui/src/styles/ultron-settings-page.css
   ```

2. Remover os componentes não utilizados:
   ```bash
   rm ui/src/ui/views/ultron-settings.ts
   rm ui/src/ui/views/ultron-settings-page.ts
   ```

3. Verificar se `ultron-settings-advanced.ts` ainda é usado:
   ```bash
   grep -r "ultron-settings-advanced" ui/src/
   ```

4. Se não for usado, remover também:
   ```bash
   rm ui/src/ui/views/ultron-settings-advanced.ts
   rm ui/src/styles/ultron-settings-advanced.css
   ```
