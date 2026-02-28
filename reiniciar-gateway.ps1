# Script para reiniciar o gateway e forcar reload da UI

Write-Host "=== REINICIANDO GATEWAY ===" -ForegroundColor Cyan
Write-Host ""

# 1. Fechar o Electron (isso mata o gateway tambem)
Write-Host "1. Fechando Electron..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*electron*" -or $_.ProcessName -like "*ultron*" } | ForEach-Object {
    Write-Host "   Matando processo: $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

# 2. Matar qualquer processo node que esteja usando a porta 18789
Write-Host "2. Verificando porta 18789..." -ForegroundColor Yellow
$connections = netstat -ano | Select-String ":18789"
if ($connections) {
    Write-Host "   Porta 18789 em uso, matando processos..." -ForegroundColor Gray
    $connections | ForEach-Object {
        $line = $_.ToString().Trim()
        $parts = $line -split '\s+'
        $pid = $parts[-1]
        if ($pid -match '^\d+$') {
            Write-Host "   Matando PID: $pid" -ForegroundColor Gray
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
}

# 3. Limpar cache do Electron
Write-Host "3. Limpando cache do Electron..." -ForegroundColor Yellow
$cacheDir = "$env:APPDATA\ultron-desktop"
if (Test-Path $cacheDir) {
    $folders = @("Cache", "Code Cache", "GPUCache", "DawnCache")
    foreach ($folder in $folders) {
        $path = Join-Path $cacheDir $folder
        if (Test-Path $path) {
            Write-Host "   Removendo: $folder" -ForegroundColor Gray
            Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

# 4. Limpar sessoes antigas
Write-Host "4. Limpando sessoes antigas..." -ForegroundColor Yellow
$sessionsFile = "$env:USERPROFILE\.openclaw\agents\main\sessions\sessions.json"
if (Test-Path $sessionsFile) {
    Write-Host "   Removendo sessoes antigas..." -ForegroundColor Gray
    $sessions = Get-Content $sessionsFile | ConvertFrom-Json
    $mainSession = $sessions | Where-Object { $_.key -eq "agent:main:main" }
    if ($mainSession) {
        @($mainSession) | ConvertTo-Json -Depth 10 | Set-Content $sessionsFile
        Write-Host "   OK Mantida apenas sessao principal" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== LIMPEZA COMPLETA ===" -ForegroundColor Green
Write-Host ""
Write-Host "Agora voce pode:" -ForegroundColor Cyan
Write-Host "1. Abrir o Electron novamente" -ForegroundColor White
Write-Host "2. Configurar o gateway" -ForegroundColor White
Write-Host "3. Criar uma nova tarefa" -ForegroundColor White
Write-Host "4. Enviar mensagens - o historico sera salvo corretamente!" -ForegroundColor White
Write-Host ""
