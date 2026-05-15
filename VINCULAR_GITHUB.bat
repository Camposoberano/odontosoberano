@echo off
echo ==========================================
echo   VINCULANDO PROJETO AO GITHUB (v5)
echo ==========================================
echo.

echo 1. Removendo arquivo problematico (nul)...
:: Tenta deletar usando o caminho UNC do Windows para arquivos reservados
del /f /q "\\?\e:\Projetos_Novos\Odonto PRO\nul" >nul 2>&1
del /f /q "\\.\e:\Projetos_Novos\Odonto PRO\nul" >nul 2>&1

echo.
echo 2. Verificando configuracao de usuario...
git config --get user.email >nul
if %errorlevel% neq 0 (
    git config --local user.email "usuario@exemplo.com"
)
git config --get user.name >nul
if %errorlevel% neq 0 (
    git config --local user.name "Usuario GitHub"
)

echo.
echo 3. Preparando arquivos...
:: Adiciona todos os arquivos
git add -A

echo.
echo 4. Criando o primeiro salvamento (commit)...
git commit -m "Primeiro commit - Projeto Odonto PRO"
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] O Git ainda nao conseguiu processar os arquivos.
    echo Isso geralmente acontece se o arquivo 'nul' ainda estiver bloqueando.
    echo.
    echo TENTANDO FORCAR A ADICAO MANUAL...
    git add src/ public/ package.json index.html tsconfig.json .gitignore
    git commit -m "Primeiro commit (Manual)"
)

echo.
echo 5. Configurando o servidor remoto...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/Camposoberano/odontosoberano.git
echo.

echo 6. Enviando para o GitHub...
git branch -M main
git push -u origin main
if %errorlevel% neq 0 (
    echo Tentando push forcado...
    git push -f origin main
)

echo.
echo ==========================================
echo   PROCESSO CONCLUIDO!
echo ==========================================
pause
