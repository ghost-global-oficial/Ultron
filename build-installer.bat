@echo off
echo ========================================
echo   ULTRON - Build Instalador
echo ========================================
echo.

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale Node.js 22+ de: https://nodejs.org
    pause
    exit /b 1
)

echo [1/6] Verificando Node.js...
node --version
echo.

echo [2/6] Instalando dependencias do backend...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do backend
    pause
    exit /b 1
)
echo.

echo [3/6] Instalando dependencias da UI...
cd ui
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias da UI
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo [4/6] Compilando TypeScript...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao compilar TypeScript
    pause
    exit /b 1
)
echo.

echo [5/6] Compilando UI...
cd ui
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao compilar UI
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo [6/6] Gerando instaladores...
call npm run package:win
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao gerar instaladores
    pause
    exit /b 1
)
echo.

echo ========================================
echo   BUILD CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Instaladores criados em: release\
echo.
dir release\*.exe /b
echo.
echo Pressione qualquer tecla para abrir a pasta...
pause >nul
explorer release
