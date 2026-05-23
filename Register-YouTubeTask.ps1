# Register-YouTubeTask.ps1
# Registers 'GamerDrift YouTube Agent' Windows Scheduled Task
# Uses current logged-in user - NO elevation / UAC prompt required

$taskName    = "GamerDrift YouTube Agent"
$pythonExe   = "C:\ProgramData\Anaconda3\python.exe"
$scriptDir   = "C:\Users\Vidya\Desktop\gamerdrift.github.io"
$agentScript = Join-Path $scriptDir "youtube-agent.py"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host " GamerDrift YouTube Agent - Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $pythonExe))   { Write-Host "[ERROR] Python not found: $pythonExe" -ForegroundColor Red; exit 1 }
Write-Host "[OK] Python  : $pythonExe" -ForegroundColor Green

if (-not (Test-Path $agentScript)) { Write-Host "[ERROR] Script not found: $agentScript" -ForegroundColor Red; exit 1 }
Write-Host "[OK] Script  : $agentScript" -ForegroundColor Green

$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$startTime   = (Get-Date).AddMinutes(2).ToString("yyyy-MM-ddTHH:mm:ss")

# Build PowerShell -Command value for the task action
# We keep the PATH prepend so Anaconda SSL libs load correctly
# XML special chars: & -> &amp;  ' -> &apos;  " -> &quot;
$psArgs = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command " +
          "&amp; { " +
          "`$env:PATH = &apos;C:\ProgramData\Anaconda3\Library\bin;C:\ProgramData\Anaconda3;&apos; + `$env:PATH; " +
          "&amp; &apos;$pythonExe&apos; &apos;$agentScript&apos; " +
          "}"

Write-Host "[..] Building task XML..." -ForegroundColor Yellow

# NOTE: here-string uses double-quotes so PS variables expand cleanly; we pass
#       the already-escaped $psArgs and $currentUser / $startTime literals.
$taskXml = '<?xml version="1.0" encoding="UTF-16"?>' + [System.Environment]::NewLine +
'<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">' + [System.Environment]::NewLine +
'  <RegistrationInfo>' + [System.Environment]::NewLine +
'    <Description>Fetches latest @gamerdrifttube YouTube videos hourly and updates GamerDrift website slides</Description>' + [System.Environment]::NewLine +
'  </RegistrationInfo>' + [System.Environment]::NewLine +
'  <Triggers>' + [System.Environment]::NewLine +
'    <TimeTrigger>' + [System.Environment]::NewLine +
'      <Repetition>' + [System.Environment]::NewLine +
'        <Interval>PT1H</Interval>' + [System.Environment]::NewLine +
'        <StopAtDurationEnd>false</StopAtDurationEnd>' + [System.Environment]::NewLine +
'      </Repetition>' + [System.Environment]::NewLine +
"      <StartBoundary>$startTime</StartBoundary>" + [System.Environment]::NewLine +
'      <Enabled>true</Enabled>' + [System.Environment]::NewLine +
'    </TimeTrigger>' + [System.Environment]::NewLine +
'  </Triggers>' + [System.Environment]::NewLine +
'  <Principals>' + [System.Environment]::NewLine +
'    <Principal id="Author">' + [System.Environment]::NewLine +
"      <UserId>$currentUser</UserId>" + [System.Environment]::NewLine +
'      <LogonType>InteractiveToken</LogonType>' + [System.Environment]::NewLine +
'      <RunLevel>LeastPrivilege</RunLevel>' + [System.Environment]::NewLine +
'    </Principal>' + [System.Environment]::NewLine +
'  </Principals>' + [System.Environment]::NewLine +
'  <Settings>' + [System.Environment]::NewLine +
'    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>' + [System.Environment]::NewLine +
'    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>' + [System.Environment]::NewLine +
'    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>' + [System.Environment]::NewLine +
'    <AllowHardTerminate>true</AllowHardTerminate>' + [System.Environment]::NewLine +
'    <StartWhenAvailable>true</StartWhenAvailable>' + [System.Environment]::NewLine +
'    <RunOnlyIfNetworkAvailable>true</RunOnlyIfNetworkAvailable>' + [System.Environment]::NewLine +
'    <AllowStartOnDemand>true</AllowStartOnDemand>' + [System.Environment]::NewLine +
'    <Enabled>true</Enabled>' + [System.Environment]::NewLine +
'    <Hidden>false</Hidden>' + [System.Environment]::NewLine +
'    <RunOnlyIfIdle>false</RunOnlyIfIdle>' + [System.Environment]::NewLine +
'    <WakeToRun>false</WakeToRun>' + [System.Environment]::NewLine +
'    <ExecutionTimeLimit>PT5M</ExecutionTimeLimit>' + [System.Environment]::NewLine +
'    <Priority>7</Priority>' + [System.Environment]::NewLine +
'  </Settings>' + [System.Environment]::NewLine +
'  <Actions Context="Author">' + [System.Environment]::NewLine +
'    <Exec>' + [System.Environment]::NewLine +
'      <Command>powershell.exe</Command>' + [System.Environment]::NewLine +
"      <Arguments>$psArgs</Arguments>" + [System.Environment]::NewLine +
"      <WorkingDirectory>$scriptDir</WorkingDirectory>" + [System.Environment]::NewLine +
'    </Exec>' + [System.Environment]::NewLine +
'  </Actions>' + [System.Environment]::NewLine +
'</Task>'

# Write XML to temp file as Unicode (UTF-16 LE) - required by schtasks
$xmlPath = Join-Path $env:TEMP "gamerdrift_yt_task.xml"
[System.IO.File]::WriteAllText($xmlPath, $taskXml, [System.Text.Encoding]::Unicode)

Write-Host "[OK] XML written to: $xmlPath" -ForegroundColor Green

# Remove old task silently
schtasks.exe /Delete /TN $taskName /F 2>$null | Out-Null

# Register
Write-Host "[..] Registering task with schtasks.exe..." -ForegroundColor Yellow
$out = schtasks.exe /Create /TN $taskName /XML $xmlPath /F 2>&1
Write-Host $out

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Scheduled task registered!" -ForegroundColor Green
    schtasks.exe /Query /TN $taskName /FO LIST
    Write-Host ""
    Write-Host "It will run every 1 hour automatically." -ForegroundColor Cyan
    Write-Host "To trigger manually: schtasks /Run /TN `"$taskName`"" -ForegroundColor Gray
    Write-Host "To view log: Get-Content '$scriptDir\youtube_agent.log' -Tail 20" -ForegroundColor Gray
} else {
    Write-Host "[ERROR] Registration failed - see above." -ForegroundColor Red
    # Print the malformed XML so we can debug
    Write-Host ""
    Write-Host "--- XML dump for debugging ---" -ForegroundColor Yellow
    Get-Content $xmlPath
}

Remove-Item $xmlPath -ErrorAction SilentlyContinue
Write-Host ""
Write-Host "Done!" -ForegroundColor Green
