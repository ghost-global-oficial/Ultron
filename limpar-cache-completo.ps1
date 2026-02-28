# Script para limpar completamente o cache do Electron/Ultron

Write-Host "🧹 Limpando cache do Ultron..." -ForegroundColor Cyan

# Parar o app se estiver rodando
Write-Host "`n1️⃣ Parando processos do Ultron..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*electron*" -or $_.ProcessName -like "*ultron*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Limpar cache do Electron
Write-Host "`n2️⃣ Limpando cache do Electron..." -ForegroundColor Yellow
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

foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        Write-Host "   Removendo: $path" -ForegroundColor Gray
        Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Limpar build antigo
Write-Host "`n3️⃣ Limpando build antigo..." -ForegroundColor Yellow
$distPath = "dist\control-ui"
if (Test-Path $distPath) {
    Write-Host "   Removendo: $distPath" -ForegroundColor Gray
    Remove-Item $distPath -Recurse -Force -ErrorAction SilentlyContinue
}

# Recompilar UI
Write-Host "`n4️⃣ Recompilando UI..." -ForegroundColor Yellow
Set-Location ui
npm run build
Set-Location ..

Write-Host "`n✅ Cache limpo e UI recompilada!" -ForegroundColor Green
Write-Host "`n🚀 Agora execute: npm start" -ForegroundColor Cyan
Write-Host "`n💡 Dica: Pressione Ctrl+Shift+R no app para hard refresh" -ForegroundColor Yellow
