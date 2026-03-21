@echo off
cd /d "%~dp0"
powershell -NoProfile -Command "$pids = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($pid in $pids) { Write-Host 'Closing old server on port 3000...'; Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue }; Start-Sleep -Milliseconds 800"
echo Starting Passport Application Experience...
echo.
echo App URL: http://localhost:3000
echo Demo Login: hire-me@anshumat.org / HireMe@2025!
echo.
"C:\Program Files\nodejs\node.exe" backend\server.js
