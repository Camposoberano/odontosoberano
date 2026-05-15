@echo off
echo ========================================
echo    CRM SOBERANO - Teste de Instalacao
echo ========================================
echo.

echo Verificando instalacao...
echo.

:: Verificar Node.js
echo [1] Node.js:
node --version
if %errorlevel% neq 0 (
    echo    [ERRO] Nao instalado!
) else (
    echo    [OK] Instalado!
)
echo.

:: Verificar NPM
echo [2] NPM:
npm --version
if %errorlevel% neq 0 (
    echo    [ERRO] Nao instalado!
) else (
    echo    [OK] Instalado!
)
echo.

:: Verificar node_modules
echo [3] Dependencias:
if exist node_modules (
    echo    [OK] Instaladas!
) else (
    echo    [ERRO] Nao instaladas! Execute: INSTALAR_AGORA.bat
)
echo.

:: Verificar arquivos importantes
echo [4] Arquivos de configuracao:
if exist package.json (
    echo    [OK] package.json
) else (
    echo    [ERRO] package.json nao encontrado!
)

if exist vite.config.ts (
    echo    [OK] vite.config.ts
) else (
    echo    [AVISO] vite.config.ts nao encontrado!
)

if exist tailwind.config.js (
    echo    [OK] tailwind.config.js
) else (
    echo    [AVISO] tailwind.config.js nao encontrado!
)

if exist index.html (
    echo    [OK] index.html
) else (
    echo    [ERRO] index.html nao encontrado!
)
echo.

:: Verificar estrutura src
echo [5] Estrutura do projeto:
if exist src\main.tsx (
    echo    [OK] src\main.tsx
) else (
    echo    [ERRO] src\main.tsx nao encontrado!
)

if exist src\App.tsx (
    echo    [OK] src\App.tsx
) else (
    echo    [ERRO] src\App.tsx nao encontrado!
)

if exist src\styles\globals.css (
    echo    [OK] src\styles\globals.css
) else (
    echo    [AVISO] src\styles\globals.css nao encontrado!
)
echo.

echo ========================================
echo Teste concluido!
echo.
echo Se tudo estiver OK, execute: EXECUTAR.bat
echo ========================================
echo.
pause
