# Guia Rápido - Testar Instalador ULTRON

## ✅ Status: PRONTO PARA USAR

O instalador foi corrigido e está pronto para gerar os executáveis.

## Passo 1: Gerar o Instalador

Execute o script de build (escolha uma opção):

**PowerShell:**
```powershell
.\build-installer.bat
```

**CMD:**
```cmd
build-installer.bat
```

**Direto via npm:**
```powershell
npm run package:win
```

O script irá:
1. ✅ Verificar Node.js
2. ✅ Instalar dependências do backend
3. ✅ Instalar dependências da UI
4. ✅ Compilar TypeScript
5. ✅ Compilar UI
6. ✅ Gerar instaladores

## Passo 2: Localizar os Instaladores

Após o build, os instaladores estarão em:

```
release/
├── Ultron-Setup-1.0.0.exe      (Instalador completo)
└── Ultron-Portable-1.0.0.exe   (Versão portable)
```

## Passo 3: Testar em Outro PC

### Opção A: Instalador Completo
1. Copie `Ultron-Setup-1.0.0.exe` para o outro PC
2. Execute o instalador
3. Escolha o diretório de instalação
4. Aguarde a instalação
5. Execute o ULTRON

### Opção B: Versão Portable
1. Copie `Ultron-Portable-1.0.0.exe` para o outro PC
2. Execute diretamente (não requer instalação)
3. O ULTRON será executado

## Passo 4: Configurar Colmeia

### No PC 1 (Servidor):
1. Abra o ULTRON
2. Vá em Configurações → Colmeia
3. Ative "Modo Colmeia"
4. Anote o ID da Colmeia gerado

### No PC 2 (Cliente):
1. Abra o ULTRON
2. Vá em Configurações → Colmeia
3. Ative "Modo Colmeia"
4. Insira o ID da Colmeia do PC 1
5. Clique em "Conectar"

## Passo 5: Verificar Conexão

Ambos os PCs devem mostrar:
- ✅ Status: Conectado
- ✅ Peers: 1 (ou mais)
- ✅ Sincronização ativa

## Recursos do Instalador

### Instalador NSIS:
- ✅ Instalação personalizada
- ✅ Atalho no Desktop
- ✅ Atalho no Menu Iniciar
- ✅ Desinstalador incluído
- ✅ Executa após instalação
- ✅ Atualização automática

### Versão Portable:
- ✅ Não requer instalação
- ✅ Execução direta
- ✅ Ideal para testes
- ✅ Pode ser executado de USB

## Troubleshooting

### Erro: "Node.js não encontrado"
- Instale Node.js 22+ de: https://nodejs.org

### Erro: "Falha ao compilar"
- Execute: `npm install` na raiz do projeto
- Execute: `cd ui && npm install && cd ..`
- Tente novamente

### Instalador não abre no outro PC
- Verifique se o Windows Defender não bloqueou
- Clique com botão direito → Propriedades → Desbloquear

### Colmeia não conecta
- Verifique se ambos os PCs estão na mesma rede
- Verifique firewall (porta padrão: 49737)
- Verifique se o ID da Colmeia está correto

## Notas Importantes

1. **Primeira execução**: Pode demorar alguns segundos para iniciar
2. **Firewall**: Windows pode pedir permissão na primeira vez
3. **Antivírus**: Pode ser necessário adicionar exceção
4. **Rede**: Ambos os PCs devem estar na mesma rede local

## Próximos Passos

Após confirmar que funciona:
1. Adicione um ícone personalizado em `assets/icon.png`
2. Reconstrua o instalador
3. Distribua para outros usuários

## Suporte

Se encontrar problemas:
1. Verifique os logs em: `%APPDATA%/Ultron/logs/`
2. Consulte `VERIFICACAO_INSTALADOR.md`
3. Verifique a documentação da colmeia em `TESTE_COLMEIA_P2P.md`
