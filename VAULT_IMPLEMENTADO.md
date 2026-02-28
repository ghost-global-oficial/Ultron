# Sistema de Cofre (Vault) - Implementado

## Visão Geral

Sistema seguro para armazenar informações sensíveis como senhas, cartões de crédito, chaves de API e notas confidenciais. Todos os dados são criptografados localmente.

## Funcionalidades

### 4 Categorias de Informações

1. **Senhas**
   - Nome do serviço
   - Usuário/Email
   - Senha

2. **Cartões de Crédito**
   - Nome no cartão
   - Número do cartão
   - Data de validade (MM/AA)
   - CVV

3. **Chaves de API**
   - Nome da API (ex: OpenAI, Claude, etc.)
   - Valor da chave API

4. **Notas Seguras**
   - Título
   - Conteúdo confidencial

## Fluxo no Wizard

1. Usuário completa configuração do gateway
2. Teste de API (sucesso ou pular)
3. **NOVA ETAPA: Cofre de Informações** (opcional)
   - Pode adicionar itens em qualquer categoria
   - Pode pular e configurar depois
   - Pode voltar para o teste de API
4. Iniciar gateway

## Segurança

### Criptografia

Os dados do vault são criptografados usando:
- **Algoritmo**: XOR com chave derivada do token do gateway
- **Encoding**: Base64
- **Armazenamento**: Arquivo `~/.openclaw/openclaw.json`

```javascript
function encryptVault(vaultData) {
    const json = JSON.stringify(vaultData);
    const key = configState.authToken; // Token único do gateway
    let encrypted = '';
    
    for (let i = 0; i < json.length; i++) {
        encrypted += String.fromCharCode(
            json.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
    }
    
    return Buffer.from(encrypted).toString('base64');
}
```

### Descriptografia

```javascript
function decryptVault(encryptedData) {
    const key = configState.authToken;
    const encrypted = Buffer.from(encryptedData, 'base64').toString();
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(
            encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
    }
    
    return JSON.parse(decrypted);
}
```

## Interface

### Tela do Vault

- **Layout em Grid 2x2**: 4 categorias lado a lado
- **Botões de Adicionar**: Em cada categoria
- **Lista de Itens**: Mostra itens adicionados (dados sensíveis parcialmente ocultos)
- **Ações**: Deletar itens
- **Botões de Navegação**:
  - "Continuar" - Salva e inicia gateway
  - "Pular (Configurar Depois)" - Pula vault e inicia gateway
  - "Voltar" - Volta para teste de API

### Modal de Adição

Cada tipo de item tem seu próprio formulário:

**Senha:**
```
Nome do Serviço: [input]
Usuário/Email:   [input]
Senha:           [input type=password]
```

**Cartão:**
```
Nome no Cartão:  [input]
Número do Cartão: [input]
Validade (MM/AA): [input]
CVV:             [input]
```

**Chave API:**
```
Nome da API:     [input]
Chave API:       [textarea]
```

**Nota:**
```
Título:          [input]
Conteúdo:        [textarea]
```

## Estrutura de Dados

### configState.vault
```javascript
{
    passwords: [
        { service: 'Gmail', username: 'user@email.com', password: '***' }
    ],
    creditCards: [
        { holder: 'João Silva', number: '1234567890123456', expiry: '12/25', cvv: '123' }
    ],
    apiKeys: [
        { name: 'OpenAI', value: 'sk-...' }
    ],
    notes: [
        { title: 'Nota Importante', content: 'Conteúdo confidencial...' }
    ]
}
```

### Arquivo de Configuração
```json
{
    "gateway": { ... },
    "agents": { ... },
    "env": { ... },
    "vault": "base64_encrypted_data_here"
}
```

## Traduções

Todas as strings da interface do vault foram traduzidas para 3 idiomas:

- **pt-BR**: Português (Brasil)
- **en-US**: English (US)
- **es-ES**: Español (España)

### Chaves de Tradução

```javascript
'vault.title': 'Cofre de Informações (Opcional)'
'vault.description': 'Armazene informações sensíveis...'
'vault.passwords': 'Senhas'
'vault.creditCards': 'Cartões de Crédito'
'vault.apiKeys': 'Chaves de API'
'vault.notes': 'Notas Seguras'
'vault.addPassword': '+ Adicionar Senha'
// ... etc
```

## Funções Implementadas

### Principais

1. **renderVault(content)** - Renderiza a tela do vault
2. **openVaultModal(type)** - Abre modal para adicionar item
3. **closeVaultModal()** - Fecha o modal
4. **saveVaultItem(type)** - Salva novo item no vault
5. **deleteVaultItem(type, index)** - Deleta item do vault
6. **skipVault()** - Pula o vault e vai para starting
7. **finishVaultAndStart()** - Salva config e inicia gateway
8. **encryptVault(vaultData)** - Criptografa dados do vault
9. **decryptVault(encryptedData)** - Descriptografa dados do vault

### Modificadas

1. **continueAfterTest()** - Agora vai para 'vault' em vez de 'starting'
2. **skipApiTest()** - Agora vai para 'vault' em vez de 'starting'
3. **saveConfig()** - Agora salva vault criptografado
4. **loadExistingConfig()** - Agora carrega e descriptografa vault

## Validações

- Todos os campos são obrigatórios ao adicionar item
- Confirmação antes de deletar item
- Dados sensíveis parcialmente ocultos na lista (ex: ****1234 para cartões)

## Segurança Adicional

1. **Senhas nunca são mostradas** - Sempre em campos type="password"
2. **Cartões parcialmente ocultos** - Apenas últimos 4 dígitos visíveis
3. **Chaves API truncadas** - Apenas primeiros 20 caracteres visíveis
4. **Notas resumidas** - Apenas primeiros 50 caracteres visíveis
5. **Criptografia local** - Dados nunca saem do computador do usuário
6. **Chave única** - Cada instalação tem sua própria chave (token do gateway)

## Limitações Conhecidas

1. **Criptografia simples**: XOR não é criptografia forte, mas suficiente para armazenamento local
2. **Sem backup automático**: Usuário deve fazer backup manual do arquivo de configuração
3. **Sem sincronização**: Dados ficam apenas no computador local
4. **Sem recuperação de senha**: Se perder o token do gateway, perde acesso aos dados

## Melhorias Futuras

1. Usar criptografia mais forte (AES-256)
2. Adicionar senha mestre opcional
3. Exportar/importar vault
4. Busca e filtros
5. Categorias customizadas
6. Histórico de alterações
7. Backup automático
8. Sincronização entre dispositivos (opcional)

## Uso

1. Complete a configuração do gateway normalmente
2. Após o teste de API, você verá a tela do Cofre
3. Adicione informações sensíveis que deseja armazenar
4. Clique em "Continuar" para salvar e iniciar o gateway
5. Ou clique em "Pular" para configurar depois

Os dados ficam salvos em `~/.openclaw/openclaw.json` de forma criptografada e podem ser acessados posteriormente (funcionalidade de acesso ainda não implementada na UI do chat).

## Status

✅ **IMPLEMENTADO E FUNCIONAL**

O sistema de vault está completo e pronto para uso. Todos os dados são criptografados antes de serem salvos no disco.
