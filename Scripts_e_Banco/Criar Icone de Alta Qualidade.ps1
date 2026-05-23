# Script para criar ícone de alta qualidade do Odonto PRO
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ODONTO PRO - CAMPO SOBERANO" -ForegroundColor Cyan
Write-Host "  Criar Icone de Alta Qualidade" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$svgPath = Join-Path $scriptDir "assets\logo.svg"
$outputPath = Join-Path $scriptDir "public\odonto-pro-icon.ico"

Write-Host "[INFO] Verificando arquivos..." -ForegroundColor Yellow

if (-not (Test-Path $svgPath)) {
    Write-Host "[ERRO] Logo SVG nao encontrado em: $svgPath" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[OK] Logo SVG encontrado" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] Para criar um icone .ico de alta qualidade," -ForegroundColor Yellow
Write-Host "       recomendamos usar ferramentas online:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Acesse: https://cloudconvert.com/svg-to-ico" -ForegroundColor Cyan
Write-Host "  2. Ou: https://convertio.co/pt/svg-ico/" -ForegroundColor Cyan
Write-Host "  3. Ou: https://anyconv.com/pt/conversor-de-svg-para-ico/" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. Faca upload do arquivo:" -ForegroundColor White
Write-Host "     $svgPath" -ForegroundColor Green
Write-Host ""
Write-Host "  5. Baixe o .ico gerado" -ForegroundColor White
Write-Host ""
Write-Host "  6. Salve como:" -ForegroundColor White
Write-Host "     $outputPath" -ForegroundColor Green
Write-Host ""
Write-Host "Alternativamente, o sistema ja possui um favicon.ico" -ForegroundColor Yellow
Write-Host "funcional na pasta public\" -ForegroundColor Yellow
Write-Host ""
Write-Host "Deseja abrir o logo SVG? (S/N): " -ForegroundColor Cyan -NoNewline
$response = Read-Host

if ($response -eq 'S' -or $response -eq 's') {
    Start-Process $svgPath
    Write-Host ""
    Write-Host "[OK] Logo SVG aberto!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
