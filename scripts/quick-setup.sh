#!/bin/bash

# DevDose Quick Setup Script
# Sets up the entire project for first-time use

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🎉 DevDose Quick Setup"
echo "====================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Node.js $(node -v) found"
echo "✅ npm $(npm -v) found"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd "$PROJECT_DIR/apps/backend"
npm install

echo ""
echo "📦 Installing frontend dependencies..."
cd "$PROJECT_DIR/apps/frontend"
npm install

echo ""
echo "📦 Installing root dependencies..."
cd "$PROJECT_DIR"
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure environment variables in apps/backend/.env"
echo "2. Set up Supabase database: ./scripts/setup-supabase.sh"
echo "3. Start development:"
echo "   - Backend API: npm run backend:api"
echo "   - Frontend: npm run frontend:dev"
echo "   - Or both: npm run dev"
echo ""
