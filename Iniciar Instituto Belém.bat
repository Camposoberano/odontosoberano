@echo off
title Instituto Bel�m - Inicializacao
color 03
chcp 65001 >nul
echo ===================================================
echo         INSTITUTO BEL�M - SISTEMA ON
echo ===================================================
echo.
cd /d "%~dp0"
echo [1/4] Verificando Node.js...
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERRO] Node.js nao encontrado. Baixe em: https://nodejs.org/
    pause & exit /b
)
echo [2/4] Verificando node_modules...
if not exist "node_modules\" (
    echo Instalando dependencias... aguarde...
    call npm install >nul 2>&1
    echo OK!
) else ( echo OK! )
echo [3/4] Ligando servidor...
start "Instituto Bel�m" /MIN cmd /c "npm run dev"
echo [4/4] Aguardando (6s)...
timeout /t 6 /nobreak >nul
echo.
echo Sistema pronto! Abrindo navegador...
echo URL: http://localhost:8081/inst.belem/
echo.
echo [ATENCAO] NAO feche a janela preta minimizada!
echo.
start http://localhost:8081/inst.belem/
pause >nul
