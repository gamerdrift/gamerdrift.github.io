@echo off
REM GamerDrift News Agent Scheduler
REM Run this as Administrator to schedule automatic news updates
REM Usage: Run this batch file once, then it will execute news-agent.py every 5 minutes

echo.
echo ====================================
echo GamerDrift News Agent - Setup
echo ====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [✓] Python detected

REM Install required packages
echo.
echo Installing required Python packages...
python -m pip install requests --quiet
if errorlevel 1 (
    echo ERROR: Failed to install requests package
    pause
    exit /b 1
)

echo [✓] Dependencies installed

REM Create scheduled task using Windows Task Scheduler
REM This will run the news agent every 5 minutes
echo.
echo Setting up Windows Task Scheduler...
echo.

REM Get the absolute path to the script
for /f "delims=" %%A in ('cd') do set "SCRIPT_PATH=%%A"
set "PYTHON_SCRIPT=%SCRIPT_PATH%\news-agent.py"

echo Task will execute: python "%PYTHON_SCRIPT%"
echo.

REM Create the scheduled task
REM Note: This requires Admin privileges
taskkill /f /im python.exe 2>nul

REM Delete existing task if it exists
schtasks /delete "GamerDrift News Agent" /f 2>nul

REM Create new scheduled task that runs every 5 minutes
schtasks /create /tn "GamerDrift News Agent" /tr "python \"%PYTHON_SCRIPT%\"" /sc minute /mo 5 /f

if errorlevel 1 (
    echo.
    echo WARNING: Could not create scheduled task
    echo This batch file must be run as Administrator
    echo.
    echo Manual alternative: Run this command in PowerShell (as Administrator):
    echo python "%PYTHON_SCRIPT%"
    echo.
    pause
    exit /b 1
)

echo [✓] Scheduled task created successfully!
echo.
echo The news agent will now run every 5 minutes automatically.
echo.
echo To verify the task:
echo   1. Open Task Scheduler (taskmgr)
echo   2. Look for "GamerDrift News Agent" in the task list
echo.
echo To view logs:
echo   type news_agent.log
echo.
echo To manually run the news agent:
echo   python "%PYTHON_SCRIPT%"
echo.
pause
