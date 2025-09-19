#!/bin/bash
# Factor Warenwirtschaftssystem - Production Startup Script

echo "🚀 Starting Factor Warenwirtschaftssystem..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd server
    npm install
    cd ..
fi

# Build the application
echo "🔨 Building application..."
npm run build
cd server
npm run build
cd ..

# Start the backend server
echo "🚀 Starting backend server on port 3002..."
cd server
npm start &
SERVER_PID=$!
cd ..

# Start the frontend server
echo "🚀 Starting frontend server on port 3001..."
npm run preview &
FRONTEND_PID=$!

echo "✅ Factor Warenwirtschaftssystem is running!"
echo "🌐 Frontend: http://localhost:3001"
echo "🔌 Backend API: http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "🛑 Stopping services..."; kill $SERVER_PID $FRONTEND_PID; exit' INT
wait