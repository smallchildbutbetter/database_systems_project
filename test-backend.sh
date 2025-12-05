#!/bin/bash

# Quick script to test backend and find the correct port

echo "🔍 Finding backend server port..."
BACKEND_PORT=$(lsof -i -P 2>/dev/null | grep -i node | grep LISTEN | awk '{print $9}' | cut -d: -f2 | head -1)

if [ -z "$BACKEND_PORT" ]; then
  echo "❌ No Node.js server found running!"
  echo "   Please start the backend server first:"
  echo "   cd backend && npm run dev"
  exit 1
fi

echo "✅ Found backend on port: $BACKEND_PORT"
echo ""
echo "Testing health endpoint..."
curl -s http://localhost:$BACKEND_PORT/api/health
echo ""
echo ""
echo "Testing products endpoint..."
curl -s http://localhost:$BACKEND_PORT/api/products | python3 -m json.tool 2>/dev/null | head -10 || curl -s http://localhost:$BACKEND_PORT/api/products | head -10
echo ""
echo ""
echo "✅ Backend is responding on port $BACKEND_PORT"
echo "   Use this port in your curl commands: http://localhost:$BACKEND_PORT"

