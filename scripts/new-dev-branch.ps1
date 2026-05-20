# Создаёт следующую ветку dev-0.N от актуальной dev
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot + "\.."

git checkout dev
git pull origin dev

$numbers = git branch -a | ForEach-Object {
  if ($_ -match 'dev-0\.(\d+)') { [int]$Matches[1] }
} | Where-Object { $_ -ne $null }

$next = if ($numbers) { ($numbers | Measure-Object -Maximum).Maximum + 1 } else { 2 }
$name = "dev-0.$next"

git checkout -b $name
Write-Host "Ветка $name создана от dev. Работайте здесь, затем PR в dev."
