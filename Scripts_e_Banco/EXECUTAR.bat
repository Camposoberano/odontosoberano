@echo off
echo ========================================
echo    CRM SOBERANO - Iniciando...
echo ========================================
echo.

:: Verificar se node_modules existe
if not exist node_modules (
    echo [AVISO] Dependencias nao instaladas!
    echo Execute primeiro: INSTALAR_AGORA.bat
    echo.
    pause
    exit /b 1
)

:: Iniciar o servidor de desenvolvimento
echo [*] Iniciando servidor de desenvolvimento...
echo [*] O navegador abrira automaticamente em http://localhost:3000
echo.
echo [*] Para parar o servidor, pressione Ctrl+C
echo.

npm run dev
