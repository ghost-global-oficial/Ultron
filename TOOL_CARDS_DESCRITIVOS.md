# Tool Cards Mais Descritivos

## Problema
Os cards das ferramentas não eram explícitos sobre o que a IA estava fazendo. Por exemplo:
- "web search" → não mostrava o que estava sendo pesquisado
- "exe" → não mostrava qual app estava sendo aberto
- "web fetch" → não mostrava qual URL estava sendo acessada

## Solução
Adicionadas configurações no `tool-display.json` e lógica inteligente no `tool-display.ts` para extrair e mostrar os parâmetros relevantes de cada ferramenta.

## Mudanças Implementadas

### 1. Web Search
**Antes**: "web search"
**Depois**: "Searching: vida dos répteis" (mostra a query)

```json
"web_search": {
  "icon": "search",
  "title": "Web Search",
  "label": "Searching",
  "detailKeys": ["query"]
}
```

### 2. Web Fetch
**Antes**: "web fetch"
**Depois**: "Fetching: https://example.com" (mostra a URL)

```json
"web_fetch": {
  "icon": "globe",
  "title": "Web Fetch",
  "label": "Fetching",
  "detailKeys": ["url"]
}
```

### 3. Execute (exe) - MELHORADO
**Antes**: "exe"
**Depois**: "Opening Microsoft Word" ou "Opening Blender" (extrai o nome do app)

A lógica agora detecta múltiplos padrões de comando:

#### Padrão 1: `start appname` ou `open appname`
```bash
start blender → "Opening Blender"
open word → "Opening Word"
```

#### Padrão 2: Executável direto
```bash
blender.exe → "Opening Blender"
code.exe → "Opening Code"
```

#### Padrão 3: Caminho completo
```bash
C:\Program Files\Blender\blender.exe → "Opening Blender"
"C:\Program Files\Microsoft Office\WINWORD.EXE" → "Opening Winword"
```

#### Padrão 4: Comando simples
```bash
notepad → "Opening Notepad"
calc → "Opening Calc"
```

### Lógica Inteligente de Extração

```typescript
// 1. Procura por "start" ou "open" seguido do nome do app
const startMatch = command.match(/(?:start|open)\s+([^\s&|;]+)/i);

// 2. Procura por arquivos .exe
const exeMatch = command.match(/([^\s\\\/]+)\.exe/i);

// 3. Procura por caminhos com .exe
const pathMatch = command.match(/[\\\/]([^\\\/]+)\.exe/i);

// 4. Usa a primeira palavra do comando
const firstWord = command.split(/\s+/)[0];

// 5. Limpa e capitaliza o nome
appName = appName.replace(/['"]/g, '').trim();
const cleanName = appName.charAt(0).toUpperCase() + appName.slice(1);

// 6. Gera mensagem amigável
label = `Opening ${cleanName}`;
detail = command; // Mostra comando completo como detalhe
```

## Como Funciona

O sistema de `detailKeys` extrai automaticamente os valores dos parâmetros da ferramenta:

1. **detailKeys**: Lista de chaves para procurar nos argumentos da ferramenta
2. **Extração**: O sistema procura por cada chave na ordem especificada
3. **Formatação**: O primeiro valor encontrado é exibido no card
4. **Truncamento**: Textos longos são automaticamente truncados (máximo 160 caracteres)
5. **Lógica Especial**: Para "exe", usa regex patterns para extrair nomes de apps

## Exemplos de Uso

### Web Search
```typescript
// Ferramenta chamada com:
{
  name: "web_search",
  args: {
    query: "vida dos répteis"
  }
}

// Card exibido:
"Searching: vida dos répteis"
```

### Web Fetch
```typescript
// Ferramenta chamada com:
{
  name: "web_fetch",
  args: {
    url: "https://wikipedia.org/wiki/Reptiles"
  }
}

// Card exibido:
"Fetching: https://wikipedia.org/wiki/Reptiles"
```

### Execute - Exemplos Reais

#### Exemplo 1: Start Command
```typescript
{
  name: "exe",
  args: {
    command: "start blender"
  }
}
// Card: "Opening Blender"
// Detail: "start blender"
```

#### Exemplo 2: Executável Direto
```typescript
{
  name: "exe",
  args: {
    command: "notepad.exe"
  }
}
// Card: "Opening Notepad"
// Detail: "notepad.exe"
```

#### Exemplo 3: Caminho Completo
```typescript
{
  name: "exe",
  args: {
    command: "C:\\Program Files\\Microsoft Office\\WINWORD.EXE"
  }
}
// Card: "Opening Winword"
// Detail: "C:\Program Files\Microsoft Office\WINWORD.EXE"
```

#### Exemplo 4: Comando com Aspas
```typescript
{
  name: "exe",
  args: {
    command: "start \"\" \"C:\\Program Files\\Blender\\blender.exe\""
  }
}
// Card: "Opening Blender"
// Detail: start "" "C:\Program Files\Blender\blender.exe"
```

## Outras Ferramentas Já Configuradas

O sistema já tinha configurações para várias outras ferramentas:

- **read**: Mostra o caminho do arquivo sendo lido
- **write**: Mostra o caminho do arquivo sendo escrito
- **edit**: Mostra o caminho do arquivo sendo editado
- **bash**: Mostra o comando bash sendo executado
- **browser**: Mostra a URL ou ação do navegador
- **canvas**: Mostra a ação no canvas
- **nodes**: Mostra a ação nos dispositivos móveis
- **discord/slack**: Mostra detalhes das ações nas plataformas

## Arquivos Modificados

1. **ui/src/ui/tool-display.json**
   - Adicionado `web_search` com `detailKeys: ["query"]`
   - Adicionado `web_fetch` com `detailKeys: ["url"]`
   - Adicionado `exe` com `detailKeys: ["command"]`

2. **ui/src/ui/tool-display.ts**
   - Melhorada lógica de extração de nome de app para "exe"
   - Adicionados 4 padrões de detecção de comandos
   - Limpeza e capitalização automática de nomes
   - Exibição do comando completo como detalhe

3. **dist/control-ui/*** (recompilado)
   - UI recompilada com as novas configurações

## Como Testar

1. **Abrir o aplicativo**
   ```bash
   npm start
   ```

2. **Fazer uma pergunta que requer pesquisa**
   - "Pesquise sobre a vida dos répteis"
   - Verificar se o card mostra: "Searching: vida dos répteis"

3. **Pedir para abrir um app**
   - "Abra o Blender"
   - Verificar se o card mostra: "Opening Blender"
   
   - "Abra o Microsoft Word"
   - Verificar se o card mostra: "Opening Word" ou "Opening Winword"
   
   - "Abra o Notepad"
   - Verificar se o card mostra: "Opening Notepad"

4. **Pedir para buscar uma URL**
   - "Busque informações em https://example.com"
   - Verificar se o card mostra: "Fetching: https://example.com"

## Benefícios

✅ **Transparência**: Usuário vê exatamente o que a IA está fazendo
✅ **Contexto**: Cards mostram informações relevantes sobre cada ação
✅ **Inteligência**: Extração automática de nomes de apps de vários formatos
✅ **Debugging**: Mais fácil identificar problemas quando algo dá errado
✅ **UX**: Interface mais informativa e profissional
✅ **Amigável**: Mensagens em linguagem natural ("Opening Blender" ao invés de "exe")

## Extensibilidade

Para adicionar mais ferramentas no futuro, basta editar `ui/src/ui/tool-display.json`:

```json
"nome_da_ferramenta": {
  "icon": "icone",
  "title": "Título",
  "label": "Label",
  "detailKeys": ["parametro1", "parametro2"]
}
```

Para lógica especial (como a do "exe"), edite `ui/src/ui/tool-display.ts` na função `resolveToolDisplay`.

O sistema automaticamente:
1. Procura pelos parâmetros especificados
2. Extrai o primeiro valor encontrado
3. Aplica lógica especial se configurada
4. Formata e exibe no card
5. Trunca se necessário
