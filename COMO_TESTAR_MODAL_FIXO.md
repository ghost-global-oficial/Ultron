# Como Testar o Modal com Tamanho Fixo

## 🎯 O que foi implementado?

O modal de "Gerir conectores" agora tem tamanho fixo de 1000px x 700px em todas as seções, proporcionando uma experiência consistente.

## 🚀 Passo a Passo para Testar

### 1. Preparação

#### Limpar Cache (Recomendado)
```powershell
.\limpar-cache-electron.ps1
```

Isso garante que você está vendo a versão mais recente da UI.

#### Verificar Compilação
```bash
cd ui
pnpm build
```

Deve compilar sem erros.

### 2. Iniciar o Ultron

1. Certifique-se de que o gateway está rodando
2. Abra o Ultron Desktop
3. Aguarde a conexão com o gateway

### 3. Abrir o Modal

1. Na sidebar esquerda, procure o botão "Gerir conectores"
2. Clique no botão
3. O modal deve abrir no centro da tela

### 4. Verificar Tamanho Fixo

#### Teste 1: Navegação entre Seções
1. Clique em cada seção da barra lateral:
   - Conta
   - Tarefas agendadas
   - Controlo de dados
   - Personalização
   - Habilidades
   - Conectores
   - Integrações
   - Obter ajuda

2. **Verifique**: O modal deve manter exatamente o mesmo tamanho em todas as seções

#### Teste 2: Scroll Interno
1. Vá para a seção "Conectores"
2. Se houver muitos conectores, role a lista
3. **Verifique**: O scroll deve funcionar dentro do modal, sem mover o modal em si

#### Teste 3: Responsividade
1. Redimensione a janela do Ultron
2. Torne a janela menor
3. **Verifique**: O modal deve se adaptar, mas manter as proporções

### 5. Verificar Detalhes Visuais

#### Layout
```
┌─────────────────────────────────────────────────────┐
│  Sidebar     │  Content Area                        │
│  (250px)     │  (750px)                             │
│              │                                       │
│  • Conta     │  ┌─────────────────────────────┐    │
│  • Tarefas   │  │  Header                     │    │
│  • Controlo  │  ├─────────────────────────────┤    │
│  • Persona.  │  │                             │    │
│  • Habilid.  │  │  Content (scroll)           │    │
│  • Conector. │  │                             │    │
│  • Integr.   │  │                             │    │
│  • Ajuda     │  └─────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
        1000px x 700px (tamanho fixo)
```

#### Checklist Visual
- [ ] Modal tem bordas arredondadas
- [ ] Sidebar tem fundo mais escuro
- [ ] Seção ativa está destacada na sidebar
- [ ] Header tem botão de fechar (X)
- [ ] Conteúdo tem padding adequado
- [ ] Scroll aparece quando necessário

### 6. Testar Interações

#### Navegação
- [ ] Clicar em cada seção da sidebar funciona
- [ ] Seção ativa muda visualmente
- [ ] Conteúdo muda ao trocar de seção

#### Botões
- [ ] Botão "X" fecha o modal
- [ ] Clicar fora do modal fecha ele
- [ ] Botões dentro das seções respondem ao hover

#### Scroll
- [ ] Scroll funciona com mouse wheel
- [ ] Scroll funciona com barra de rolagem
- [ ] Scroll não afeta o tamanho do modal

### 7. Testar em Diferentes Temas

#### Tema Escuro (Padrão)
1. Verifique se o modal tem fundo escuro (#1a1a1a)
2. Verifique se o texto é claro
3. Verifique se os contrastes estão adequados

#### Tema Claro
1. Vá para Configurações
2. Mude para tema claro
3. Abra o modal novamente
4. Verifique se as cores se adaptaram

### 8. Verificar Console (Opcional)

1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Não deve haver erros relacionados ao modal
4. Verifique se há warnings de CSS

## ✅ Checklist Completo

### Funcionalidade
- [ ] Modal abre ao clicar em "Gerir conectores"
- [ ] Modal fecha ao clicar no X
- [ ] Modal fecha ao clicar fora
- [ ] Navegação entre seções funciona
- [ ] Todas as 8 seções são acessíveis

### Tamanho e Layout
- [ ] Modal tem tamanho fixo (1000px x 700px)
- [ ] Tamanho é consistente em todas as seções
- [ ] Sidebar tem 250px de largura
- [ ] Content area tem 750px de largura
- [ ] Modal é responsivo em telas menores

### Scroll
- [ ] Scroll interno funciona
- [ ] Scroll não afeta o tamanho do modal
- [ ] Scroll aparece apenas quando necessário
- [ ] Scroll é suave

### Visual
- [ ] Bordas arredondadas
- [ ] Sombra adequada
- [ ] Cores corretas no tema escuro
- [ ] Cores corretas no tema claro
- [ ] Transições suaves

### Performance
- [ ] Modal abre rapidamente
- [ ] Navegação é instantânea
- [ ] Scroll é fluido
- [ ] Sem travamentos

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento.

## 📝 Reportar Problemas

Se encontrar algum problema:

1. Anote o que estava fazendo
2. Tire um screenshot se possível
3. Verifique o console (F12) por erros
4. Descreva o comportamento esperado vs. observado

## 🎓 Dicas

### Atalhos Úteis
- `F12` - Abrir DevTools
- `Ctrl+Shift+I` - Abrir DevTools (alternativo)
- `Ctrl+R` - Recarregar a página
- `Ctrl+Shift+R` - Recarregar sem cache

### Verificar Tamanho do Modal
1. Abra o DevTools (F12)
2. Clique no ícone de seleção de elemento
3. Clique no modal
4. Verifique as dimensões no painel Elements

Deve mostrar:
```
width: 1000px
height: 700px
```

### Verificar Scroll
1. Abra o DevTools (F12)
2. Vá para a aba Elements
3. Procure por `.manage-connectors-settings__section`
4. Verifique se tem `overflow-y: auto`

## 🎉 Sucesso!

Se todos os testes passarem, o modal está funcionando perfeitamente!

O modal agora proporciona uma experiência consistente e previsível, independente da seção que você está visualizando.

---

**Última atualização**: 26 de fevereiro de 2026
**Versão**: 1.0.0
