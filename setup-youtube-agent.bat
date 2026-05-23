@echo off
REM GamerDrift YouTube Agent Scheduler
REM Run this as Administrator to schedule automatic YouTube updates
REM Usage: Run this batch file once, then it will execute youtube-agent.py every hour

echo.
echo ====================================
echo GamerDrift YouTube Agent - Setup
echo ====================================
echo.

REM Check for Admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script requires Administrator privileges.
    echo Please right-click this file and choose "Run as administrator".
    echo.
    pause
    exit /b 1
)

echo [✓] Running as Administrator
echo.

REM Launch the PowerShell Setup Script
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Setup-YouTubeAgent.ps1"

if %errorLevel% neq 0 (
    echo.
    echo WARNING: PowerShell setup returned an error.
    echo.
    pause
    exit /b 1
)

echo.
echo Setup batch completed.
echo.
pause
