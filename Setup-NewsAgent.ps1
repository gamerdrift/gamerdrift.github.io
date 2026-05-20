# GamerDrift News Agent - PowerShell Setup
# Run this script as Administrator: Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
# Then: .\Setup-NewsAgent.ps1

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "GamerDrift News Agent - Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "[!] This script requires Administrator privileges" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "[✓] Running as Administrator" -ForegroundColor Green
Write-Host ""

# Check Python installation
Write-Host "Checking Python installation..."
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "[✓] Python detected: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Install required packages
Write-Host "Installing required Python packages..."
python -m pip install requests --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Failed to install requests package" -ForegroundColor Red
    exit 1
}

Write-Host "[✓] Dependencies installed" -ForegroundColor Green
Write-Host ""

# Get script path
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonScript = Join-Path $scriptPath "news-agent.py"

Write-Host "Script path: $pythonScript" -ForegroundColor Cyan
Write-Host ""

# Create scheduled task
Write-Host "Setting up Windows Task Scheduler..."
Write-Host ""

# Delete existing task
$taskName = "GamerDrift News Agent"
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Removing existing task..."
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false | Out-Null
    Start-Sleep -Seconds 2
}

# Create task trigger (every 5 minutes)
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 10950)

# Create task action
$action = New-ScheduledTaskAction `
    -Execute "python.exe" `
    -Argument "`"$pythonScript`"" `
    -WorkingDirectory $scriptPath

# Register task with high privileges
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

Register-ScheduledTask `
    -TaskName $taskName `
    -Trigger $trigger `
    -Action $action `
    -Principal $principal `
    -Settings $settings `
    -Force | Out-Null

Write-Host "[✓] Scheduled task created successfully!" -ForegroundColor Green
Write-Host ""

# Verify task creation
$verifyTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($verifyTask) {
    Write-Host "Task Details:" -ForegroundColor Cyan
    Write-Host "  Name: $($verifyTask.TaskName)" -ForegroundColor Gray
    Write-Host "  State: $($verifyTask.State)" -ForegroundColor Gray
    Write-Host "  Path: $($verifyTask.TaskPath)" -ForegroundColor Gray
    Write-Host ""
}

# Manual test run option
Write-Host "Would you like to run the news agent now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Running news agent..." -ForegroundColor Cyan
    Write-Host ""
    & python "$pythonScript"
    Write-Host ""
}

Write-Host "Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "The news agent will run automatically every 5 minutes." -ForegroundColor Cyan
Write-Host ""
Write-Host "To manage the task:" -ForegroundColor Cyan
Write-Host "  - Open Task Scheduler (taskmgr)" -ForegroundColor Gray
Write-Host "  - Look for 'GamerDrift News Agent'" -ForegroundColor Gray
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Cyan
Write-Host "  - Get-Content news_agent.log -Tail 20" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop the task:" -ForegroundColor Cyan
Write-Host "  - Stop-ScheduledTask -TaskName 'GamerDrift News Agent'" -ForegroundColor Gray
Write-Host ""
