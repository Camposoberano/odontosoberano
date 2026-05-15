@echo off
title Criar Atalho - Odonto PRO Campo Soberano
color 0B

echo ====================================
echo   ODONTO PRO - CAMPO SOBERANO
echo   Criar Atalho na Area de Trabalho
echo ====================================
echo.

set "SCRIPT_DIR=%~dp0"
set "DESKTOP=%USERPROFILE%\Desktop"
set "ICON_PATH=%SCRIPT_DIR%public\favicon.ico"

echo [1/2] Verificando icone...
if exist "%ICON_PATH%" (
    echo Icone encontrado: favicon.ico
    echo.
) else (
    echo AVISO: Icone nao encontrado, usando icone padrao
    echo.
)

echo [2/2] Criando atalho na area de trabalho...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$WshShell = New-Object -ComObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut('%DESKTOP%\Odonto PRO.lnk'); ^
$Shortcut.TargetPath = '%SCRIPT_DIR%Iniciar Odonto PRO.bat'; ^
$Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; ^
$Shortcut.IconLocation = '%ICON_PATH%'; ^
$Shortcut.Description = 'Sistema de Gestao Odontologica - Campo Soberano'; ^
$Shortcut.WindowStyle = 1; ^
$Shortcut.Save()"

echo.
if exist "%DESKTOP%\Odonto PRO.lnk" (
    echo ====================================
    echo   ATALHO CRIADO COM SUCESSO!
    echo ====================================
    echo.
    echo O atalho "Odonto PRO" foi criado
    echo na sua area de trabalho com o logo
    echo da Campo Soberano.
    echo.
    echo Funcionalidades:
    echo  - Inicia o servidor automaticamente
    echo  - Abre o navegador
    echo  - Icone personalizado
    echo.
    echo Clique duas vezes no atalho para
    echo iniciar o Odonto PRO!
) else (
    echo ====================================
    echo   ERRO AO CRIAR ATALHO
    echo ====================================
    echo.
    echo Nao foi possivel criar o atalho.
    echo Verifique as permissoes do sistema.
)

echo.
echo Pressione qualquer tecla para fechar...
pause >nul
