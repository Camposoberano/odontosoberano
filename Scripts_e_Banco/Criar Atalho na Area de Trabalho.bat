@echo off
title Criar Atalho - Odonto PRO
color 0B

echo ====================================
echo   CRIAR ATALHO NA AREA DE TRABALHO
echo ====================================
echo.

set "SCRIPT_DIR=%~dp0"
set "DESKTOP=%USERPROFILE%\Desktop"

echo Criando atalho na area de trabalho...
echo.

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\Odonto PRO.lnk'); $Shortcut.TargetPath = '%SCRIPT_DIR%Iniciar Odonto PRO.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.IconLocation = '%SCRIPT_DIR%public\favicon.ico'; $Shortcut.Description = 'Iniciar Sistema Odonto PRO - Campo Soberano'; $Shortcut.Save()"

if exist "%DESKTOP%\Odonto PRO.lnk" (
    echo ====================================
    echo   ATALHO CRIADO COM SUCESSO!
    echo ====================================
    echo.
    echo O atalho "Odonto PRO" foi criado
    echo na sua area de trabalho.
    echo.
    echo Clique duas vezes nele para iniciar
    echo o sistema Odonto PRO.
) else (
    echo ERRO: Nao foi possivel criar o atalho.
)

echo.
echo Pressione qualquer tecla para fechar...
pause >nul
