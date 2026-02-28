# Script para forcar recompilacao completa

Write-Host "=== Forcando Recompilacao Completa ===" -ForegroundColor Cyan
Write-Host ""

# 1. Limpar dist da UI
Write-Host "1. Limpando dist da UI..." -ForegroundColor Yellow
if (Test-Path "ui/dist") {
    Remove-Item -Recurse -Force "ui/dist"
    Write-Host "   OK ui/dist removido" -ForegroundColor Green
}

# 2. Limpar node_modules/.vite da UI
Write-Host "2. Limpando cache do Vite..." -ForegroundColor Yellow
if (Test-Path "ui/node_modules/.vite") {
    Remove-Item -Recurse -Force "ui/node_modules/.vite"
    Write-Host "   OK Cache do Vite removido" -ForegroundColor Green
}

# 3. Limpar dist principal
Write-Host "3. Limpando dist principal..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "   OK dist removido" -ForegroundColor Green
}

# 4. Recompilar UI
Write-Host "4. Recompilando UI..." -ForegroundColor Yellow
Set-Location ui
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK UI recompilada com sucesso" -ForegroundColor Green
} else {
    Write-Host "   ERRO ao recompilar UI" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# 5. Recompilar projeto principal
Write-Host "5. Recompilando projeto principal..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Projeto recompilado com sucesso" -ForegroundColor Green
} else {
    Write-Host "   ERRO ao recompilar projeto" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Recompilacao Completa ===" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "1. Feche o Ultron COMPLETAMENTE (se estiver aberto)"
Write-Host "2. Inicie o Ultron novamente"
Write-Host "3. Crie uma NOVA tarefa"
Write-Host "4. Verifique no console se a sessionKey comeca com agent:main:chat:"
Write-Host ""
