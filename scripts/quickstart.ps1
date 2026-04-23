# quickstart.ps1 - one-time setup on Windows
# Run from anywhere in PowerShell:
#   & C:\Users\geron\Projects\detox-project\scripts\quickstart.ps1

$ErrorActionPreference = "Stop"

# Always run from the project root (one level up from this script).
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot
Write-Host "Project root: $ProjectRoot" -ForegroundColor DarkGray

function Require-Cmd {
  param([string]$Name, [string]$Hint)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) {
    Write-Host ""
    Write-Host "ERROR: '$Name' is not on PATH." -ForegroundColor Red
    Write-Host $Hint -ForegroundColor Yellow
    exit 1
  }
}

Write-Host ""
Write-Host "==> 0/4 Checking prerequisites..." -ForegroundColor Cyan
Require-Cmd "node" "Install Node.js 20+ from https://nodejs.org/ (or run: winget install OpenJS.NodeJS.LTS)"
Require-Cmd "npm"  "npm ships with Node.js. Reinstall Node from https://nodejs.org/"
Require-Cmd "git"  "Install Git for Windows: 'winget install --id Git.Git -e --source winget' OR download from https://git-scm.com/download/win . After install, OPEN A NEW PowerShell window so PATH refreshes."

$nodeVersion = (node --version)
$npmVersion  = (npm --version)
$gitVersion  = (git --version)
Write-Host ("  node {0} | npm {1} | {2}" -f $nodeVersion, $npmVersion, $gitVersion) -ForegroundColor DarkGray

Write-Host ""
Write-Host "==> 1/4 Installing npm dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "==> 2/4 Initialising git..." -ForegroundColor Cyan
if (-not (Test-Path .git)) {
  git init
  git branch -M main
}
$existing = git remote 2>$null
if ($existing -contains "origin") {
  git remote remove origin
}
git remote add origin https://github.com/ZdorMak/detox-project.git
Write-Host "  remote 'origin' = https://github.com/ZdorMak/detox-project.git" -ForegroundColor DarkGray

Write-Host ""
Write-Host "==> 3/4 Initial commit..." -ForegroundColor Cyan
git add .
$staged = git diff --cached --name-only
if ([string]::IsNullOrWhiteSpace($staged)) {
  Write-Host "  nothing to commit (already committed)" -ForegroundColor DarkGray
} else {
  $commitMsg = "chore: initial Next.js setup with Supabase, i18n, GDPR banner, landing page"
  git commit -m $commitMsg
}

Write-Host ""
Write-Host "==> 4/4 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "  If this fails:" -ForegroundColor DarkGray
Write-Host "    - ensure the repo EXISTS at https://github.com/ZdorMak/detox-project (private is fine)" -ForegroundColor DarkGray
Write-Host "    - authenticate via 'gh auth login' OR set up a PAT in Windows Credential Manager" -ForegroundColor DarkGray
git push -u origin main

Write-Host ""
Write-Host "All done." -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "  1. Paste SUPABASE_SERVICE_ROLE_KEY into .env.local"
Write-Host "     (Supabase Dashboard -> Project Settings -> API -> service_role)"
Write-Host "  2. npm run dev   then open http://localhost:3000"
Write-Host "  3. Connect repo at https://vercel.com/new for auto-deploy"
Write-Host "  4. (optional) bash scripts/file-backlog-issues.sh   to file Week 2-5 issues"
