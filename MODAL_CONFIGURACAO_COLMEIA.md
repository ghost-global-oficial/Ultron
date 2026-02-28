# Modal de Configuração da Colmeia

## Funcionalidade Implementada

Quando o usuário clica no botão "Criar Colmeia", agora abre um modal de configuração antes de criar a colmeia.

## Campos do Modal

### 1. Nome da Colmeia
- Campo de texto obrigatório
- Valor padrão: "Colmeia Principal"
- Permite personalizar o nome da colmeia

### 2. Descrição (opcional)
- Campo de texto multilinha (textarea)
- Permite adicionar uma descrição do propósito da colmeia
- Redimensionável verticalmente

### 3. Configurações Iniciais

Quatro toggles para configurar o comportamento da colmeia:

**Sincronização automática** (ativado por padrão)
- Sincroniza dados e contexto entre todos os ULTRONs

**Balanceamento de carga** (ativado por padrão)
- Distribui tarefas automaticamente entre membros

**Failover automático** (ativado por padrão)
- Redireciona tarefas se um membro ficar offline

**Compartilhamento de memória** (ativado por padrão)
- Permite acesso ao histórico compartilhado

## Comportamento

1. Usuário clica em "Criar Colmeia"
2. Modal de configuração aparece
3. Usuário preenche os campos e ajusta as configurações
4. Ao clicar em "Criar Colmeia" no modal:
   - Nome e descrição são salvos no localStorage
   - Configurações são aplicadas ao HiveManager
   - Colmeia é criada
   - Modal fecha automaticamente
5. Interface muda para mostrar a colmeia criada

## Persistência

- Nome da colmeia: `localStorage.getItem('hive_name')`
- Descrição: `localStorage.getItem('hive_description')`
- Configurações: gerenciadas pelo HiveManager

## Estilos

- Modal maior (600px) para acomodar todos os campos
- Toggles agrupados em container com fundo diferenciado
- Textarea redimensionável para descrições longas
- Suporte completo a tema claro e escuro

## Arquivos Modificados

- `ui/src/ui/views/manage-connectors-sections.ts` - Adicionada função `showHiveSetupModal()`
- `ui/src/styles/manage-connectors-settings.css` - Estilos para textarea e modal de setup

## Como Testar

1. Abra a aplicação ULTRON
2. Clique em "Gerir conectores"
3. Navegue até "Colmeia" na barra lateral
4. Clique no botão "Criar Colmeia"
5. Preencha os campos no modal
6. Ajuste as configurações conforme desejado
7. Clique em "Criar Colmeia" para confirmar
8. Verifique que a colmeia foi criada com as configurações escolhidas
