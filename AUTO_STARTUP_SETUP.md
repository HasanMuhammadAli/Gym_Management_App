# Auto-Startup Setup for Gym Workout App

## Simple Steps to Make App Start Automatically

### Step 1: Copy the Script
1. Copy the `auto-start-app.bat` file to the new computer
2. Place it in your project folder (same location as your other files)

### Step 2: Add to Windows Startup (Choose ONE method)

#### Method A: Startup Folder (Easiest)
1. **Press `Win + R`** on your keyboard
2. **Type `shell:startup`** and press Enter
3. **Copy `auto-start-app.bat`** into this folder
4. **Done!** The app will start automatically when you log in

#### Method B: Task Scheduler (More Professional)
1. **Press `Win + R`**, type `taskschd.msc`, press Enter
2. **Click "Create Basic Task"** on the right
3. **Name**: "Gym Workout App"
4. **Trigger**: "When the computer starts"
5. **Action**: "Start a program"
6. **Program**: Browse to your `auto-start-app.bat` file
7. **Finish**

### Step 3: Test It
1. **Restart your computer**
2. **Wait for it to fully boot**
3. **Check if the app is running**:
   - Open browser and go to `http://localhost:3000`
   - You should see your gym workout app

## What the Script Does

The `auto-start-app.bat` script:
- ✅ Waits 10 seconds for system to fully boot
- ✅ Opens two command windows (backend + frontend)
- ✅ Starts your backend server on port 5000
- ✅ Starts your frontend app on port 3000
- ✅ Shows you the URLs where to access the app
- ✅ Closes itself after 30 seconds

## Troubleshooting

### If the app doesn't start:
1. **Check if Node.js is installed**: Open cmd and type `node --version`
2. **Check if MongoDB is running**: Make sure MongoDB starts automatically
3. **Check the startup folder**: Make sure the .bat file is actually there
4. **Run manually first**: Try running `auto-start-app.bat` manually to test

### If you see errors:
1. **Check the command windows** that opened
2. **Look for error messages** in those windows
3. **Make sure all dependencies are installed** (run `npm install` in both folders)

## To Disable Auto-Startup

### If using Startup Folder:
1. Press `Win + R`, type `shell:startup`, press Enter
2. Delete the `auto-start-app.bat` file

### If using Task Scheduler:
1. Press `Win + R`, type `taskschd.msc`, press Enter
2. Find "Gym Workout App" task
3. Right-click and select "Delete"

## Notes

- The script waits 10 seconds before starting to ensure the system is ready
- Two command windows will open (one for backend, one for frontend)
- The script window will close automatically after 30 seconds
- Your app will be available at `http://localhost:3000`
- Make sure MongoDB is also set to start automatically 