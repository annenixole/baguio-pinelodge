@echo off
echo ============================================
echo Starting Pine Lodge Booking System
echo ============================================
echo.

echo [1/2] Starting Backend Server...
start cmd /k "cd server && npm start"
timeout /t 3 /nobreak > nul

echo [2/2] Starting React App...
start cmd /k "cd pinelodge && cmd /c npm start"

echo.
echo ============================================
echo Both servers starting in new windows
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3001
echo ============================================
echo.
echo Press any key to exit this window...
pause > nul
