@echo off
REM ============================================================
REM 🚀 GamerDrift - Auto-Commit & Push Script (Windows)
REM ============================================================
REM This script automatically commits and pushes changes to GitHub

setlocal enabledelayedexpansion

cls
color 0A
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   🎮 GamerDrift Auto-Commit & Push                     ║
echo ║   Version 1.0                                          ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Navigate to repo directory
cd /d "c:\Users\Vidya\Desktop\gamerdrift.github.io\gamerdrift.github.io"

if errorlevel 1 (
    echo ❌ ERROR: Could not navigate to repository
    pause
    exit /b 1
)

echo 📍 Repository: %cd%
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Git is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ Git found: 
git --version
echo.

REM Check for changes
echo 🔍 Checking for changes...
git status --porcelain >temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if "!STATUS!"=="" (
    echo ℹ️ No changes detected
    echo Working directory is clean
    pause
    exit /b 0
)

echo 📝 Changes detected:
echo !STATUS!
echo.

REM Add all changes
echo ⚙️ Staging changes...
git add .
echo ✅ Changes staged

REM Create commit message
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)

set COMMIT_MSG=🔄 Auto-update: Website changes [%mydate% %mytime%]

REM Commit changes
echo 💾 Committing...
git commit -m "!COMMIT_MSG!"
if errorlevel 1 (
    echo ❌ Commit failed
    pause
    exit /b 1
)
echo ✅ Changes committed

REM Push to GitHub
echo.
echo ⬆️ Pushing to GitHub (main branch)...
git push origin main

if errorlevel 1 (
    echo ❌ Push failed - check your GitHub credentials
    echo 💡 Make sure you have:
    echo    1. GitHub account created
    echo    2. Repository created: gamerdrift.github.io
    echo    3. Git credentials configured
    pause
    exit /b 1
)

echo ✅ Successfully pushed to GitHub!
echo.

REM Show commit log
echo 📊 Recent Commits:
git log --oneline -3
echo.

REM Show website status
echo 🌐 Website Status:
echo    Repository: gamerdrift.github.io
echo    Branch: main
echo    Live URL: https://gamerdrift.github.io
echo.

echo ✅ Auto-commit complete!
echo 🎉 Your changes are now live on GitHub Pages!
echo.
pause
