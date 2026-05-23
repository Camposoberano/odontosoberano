# Script PowerShell para preparar projeto para transferência
# Encoding: UTF-8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PREPARAR ODONTO PRO PARA TRANSFERÊNCIA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Este script irá:" -ForegroundColor Yellow
Write-Host "  1. Criar um arquivo .zip com os arquivos necessários"
Write-Host "  2. Excluir node_modules, dist, .env e outros arquivos temporários"
Write-Host "  3. Manter apenas o essencial para transferência"
Write-Host ""

$confirm = Read-Host "Deseja continuar? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Cancelado pelo usuário." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit
}

Write-Host ""
Write-Host "📦 Criando arquivo de transferência..." -ForegroundColor Green
Write-Host ""

$dataAtual = Get-Date -Format "yyyyMMdd"
$arquivoSaida = "Odonto_PRO_Transferencia_$dataAtual.zip"

# Diretório atual
$pastaOrigem = $PSScriptRoot

# Criar pasta temporária
$pastaTemp = Join-Path $env:TEMP "OdontoPRO_Temp"
if (Test-Path $pastaTemp) {
    Remove-Item $pastaTemp -Recurse -Force
}
New-Item -ItemType Directory -Path $pastaTemp | Out-Null

Write-Host "📁 Copiando arquivos necessários..." -ForegroundColor Cyan

# Copiar todos os arquivos exceto os excluídos
$excluir = @(
    'node_modules',
    'dist',
    'dist-ssr',
    '.env',
    '*.log',
    '.vscode',
    '.idea',
    '*.tmp',
    '*.temp',
    '.git',
    $arquivoSaida
)

Get-ChildItem -Path $pastaOrigem | Where-Object {
    $item = $_
    $shouldExclude = $false

    foreach ($pattern in $excluir) {
        if ($item.Name -like $pattern) {
            $shouldExclude = $true
            break
        }
    }

    -not $shouldExclude
} | ForEach-Object {
    $destino = Join-Path $pastaTemp $_.Name
    Copy-Item $_.FullName -Destination $destino -Recurse -Force
    Write-Host "  ✓ $($_.Name)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🗜️ Compactando..." -ForegroundColor Cyan

# Compactar usando .NET
$arquivoZipCompleto = Join-Path $pastaOrigem $arquivoSaida

if (Test-Path $arquivoZipCompleto) {
    Remove-Item $arquivoZipCompleto -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($pastaTemp, $arquivoZipCompleto)

# Limpar pasta temporária
Remove-Item $pastaTemp -Recurse -Force

Write-Host ""
Write-Host "✅ Arquivo criado com sucesso!" -ForegroundColor Green
Write-Host ""

$arquivo = Get-Item $arquivoZipCompleto
$tamanhoMB = [math]::Round($arquivo.Length / 1MB, 2)

Write-Host "📁 Arquivo: $arquivoSaida" -ForegroundColor Cyan
Write-Host "📊 Tamanho: $tamanhoMB MB" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRÓXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Copie o arquivo $arquivoSaida" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. No computador de destino:" -ForegroundColor Yellow
Write-Host "   - Descompacte o arquivo"
Write-Host "   - Crie o arquivo .env (use .env.example como referência)"
Write-Host "   - Execute: npm install"
Write-Host "   - Execute: npm run dev"
Write-Host ""
Write-Host "3. Para VPS, consulte: GUIA_TRANSFERENCIA.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Pronto para transferir!" -ForegroundColor Green
Write-Host ""

Read-Host "Pressione Enter para sair"
