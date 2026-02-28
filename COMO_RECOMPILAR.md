# 🔄 Como Recompilar o OpenClaw para Ver as Mudanças de Cor

## ✅ As mudanças JÁ FORAM FEITAS no código!

O arquivo `ui/src/styles/base.css` já foi modificado com as cores corretas:
- Modo escuro: Branco (#ffffff)
- Modo claro: Preto (#000000)

## ⚠️ Mas você precisa RECOMPILAR o app!

### Opção 1: Recompilar Completo (Recomendado)

```bash
# No diretório raiz do OpenClaw
pnpm build
```

Isso vai:
1. Compilar o TypeScript
2. Processar o CSS
3. Gerar os arquivos finais em `dist/`

### Opção 2: Modo Desenvolvimento (Mais Rápido)

```bash
# No diretório raiz do OpenClaw
pnpm dev
```

Isso vai:
1. Iniciar servidor de desenvolvimento
2. Recompilar automaticamente quando você salvar arquivos
3. Hot reload (atualização automática)

### Opção 3: Apenas UI

```bash
# No diretório ui/
cd ui
pnpm build
```

Isso compila apenas a interface do usuário.

## 🧹 Se ainda não funcionar: Limpar Cache

```bash
# Limpar cache e node_modules
rm -rf node_modules dist ui/dist
pnpm install
pnpm build
```

## 🔍 Verificar se Funcionou

Depois de recompilar, abra o app e:

1. Abra o DevTools (F12)
2. Vá em "Elements" ou "Inspetor"
3. Procure por `:root` ou `:root[data-theme="light"]`
4. Verifique se `--danger` e `--accent` estão com as cores corretas:
   - Modo escuro: `#ffffff` (branco)
   - Modo claro: `#000000` (preto)

## 📝 Resumo

```bash
# Comando mais simples:
pnpm build

# Depois reinicie o app
```

**As mudanças estão no código, só falta recompilar!** 🎨
