# ============================================================
# 🚀 GamerDrift - Auto-Commit Setup Script (Windows PowerShell)
# ============================================================
# This script sets up automatic git commits for your website

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🎮 GamerDrift Auto-Commit Setup (Windows)            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Configuration
$REPO_PATH = "c:\Users\Vidya\Desktop\gamerdrift.github.io\gamerdrift.github.io"
$HOOK_DIR = "$REPO_PATH\.git\hooks"

Write-Host "`n📍 Repository Path: $REPO_PATH" -ForegroundColor Yellow

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git for Windows." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git found: $(git --version)" -ForegroundColor Green

# Change to repo directory
Set-Location $REPO_PATH
Write-Host "📂 Working directory: $(Get-Location)" -ForegroundColor Yellow

# Configure git
Write-Host "`n⚙️ Configuring Git..." -ForegroundColor Cyan
git config user.name "Vidya" | Out-Null
git config user.email "vidya@gamerdrift.com" | Out-Null
Write-Host "✅ Git user configured" -ForegroundColor Green

# Create post-save commit script
$POST_SAVE_SCRIPT = @'
@echo off
REM Auto-commit changes when files are saved
cd /d "%~dp0"

REM Check for modified files
git status --porcelain > nul
if errorlevel 1 (
    echo No changes to commit
    exit /b 0
)

REM Get list of modified files
for /f %%F in ('git status --porcelain ^| find "M" ^| wc -l') do set MODIFIED=%%F

if %MODIFIED% gtr 0 (
    echo [%date% %time%] Auto-committing changes...
    git add .
    git commit -m "🔄 Auto-update: Website changes @ %time%"
    git push origin main
    echo ✅ Changes committed and pushed
) else (
    echo No modified files
)
'@

$BATCH_FILE = "$REPO_PATH\auto-commit.bat"
Set-Content -Path $BATCH_FILE -Value $POST_SAVE_SCRIPT
Write-Host "✅ Auto-commit script created: auto-commit.bat" -ForegroundColor Green

# Create PowerShell auto-watch script
$WATCH_SCRIPT = @'
# Auto-commit watch script for GamerDrift
param(
    [int]$IntervalSeconds = 30
)

Write-Host "👁️ Starting auto-commit watcher..." -ForegroundColor Cyan
Write-Host "📝 Will auto-commit every $IntervalSeconds seconds" -ForegroundColor Yellow

$lastCommit = git rev-parse HEAD
$watchPath = Get-Location

while ($true) {
    Start-Sleep -Seconds $IntervalSeconds
    
    # Check for changes
    $status = git status --porcelain
    
    if ($status) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 📝 Changes detected - Auto-committing..." -ForegroundColor Yellow
        
        git add .
        $message = "🔄 Auto-update: Website changes @ $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git commit -m $message | Out-Null
        
        Write-Host "✅ Committed: $message" -ForegroundColor Green
        
        # Push to GitHub
        Write-Host "⬆️ Pushing to GitHub..." -ForegroundColor Cyan
        git push origin main 2>&1 | ForEach-Object {
            if ($_ -match "up to date|master|main") {
                Write-Host "✅ $($_)" -ForegroundColor Green
            }
        }
    }
}
'@

$PS_SCRIPT = "$REPO_PATH\auto-watch.ps1"
Set-Content -Path $PS_SCRIPT -Value $WATCH_SCRIPT
Write-Host "✅ Auto-watch script created: auto-watch.ps1" -ForegroundColor Green

# Display status
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ✅ Setup Complete!                                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📋 Setup Summary:" -ForegroundColor Yellow
Write-Host "   ✅ Git configured" -ForegroundColor Green
Write-Host "   ✅ Auto-commit batch file created" -ForegroundColor Green
Write-Host "   ✅ Auto-watch PowerShell script created" -ForegroundColor Green

Write-Host "`n🚀 How to Use:" -ForegroundColor Cyan
Write-Host "
   Option 1: Manual Auto-Commit (Run when you want)
   ➜ cd $REPO_PATH
   ➜ .\auto-commit.bat

   Option 2: Continuous Auto-Watch (Background monitoring)
   ➜ cd $REPO_PATH
   ➜ powershell -ExecutionPolicy Bypass -File .\auto-watch.ps1

   Option 3: Schedule with Task Scheduler
   ➜ Create a scheduled task to run auto-commit.bat every 5 minutes

   Option 4: GitHub Actions (Automatic)
   ➜ Already setup in .github/workflows/deploy.yml
   ➜ Auto-deploys when you push to GitHub
" -ForegroundColor White

Write-Host "🌐 Your Website:" -ForegroundColor Cyan
Write-Host "   Live at: https://gamerdrift.github.io" -ForegroundColor White
Write-Host "   Updates automatically when you push to GitHub" -ForegroundColor White

Write-Host "`n📝 Recent Commits:" -ForegroundColor Yellow
git log --oneline -3 | ForEach-Object { Write-Host "   $_" -ForegroundColor White }

Write-Host "`n✅ Ready for auto-deployment!" -ForegroundColor Green
'@

$SETUP_PS_FILE = "$REPO_PATH\setup-auto-commit.ps1"
Set-Content -Path $SETUP_PS_FILE -Value $WATCH_SCRIPT
Write-Host "✅ Setup script created: setup-auto-commit.ps1" -ForegroundColor Green

# Show git status
Write-Host "`n📊 Current Repository Status:" -ForegroundColor Cyan
git status

Write-Host "`n✅ Auto-commit setup complete!" -ForegroundColor Green
Write-Host "`n💡 TIP: Run auto-watch.ps1 to start continuous auto-commits" -ForegroundColor Yellow
