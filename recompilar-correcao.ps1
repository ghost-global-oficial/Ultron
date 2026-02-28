#!/usr/bin/env pwsh

Write-Host "Recompilando correcao do onboarding..." -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos no diretorio correto
if (-not (Test-Path "package.json")) {
    Write-Host "Erro: package.json nao encontrado!" -ForegroundColor Red
    Write-Host "Execute este script na raiz do projeto openclaw" -ForegroundColor Yellow
    exit 1
}

Write-Host "Passo 1: Limpando cache e build anterior..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "Pasta dist removida" -ForegroundColor Green
}

if (Test-Path "ui/dist") {
    Remove-Item -Recurse -Force "ui/dist"
    Write-Host "Pasta ui/dist removida" -ForegroundColor Green
}

Write-Host ""
Write-Host "Passo 2: Compilando backend TypeScript..." -ForegroundColor Yellow
pnpm build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Erro durante o build do backend!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Passo 3: Compilando UI (interface web)..." -ForegroundColor Yellow
Set-Location ui
npm run build
$uiBuildExitCode = $LASTEXITCODE
Set-Location ..

if ($uiBuildExitCode -ne 0) {
    Write-Host ""
    Write-Host "Erro durante o build da UI!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Recompilacao concluida com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "1. Parar o gateway se estiver rodando" -ForegroundColor White
Write-Host "2. Iniciar o gateway novamente" -ForegroundColor White
Write-Host "3. Abrir o navegador com ?onboarding=true" -ForegroundColor White
Write-Host "4. Configurar e clicar em Connect" -ForegroundColor White
Write-Host "5. Verificar se navega para o chat corretamente" -ForegroundColor White
Write-Host ""
Write-Host "Dica: Se o problema persistir, limpe o cache do navegador" -ForegroundColor Yellow
Write-Host ""
