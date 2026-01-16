#!/bin/bash

# DevDose Pipeline Runner
# Run the complete 6-stage content pipeline

set -e  # Exit on error

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../apps/backend" && pwd)"

echo "🚀 DevDose Content Pipeline"
echo "============================"
echo ""
echo "Running 6-stage pipeline:"
echo "  1. Discovery"
echo "  2. Extraction"
echo "  3. Processing"
echo "  4. Quality Scoring"
echo "  5. Enrichment"
echo "  6. Publishing"
echo ""

cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run pipeline
echo "▶️  Starting pipeline..."
npm run pipeline

echo ""
echo "✅ Pipeline completed successfully!"
