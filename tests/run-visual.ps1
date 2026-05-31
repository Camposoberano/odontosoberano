param([string]$Url = "")

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Instituto Belem - Visual Grid (6 telas)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($Url) {
    $env:PLAYWRIGHT_BASE_URL = $Url
    Write-Host "Target: $Url" -ForegroundColor Yellow
} else {
    Write-Host "Target: http://localhost:8081/belem/ (dev)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[1/2] Capturando screenshots nos 6 ambientes..." -ForegroundColor White

npx playwright test tests/e2e/visual-grid.spec.ts --project=iPhone --project=Android --project=Safari --project=Opera --project=Chrome --project=MacBook

Write-Host ""
Write-Host "[2/2] Gerando viewer HTML..." -ForegroundColor White

powershell -ExecutionPolicy Bypass -File tests/generate-viewer.ps1

Write-Host ""
Write-Host "Pronto! Grade visual aberta no browser." -ForegroundColor Green
