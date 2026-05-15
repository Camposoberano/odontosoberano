@echo off
echo ========================================
echo    CRM SOBERANO - Instalacao Rapida
echo ========================================
echo.

:: Verificar se Node.js esta instalado
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js instalado!
node --version
echo.

:: Verificar se NPM esta instalado
echo [2/5] Verificando NPM...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] NPM nao encontrado!
    pause
    exit /b 1
)
echo [OK] NPM instalado!
npm --version
echo.

:: Instalar dependencias
echo [3/5] Instalando dependencias...
echo Isso pode demorar alguns minutos...
echo.
npm install
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias!
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas!
echo.

:: Copiar config do Tailwind
echo [4/5] Configurando Tailwind...
if exist tailwind.config.modern.js (
    copy /Y tailwind.config.modern.js tailwind.config.js >nul
    echo [OK] Tailwind configurado!
) else (
    echo [INFO] tailwind.config.modern.js nao encontrado, pulando...
)
echo.

:: Criar arquivo .env se nao existir
echo [5/5] Configurando ambiente...
if not exist .env (
    echo # CRM SOBERANO - Configuracao > .env
    echo VITE_SUPABASE_URL= >> .env
    echo VITE_SUPABASE_ANON_KEY= >> .env
    echo VITE_APP_ENV=development >> .env
    echo VITE_APP_VERSION=7.4.2.12 >> .env
    echo [OK] Arquivo .env criado!
) else (
    echo [OK] Arquivo .env ja existe!
)
echo.

echo ========================================
echo    INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Para iniciar o projeto, execute:
echo    npm run dev
echo.
echo Ou simplesmente clique em: EXECUTAR.bat
echo.
pause
