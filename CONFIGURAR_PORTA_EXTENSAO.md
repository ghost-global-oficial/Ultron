# ⚙️ CONFIGURAR PORTA DA EXTENSÃO

## 🎯 RESPOSTA RÁPIDA

Quando a extensão pedir a porta, digite: **18792**

---

## 📋 PASSO A PASSO COMPLETO

### 1. Primeira Instalação
Quando você instala a extensão pela primeira vez, ela abre automaticamente a página de configurações pedindo a porta.

### 2. Digite a Porta
- Campo: **Port**
- Valor: **18792**
- Clique em **Save**

### 3. Testar Conexão
- Clique no botão **Test connection**
- Deve aparecer: ✓ "Relay reachable at http://127.0.0.1:18792"

---

## ✅ CONFIGURAÇÃO APLICADA

A configuração do browser relay foi adicionada ao arquivo de config do ULTRON:

```json
{
  "browser": {
    "relay": {
      "enabled": true,
      "port": 18792
    }
  }
}
```

**Localização**: `C:\Users\guilh\.ultron\ultron.json`

---

## 🔄 REINICIAR O GATEWAY

Para que o browser relay funcione, você precisa reiniciar o app ULTRON:

1. **Feche o app ULTRON completamente**
2. **Abra o app novamente**
3. **Aguarde o gateway iniciar** (porta 18789)
4. **O relay server também vai iniciar** (porta 18792)

---

## 🧪 VERIFICAR SE ESTÁ FUNCIONANDO

### Verificar Relay Server
```powershell
netstat -ano | findstr 18792
```

**Resultado esperado:**
```
TCP    127.0.0.1:18792    0.0.0.0:0    LISTENING    [PID]
```

Se aparecer isso, o relay está rodando ✓

### Verificar Gateway
```powershell
netstat -ano | findstr 18789
```

**Resultado esperado:**
```
TCP    127.0.0.1:18789    0.0.0.0:0    LISTENING    [PID]
```

Se aparecer isso, o gateway está rodando ✓

---

## 🚨 SE O RELAY NÃO INICIAR

### Problema: Porta 18792 já está em uso
```powershell
# Verificar o que está usando a porta
netstat -ano | findstr 18792
```

Se algo já estiver usando a porta, você tem 2 opções:

#### Opção 1: Matar o processo
```powershell
# Substitua [PID] pelo número que apareceu no comando anterior
taskkill /PID [PID] /F
```

#### Opção 2: Usar outra porta
1. Edite o arquivo `C:\Users\guilh\.ultron\ultron.json`
2. Mude a porta de 18792 para outra (ex: 18793)
3. Salve o arquivo
4. Reinicie o app ULTRON
5. Configure a extensão com a nova porta

---

## 📝 CONFIGURAR MANUALMENTE (SE NECESSÁRIO)

Se você fechar a página de configurações sem salvar, pode acessar novamente:

### Método 1: Via Extensão
1. Clique com botão direito no ícone da extensão
2. Selecione "Opções"

### Método 2: Via Chrome
1. Vá em `chrome://extensions/`
2. Encontre "ULTRON Browser Relay"
3. Clique em "Detalhes"
4. Clique em "Opções da extensão"

---

## ✅ CHECKLIST

- [ ] Extensão instalada
- [ ] Porta configurada: **18792**
- [ ] Configuração salva
- [ ] App ULTRON reiniciado
- [ ] Gateway rodando (porta 18789)
- [ ] Relay rodando (porta 18792)
- [ ] Teste de conexão passou
- [ ] Extensão conectada a uma aba
- [ ] Testou comando "abra o Google"

---

## 🎯 PRÓXIMOS PASSOS

1. **Digite 18792** na página de configurações da extensão
2. **Clique em Save**
3. **Feche e reabra o app ULTRON**
4. **Teste a conexão** na página de configurações
5. **Conecte a extensão** a uma aba do Chrome
6. **Teste com a IA**: "abra o Google"

---

**Porta padrão**: 18792
**Status**: Configuração aplicada ✓
**Próximo passo**: Reiniciar o app ULTRON
