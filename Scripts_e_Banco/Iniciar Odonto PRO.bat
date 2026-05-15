@echo off
title Odonto PRO - Iniciando...
color 0A

echo ====================================
echo     ODONTO PRO - INICIANDO
echo ====================================
echo.

cd /d "E:\Odonto PRO"

echo [1/2] Iniciando servidor...
start "Odonto PRO Server" cmd /k "npm run dev"

echo [2/2] Aguardando servidor inicializar...
timeout /t 5 /nobreak >nul

echo.
echo Abrindo navegador...
start http://localhost:8080

echo.
echo ====================================
echo   Odonto PRO iniciado com sucesso!
echo   Acesse: http://localhost:8080
echo ====================================
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
