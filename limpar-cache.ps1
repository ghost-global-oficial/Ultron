#!/usr/bin/env pwsh
# Script para limpar apenas o cache do Ultron

Write-Host "🧹 Limpando cache do Ultron..." -ForegroundColor Cyan
Write-Host "   (Certifique-se de que o app está fechado)" -ForegroundColor Yellow
Write-Host ""

# Limpar cache
$cachePaths = @(
    "$env:APPDATA\ultron\Cache",
    "$env:APPDATA\ultron\Code Cache",
    "$env:APPDATA\ultron\GPUCache",
    "$env:APPDATA\ultron\DawnCache",
    "$env:APPDATA\ultron\Session Storage"
)

$removed = 0
foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        Write-Host "Removendo: $path" -ForegroundColor Gray
        Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
        $removed++
    }
}

Write-Host ""
if ($removed -gt 0) {
    Write-Host "✅ $removed pastas de cache removidas" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Nenhuma pasta de cache encontrada" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Agora você pode iniciar o app: npm start" -ForegroundColor Cyan
