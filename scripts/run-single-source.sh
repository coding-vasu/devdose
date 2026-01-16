#!/bin/bash

# DevDose Single Source Pipeline Runner
# Run pipeline on a single source (faster for testing)

set -e

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../apps/backend" && pwd)"

echo "🎯 DevDose Single Source Pipeline"
echo "=================================="
echo ""
echo "This runs the pipeline on a single source for quick testing."
echo ""

cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run single source pipeline
npm run single-source

echo ""
echo "✅ Single source pipeline completed!"
