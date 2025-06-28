# Gym Workout Application Setup Guide

This guide will help you set up and run the Gym Workout Application on a new computer from scratch.

## Prerequisites

Before starting, you'll need to install the following software:

### 1. Node.js
- **Download**: Visit [nodejs.org](https://nodejs.org/)
- **Install**: Download the LTS (Long Term Support) version for your operating system
- **Verify**: Open terminal/command prompt and run:
  ```bash
  node --version
  npm --version
  ```

### 2. MongoDB
- **Download**: Visit [mongodb.com](https://www.mongodb.com/try/download/community)
- **Install**: Download MongoDB Community Server for your operating system
- **Alternative**: Use MongoDB Atlas (cloud service) - see section below

### 3. Git (Optional but recommended)
- **Download**: Visit [git-scm.com](https://git-scm.com/)
- **Install**: Download and install for your operating system

## Installation Steps

### Step 1: Clone or Copy the Project
If using Git:
```bash
git clone <your-repository-url>
cd "v6 final copy"
```

If copying files manually:
- Copy the entire project folder to your new computer
- Navigate to the project directory in terminal/command prompt

### Step 2: Set Up MongoDB

#### Option A: Local MongoDB Installation
1. **Start MongoDB Service**:
   - **Windows**: MongoDB should start automatically as a service
   - **macOS**: Run `brew services start mongodb-community` (if installed via Homebrew)
   - **Linux**: Run `sudo systemctl start mongod`

2. **Verify MongoDB is running**:
   ```bash
   mongosh
   # or
   mongo
   ```

#### Option B: MongoDB Atlas (Cloud - Recommended for beginners)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Replace the MONGO_URI in your .env file

### Step 3: Set Up Backend

1. **Navigate to Backend directory**:
   ```bash
   cd Backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   Create a file named `.env` in the Backend directory with the following content:
   ```
   MONGO_URI=mongodb://localhost:27017/gym-workout-app
   PORT=5000
   ```
   
   **For MongoDB Atlas**, use your connection string:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gym-workout-app
   PORT=5000
   ```

4. **Start the backend server**:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

### Step 4: Set Up Frontend

1. **Open a new terminal/command prompt window**

2. **Navigate to Frontend directory**:
   ```bash
   cd Frontend/gym-workout-frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the frontend application**:
   ```bash
   npm start
   ```

## Running the Application

### Development Mode
1. **Backend**: Should be running on `http://localhost:5000`
2. **Frontend**: Should automatically open in your browser at `http://localhost:3000`

### Production Mode
1. **Build the frontend**:
   ```bash
   cd Frontend/gym-workout-frontend
   npm run build
   ```

2. **Serve the built files** (you can use a static server or serve from backend)

## Troubleshooting

### Common Issues

1. **Port already in use**:
   - Change the PORT in .env file
   - Or kill the process using the port

2. **MongoDB connection failed**:
   - Ensure MongoDB is running
   - Check your connection string
   - Verify network connectivity (for Atlas)

3. **Node modules not found**:
   - Delete `node_modules` folder and `package-lock.json`
   - Run `npm install` again

4. **CORS errors**:
   - Ensure backend is running on the correct port
   - Check the proxy setting in frontend package.json

### Port Configuration
- **Backend**: Default port 5000 (configurable via .env)
- **Frontend**: Default port 3000 (React default)
- **MongoDB**: Default port 27017

## File Structure
```
v6 final copy/
├── Backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── server.js
├── Frontend/
│   └── gym-workout-frontend/
│       ├── src/
│       └── package.json
└── SETUP_GUIDE.md
```

## Quick Start Scripts

### Windows (batch file)
Create `start-app.bat`:
```batch
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
pause
```

### macOS/Linux (shell script)
Create `start-app.sh`:
```bash
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
```

## Support

If you encounter any issues:
1. Check the console/terminal for error messages
2. Verify all prerequisites are installed correctly
3. Ensure all dependencies are installed
4. Check that MongoDB is running and accessible

## Notes
- The frontend is configured to proxy API calls to `http://localhost:5000`
- Make sure both backend and frontend are running simultaneously
- The application uses React 18 and Express.js
- MongoDB is used as the database 