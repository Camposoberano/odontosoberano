param([string]$OutputFile = "tests\visual-grid.html")

$screenshots_dir = "tests\screenshots"
$devices = @(
    @{ name = "iPhone";  label = "iPhone 14";      icon = "" },
    @{ name = "Android"; label = "Android (Pixel 7)"; icon = "" },
    @{ name = "Safari";  label = "Safari Desktop";  icon = "" },
    @{ name = "Opera";   label = "Opera";           icon = "" },
    @{ name = "Chrome";  label = "Chrome";          icon = "" },
    @{ name = "MacBook"; label = "MacBook (Safari)"; icon = "" }
)

$cards = ""
foreach ($d in $devices) {
    $file = "$screenshots_dir\$($d.name)-login.png"
    if (Test-Path $file) {
        $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $file))
        $b64 = [Convert]::ToBase64String($bytes)
        $src = "data:image/png;base64,$b64"
        $status = "<span class='badge pass'>OK</span>"
    } else {
        $src = ""
        $status = "<span class='badge missing'>Sem screenshot</span>"
    }

    $img = if ($src) { "<img src='$src' alt='$($d.label)' />" } else { "<div class='no-img'>Rode os testes primeiro</div>" }

    $cards += @"
    <div class="card">
      <div class="card-header">
        <span class="device-label">$($d.label)</span>
        $status
      </div>
      $img
    </div>
"@
}

$timestamp = Get-Date -Format "dd/MM/yyyy HH:mm"

$html = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Instituto Belem — Visual Grid</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f0f0f; color: #fff; padding: 24px; }
    h1 { text-align: center; color: #f8cc72; font-size: 1.5rem; margin-bottom: 4px; }
    .subtitle { text-align: center; color: #888; font-size: 0.85rem; margin-bottom: 28px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 1400px; margin: 0 auto; }
    @media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
    .card { background: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a; }
    .card-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #111; border-bottom: 1px solid #2a2a2a; }
    .device-label { font-weight: 600; font-size: 0.9rem; color: #f8cc72; }
    .badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 99px; font-weight: 700; }
    .badge.pass { background: #16a34a22; color: #4ade80; border: 1px solid #16a34a44; }
    .badge.missing { background: #92400e22; color: #fb923c; border: 1px solid #92400e44; }
    .card img { width: 100%; display: block; }
    .no-img { height: 200px; display: flex; align-items: center; justify-content: center; color: #555; font-size: 0.8rem; }
    footer { text-align: center; margin-top: 24px; color: #444; font-size: 0.75rem; }
  </style>
</head>
<body>
  <h1>Instituto Belem — Visual Grid</h1>
  <p class="subtitle">Gerado em $timestamp &nbsp;|&nbsp; 6 ambientes</p>
  <div class="grid">
    $cards
  </div>
  <footer>Gerado por Playwright · npm run test:visual</footer>
</body>
</html>
"@

$html | Out-File -FilePath $OutputFile -Encoding UTF8
Write-Host "Viewer gerado: $OutputFile" -ForegroundColor Green
Start-Process $OutputFile
