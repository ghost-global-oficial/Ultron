# Cores do Menu de Integrações Atualizadas

## Mudanças Realizadas

O menu "Integrações" agora tem a mesma cor de fundo da barra lateral esquerda.

### Cores Aplicadas

| Elemento | Cor Anterior | Cor Nova | Descrição |
|----------|--------------|----------|-----------|
| Fundo do modal | `#1a1a1a` | `#000000` | Preto sólido (igual à barra lateral) |
| Header | `#1a1a1a` | `#000000` | Preto sólido |
| Toolbar | `#1a1a1a` | `#000000` | Preto sólido |
| Content | `#1a1a1a` | `#000000` | Preto sólido |
| Cards | `#252525` | `#1a1a1a` | Cinza escuro |
| Bordas | `#333333` | `#2a2a2a` | Cinza mais escuro |
| Hover dos cards | `#2a2a2a` | `#1a1a1a` | Mantém o cinza escuro |
| Hover das bordas | `#444444` | `#6366f1` | Roxo (accent) |
| Input de busca | `#252525` | `#1a1a1a` | Cinza escuro |
| Botão adicionar API | `#252525` | `#1a1a1a` | Cinza escuro |

### Elementos Atualizados

1. **Modal principal** (`manage-connectors-modal`)
   - Fundo: `#000000`
   - Borda: `#2a2a2a`

2. **Header** (`manage-connectors-modal__header`)
   - Fundo: `#000000`
   - Borda inferior: `#2a2a2a`

3. **Toolbar** (`manage-connectors-modal__toolbar`)
   - Fundo: `#000000`

4. **Content** (`manage-connectors-modal__content`)
   - Fundo: `#000000`

5. **Cards de conectores** (`manage-connectors-modal__card`)
   - Fundo: `#1a1a1a`
   - Borda: `#2a2a2a`
   - Hover: borda `#6366f1` (roxo)

6. **Ícones dos cards** (`manage-connectors-modal__card-icon`)
   - Fundo: `#000000`

7. **Input de busca** (`manage-connectors-modal__search-input`)
   - Fundo: `#1a1a1a`
   - Borda: `#2a2a2a`
   - Focus: borda `#6366f1`

8. **Botão adicionar API** (`manage-connectors-modal__add-api-btn`)
   - Fundo: `#1a1a1a`
   - Borda: `#2a2a2a` (tracejada)
   - Hover: borda `#6366f1`

9. **Cards de API** (`manage-connectors-modal__api-card`)
   - Fundo: `#1a1a1a`
   - Borda: `#2a2a2a`
   - Hover: borda `#6366f1`

10. **Intro de API** (`manage-connectors-modal__api-intro`)
    - Fundo: `#1a1a1a`
    - Borda: `#2a2a2a`

11. **Botão fechar** (`manage-connectors-modal__close`)
    - Hover: fundo `#1a1a1a`

## Paleta de Cores Unificada

```css
/* Fundos principais */
--bg-primary: #000000;    /* Barra lateral e modal */
--bg-secondary: #1a1a1a;  /* Cards e elementos secundários */

/* Bordas */
--border-primary: #2a2a2a;  /* Bordas padrão */
--border-accent: #6366f1;   /* Bordas em hover/focus */

/* Textos */
--text-primary: #ffffff;
--text-secondary: #e5e7eb;
--text-muted: #9ca3af;
```

## Como Testar

Execute o script de teste:

```bash
node testar-cores-integracao.cjs
```

### Checklist Visual

- [ ] Fundo do modal é preto sólido (#000000)
- [ ] Fundo é idêntico à barra lateral esquerda
- [ ] Cards têm fundo cinza escuro (#1a1a1a)
- [ ] Bordas são cinza mais escuro (#2a2a2a)
- [ ] Hover nos cards muda a borda para roxo (#6366f1)
- [ ] Input de busca tem fundo cinza escuro (#1a1a1a)
- [ ] Botão "Adicionar API" tem fundo cinza escuro (#1a1a1a)
- [ ] Ícones dos cards têm fundo preto (#000000)

## Arquivos Modificados

- `ui/src/styles/manage-connectors-modal.css` - Atualizado com as novas cores

## Resultado

O menu de Integrações agora tem uma aparência consistente com a barra lateral, usando a mesma paleta de cores preta e cinza escura, com acentos roxos nos hovers para melhor feedback visual.
