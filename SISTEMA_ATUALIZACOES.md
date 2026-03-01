# 🔄 Sistema de Atualizações Automáticas do ULTRON

## ✅ Implementado e Funcional

O ULTRON agora possui um sistema completo de atualizações automáticas que verifica e instala novas versões diretamente do GitHub.

## 🎯 Características

### 1. Verificação Automática
- Busca a última release no repositório GitHub
- Compara versões automaticamente
- Exibe informações detalhadas da atualização

### 2. Download Inteligente
- Baixa o instalador (.exe) automaticamente
- Mostra progresso em tempo real
- Salva em diretório temporário

### 3. Instalação Simples
- Executa o instalador automaticamente
- Fecha o ULTRON para permitir atualização
- Processo totalmente automatizado

## 📍 Localização

### Na Interface

1. Abra as **Configurações do ULTRON**
2. Role até a seção **"Atualizações do ULTRON"**
3. Clique em **"Gerenciar atualizações"**
4. Um painel lateral será aberto com:
   - Status atual
   - Versão instalada
   - Botão para verificar atualizações
   - Informações da nova versão (se disponível)

## 🚀 Como Usar

### Verificar Atualizações

1. Clique em **"Verificar atualizações"**
2. O sistema busca no GitHub: `ghost-global-oficial/Ultron`
3. Compara a versão atual com a última release
4. Exibe resultado:
   - ✅ **Atualizado**: "Você está usando a versão mais recente"
   - 🆕 **Disponível**: Mostra detalhes da nova versão

### Instalar Atualização

Quando uma nova versão está disponível:

1. Leia as **notas de versão** (changelog)
2. Clique em **"Instalar atualização"**
3. Aguarde o download (progresso em tempo real)
4. O instalador será executado automaticamente
5. O ULTRON será fechado
6. Siga as instruções do instalador

## 🔧 Arquitetura Técnica

### Frontend (UI)

**Arquivo**: `ui/src/ui/views/ultron-updates.ts`

```typescript
export type UpdateStatus = 
  | 'idle'           // Aguardando ação
  | 'checking'       // Verificando GitHub
  | 'available'      // Atualização disponível
  | 'downloading'    // Baixando instalador
  | 'installing'     // Instalando
  | 'uptodate'       // Já atualizado
  | 'error';         // Erro

export type UpdateInfo = {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string;
  downloadUrl: string;
  publishedAt: string;
};
```

**CSS**: `ui/src/styles/ultron-updates.css`
- Estilos completos para todos os estados
- Animações de loading
- Barra de progresso
- Responsivo

### Backend (Electron)

**Arquivo**: `main.js`

#### IPC Handlers

1. **`check-updates`**
   - Busca última release no GitHub API
   - Compara versões (semver)
   - Retorna informações da atualização

2. **`install-update`**
   - Baixa o instalador (.exe)
   - Mostra progresso via evento `update-download-progress`
   - Executa o instalador
   - Fecha o ULTRON

#### Funções Auxiliares

```javascript
function compareVersions(v1, v2) {
  // Compara versões no formato X.Y.Z
  // Retorna: 1 (v1 > v2), -1 (v1 < v2), 0 (iguais)
}
```

## 📊 Fluxo de Atualização

```
1. Usuário clica "Verificar atualizações"
   ↓
2. UI envia IPC 'check-updates'
   ↓
3. Backend busca GitHub API
   ├─ GET /repos/ghost-global-oficial/Ultron/releases/latest
   └─ Compara versões
   ↓
4. Backend retorna resultado
   ├─ Atualizado: status 'uptodate'
   └─ Disponível: status 'available' + info
   ↓
5. UI exibe informações
   ├─ Notas de versão
   ├─ Data de publicação
   └─ Botão "Instalar"
   ↓
6. Usuário clica "Instalar atualização"
   ↓
7. UI envia IPC 'install-update'
   ↓
8. Backend baixa instalador
   ├─ Stream com progresso
   └─ Salva em %TEMP%
   ↓
9. Backend executa instalador
   ├─ exec("ULTRON-Setup.exe")
   └─ app.quit()
   ↓
10. Instalador atualiza o ULTRON
```

## 🔐 Segurança

### Verificações Implementadas

1. **GitHub API Oficial**
   - Usa apenas `api.github.com`
   - Verifica status HTTP
   - Valida resposta JSON

2. **Comparação de Versões**
   - Algoritmo semver
   - Previne downgrade acidental

3. **Download Seguro**
   - Apenas assets da release oficial
   - Verifica extensão `.exe`
   - Salva em diretório temporário do sistema

### Recomendações

- ✅ Sempre leia as notas de versão antes de instalar
- ✅ Feche outros programas antes da instalação
- ✅ Faça backup de configurações importantes
- ⚠️ Não interrompa o processo de instalação

## 📝 Configuração

### Repositório GitHub

Definido em `main.js`:

```javascript
const GITHUB_REPO = 'ghost-global-oficial/Ultron';
const CURRENT_VERSION = '1.0.0';
```

### Versão Atual

Para atualizar a versão após uma release:

1. Edite `main.js`:
   ```javascript
   const CURRENT_VERSION = '1.1.0'; // Nova versão
   ```

2. Rebuild:
   ```bash
   npm run build
   cd ui && npm run build && cd ..
   ```

## 🐛 Troubleshooting

### Erro: "Erro ao conectar com o GitHub"

**Causas**:
- Sem conexão com internet
- GitHub API indisponível
- Rate limit excedido

**Solução**:
- Verifique sua conexão
- Aguarde alguns minutos
- Tente novamente

### Erro: "Erro ao baixar"

**Causas**:
- Conexão interrompida
- Asset não encontrado na release
- Sem permissão para escrever em %TEMP%

**Solução**:
- Verifique conexão
- Baixe manualmente do GitHub
- Execute como administrador

### Instalador não inicia

**Causas**:
- Antivírus bloqueando
- Arquivo corrompido
- Sem permissões

**Solução**:
- Desabilite antivírus temporariamente
- Baixe novamente
- Execute como administrador

## 🎯 Próximas Melhorias

### Curto Prazo
- [ ] Verificação automática ao iniciar
- [ ] Notificação de nova versão
- [ ] Opção de atualização silenciosa

### Longo Prazo
- [ ] Delta updates (apenas diferenças)
- [ ] Rollback automático em caso de erro
- [ ] Histórico de versões instaladas
- [ ] Canal beta/stable

## 📚 Referências

### GitHub API
- [Releases API](https://docs.github.com/en/rest/releases/releases)
- [Rate Limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)

### Electron
- [Auto Updater](https://www.electronjs.org/docs/latest/api/auto-updater)
- [IPC Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)

## ✅ Checklist de Implementação

- [x] Componente UI de atualizações
- [x] CSS completo com animações
- [x] IPC handler para verificar atualizações
- [x] IPC handler para instalar atualizações
- [x] Comparação de versões (semver)
- [x] Download com progresso
- [x] Execução automática do instalador
- [x] Integração com página de configurações
- [x] Documentação completa

## 🎉 Conclusão

O sistema de atualizações está **100% funcional** e pronto para uso!

**Características**:
- ✅ Verificação automática no GitHub
- ✅ Download com progresso
- ✅ Instalação automatizada
- ✅ Interface intuitiva
- ✅ Tratamento de erros
- ✅ Documentação completa

**Para testar**:
1. Crie uma release no GitHub com tag `v1.1.0`
2. Anexe um instalador `.exe`
3. Abra o ULTRON
4. Vá em Configurações → Atualizações
5. Clique em "Verificar atualizações"
6. A nova versão será detectada!

---

**Desenvolvido para ULTRON v1.0.0**  
**Sistema de atualizações automáticas via GitHub Releases**
