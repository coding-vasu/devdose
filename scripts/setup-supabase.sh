#!/bin/bash

# Quick setup script for DevDose Supabase

echo "🚀 DevDose Supabase Quick Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
fi

echo "📋 Follow these steps:"
echo ""
echo "1. Create Supabase Project"
echo "   → Go to: https://supabase.com/dashboard"
echo "   → Click 'New Project'"
echo "   → Name: devdose"
echo "   → Save your database password!"
echo ""

echo "2. Get Your Credentials"
echo "   → Settings → API"
echo "   → Copy 'Project URL'"
echo "   → Copy 'service_role' key (click Reveal)"
echo ""

echo "3. Update .env file"
echo "   → Open: nano .env"
echo "   → Update SUPABASE_URL"
echo "   → Update SUPABASE_SERVICE_KEY"
echo ""

echo "4. Set Up Database Schema"
echo "   → Supabase Dashboard → SQL Editor"
echo "   → Copy contents of: src/pipeline/publishing/schema.sql"
echo "   → Paste and Run"
echo ""

echo "5. Test Connection"
echo "   → Run: npm run test-supabase"
echo ""

echo "📖 Full guide: SUPABASE_SETUP.md"
echo ""

# Ask if user wants to open the schema file
read -p "Do you want to view the schema.sql file now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat src/pipeline/publishing/schema.sql
    echo ""
    echo "👆 Copy this SQL and run it in Supabase SQL Editor"
fi
