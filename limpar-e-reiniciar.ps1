#!/usr/bin/env pwsh
# Script para limpar cache e reiniciar o Ultron

Write-Host "🧹 Limpando cache e reiniciando Ultron..." -ForegroundColor Cyan

# 1. Parar processos
Write-Host "`n1️⃣ Parando processos..." -ForegroundColor Yellow
Get-Process | Where-Object { 
    $_.ProcessName -like "*electron*" -or 
    $_.ProcessName -like "*ultron*" -or
    $_.ProcessName -like "*node*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2
Write-Host "   ✅ Processos parados" -ForegroundColor Green

# 2. Limpar cache
Write-Host "`n2️⃣ Limpando cache..." -ForegroundColor Yellow
$cachePaths = @(
    "$env:APPDATA\ultron\Cache",
    "$env:APPDATA\ultron\Code Cache",
    "$env:APPDATA\ultron\GPUCache",
    "$env:APPDATA\ultron\DawnCache",
    "$env:APPDATA\ultron\Session Storage",
    "$env:APPDATA\ultron\Local Storage",
    "$env:APPDATA\Electron\Cache",
    "$env:APPDATA\Electron\Code Cache",
    "$env:APPDATA\Electron\GPUCache"
)

$removed = 0
foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        Write-Host "   Removendo: $path" -ForegroundColor Gray
        Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
        $removed++
    }
}

if ($removed -gt 0) {
    Write-Host "   ✅ $removed pastas de cache removidas" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Nenhuma pasta de cache encontrada" -ForegroundColor Gray
}

# 3. Aguardar um pouco
Write-Host "`n3️⃣ Aguardando..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

# 4. Reiniciar app
Write-Host "`n4️⃣ Iniciando Ultron..." -ForegroundColor Yellow
Write-Host "   Executando: npm start" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

Write-Host "`n✅ Pronto!" -ForegroundColor Green
Write-Host "   O Ultron está iniciando em uma nova janela..." -ForegroundColor Cyan
Write-Host "   Aguarde o gateway iniciar (porta 18789)" -ForegroundColor Yellow
