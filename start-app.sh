#!/bin/bash
echo "Starting Gym Workout Application..."
echo ""
echo "Starting Backend..."
cd Backend
npm start &
echo ""
echo "Starting Frontend..."
cd ../Frontend/gym-workout-frontend
npm start &
echo ""
echo "Application starting..."
echo "Backend will be available at: http://localhost:5000"
echo "Frontend will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
wait 