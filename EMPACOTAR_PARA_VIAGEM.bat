@echo off
title Empacotador de Viagem - Odonto PRO
color 0E
chcp 65001 >nul

echo ============================================================
echo      PREPARADOR PARA PENDRIVE OU GOOGLE DRIVE
echo ============================================================
echo.
echo Vai levar o sistema para outro lugar?
echo Este assistente vai deletar os arquivos ultrapesados temporarios
echo gerados pelo sistema (pasta node_modules, que pesa quase 1 GB).
echo Fique tranquilo, isso NAO exclui clientes, nem seus codigos,
echo nem configuracoes. É só lixo temporario de instalacao!
echo.
echo Ao abrir o "Iniciar Odonto PRO.bat" no outro computador, 
echo o proprio sistema vai recriar esses arquivos automaticamente.
echo.
echo Deseja limpar a pasta agora para facilitar o upload/copia?
echo.
set /p confirm="Digite S para SIM ou N para NAO: "
if /i not "%confirm%"=="S" (
    echo Operacao cancelada. Cuidado que o upload pode demorar muito!
    pause
    exit /b
)

cd /d "%~dp0"

echo.
echo Limpando sistema (pode demorar ALGUNS MINUTOS dependendo do PC)...
echo Aguarde...
echo.

if exist "node_modules" rmdir /s /q "node_modules"
if exist "dist" rmdir /s /q "dist"

echo ============================================================
echo   PRONTO! SISTEMA ESTA LEVINHO!
echo ============================================================
echo.
echo Agora voce pode tranquilamente zipar ou colar essa pasta toda do 
echo Odonto PRO no seu Google Drive ou Pendrive em poucos segundos.
echo.
echo Ao levar pro outro computador, lembra de la usar o arquivo
echo [Iniciar Odonto PRO.bat] para ele religar o sistema de novo.
echo.
pause
