# GamerDrift CI/CD Automation Setup
# Configures automatic commit, push, and deployment

param(
    [switch]$EnableWatcher = $false,
    [switch]$TestMode = $false
)

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "GamerDrift CI/CD Automation Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if running as Admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

Write-Host "Step 1: Git Configuration" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray

# Check git installation
$gitVersion = git --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git not installed" -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Cyan
    exit 1
}

Write-Host "✓ Git detected: $gitVersion" -ForegroundColor Green

# Check git status
$gitStatus = git status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not a git repository" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Git repository initialized" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Configure Git Hooks" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray

# Make hooks executable (Windows PowerShell)
$hookFiles = @(".\.git\hooks\pre-commit", ".\.git\hooks\post-commit")

foreach ($hook in $hookFiles) {
    if (Test-Path $hook) {
        Write-Host "✓ Hook found: $hook" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Hook not found: $hook (will be created)" -ForegroundColor Yellow
    }
}

Write-Host ""

Write-Host "Step 3: GitHub Pages Configuration" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray

# Check CNAME
if (Test-Path "CNAME") {
    $cname = Get-Content "CNAME" -Raw
    Write-Host "✓ CNAME configured: $cname" -ForegroundColor Green
} else {
    Write-Host "⚠️ CNAME not found (optional)" -ForegroundColor Yellow
}

# Check GitHub Actions workflow
if (Test-Path ".\.github\workflows\deploy.yml") {
    Write-Host "✓ GitHub Actions workflow found" -ForegroundColor Green
} else {
    Write-Host "⚠️ GitHub Actions workflow not configured" -ForegroundColor Yellow
}

Write-Host ""

Write-Host "Step 4: Setup Options" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "Choose your automation level:" -ForegroundColor Cyan
Write-Host "  1) Manual (push when you want)" -ForegroundColor Gray
Write-Host "  2) Auto-Watcher (auto-commit every 5 min)" -ForegroundColor Gray
Write-Host "  3) GitHub Actions Only (deploy on push)" -ForegroundColor Gray
Write-Host "  4) Full Auto (all of the above)" -ForegroundColor Gray
Write-Host ""

if ($TestMode) {
    $choice = "4"
    Write-Host "Test mode: Selected option 4 (Full Auto)" -ForegroundColor Yellow
} else {
    $choice = Read-Host "Enter your choice (1-4)"
}

Write-Host ""

switch ($choice) {
    "1" {
        Write-Host "Manual Mode Selected" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now:" -ForegroundColor Cyan
        Write-Host "  • Edit files in VS Code" -ForegroundColor Gray
        Write-Host "  • Manually commit: git add . && git commit -m 'message'" -ForegroundColor Gray
        Write-Host "  • Manually push: git push origin main" -ForegroundColor Gray
        Write-Host "  • Deployment happens automatically on GitHub" -ForegroundColor Gray
    }
    "2" {
        Write-Host "Auto-Watcher Mode Selected" -ForegroundColor Green
        Write-Host ""
        Write-Host "Starting auto-commit watcher..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "This will:" -ForegroundColor Cyan
        Write-Host "  ✓ Monitor files every 5 minutes" -ForegroundColor Gray
        Write-Host "  ✓ Auto-commit changes with timestamp" -ForegroundColor Gray
        Write-Host "  ✓ Auto-push to GitHub" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Press Ctrl+C in the watcher window to stop" -ForegroundColor Yellow
        Write-Host ""
        
        # Start watcher in new window
        Start-Process powershell -ArgumentList "-NoExit", "-File", "auto-commit-watch.ps1"
        Write-Host "✓ Auto-watcher started in new window" -ForegroundColor Green
    }
    "3" {
        Write-Host "GitHub Actions Only Mode Selected" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now:" -ForegroundColor Cyan
        Write-Host "  • Edit files in VS Code" -ForegroundColor Gray
        Write-Host "  • Commit locally: git add . && git commit -m 'message'" -ForegroundColor Gray
        Write-Host "  • Push to GitHub: git push origin main" -ForegroundColor Gray
        Write-Host "  • Deployment happens automatically on GitHub" -ForegroundColor Gray
    }
    "4" {
        Write-Host "Full Automation Mode Selected" -ForegroundColor Green
        Write-Host ""
        Write-Host "Setting up complete CI/CD pipeline..." -ForegroundColor Cyan
        Write-Host ""
        
        # Enable all features
        Write-Host "Step 5: Creating Scheduled Tasks" -ForegroundColor Yellow
        Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray
        
        if ($isAdmin) {
            Write-Host "Admin privileges detected - setting up scheduled tasks" -ForegroundColor Green
            
            # Create auto-watcher task
            $taskName = "GamerDrift Auto-Commit Watcher"
            $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
            
            if ($existingTask) {
                Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
                Start-Sleep -Seconds 1
            }
            
            $trigger = New-ScheduledTaskTrigger -AtStartup
            $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -File `"$(Get-Location)\auto-commit-watch.ps1`""
            $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest
            $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
            
            Register-ScheduledTask -TaskName $taskName -Trigger $trigger -Action $action -Principal $principal -Settings $settings -Force | Out-Null
            
            Write-Host "✓ Scheduled task created: $taskName" -ForegroundColor Green
            Write-Host "  Will auto-start on system boot" -ForegroundColor Gray
        } else {
            Write-Host "⚠️ Admin privileges not detected" -ForegroundColor Yellow
            Write-Host "Skipping scheduled task setup" -ForegroundColor Gray
            Write-Host ""
            Write-Host "To enable full automation, run PowerShell as Administrator:" -ForegroundColor Cyan
            Write-Host "  .\Setup-Automation.ps1" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "Starting auto-watcher now..." -ForegroundColor Cyan
        Write-Host ""
        Start-Process powershell -ArgumentList "-NoExit", "-File", "auto-commit-watch.ps1"
        Write-Host "✓ Auto-watcher started in new window" -ForegroundColor Green
    }
    default {
        Write-Host "Invalid option. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Your GamerDrift workflow:" -ForegroundColor Cyan
Write-Host "  1. Edit files normally in VS Code" -ForegroundColor Gray
Write-Host "  2. Changes are auto-committed and pushed" -ForegroundColor Gray
Write-Host "  3. GitHub Actions deploys automatically" -ForegroundColor Gray
Write-Host "  4. Live website updates within minutes" -ForegroundColor Gray
Write-Host ""

Write-Host "Monitor deployment:" -ForegroundColor Cyan
Write-Host "  → GitHub Actions: https://github.com/gamerdrift/gamerdrift.github.io/actions" -ForegroundColor Gray
Write-Host "  → Live Site: https://gamerdrift.github.io" -ForegroundColor Gray
Write-Host "  → Local logs: Get-Content news_agent.log -Tail 20" -ForegroundColor Gray
Write-Host ""
