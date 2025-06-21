#!/bin/bash

echo "🌐 Starting Frontend Server..."

cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start development server
echo "Starting frontend server on http://localhost:3000"
npm start 