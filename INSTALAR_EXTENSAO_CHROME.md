# 📦 COMO INSTALAR A EXTENSÃO DO CHROME - ULTRON

## 🎯 O QUE É A EXTENSÃO?

A extensão do Chrome permite que o ULTRON controle o navegador:
- Abrir páginas
- Navegar entre sites
- Ler conteúdo de páginas
- Preencher formulários
- Clicar em elementos
- E muito mais!

---

## 📋 PASSO A PASSO - INSTALAÇÃO

### 1. Abrir o Chrome
1. Abra o Google Chrome
2. Digite na barra de endereços: `chrome://extensions/`
3. Pressione Enter

### 2. Ativar Modo Desenvolvedor
1. No canto superior direito, você verá um botão "Modo do desenvolvedor"
2. Clique para ATIVAR (deve ficar azul/ligado)

### 3. Carregar a Extensão
1. Clique no botão "Carregar sem compactação" (ou "Load unpacked")
2. Uma janela de seleção de pasta vai abrir
3. Navegue até a pasta do projeto ULTRON
4. Entre na pasta: `assets` → `chrome-extension`
5. Selecione a pasta `chrome-extension` e clique em "Selecionar pasta"

**Caminho completo:**
```
C:\Users\guilh\ULTRON V4\Ultron\assets\chrome-extension
```

### 4. Verificar Instalação
1. A extensão "ULTRON Browser Relay" deve aparecer na lista
2. Você verá:
   - Nome: ULTRON Browser Relay
   - Versão: 0.1.0
   - ID: (um código aleatório)
   - Status: Ativado

### 5. Fixar na Barra de Ferramentas (Opcional mas Recomendado)
1. Clique no ícone de quebra-cabeça (🧩) no canto superior direito do Chrome
2. Encontre "ULTRON Browser Relay"
3. Clique no ícone de alfinete (📌) para fixar na barra

---

## ✅ COMO USAR A EXTENSÃO

### Conectar a uma Aba
1. Abra uma aba no Chrome (qualquer página)
2. Clique no ícone da extensão ULTRON na barra de ferramentas
3. A extensão vai conectar à aba atual
4. O ícone deve mudar de cor/estado

### Verificar Conexão
- **Desconectado**: Ícone cinza ou com badge vermelho
- **Conectado**: Ícone verde ou sem badge
- **Erro**: Badge vermelho com "!"

### Desconectar
1. Clique no ícone da extensão novamente
2. A extensão vai desconectar da aba

---

## 🧪 TESTAR A EXTENSÃO

### Teste 1: Verificar se está instalada
```powershell
# No PowerShell, execute:
Test-Path "C:\Users\guilh\ULTRON V4\Ultron\assets\chrome-extension\manifest.json"
```
Deve retornar: `True`

### Teste 2: Conectar e usar
1. Abra o Chrome
2. Abra uma nova aba
3. Clique no ícone da extensão ULTRON
4. Volte para o chat do ULTRON
5. Digite: "abra o Google"
6. A IA deve conseguir abrir o Google na aba conectada

---

## 🔧 CONFIGURAÇÕES DA EXTENSÃO

### Acessar Configurações
1. Clique com botão direito no ícone da extensão
2. Selecione "Opções"
3. Ou vá em `chrome://extensions/` e clique em "Detalhes" → "Opções da extensão"

### Porta do Relay
- Porta padrão: **18792**
- Só mude se você configurou uma porta diferente no ULTRON

### Testar Conexão
1. Nas opções, clique em "Test connection"
2. Deve mostrar: "Relay reachable at http://127.0.0.1:18792"

---

## 🚨 PROBLEMAS COMUNS

### Problema 1: "Carregar sem compactação" não aparece
**Causa**: Modo desenvolvedor não está ativado
**Solução**: Ative o "Modo do desenvolvedor" no canto superior direito

### Problema 2: Erro ao carregar extensão
**Causa**: Pasta errada selecionada
**Solução**: Certifique-se de selecionar a pasta `chrome-extension` que contém o arquivo `manifest.json`

### Problema 3: Extensão carrega mas não funciona
**Causa**: Gateway não está rodando
**Solução**: 
1. Verifique se o app ULTRON está aberto
2. Verifique se o gateway iniciou (porta 18789)
3. Reinicie o app se necessário

### Problema 4: Badge vermelho com "!"
**Causa**: Relay server não está acessível
**Solução**:
1. Verifique se a porta 18792 está livre
2. Reinicie o gateway
3. Verifique firewall/antivírus

### Problema 5: Extensão conecta mas IA não controla
**Causa**: Aba não está realmente conectada
**Solução**:
1. Desconecte a extensão (clique no ícone)
2. Feche a aba
3. Abra uma nova aba
4. Conecte novamente

---

## 📊 VERIFICAR SE ESTÁ FUNCIONANDO

### Verificar Relay Server
```powershell
# Verificar se a porta 18792 está em uso
netstat -ano | findstr 18792
```

Se aparecer algo, o relay está rodando ✓

### Verificar Gateway
```powershell
# Verificar se a porta 18789 está em uso
netstat -ano | findstr 18789
```

Se aparecer algo, o gateway está rodando ✓

---

## 🎯 COMANDOS PARA TESTAR

Depois de instalar e conectar a extensão:

1. **Abrir página**: "abra o Google"
2. **Navegar**: "vá para o YouTube"
3. **Buscar**: "busque por 'inteligência artificial' no Google"
4. **Ler página**: "qual é o título desta página?"
5. **Nova aba**: "abra uma nova aba"

---

## 📝 ARQUIVOS DA EXTENSÃO

A extensão está localizada em:
```
assets/chrome-extension/
├── manifest.json       # Configuração da extensão
├── background.js       # Lógica principal
├── options.html        # Interface de configurações
├── options.js          # Lógica das configurações
├── README.md          # Documentação
└── icons/             # Ícones da extensão
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

---

## 🔄 ATUALIZAR A EXTENSÃO

Se você fizer mudanças na extensão:

1. Vá em `chrome://extensions/`
2. Encontre "ULTRON Browser Relay"
3. Clique no ícone de recarregar (🔄)
4. A extensão será recarregada com as mudanças

---

## 🗑️ DESINSTALAR A EXTENSÃO

Se precisar remover:

1. Vá em `chrome://extensions/`
2. Encontre "ULTRON Browser Relay"
3. Clique em "Remover"
4. Confirme a remoção

---

## 📚 MAIS INFORMAÇÕES

### Permissões da Extensão
A extensão precisa de:
- **debugger**: Para controlar o Chrome via CDP (Chrome DevTools Protocol)
- **tabs**: Para gerenciar abas
- **activeTab**: Para acessar a aba ativa
- **storage**: Para salvar configurações
- **host_permissions**: Para conectar ao relay local (127.0.0.1)

### Segurança
- A extensão só se conecta a `127.0.0.1` (localhost)
- Não envia dados para servidores externos
- Só funciona quando você conecta manualmente
- Você pode desconectar a qualquer momento

---

## ✅ CHECKLIST DE INSTALAÇÃO

- [ ] Chrome aberto
- [ ] Navegou para `chrome://extensions/`
- [ ] Modo desenvolvedor ATIVADO
- [ ] Clicou em "Carregar sem compactação"
- [ ] Selecionou a pasta `assets/chrome-extension`
- [ ] Extensão aparece na lista
- [ ] Extensão está ATIVADA
- [ ] Ícone fixado na barra de ferramentas (opcional)
- [ ] Abriu uma aba
- [ ] Clicou no ícone da extensão
- [ ] Extensão conectou (ícone mudou)
- [ ] Testou com comando "abra o Google"

---

**Próximo passo**: Instale a extensão seguindo os passos acima e teste!
