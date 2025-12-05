#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "🚀 Starting Coffee Store FMS..."
echo ""

# Check backend directory
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Error: Backend directory not found at $BACKEND_DIR"
    exit 1
fi

# Check frontend directory
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Error: Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in backend directory"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Warning: node_modules not found. Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating template..."
    cat > .env << EOF
PGUSER=your_username
PGHOST=localhost
PGPORT=5432
PGDATABASE=coffee_store
PGPASSWORD=
PORT=5000
EOF
    echo "   Please edit backend/.env with your database credentials"
    echo ""
fi

# Check for port conflicts
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Warning: Port 5000 is already in use"
    echo "   Killing existing processes..."
    pkill -f "node.*server.js" || true
    sleep 2
fi

# Check frontend dependencies
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "⚠️  Warning: Frontend node_modules not found. Installing dependencies..."
    npm install
fi

# Check for frontend port conflicts
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Warning: Port 5173 is already in use"
    echo "   You may need to stop the existing frontend server"
fi

echo "✅ Starting backend server..."
cd "$BACKEND_DIR"
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo "✅ Starting frontend server..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

# Get the actual port from .env
BACKEND_PORT=$(grep "^PORT=" "$BACKEND_DIR/.env" 2>/dev/null | cut -d= -f2 | tr -d ' ')
BACKEND_PORT=${BACKEND_PORT:-5000}

echo ""
echo "✅ Both servers are starting..."
echo "   Backend: http://localhost:$BACKEND_PORT"
echo "   Frontend: http://localhost:5173"
echo ""
echo "⚠️  Note: If port 5000 is blocked by macOS AirPlay, backend uses port 5002"
echo "   Check backend/.env file for the actual PORT value"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Wait for processes
wait
