# Gym Workout Management System

A comprehensive gym management system built with React.js frontend and Node.js backend, featuring workout planning, fitness testing, membership management, and user tracking.

## 🏋️ Features

- **Workout Planning**: Create and manage personalized workout plans
- **Fitness Testing**: Track fitness assessments and progress
- **Membership Management**: Handle gym memberships and renewals
- **User Management**: Complete user profile and history tracking
- **Reporting**: Generate reports for expiring memberships, inactive users, and fitness test due dates
- **Session Tracking**: Monitor workout sessions and progress

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Modern UI/UX design

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- RESTful API

## 📁 Project Structure

```
├── Backend/                 # Node.js backend server
│   ├── config/             # Database configuration
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── server.js           # Main server file
├── Frontend/               # React.js frontend application
│   └── gym-workout-frontend/
│       ├── src/            # React components and logic
│       ├── public/         # Static assets
│       └── package.json    # Frontend dependencies
├── SETUP_GUIDE.md          # Detailed setup instructions
├── AUTO_STARTUP_SETUP.md   # Auto-startup configuration
└── start-app.*             # Startup scripts for different platforms
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "v6 final copy"
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend/gym-workout-frontend
   npm install
   ```

4. **Configure Database**
   - Update the database connection in `Backend/config/db.js`
   - Ensure MongoDB is running

5. **Start the Application**
   
   **Option 1: Using provided scripts**
   ```bash
   # For Windows
   ./start-app.bat
   
   # For macOS/Linux
   ./start-app.sh
   ```
   
   **Option 2: Manual startup**
   ```bash
   # Terminal 1 - Start Backend
   cd Backend
   npm start
   
   # Terminal 2 - Start Frontend
   cd Frontend/gym-workout-frontend
   npm start
   ```

## 📖 Detailed Setup

For comprehensive setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🔧 Configuration

- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:3000`
- Database: MongoDB (configure in `Backend/config/db.js`)

## 📋 Available Scripts

### Backend
- `npm start` - Start the development server
- `npm run dev` - Start with nodemon for development

### Frontend
- `npm start` - Start the React development server
- `npm build` - Build for production
- `npm test` - Run tests


---

**Note**: Make sure to configure your environment variables and database connections before running the application. See the setup guide for detailed instructions. 