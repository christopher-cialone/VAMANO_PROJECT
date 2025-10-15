#!/bin/bash

# VAMANO Deployment Script
echo "🚀 Starting VAMANO deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the VAMANO root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build frontend
echo "🏗️  Building frontend..."
cd frontend
yarn build
cd ..

# Build backend
echo "🏗️  Building backend..."
cd backend
yarn build
cd ..

# Deploy Anchor program (if available)
echo "⛓️  Deploying Anchor program..."
cd programs/vamano-program
if command -v anchor &> /dev/null; then
    anchor build
    anchor deploy --provider.cluster devnet
    echo "✅ Anchor program deployed to devnet"
else
    echo "⚠️  Anchor CLI not found, skipping program deployment"
fi
cd ../..

# Start services
echo "🎯 Starting services..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo ""
echo "Run 'yarn dev' to start development servers"

echo "✅ VAMANO deployment complete!"


