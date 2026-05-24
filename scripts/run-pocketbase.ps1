$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$PbDir = Join-Path $Root "pocketbase"
$BinDir = Join-Path $PbDir "bin"
$Exe = Join-Path $BinDir "pocketbase.exe"

if (-not (Test-Path $Exe)) {
  Write-Host "Скачайте pocketbase.exe в pocketbase/bin/ с https://pocketbase.io/docs/"
  Write-Host "Ожидается: $Exe"
  exit 1
}

Push-Location $PbDir
try {
  # CORS: по умолчанию * (все origins). На VPS: --origins=https://домен.ru
  & $Exe serve --http=127.0.0.1:8090
} finally {
  Pop-Location
}
