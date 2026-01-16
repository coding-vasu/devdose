#!/bin/bash

# DevDose Source Verification Script
# Verify a source URL works with the pipeline

set -e

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../apps/backend" && pwd)"

if [ -z "$1" ]; then
    echo "❌ Error: Source URL required"
    echo ""
    echo "Usage: ./verify-source.sh <source-url>"
    echo ""
    echo "Examples:"
    echo "  ./verify-source.sh https://github.com/facebook/react"
    echo "  ./verify-source.sh https://developer.mozilla.org/en-US/docs/Web/JavaScript"
    exit 1
fi

SOURCE_URL="$1"

echo "🔍 DevDose Source Verification"
echo "=============================="
echo ""
echo "Verifying: $SOURCE_URL"
echo ""

cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run verification
SOURCE_URL="$SOURCE_URL" npm run verify-source

echo ""
echo "✅ Verification completed!"
