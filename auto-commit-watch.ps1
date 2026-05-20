# GamerDrift Auto-Commit Watcher (PowerShell)
# Monitors for file changes and auto-commits every 5 minutes
# Usage: powershell -File auto-commit-watch.ps1

param(
    [int]$IntervalSeconds = 300  # Default: 5 minutes
)

$RepoPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoPath

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "GamerDrift Auto-Commit Watcher" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Repository: $RepoPath" -ForegroundColor Gray
Write-Host "Interval: $IntervalSeconds seconds" -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$lastStatus = ""

while ($true) {
    Start-Sleep -Seconds $IntervalSeconds
    
    # Get git status
    $gitStatus = git status --porcelain 2>$null
    $currentStatus = $gitStatus | Out-String
    
    if ($currentStatus -and $currentStatus -ne $lastStatus) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] 📝 Changes detected - Auto-committing..." -ForegroundColor Yellow
        
        # Add all changes
        git add -A 2>$null
        
        # Commit with timestamp
        $commitOutput = git commit -m "Auto-commit: $timestamp" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[$timestamp] ✅ Committed successfully" -ForegroundColor Green
            $lastStatus = $currentStatus
        } else {
            Write-Host "[$timestamp] ℹ️ Nothing to commit" -ForegroundColor Gray
        }
    } else {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] ✓ No changes detected" -ForegroundColor Gray
    }
}
