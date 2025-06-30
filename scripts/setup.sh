#!/bin/bash

# Ostrich Talks Development Setup Script

echo "🚀 Setting up Ostrich Talks development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
npm run install:backend

# Install mobile dependencies
echo "📱 Installing mobile dependencies..."
npm run install:mobile

# Create environment files
echo "⚙️ Setting up environment files..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/env.example backend/.env
    echo "⚠️  Please edit backend/.env with your configuration"
else
    echo "✅ Backend environment file already exists"
fi

# Mobile environment
if [ ! -f "mobile/.env" ]; then
    echo "📝 Creating mobile environment file..."
    cp mobile/env.example mobile/.env
    echo "⚠️  Please edit mobile/.env with your configuration"
else
    echo "✅ Mobile environment file already exists"
fi

# Check if MongoDB is running (optional)
echo "🗄️ Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB for backend development."
    fi
else
    echo "⚠️  MongoDB client not found. Please install MongoDB for backend development."
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI..."
    npm install -g @expo/cli
else
    echo "✅ Expo CLI is installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your MongoDB and JWT configuration"
echo "2. Edit mobile/.env with your Firebase and API configuration"
echo "3. Start development servers:"
echo "   - npm run dev (both backend and mobile)"
echo "   - npm run dev:backend (backend only)"
echo "   - npm run dev:mobile (mobile only)"
echo ""
echo "📚 Documentation:"
echo "- Backend API: backend/README.md"
echo "- Mobile App: mobile/README.md"
echo "- Monorepo: README.md" 