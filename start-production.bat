@echo off
REM Factor Warenwirtschaftssystem - Windows Production Startup Script

echo 🚀 Starting Factor Warenwirtschaftssystem...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
)

if not exist "server\node_modules" (
    echo 📦 Installing backend dependencies...
    cd server
    call npm install
    cd ..
)

REM Build the application
echo 🔨 Building application...
call npm run build
cd server
call npm run build
cd ..

REM Start the backend server in background
echo 🚀 Starting backend server on port 3002...
cd server
start /b npm start
cd ..

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Start the frontend server
echo 🚀 Starting frontend server on port 3001...
start /b npm run preview

echo ✅ Factor Warenwirtschaftssystem is running!
echo 🌐 Frontend: http://localhost:3001
echo 🔌 Backend API: http://localhost:3002
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:3001

echo.
echo Press any key to stop all services...
pause >nul

REM Kill all node processes (simple approach)
taskkill /f /im node.exe >nul 2>&1
echo 🛑 Services stopped.