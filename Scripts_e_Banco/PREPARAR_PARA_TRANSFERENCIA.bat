@echo off
chcp 65001 >nul
echo ========================================
echo   PREPARAR ODONTO PRO PARA TRANSFERÊNCIA
echo ========================================
echo.

echo 📋 Este script irá:
echo   1. Criar um arquivo .zip com os arquivos necessários
echo   2. Excluir node_modules, dist, .env e outros arquivos temporários
echo   3. Manter apenas o essencial para transferência
echo.

set /p confirm="Deseja continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo Cancelado pelo usuário.
    pause
    exit /b
)

echo.
echo 🔍 Verificando se 7-Zip está instalado...

where 7z >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ 7-Zip não encontrado!
    echo.
    echo Por favor, instale o 7-Zip:
    echo https://www.7-zip.org/download.html
    echo.
    echo Ou use PowerShell para compactar manualmente.
    pause
    exit /b
)

echo ✅ 7-Zip encontrado!
echo.

echo 📦 Criando arquivo de transferência...
echo.

cd /d "%~dp0"

set "arquivo_saida=Odonto_PRO_Transferencia_%date:~-4,4%%date:~-10,2%%date:~-7,2%.zip"

7z a -tzip "%arquivo_saida%" ^
    -x!node_modules ^
    -x!dist ^
    -x!.env ^
    -x!*.log ^
    -x!.vscode ^
    -x!.idea ^
    -x!*.tmp ^
    -x!*.temp ^
    * >nul 2>&1

if errorlevel 1 (
    echo ❌ Erro ao criar arquivo ZIP
    pause
    exit /b
)

echo.
echo ✅ Arquivo criado com sucesso!
echo.
echo 📁 Arquivo: %arquivo_saida%
echo.

for %%A in ("%arquivo_saida%") do (
    set "tamanho=%%~zA"
)

set /a tamanhoMB=%tamanho% / 1048576

echo 📊 Tamanho: ~%tamanhoMB% MB
echo.
echo ========================================
echo   PRÓXIMOS PASSOS
echo ========================================
echo.
echo 1. Copie o arquivo %arquivo_saida%
echo 2. No computador de destino:
echo    - Descompacte o arquivo
echo    - Crie o arquivo .env (use .env.example como referência)
echo    - Execute: npm install
echo    - Execute: npm run dev
echo.
echo 3. Para VPS, consulte: GUIA_TRANSFERENCIA.md
echo.
echo ✅ Pronto para transferir!
echo.

pause
