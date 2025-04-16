@echo off
echo Starting Volunteer Management System in development mode...

REM Start the server in a new window
start cmd /k "cd server && npm run dev"

REM Wait a moment for the server to start
timeout /t 3 /nobreak > nul

REM Start the client in a new window
start cmd /k "cd client && npm run dev"

echo Development servers started! Check the command windows for details.
echo Server: http://localhost:5000/api
echo Client: http://localhost:5174
echo.
echo Press any key to close this window (the servers will keep running)...
pause > nul 