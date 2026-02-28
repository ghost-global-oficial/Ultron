# Tool Cards - Erros Limpos e Formatados (v2)

## Problema Identificado

Os erros dos tool cards estavam aparecendo como texto bruto no chat, mostrando:
- JSON completo de erro com toda a estrutura
- Mensagens técnicas do PowerShell
- Informações de debug não relevantes para o usuário
- Códigos ANSI de terminal (em alguns casos)

Exemplo do problema:
```
Opening Blender⚙{ "status": "error", "tool": "exec", "error": "blender : The term 'blender' is not recognized as the name of a cmdlet, function, script file, or operable program. \r\nCheck the spelling of the name, or if a path was included, verify that the path is correct and try again.\r\nAt line:1 char:1\r\n+ blender\r\n+ ~~~~~~~\r\n + CategoryInfo : ObjectNotFound: (blender:String) [], CommandNotFoundException\r\n + FullyQualifiedErrorId : CommandNotFoundException\n\nCommand exited with code 1" }
```

## Solução Implementada (v2 - Melhorada)

### 1. Limpeza de Códigos ANSI

Função `stripAnsiCodes()` que remove:
- Sequências de escape ANSI (`\x1B[...`)
- Códigos de controle de terminal
- Caracteres especiais de formatação

### 2. Extração Inteligente de Mensagens de Erro

Função `extractCleanError()` melhorada que:
1. **Detecta JSON de erro primeiro** - Extrai o campo `error` do JSON
2. **Procura padrões PowerShell** - "The term 'X' is not recognized"
3. **Extrai CategoryInfo** - Informações de categoria de erro
4. **Filtra linhas técnicas** - Remove linhas com `At line:`, `+ `, etc.
5. **Retorna mensagem limpa** - Apenas o essencial

Exemplos de transformação:
- JSON completo → `"Command 'blender' not found"`
- Erro PowerShell longo → Primeira linha significativa
- CategoryInfo → Mensagem amigável

### 3. Formatação Visual de Erros

Os tool cards detectam erros e aplicam estilo visual diferenciado:

#### Detecção de Erros
- Verifica se o texto contém `"status": "error"`
- Verifica se contém `"not recognized"`
- Verifica se contém `"CommandNotFoundException"`
- Verifica se contém `"not found"` ou `"Error"`

#### Estilo Visual
- **Borda vermelha** (`#dc2626`) em vez de cinza
- **Fundo vermelho escuro** (`#1a0f0f`) em vez de preto
- **Ícone de alerta** (⚠️) em vez de check (✓)
- **Texto vermelho** para destacar o erro
- **Hover vermelho** mais claro para feedback

### 4. Prevenção de JSON Bruto

Três camadas de proteção:

1. **`formatToolOutputForSidebar()`**:
   - Detecta JSON de erro antes de formatar
   - Extrai mensagem limpa em vez de mostrar JSON
   - Só formata JSON válido que não seja erro

2. **`getTruncatedPreview()`**:
   - Detecta JSON de erro no preview
   - Extrai mensagem limpa antes de truncar
   - Não mostra objetos JSON brutos

3. **`renderToolCardSidebar()`**:
   - Usa `getTruncatedPreview()` que já limpa
   - Aplica classes CSS de erro
   - Mostra ícone de alerta

## Arquivos Modificados

### 1. `ui/src/ui/chat/tool-helpers.ts` (v2)
- **Melhorada** `extractCleanError()`:
  - Detecta JSON primeiro
  - Extrai recursivamente de JSON aninhado
  - Filtra mais padrões PowerShell
  - Remove linhas técnicas (`At line:`, `+ `)
  
- **Melhorada** `formatToolOutputForSidebar()`:
  - Detecta JSON de erro antes de formatar
  - Não mostra JSON de erro como código
  - Extrai mensagem limpa de JSON
  
- **Melhorada** `getTruncatedPreview()`:
  - Detecta JSON de erro no preview
  - Tenta parsear JSON para extrair erro
  - Não mostra objetos JSON brutos

### 2. `ui/src/ui/chat/tool-cards.ts`
- Detecção de erros no `renderToolCardSidebar()`
- Classe CSS `chat-tool-card--error` para cards com erro
- Ícone `alertCircle` para erros
- Classes de erro para ações e status
- Usa `getTruncatedPreview()` que limpa automaticamente

### 3. `ui/src/ui/icons.ts`
- Adicionado ícone `alertCircle` para indicar erros

### 4. `ui/src/styles/chat/tool-cards.css`
- Estilos para `.chat-tool-card--error`
- Estilos para hover de erro
- Estilos para ícone de erro
- Estilos para título de erro
- Estilos para ação e status de erro

## Resultado

### Antes
```
Opening Blender⚙{ "status": "error", "tool": "exec", "error": "blender : The term 'blender' is not recognized as the name of a cmdlet, function, script file, or operable program. \r\nCheck the spelling of the name, or if a path was included, verify that the path is correct and try again.\r\nAt line:1 char:1\r\n+ blender\r\n+ ~~~~~~~\r\n + CategoryInfo : ObjectNotFound: (blender:String) [], CommandNotFoundException\r\n + FullyQualifiedErrorId : CommandNotFoundException\n\nCommand exited with code 1" }
```

### Depois
```
Opening Blender ⚠️
Error: Command 'blender' not found
```

Com estilo visual:
- Card com borda vermelha
- Fundo vermelho escuro
- Ícone de alerta vermelho
- Texto limpo e direto
- Sem JSON visível

## Como Testar

1. Reinicie o ULTRON
2. Limpe o cache do Electron (se necessário):
   ```powershell
   Remove-Item -Recurse -Force "$env:APPDATA\openclaw-control-ui\*"
   ```
3. Peça para abrir um aplicativo que não existe: "abra o blnender"
4. Observe que:
   - O erro aparece limpo: "Error: Command 'blender' not found"
   - O card tem borda vermelha
   - O ícone é um alerta (⚠️)
   - Não há JSON visível
   - A mensagem é clara e direta

## Melhorias da v2

1. **Detecção de JSON melhorada** - Parseia JSON antes de processar
2. **Extração recursiva** - Extrai erros de JSON aninhado
3. **Filtragem avançada** - Remove mais linhas técnicas
4. **Três camadas de proteção** - Garante que JSON nunca apareça
5. **Mensagens mais limpas** - Apenas o essencial

## Compilação

A aplicação foi recompilada com sucesso:
```
npm run build (no diretório ui)
```

Reinicie o ULTRON e limpe o cache para ver as mudanças.
