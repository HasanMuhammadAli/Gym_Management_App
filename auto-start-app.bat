@echo off
title Gym Workout App Auto-Start
echo Starting Gym Workout Application...
echo.

REM Wait for system to fully boot
timeout /t 10 /nobreak >nul

REM Navigate to project directory
cd /d "%~dp0"

echo Starting Backend Server...
cd Backend
start "Backend Server" cmd /k "npm start"

echo.
echo Starting Frontend Application...
cd ..\Frontend\gym-workout-frontend
start "Frontend App" cmd /k "npm start"

echo.
echo Gym Workout Application is starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo This window will close automatically in 30 seconds...
timeout /t 30 /nobreak >nul
exit 