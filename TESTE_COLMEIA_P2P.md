# 🧪 Guia de Teste - Colmeia P2P

## 🎯 Objetivo

Testar o sistema de Colmeia P2P entre dois ou mais ULTRONs.

## 📋 Pré-requisitos

1. ULTRON compilado e funcionando
2. Pelo menos 2 instâncias do ULTRON (podem ser na mesma máquina)
3. Credenciais do ULTRON configuradas

## 🚀 Teste 1: Conexão Local (Mesma Máquina)

### Passo 1: Preparar Primeira Instância

1. Abra o ULTRON
2. Vá para Configurações → Colmeia
3. Clique em "Criar Nova Colmeia"
4. Preencha as credenciais:
   ```
   ID da Colmeia: ULTRON-TEST-001
   Passphrase 1: senha123
   Passphrase 2: senha456
   ```
5. Clique em "Criar Colmeia"
6. Aguarde mensagem de sucesso

### Passo 2: Preparar Segunda Instância

1. Abra uma SEGUNDA instância do ULTRON (nova janela)
2. Vá para Configurações → Colmeia
3. Clique em "Entrar em Colmeia Existente"
4. Use as MESMAS credenciais:
   ```
   ID da Colmeia: ULTRON-TEST-001
   Passphrase 1: senha123
   Passphrase 2: senha456
   ```
5. Clique em "Entrar"
6. Aguarde conexão

### Passo 3: Verificar Conexão

1. Em ambas as instâncias, vá para Colmeia
2. Verifique a lista de "Membros Conectados"
3. Você deve ver o outro ULTRON listado
4. Status deve estar "Online"

### Passo 4: Testar Comunicação

1. Na primeira instância, envie uma mensagem de teste
2. Na segunda instância, verifique se recebeu
3. Teste o contrário (segunda → primeira)

### ✅ Resultado Esperado

- Ambos os ULTRONs aparecem na lista de membros
- Status "Online" em ambos
- Mensagens são recebidas em tempo real
- Console do Electron mostra logs de conexão P2P

## 🌐 Teste 2: Conexão em Rede Local

### Passo 1: ULTRON A (Computador 1)

1. Anote o IP do computador: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
   - Exemplo: 192.168.1.10
2. Abra o ULTRON
3. Crie uma colmeia com credenciais:
   ```
   ID: ULTRON-LAN-TEST
   Passphrase 1: rede123
   Passphrase 2: local456
   ```

### Passo 2: ULTRON B (Computador 2)

1. Certifique-se de estar na MESMA rede WiFi/LAN
2. Abra o ULTRON
3. Entre na colmeia com as MESMAS credenciais:
   ```
   ID: ULTRON-LAN-TEST
   Passphrase 1: rede123
   Passphrase 2: local456
   ```

### Passo 3: Verificar Descoberta Automática

1. Aguarde até 30 segundos
2. Verifique os logs do console:
   - "ULTRON descoberto na rede local"
   - "Nova conexão P2P estabelecida"
3. Verifique a lista de membros em ambos

### ✅ Resultado Esperado

- Descoberta automática via mDNS
- Conexão P2P estabelecida
- Ambos aparecem na lista de membros
- Latência baixa (< 50ms)

## 🌍 Teste 3: Conexão via Internet

### Passo 1: ULTRON A (Rede 1)

1. Conecte-se a uma rede (ex: WiFi de casa)
2. Crie colmeia:
   ```
   ID: ULTRON-INTERNET-TEST
   Passphrase 1: internet123
   Passphrase 2: global456
   ```

### Passo 2: ULTRON B (Rede 2)

1. Conecte-se a uma REDE DIFERENTE (ex: 4G/5G do celular)
2. Entre na colmeia com as MESMAS credenciais
3. Aguarde até 60 segundos (DHT pode demorar mais)

### Passo 3: Verificar NAT Traversal

1. Verifique os logs:
   - "Conectado ao swarm da colmeia"
   - "Nova conexão P2P estabelecida"
2. Teste comunicação bidirecional

### ✅ Resultado Esperado

- Conexão estabelecida mesmo com NAT
- Hyperswarm DHT faz o NAT traversal
- Comunicação funciona normalmente
- Latência pode ser maior (depende da distância)

## 🔍 Verificação de Logs

### Console do Electron (DevTools)

Abra DevTools (F12) e procure por:

```
✓ Conectado ao swarm da colmeia: ULTRON-TEST-001
Nova conexão P2P estabelecida
Peer entrou na colmeia: ULTRON-B
✓ Colmeia ativa!
```

### Console do Main Process

No terminal onde você executou `npm start`:

```
=== CRIANDO/JUNTANDO COLMEIA P2P ===
Conectado ao swarm da colmeia: ULTRON-TEST-001
Membro entrou na colmeia: { id: '...', name: 'ULTRON-B', ... }
✓ Colmeia criada/juntada com sucesso!
```

## 🐛 Troubleshooting

### Problema: Peers não se conectam

**Possíveis causas:**
1. Credenciais diferentes
2. Firewall bloqueando UDP
3. Hyperswarm não conseguiu fazer NAT traversal

**Soluções:**
1. Verifique se ID e passphrases são EXATAMENTE iguais
2. Desabilite firewall temporariamente para teste
3. Tente na mesma rede local primeiro

### Problema: Descoberta local não funciona

**Possíveis causas:**
1. mDNS bloqueado no roteador
2. Redes diferentes (mesmo WiFi, mas VLANs separadas)
3. Bonjour não instalado (Windows)

**Soluções:**
1. Use apenas Hyperswarm (funciona via internet)
2. Verifique se ambos estão na mesma subnet
3. Instale Bonjour Print Services (Windows)

### Problema: Mensagens não chegam

**Possíveis causas:**
1. Colmeia não está ativa
2. Peer não está na lista de membros
3. Assinatura inválida

**Soluções:**
1. Verifique status com `hive-is-active`
2. Aguarde handshake completar (até 30s)
3. Verifique logs de erro no console

## 📊 Métricas de Sucesso

### Conexão Local
- ✅ Tempo de conexão: < 5 segundos
- ✅ Latência: < 10ms
- ✅ Taxa de sucesso: 100%

### Conexão LAN
- ✅ Tempo de conexão: < 10 segundos
- ✅ Latência: < 50ms
- ✅ Taxa de sucesso: > 95%

### Conexão Internet
- ✅ Tempo de conexão: < 60 segundos
- ✅ Latência: < 200ms
- ✅ Taxa de sucesso: > 90%

## 🎯 Testes Avançados

### Teste de Sincronização

```javascript
// No console do DevTools
const context = {
  task: 'Análise de dados',
  progress: 75,
  data: { items: 100 }
};

await hiveManager.syncContextP2P(context);
```

### Teste de Distribuição de Tarefas

```javascript
const task = {
  id: 'task-001',
  type: 'processing',
  data: { file: 'data.csv' },
  priority: 'high'
};

await hiveManager.distributeTaskP2P(task);
```

### Teste de Broadcast

```javascript
await hiveManager.sendP2PMessage('data', {
  type: 'announcement',
  message: 'Olá, colmeia!'
});
```

### Teste de Mensagem Direta

```javascript
const members = await hiveManager.getP2PMembers();
const targetId = members[0].id;

await hiveManager.sendP2PMessage('data', {
  type: 'private',
  message: 'Mensagem privada'
}, targetId);
```

## 📝 Relatório de Teste

Após os testes, preencha:

### Teste 1: Conexão Local
- [ ] Passou
- [ ] Falhou
- Observações: _______________

### Teste 2: Conexão LAN
- [ ] Passou
- [ ] Falhou
- Observações: _______________

### Teste 3: Conexão Internet
- [ ] Passou
- [ ] Falhou
- Observações: _______________

### Testes Avançados
- [ ] Sincronização funcionou
- [ ] Distribuição de tarefas funcionou
- [ ] Broadcast funcionou
- [ ] Mensagem direta funcionou

## 🎉 Conclusão

Se todos os testes passaram, o sistema de Colmeia P2P está **100% funcional** e pronto para produção!

**Próximos passos:**
1. Documentar casos de uso reais
2. Criar tutoriais em vídeo
3. Adicionar métricas e monitoramento
4. Implementar features avançadas (chat, compartilhamento de tela, etc.)
