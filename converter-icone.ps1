# Script para converter PNG para ICO
Write-Host "Convertendo PNG para ICO..."

Add-Type -AssemblyName System.Drawing

try {
    $inputPath = Join-Path (Get-Location) "assets\icon.png"
    $outputPath = Join-Path (Get-Location) "assets\icon.ico"
    
    Write-Host "Input: $inputPath"
    Write-Host "Output: $outputPath"
    
    # Carregar a imagem PNG
    $png = [System.Drawing.Image]::FromFile($inputPath)
    
    # Criar bitmap 256x256
    $bitmap = [System.Drawing.Bitmap]::new(256, 256)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($png, 0, 0, 256, 256)
    $graphics.Dispose()
    
    # Salvar como ICO
    $iconStream = [System.IO.File]::Create($outputPath)
    
    # Header do ICO (formato simplificado - 1 imagem)
    $writer = [System.IO.BinaryWriter]::new($iconStream)
    $writer.Write([uint16]0)  # Reserved
    $writer.Write([uint16]1)  # Type (1 = ICO)
    $writer.Write([uint16]1)  # Number of images
    
    # Salvar bitmap como PNG em memória
    $ms = [System.IO.MemoryStream]::new()
    $bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $imageData = $ms.ToArray()
    
    # Directory entry
    $writer.Write([byte]0)      # Width (0 = 256)
    $writer.Write([byte]0)      # Height (0 = 256)
    $writer.Write([byte]0)      # Color palette
    $writer.Write([byte]0)      # Reserved
    $writer.Write([uint16]1)    # Color planes
    $writer.Write([uint16]32)   # Bits per pixel
    $writer.Write([uint32]$imageData.Length)  # Size
    $writer.Write([uint32]22)   # Offset (6 + 16)
    
    # Image data
    $writer.Write($imageData)
    
    $writer.Close()
    $iconStream.Close()
    $ms.Dispose()
    $bitmap.Dispose()
    $png.Dispose()
    
    Write-Host "Conversao concluida!" -ForegroundColor Green
    Write-Host "Arquivo: $outputPath"
}
catch {
    Write-Host "Erro: $_" -ForegroundColor Red
    exit 1
}
