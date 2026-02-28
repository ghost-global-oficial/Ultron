# 🚀 COMECE AQUI

## Passos Rápidos

### 1️⃣ Limpar Tudo
```bash
node clean-all-configs.cjs
```

### 2️⃣ Iniciar App
```bash
npm start
```

### 3️⃣ Configurar
1. Escolher **Loopback**
2. Escolher **OpenRouter**
3. Colar **API Key**
4. Escolher **Modelo** (ex: `openai/gpt-oss-120b:free`)
5. Aguardar teste
6. Clicar **Abrir Chat**

### 4️⃣ Testar
Digite uma mensagem e aguarde resposta da IA.

---

## ⚠️ Problemas?

### Mensagens ficam "Queued"
```bash
# Reiniciar o app
```

### Gateway não inicia
```bash
# Limpar e reconfigurar
node clean-all-configs.cjs
npm start
```

### Gateway rejeita conexão (token mismatch)
```bash
# Fechar app completamente e reiniciar
# O localStorage será limpo automaticamente
```

### IA não responde
```bash
# Verificar configuração
node check-current-config.cjs

# Testar API
node test-openrouter-api.cjs
```

---

## 📚 Documentação Completa

- `GUIA_INICIO_RAPIDO.md` - Guia detalhado
- `README_CORRECOES.md` - Todas as correções
- `RESUMO_TODAS_CORRECOES.md` - Detalhes técnicos

---

## ✅ Tudo Funcionando?

- [ ] Gateway inicia
- [ ] Chat carrega
- [ ] Mensagem é enviada
- [ ] IA responde

**Se sim, parabéns! O Ultron está pronto! 🎉**
