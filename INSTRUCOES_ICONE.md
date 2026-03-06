# Instruções para o Ícone do ULTRON

## Status Atual

✅ Criei um ícone SVG temporário em: `assets/ultron-icon.svg`
✅ Configurei o `package.json` para usar este ícone

## Problema

O Electron Builder precisa de um arquivo PNG ou ICO para Windows, não SVG.

## Solução Rápida

### Opção 1: Converter o SVG para PNG (Recomendado)

Use um destes métodos:

#### Online (Mais Fácil):
1. Acesse: https://cloudconvert.com/svg-to-png
2. Faça upload de `assets/ultron-icon.svg`
3. Configure para 512x512 pixels
4. Baixe e salve como `assets/icon.png`

#### Com Inkscape (Se instalado):
```bash
inkscape -w 512 -h 512 assets/ultron-icon.svg -o assets/icon.png
```

#### Com ImageMagick (Se instalado):
```bash
magick convert -density 300 -background none assets/ultron-icon.svg -resize 512x512 assets/icon.png
```

### Opção 2: Usar um Ícone Existente

Se você já tem um logo do ULTRON:
1. Copie o arquivo PNG para `assets/icon.png`
2. Certifique-se de que tem pelo menos 256x256 pixels (recomendado 512x512)

### Opção 3: Criar um Ícone Personalizado

Use qualquer editor de imagem (Photoshop, GIMP, Figma, etc.) para criar:
- Tamanho: 512x512 pixels
- Formato: PNG com transparência
- Conteúdo: Logo do ULTRON
- Salvar como: `assets/icon.png`

## Após Criar o Ícone

1. Certifique-se de que o arquivo está em: `assets/icon.png`
2. Atualize o `package.json`:

```json
"win": {
  "icon": "assets/icon.png"
},
"nsis": {
  "installerIcon": "assets/icon.png",
  "uninstallerIcon": "assets/icon.png",
  "installerHeaderIcon": "assets/icon.png"
}
```

3. Execute o build:
```bash
build-installer.bat
```

## Design Sugerido

O ícone SVG criado tem:
- Fundo circular com gradiente roxo/azul (#667eea → #764ba2)
- Letra "U" grande e branca no centro
- Círculo de destaque no canto superior direito
- Sombra suave para profundidade

Você pode usar este design ou criar um personalizado que represente melhor o ULTRON.

## Nota Importante

Sem um ícone PNG válido, o instalador ainda será gerado, mas usará o ícone padrão do Electron (que não é ideal para distribuição).
