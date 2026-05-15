@echo off
title Odonto PRO - Inicializacao Automatica
color 0B
chcp 65001 >nul

echo ===================================================
echo             ODONTO PRO - SISTEMA ON
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/4] Verificando dependencias essenciais do sistema...
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERRO CRITICO] Node.js nao encontrado neste computador!
    echo O sistema precisa do Node.js para rodar.
    echo Baixe e instale a versao LTS em: https://nodejs.org/
    echo.
    pause
    exit /b
)

echo [2/4] Verificando integridade da pasta (node_modules)...
if not exist "node_modules\" (
    echo.
    echo Percebi que voce acabou de baixar ou mover o projeto.
    echo Restaurando o sistema pela primeira vez... Isso pode levar 2 minutinhos.
    echo Por favor, aguarde...
    call npm install >nul 2>&1
    echo Dependencias restauradas com sucesso!
    echo.
) else (
    echo Tudo OK!
)

echo [3/4] Ligando o Motor do Sistema (Servidor de Desenvolvimento)...
start "Motor Odonto PRO" /MIN cmd /c "npm run dev"

echo [4/4] Aguardando os motores aquecerem (6 segundos)...
timeout /t 6 /nobreak >nul

echo.
echo ===================================================
echo SISTEMA PRONTO PARA USO!
echo ===================================================
echo.
echo Abrindo o navegador... Se nao abrir sozinho, acesse:
echo http://localhost:8080/orto/
echo.
echo [ATENCAO] NAO FECHE A JANELINHA PRETA MINIMIZADA!
echo Ela e o motor do sistema. Quando quiser desligar, feche-a.
echo.

start http://localhost:8080/orto/

echo Pressione qualquer tecla para fechar este assistente...
pause >nul
