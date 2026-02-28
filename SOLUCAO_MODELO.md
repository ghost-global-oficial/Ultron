# 🎯 Solução: Problema de Limite de Tokens

## Problema Identificado

O system prompt do OpenClaw é muito grande (~12000+ tokens), excedendo os limites dos modelos gratuitos do Groq.

## Soluções Disponíveis

### Opção 1: OpenRouter com Gemini 2.0 Flash (RECOMENDADO) ⭐

**Modelo**: `openrouter/google/gemini-2.0-flash-exp:free`

**Vantagens**:
- ✅ Completamente GRÁTIS
- ✅ Limite de contexto: 1 MILHÃO de tokens
- ✅ Muito rápido
- ✅ Excelente qualidade

**Como configurar**:
1. Obter API key grátis: https://openrouter.ai/keys
2. Executar configuração novamente e escolher OpenRouter
3. Colar a API key
4. Escolher modelo: `google/gemini-2.0-flash-exp:free`

### Opção 2: OpenRouter com Llama 3.3 70B

**Modelo**: `openrouter/meta-llama/llama-3.3-70b-instruct:free`

**Vantagens**:
- ✅ Completamente GRÁTIS
- ✅ Limite de contexto: 128k tokens
- ✅ Excelente para conversação
- ✅ Open source

**Como configurar**: Igual à Opção 1, mas escolher Llama 3.3

### Opção 3: Groq com Llama 3.1 8B

**Modelo**: `groq/llama-3.1-8b-instant`

**Vantagens**:
- ✅ Grátis
- ✅ MUITO rápido
- ✅ Já tem a API key configurada

**Desvantagens**:
- ⚠️ Pode ainda ter problema com system prompt grande
- ⚠️ Modelo menor (menos capaz)

**Como configurar**: Apenas trocar o modelo na config

### Opção 4: Claude 3.5 Sonnet (MELHOR QUALIDADE)

**Modelo**: `anthropic/claude-3.5-sonnet`

**Vantagens**:
- ✅ Melhor modelo disponível
- ✅ Limite de contexto: 200k tokens
- ✅ Excelente para tudo

**Desvantagens**:
- ❌ Pago (mas tem créditos grátis iniciais)

**Como configurar**:
1. Obter API key: https://console.anthropic.com/settings/keys
2. Executar configuração novamente e escolher Claude
3. Colar a API key

## Recomendação

**Use OpenRouter com Gemini 2.0 Flash** - é grátis, rápido e tem limite gigante!

## Como Aplicar

### Método 1: Reconfigurar (Recomendado)

1. Feche o aplicativo
2. Delete a configuração:
   ```bash
   del %USERPROFILE%\.openclaw\openclaw.json
   ```
3. Execute `npm start`
4. Escolha **OpenRouter**
5. Obtenha API key em: https://openrouter.ai/keys
6. Cole a API key
7. Escolha modelo: **google/gemini-2.0-flash-exp:free**

### Método 2: Editar Manualmente

1. Abra: `%USERPROFILE%\.openclaw\openclaw.json`
2. Altere:
   ```json
   {
     "agents": {
       "defaults": {
         "model": {
           "primary": "openrout