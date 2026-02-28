# Credenciais Persistentes do ULTRON

## Problema Identificado

As credenciais na seção "Conta" estavam sendo regeneradas a cada renderização, causando mudanças constantes nos valores exibidos.

## Solução Implementada

### 1. Persistência no localStorage

As credenciais agora são geradas uma única vez e armazenadas no localStorage:

```typescript
localStorage.setItem('ultron_id', ultronId);
localStorage.setItem('ultron_access_token', accessToken);
localStorage.setItem('ultron_passphrase1', passphrase1);
localStorage.setItem('ultron_passphrase2', passphrase2);
```

### 2. Verificação e Geração Condicional

Ao renderizar a seção de conta:
1. Tenta carregar credenciais existentes do localStorage
2. Se não existirem, gera novas e salva
3. Se existirem, usa as credenciais salvas

```typescript
let ultronId = localStorage.getItem('ultron_id');
// ... outros campos

if (!ultronId || !accessToken || !passphrase1 || !passphrase2) {
  // Gerar novas credenciais
  // Salvar no localStorage
}
```

## Funcionalidades Adicionadas

### 1. Botão "Regenerar Credenciais"

- Pede confirmação ao usuário
- Gera novas credenciais
- Salva no localStorage
- Recarrega a página para aplicar mudanças
- Aviso: credenciais antigas deixam de funcionar

**Handler:**
```typescript
const handleRegenerateCredentials = async () => {
  const confirmed = await showConfirm('...');
  if (confirmed) {
    // Gerar e salvar novas credenciais
    location.reload();
  }
};
```

### 2. Botão "Revogar Acesso"

- Pede confirmação ao usuário
- Remove todas as credenciais do localStorage
- Recarrega a página
- Aviso: todas as conexões serão desfeitas

**Handler:**
```typescript
const handleRevokeAccess = async () => {
  const confirmed = await showConfirm('...');
  if (confirmed) {
    // Remover credenciais
    location.reload();
  }
};
```

## Chaves do localStorage

| Chave | Formato | Exemplo |
|-------|---------|---------|
| `ultron_id` | ULTRON-XXXXXXXX | ULTRON-A7B3C9D2 |
| `ultron_access_token` | tk_xxxxxxxxxxxxx | tk_a7b3c9d2e5f6g8h9 |
| `ultron_passphrase1` | palavra-palavra-1234 | alpha-bravo-5678 |
| `ultron_passphrase2` | palavra-palavra-5678 | charlie-delta-9012 |

## Comportamento

### Primeira Visita
1. Usuário abre a seção "Conta"
2. Credenciais são geradas automaticamente
3. Credenciais são salvas no localStorage
4. Credenciais são exibidas

### Visitas Subsequentes
1. Usuário abre a seção "Conta"
2. Credenciais são carregadas do localStorage
3. Mesmas credenciais são exibidas (não mudam)

### Regenerar Credenciais
1. Usuário clica em "Regenerar credenciais"
2. Modal de confirmação aparece
3. Se confirmar:
   - Novas credenciais são geradas
   - localStorage é atualizado
   - Página recarrega
   - Novas credenciais são exibidas

### Revogar Acesso
1. Usuário clica em "Revogar acesso"
2. Modal de confirmação aparece
3. Se confirmar:
   - Credenciais são removidas do localStorage
   - Página recarrega
   - Novas credenciais são geradas na próxima visita

## Arquivos Modificados

### `ui/src/ui/views/manage-connectors-sections.ts`

**Alterações:**
1. Adicionada lógica de verificação do localStorage
2. Geração condicional de credenciais
3. Função `handleRegenerateCredentials()`
4. Função `handleRevokeAccess()`
5. Botões agora têm handlers funcionais

## Benefícios

1. **Estabilidade**: Credenciais não mudam a cada renderização
2. **Persistência**: Credenciais mantêm-se entre sessões
3. **Controle**: Usuário pode regenerar quando necessário
4. **Segurança**: Opção de revogar acesso completamente
5. **Usabilidade**: Credenciais consistentes para copiar/usar

## Como Testar

1. **Primeira Visita:**
   - Abra "Configurações" → "Conta"
   - Observe as credenciais geradas
   - Copie o ID de Identificação
   - Feche e reabra a seção
   - Verifique que o ID é o mesmo

2. **Persistência:**
   - Recarregue a página
   - Abra "Conta" novamente
   - Verifique que as credenciais são as mesmas

3. **Regenerar:**
   - Clique em "Regenerar credenciais"
   - Confirme a ação
   - Após recarregar, verifique que as credenciais mudaram
   - Feche e reabra para confirmar que as novas credenciais persistem

4. **Revogar:**
   - Clique em "Revogar acesso"
   - Confirme a ação
   - Após recarregar, abra "Conta"
   - Verifique que novas credenciais foram geradas

## Compilação

✅ Compilado com sucesso
✅ Sem erros TypeScript
✅ Funcionalidade testada e validada
