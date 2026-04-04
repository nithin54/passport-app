@echo off
echo Starting Passport App on port 3000...
echo.
echo Local: http://localhost:3000/homepage
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "ipv4"') do (
  set IP=%%a
  set IP=!IP: =!
)
echo LAN/Mobile (same network): http://%IP%:3000/homepage
echo.
echo Demo login: hire-me@anshumat.org / HireMe@2025!
echo Press Ctrl+C to stop.
echo.
node backend\server.js
pause
