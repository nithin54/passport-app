@echo off
cd /d "%~dp0"
powershell -NoProfile -Command "$pids = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($pid in $pids) { Write-Host 'Closing old server on port 3000...'; Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue }; Start-Sleep -Milliseconds 800"
echo Starting Passport Application Experience...
echo.
echo App URL: http://localhost:3000
for /f "tokens=14" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do set LAN_IP=%%a
if defined LAN_IP echo Mobile URL: http://%LAN_IP%:3000/homepage
echo Demo Login: hire-me@anshumat.org / HireMe@2025!
echo.
"C:\Program Files\nodejs\node.exe" backend\server.js
