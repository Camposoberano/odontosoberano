param(
    [string]$Url = "",
    [string]$Project = ""
)

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Instituto Belem - Cross-Browser Dashboard" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($Url) {
    $env:PLAYWRIGHT_BASE_URL = $Url
    Write-Host "Target: $Url" -ForegroundColor Yellow
} else {
    Write-Host "Target: http://localhost:8081/belem/ (dev)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Browsers: Chrome | Firefox | Safari(WebKit) | Edge" -ForegroundColor Green
Write-Host "Mobile:   iPhone 14 | Pixel 7 | iPad Pro" -ForegroundColor Green
Write-Host ""
Write-Host "Rodando testes..." -ForegroundColor White
Write-Host ""

if ($Project) {
    Write-Host "Projeto filtrado: $Project" -ForegroundColor Magenta
    npx playwright test --project=$Project
} else {
    npx playwright test
}

$exit_code = $LASTEXITCODE

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
if ($exit_code -eq 0) {
    Write-Host "  TODOS OS TESTES PASSARAM" -ForegroundColor Green
} else {
    Write-Host "  FALHAS DETECTADAS - veja o relatorio" -ForegroundColor Red
}
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Abrindo relatorio visual..." -ForegroundColor White

npx playwright show-report

exit $exit_code
