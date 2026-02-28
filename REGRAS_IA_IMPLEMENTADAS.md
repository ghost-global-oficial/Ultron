# Regras para IA - Implementado

## Visão Geral

Nova categoria no Vault que permite ao usuário criar regras personalizadas (system prompts) para a IA. As regras ativas são automaticamente incluídas no system prompt do agente.

## Funcionalidade

### Características

- **Título da Regra**: Nome descritivo (ex: "Responder em Português", "Ser Formal", "Especialista em Python")
- **Conteúdo**: Instruções detalhadas para a IA
- **Ativar/Desativar**: Toggle para ativar ou desativar cada regra
- **Múltiplas Regras**: Suporta várias regras simultâneas
- **Combinação Automática**: Regras ativas são combinadas no system prompt

### Interface

**Layout**: Grid 3x2 (5 categorias)
- Senhas
- Cartões de Crédito
- Chaves de API
- Notas Seguras
- **Regras para IA** (NOVO)

**Indicador Visual**:
- ● Verde = Regra ativa
- ○ Cinza = Regra inativa

**Botões**:
- "Mostrar/Ocultar" - Ativa/desativa a regra
- "Deletar" - Remove a regra

## Formulário de Adição

```
Nome da Regra: [input]
Instruções para a IA: [textarea - 6 linhas]
☑ Ativar esta regra [checkbox - marcado por padrão]
```

## Exemplos de Uso

### Exemplo 1: Idioma e Tom
```
Nome: Responder em Português Formal
Instruções:
Você deve sempre responder em português brasileiro.
Use linguagem formal e profissional.
Evite gírias e expressões coloquiais.
```

### Exemplo 2: Especialização
```
Nome: Especialista em Python
Instruções:
Você é um especialista em programação Python.
Sempre forneça exemplos de código quando relevante.
Explique conceitos complexos de forma clara.
Use boas práticas e padrões PEP 8.
```

### Exemplo 3: Formato de Resposta
```
Nome: Respostas Concisas
Instruções:
Mantenha suas respostas breves e diretas.
Use bullet points quando apropriado.
Evite explicações longas a menos que solicitado.
```

### Exemplo 4: Personalidade
```
Nome: Assistente Amigável
Instruções:
Seja amigável e acessível em suas respostas.
Use emojis ocasionalmente para tornar a conversa mais leve.
Mostre empatia e compreensão.
```

## Armazenamento

### Arquivo Vault
```json
{
  "encrypted": "base64_encrypted_data",
  "version": "1.0.0",
  "createdAt": "2026-02-10T..."
}
```

### Dados Descriptografados
```javascript
{
  passwords: [...],
  creditCards: [...],
  apiKeys: [...],
  notes: [...],
  aiRules: [
    {
      title: "Responder em Português",
      content: "Você deve sempre responder em português brasileiro...",
      active: true
    },
    {
      title: "Ser Formal",
      content: "Use linguagem formal e profissional...",
      active: false
    }
  ]
}
```

### Configuração do OpenClaw
```json
{
  "gateway": {...},
  "agents": {
    "defaults": {
      "model": {
        "primary": "openrouter/..."
      },
      "systemPrompt": "Você deve sempre responder em português brasileiro...\n\nUse linguagem formal e profissional..."
    }
  },
  "env": {...}
}
```

## Lógica de Combinação

```javascript
// Filtrar apenas regras ativas
const activeRules = configState.vault.aiRules.filter(r => r.active);

// Combinar conteúdos com quebra de linha dupla
const systemPrompt = activeRules.map(r => r.content).join('\n\n');

// Adicionar ao config
config.agents.defaults.systemPrompt = systemPrompt;
```

## Traduções

### Português (pt-BR)
```javascript
'vault.aiRules': 'Regras para IA'
'vault.aiRulesDesc': 'Prompts do sistema, instruções personalizadas'
'vault.addAiRule': '+ Adicionar Regra'
'vault.ruleTitle': 'Nome da Regra'
'vault.ruleContent': 'Instruções para a IA'
'vault.ruleActive': 'Ativar esta regra'
```

### Inglês (en-US)
```javascript
'vault.aiRules': 'AI Rules'
'vault.aiRulesDesc': 'System prompts, custom instructions'
'vault.addAiRule': '+ Add Rule'
'vault.ruleTitle': 'Rule Name'
'vault.ruleContent': 'Instructions for AI'
'vault.ruleActive': 'Activate this rule'
```

### Espanhol (es-ES)
```javascript
'vault.aiRules': 'Reglas para IA'
'vault.aiRulesDesc': 'Prompts del sistema, instrucciones personalizadas'
'vault.addAiRule': '+ Agregar Regla'
'vault.ruleTitle': 'Nombre de la Regla'
'vault.ruleContent': 'Instrucciones para la IA'
'vault.ruleActive': 'Activar esta regla'
```

## Funções Implementadas

### Principais
1. **renderVault()** - Atualizado para incluir seção de AI Rules
2. **openVaultModal('airule')** - Abre modal para adicionar regra
3. **saveVaultItem('airule')** - Salva nova regra
4. **deleteVaultItem('airule', index)** - Deleta regra
5. **toggleAiRule(index)** - Ativa/desativa regra
6. **saveConfig()** - Combina regras ativas no systemPrompt

## Fluxo de Uso

1. **Usuário acessa Vault** no wizard
2. **Clica em "+ Adicionar Regra"** na seção "Regras para IA"
3. **Preenche formulário**:
   - Nome da regra
   - Instruções detalhadas
   - Marca/desmarca checkbox "Ativar"
4. **Clica em "Salvar"**
5. **Regra aparece na lista** com indicador de status
6. **Pode ativar/desativar** clicando no botão
7. **Ao finalizar wizard**, regras ativas são combinadas no systemPrompt
8. **IA recebe instruções** automaticamente em todas as conversas

## Vantagens

1. **Personalização Total**: Usuário define como a IA deve se comportar
2. **Múltiplos Perfis**: Pode ter várias regras para diferentes contextos
3. **Ativar/Desativar Fácil**: Toggle rápido sem deletar regras
4. **Persistente**: Regras são salvas e aplicadas automaticamente
5. **Criptografado**: Regras ficam seguras no vault
6. **Combinável**: Múltiplas regras ativas são combinadas

## Casos de Uso

### Profissional
- Especialização técnica (Python, JavaScript, DevOps, etc.)
- Tom formal para comunicação corporativa
- Formato específico de respostas (relatórios, documentação)

### Pessoal
- Idioma e regionalização
- Personalidade e tom de conversa
- Preferências de formato (conciso vs detalhado)

### Educacional
- Nível de explicação (iniciante, intermediário, avançado)
- Estilo de ensino (socrático, direto, com exemplos)
- Foco em conceitos específicos

### Criativo
- Estilo de escrita (formal, casual, poético)
- Gênero literário
- Tom e voz narrativa

## Limitações

1. **Tamanho do Prompt**: Muitas regras longas podem exceder limite de tokens
2. **Conflitos**: Regras contraditórias podem confundir a IA
3. **Ordem**: Não há controle sobre a ordem de aplicação das regras
4. **Sem Prioridade**: Todas as regras ativas têm o mesmo peso

## Melhorias Futuras

1. **Priorização**: Definir ordem/prioridade das regras
2. **Categorias**: Agrupar regras por contexto
3. **Templates**: Regras pré-definidas para casos comuns
4. **Validação**: Verificar tamanho total do prompt
5. **Preview**: Visualizar prompt final antes de salvar
6. **Perfis**: Conjuntos de regras ativados/desativados juntos
7. **Importar/Exportar**: Compartilhar regras entre instalações
8. **Histórico**: Ver como regras afetaram conversas anteriores

## Status

✅ **IMPLEMENTADO E FUNCIONAL**

O sistema de Regras para IA está completo e integrado ao Vault. As regras ativas são automaticamente aplicadas ao system prompt do agente.
