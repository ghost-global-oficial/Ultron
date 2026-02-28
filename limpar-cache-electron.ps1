# Script para limpar cache do Electron

Write-Host "=== Limpeza de Cache do Electron ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se o Ultron esta rodando
$ultronProcess = Get-Process | Where-Object { $_.ProcessName -like "*ultron*" -or $_.ProcessName -like "*electron*" }
if ($ultronProcess) {
    Write-Host "AVISO: Ultron esta rodando!" -ForegroundColor Yellow
    Write-Host "Feche o Ultron antes de continuar." -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Deseja fechar automaticamente? (S/N)"
    if ($response -eq "S" -or $response -eq "s") {
        Write-Host "Fechando Ultron..." -ForegroundColor Yellow
        $ultronProcess | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-Host "Ultron fechado." -ForegroundColor Green
    } else {
        Write-Host "Por favor, feche o Ultron manualmente e execute este script novamente." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Procurando pastas de cache..." -ForegroundColor Yellow
Write-Host ""

$cacheFolders = @(
    "$env:APPDATA\ultron-desktop\Cache",
    "$env:APPDATA\ultron-desktop\Code Cache",
    "$env:APPDATA\ultron-desktop\GPUCache",
    "$env:APPDATA\ultron-desktop\DawnCache",
    "$env:APPDATA\ultron-desktop\Session Storage",
    "$env:APPDATA\ultron-desktop\Local Storage",
    "$env:LOCALAPPDATA\ultron-desktop\Cache",
    "$env:LOCALAPPDATA\ultron-desktop\Code Cache",
    "$env:LOCALAPPDATA\ultron-desktop\GPUCache"
)

$removedCount = 0
$totalSize = 0

foreach ($folder in $cacheFolders) {
    if (Test-Path $folder) {
        try {
            # Calcular tamanho
            $size = (Get-ChildItem -Path $folder -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            $sizeMB = [math]::Round($size / 1MB, 2)
            $totalSize += $sizeMB
            
            Write-Host "Removendo: $folder ($sizeMB MB)" -ForegroundColor Yellow
            Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  OK Removido" -ForegroundColor Green
            $removedCount++
        } catch {
            Write-Host "  ERRO: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Nao encontrado: $folder" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Resumo ===" -ForegroundColor Cyan
Write-Host "Pastas removidas: $removedCount" -ForegroundColor Green
Write-Host "Espaco liberado: $totalSize MB" -ForegroundColor Green

Write-Host ""
Write-Host "=== Proximos Passos ===" -ForegroundColor Cyan
Write-Host "1. Inicie o Ultron novamente"
Write-Host "2. Crie uma NOVA tarefa"
Write-Host "3. Verifique no console (F12) se a sessionKey comeca com 'agent:main:chat:'"
Write-Host "4. Envie uma mensagem e verifique se o historico e salvo"
Write-Host ""
