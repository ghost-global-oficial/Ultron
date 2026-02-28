# Guia de Início Rápido - Ultron

## 🚀 Primeira Vez / Reconfiguração

### 1. Limpar Configurações Antigas

```bash
node clean-all-configs.cjs
```

Isso remove:
- `~/.openclaw/openclaw.json`
- `~/.moltbot/moltbot.json`
- `~/.openclaw/` (diretório completo)

### 2. Iniciar o App

```bash
npm start
```

### 3. Seguir o Wizard de Configuração

1. **Bem-vindo** → Clicar em "Iniciar Configuração"
2. **Rede** → Escolher "Loopback (127.0.0.1)" (mais seguro)
3. **Provedor** → Escolher "OpenRouter" (recomendado)
4. **API Key** → Colar sua chave do OpenRouter
5. **Modelo** → Escolher um modelo (ex: `openai/gpt-oss-120b:free`)
6. **Teste** → Aguardar teste de API (ou pular)
7. **Finalizar** → Aguardar gateway iniciar
8. **Token** → Copiar token (opcional, já está salvo)
9. **Abrir Chat** → Clicar no botão verde

### 4. Testar o Chat

1. Digite uma mensagem
2. Pressione Enter
3. Aguarde resposta da IA

---

## 🔧 Verificação de Problemas

### Verificar Configuração Atual

```bash
node check-current-config.cjs
```

### Verificar Sessões

```bash
node check-session.cjs
```

### Testar API do OpenRouter

```bash
node test-openrouter-api.cjs
```

---

## ⚠️ Problemas Comuns

### Mensagens Ficam "Queued"

**Causa**: SessionKey incorreto ou gateway não está rodando

**Solução**:
1. Verificar se gateway está rodando (ver logs no terminal)
2. Reiniciar o app
3. Se persistir, limpar configurações e reconfigurar

### Gateway Não Inicia

**Causa**: Porta 18789 já está em uso

**Solução**:
1. Fechar todos os processos do Ultron
2. Verificar se há outro gateway rodando: `netstat -ano | findstr 18789`
3. Matar processo se necessário
4. Reiniciar o app

### IA Não Responde

**Causa**: Modelo desconhecido ou API key inválida

**Solução**:
1. Verificar configuração: `node check-current-config.cjs`
2. Testar API: `node test-openrouter-api.cjs`
3. Se falhar, reconfigurar com chave válida

### Erro "Unknown model"

**Causa**: Configuração antiga do Moltbot sendo carregada

**Solução**:
1. Executar: `node clean-all-configs.cjs`
2. Reiniciar o app
3. Configurar do zero

---

## 📝 Modelos Recomendados (OpenRouter)

### Gratuitos
- `openai/gpt-oss-120b:free` - Bom equilíbrio
- `google/gemini-2.0-flash-exp:free` - Rápido
- `meta-llama/llama-3.3-70b-instruct:free` - Potente
- `qwen/qwq-32b-preview:free` - Raciocínio

### Pagos (melhores)
- `anthropic/claude-opus-4.6` - Melhor qualidade
- `openai/gpt-4o` - Muito bom
- `google/gemini-2.5-pro` - Excelente

---

## 🛠️ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `clean-all-configs.cjs` | Limpar todas as configurações |
| `check-current-config.cjs` | Verificar configuração atual |
| `check-session.cjs` | Verificar sessões ativas |
| `test-openrouter-api.cjs` | Testar API do OpenRouter |
| `create-test-config.cjs` | Criar configuração de teste |

---

## 📚 Documentação Completa

- `RESUMO_TODAS_CORRECOES.md` - Todas as correções aplicadas
- `PROBLEMA_MODELO_DESCONHECIDO.md` - Problema de configuração antiga
- `CORRECAO_SESSIONKEY_FINAL.md` - Correção do sessionKey
- `CORRECAO_TESTE_API_OPENROUTER.md` - Correção do teste de API

---

## ✅ Checklist de Funcionamento

- [ ] Gateway inicia sem erros
- [ ] Chat UI carrega corretamente
- [ ] Mensagem é enviada (sai de "Queued")
- [ ] IA responde à mensagem
- [ ] Token está salvo corretamente
- [ ] Configuração persiste após reiniciar

Se todos os itens estiverem marcados, o Ultron está funcionando perfeitamente! 🎉
