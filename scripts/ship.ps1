# ship.ps1 — one-line push helper
# Usage:
#   & C:\Users\geron\OneDrive - DIVTEC\Projects\detox-project\scripts\ship.ps1 "your commit message"
#
# What it does:
#   1. cd to project root (auto, doesn't matter where you call from)
#   2. git add .
#   3. git commit -m "<message>" (skips if nothing staged)
#   4. git push
#   5. Prints the live URLs to check after Vercel rebuilds (~2 min)

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Message
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

Write-Host ""
Write-Host "==> Staging changes..." -ForegroundColor Cyan
git add .

$staged = git diff --cached --name-only
if ([string]::IsNullOrWhiteSpace($staged)) {
  Write-Host "  nothing to commit. Pushing existing HEAD anyway." -ForegroundColor DarkGray
} else {
  Write-Host "  staged files:" -ForegroundColor DarkGray
  $staged -split "`n" | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }

  Write-Host ""
  Write-Host "==> Committing..." -ForegroundColor Cyan
  git commit -m $Message
}

Write-Host ""
Write-Host "==> Pushing to origin/main..." -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "Done. Vercel will rebuild in ~10 seconds and deploy in ~2 min." -ForegroundColor Green
Write-Host ""
Write-Host "Check it:" -ForegroundColor Green
Write-Host "  https://vercel.com/dashboard           - watch the build" -ForegroundColor DarkGray
Write-Host "  https://detox-project.vercel.app       - live site" -ForegroundColor DarkGray
Write-Host "  https://detox-project.vercel.app/jeu   - challenge game" -ForegroundColor DarkGray
Write-Host "  https://detox-project.vercel.app/experience" -ForegroundColor DarkGray
Write-Host "  https://detox-project.vercel.app/survey" -ForegroundColor DarkGray
