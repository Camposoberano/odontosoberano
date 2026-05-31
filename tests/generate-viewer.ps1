param([string]$OutputFile = "tests\visual-grid.html")

$screenshots_dir = "tests\screenshots"
$devices = @("iPhone", "Android", "Safari", "Opera", "Chrome", "MacBook")
$labels  = @{
  "iPhone"  = "iPhone 14"
  "Android" = "Android (Pixel 7)"
  "Safari"  = "Safari Desktop"
  "Opera"   = "Opera"
  "Chrome"  = "Chrome"
  "MacBook" = "MacBook / Safari"
}
$pages = @(
  @{ key = "login";     title = "Tela de Login" },
  @{ key = "dashboard"; title = "Dashboard" }
)

$timestamp = Get-Date -Format "dd/MM/yyyy HH:mm"

# Monta blocos de secao
$sections_html = ""
foreach ($pg in $pages) {
  $cells_html = ""
  foreach ($dev in $devices) {
    $file = "$screenshots_dir\${dev}-$($pg.key).png"
    $rel  = "screenshots/${dev}-$($pg.key).png"
    if (Test-Path $file) {
      $img_html = "<img src=`"$rel`" alt=`"$dev`" />"
      $badge_html = "<span class=`"ok`">OK</span>"
    } else {
      $img_html = "<div class=`"empty`">sem screenshot</div>"
      $badge_html = "<span class=`"miss`">pendente</span>"
    }
    $cells_html += "
      <div class=`"card`">
        <div class=`"card-top`">
          <span class=`"dev-name`">$($labels[$dev])</span>
          $badge_html
        </div>
        $img_html
      </div>"
  }
  $sections_html += "
    <h2>$($pg.title)</h2>
    <div class=`"grid`">$cells_html</div>"
}

$html = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Instituto Belem - Visual Grid</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:#111;color:#fff;padding:20px}
  h1{text-align:center;color:#f8cc72;font-size:1.4rem;margin-bottom:4px}
  .sub{text-align:center;color:#666;font-size:.8rem;margin-bottom:24px}
  h2{color:#f8cc72;font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin:28px 0 10px;max-width:1360px;margin-left:auto;margin-right:auto}
  .grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;max-width:1360px;margin:0 auto}
  @media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:640px){.grid{grid-template-columns:repeat(2,1fr)}}
  .card{background:#1c1c1c;border:1px solid #2a2a2a;border-radius:10px;overflow:hidden}
  .card-top{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#161616;border-bottom:1px solid #222}
  .dev-name{font-size:.75rem;font-weight:600;color:#f8cc72}
  .ok{font-size:.65rem;padding:2px 7px;border-radius:99px;background:#16a34a22;color:#4ade80;border:1px solid #16a34a55;font-weight:700}
  .miss{font-size:.65rem;padding:2px 7px;border-radius:99px;background:#92400e22;color:#fb923c;border:1px solid #92400e55;font-weight:700}
  .card img{width:100%;display:block}
  .empty{height:130px;display:flex;align-items:center;justify-content:center;color:#444;font-size:.75rem}
  footer{text-align:center;margin-top:28px;color:#333;font-size:.7rem}
</style>
</head>
<body>
  <h1>Instituto Belem - Visual Grid</h1>
  <p class="sub">Gerado em $timestamp | 6 browsers x 2 telas</p>
  $sections_html
  <footer>Playwright - npm run test:visual</footer>
</body>
</html>
"@

[System.IO.File]::WriteAllText(
  (Join-Path (Get-Location) $OutputFile),
  $html,
  [System.Text.Encoding]::UTF8
)

Write-Host "Viewer gerado: $OutputFile" -ForegroundColor Green
Start-Process (Join-Path (Get-Location) $OutputFile)
