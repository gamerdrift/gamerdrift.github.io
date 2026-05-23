# GamerDrift YouTube Agent - PowerShell Setup
# Run this script as Administrator: Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
# Then: .\Setup-YouTubeAgent.ps1

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "GamerDrift YouTube Agent - Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "[!] This script requires Administrator privileges" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Running as Administrator" -ForegroundColor Green
Write-Host ""

# Locate Python
$pythonPath = "C:\ProgramData\Anaconda3\python.exe"
if (-not (Test-Path $pythonPath)) {
    Write-Host "[ERROR] Anaconda Python was not found at $pythonPath" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Python detected: $pythonPath" -ForegroundColor Green

# Get script path
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonScript = Join-Path $scriptPath "youtube-agent.py"

Write-Host "Script path: $pythonScript" -ForegroundColor Cyan
Write-Host ""

# Create scheduled task
Write-Host "Setting up Windows Task Scheduler..."
Write-Host ""

# Delete existing task
$taskName = "GamerDrift YouTube Agent"
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Removing existing task..."
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false | Out-Null
    Start-Sleep -Seconds 2
}

# Create task trigger (every 1 hour)
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 10950)

# Format the arguments string safely using -f to avoid escape-sequence issues
$actionArgs = '-NoProfile -WindowStyle Hidden -Command "$env:PATH = ''C:\ProgramData\Anaconda3\Library\bin;'' + $env:PATH; & ''{0}'' ''{1}''"' -f $pythonPath, $pythonScript

# Create task action
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument $actionArgs `
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

Write-Host "[OK] Scheduled task created successfully!" -ForegroundColor Green
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
Write-Host "Would you like to run the YouTube agent now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Running YouTube agent..." -ForegroundColor Cyan
    Write-Host ""
    $env:PATH = "C:\ProgramData\Anaconda3\Library\bin;" + $env:PATH
    & $pythonPath "$pythonScript"
    Write-Host ""
}

Write-Host "Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "The YouTube agent will run automatically every 1 hour." -ForegroundColor Cyan
Write-Host ""
Write-Host "To manage the task:" -ForegroundColor Cyan
Write-Host "  - Open Task Scheduler (taskschd.msc)" -ForegroundColor Gray
Write-Host "  - Look for 'GamerDrift YouTube Agent'" -ForegroundColor Gray
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Cyan
Write-Host "  - Get-Content youtube_agent.log -Tail 20" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop the task:" -ForegroundColor Cyan
Write-Host "  - Stop-ScheduledTask -TaskName 'GamerDrift YouTube Agent'" -ForegroundColor Gray
Write-Host ""
