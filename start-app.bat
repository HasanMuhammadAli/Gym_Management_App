@echo off
echo Starting Gym Workout Application...
echo.
echo Starting Backend...
cd Backend
start cmd /k "npm start"
echo.
echo Starting Frontend...
cd ../Frontend/gym-workout-frontend
start cmd /k "npm start"
echo.
echo Application starting...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3000
pause 