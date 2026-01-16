# DevDose Pipeline Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```bash
# Required API Keys
GITHUB_TOKEN=ghp_your_github_token_here          # Get from: https://github.com/settings/tokens
GEMINI_API_KEY=your_gemini_api_key_here          # Get from: https://aistudio.google.com/app/apikey
SUPABASE_URL=https://your-project.supabase.co    # From your Supabase project
SUPABASE_SERVICE_KEY=your_service_key_here       # From Supabase project settings
```

### 3. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the schema migration:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `src/pipeline/publishing/schema.sql`
   - Execute the SQL

### 4. Run the Pipeline

```bash
# Run the complete pipeline (all 6 stages)
npm run pipeline

# Or run individual stages
npm run discovery
npm run extraction
npm run processing
npm run quality
npm run enrichment
npm run publishing
```

---

## 📊 Pipeline Stages

### Stage 1: Discovery

**Purpose:** Find high-quality sources of frontend content  
**Output:** `discovery-results.json`  
**Duration:** 2-5 minutes  
**Cost:** Free

Discovers 100-150 sources including:

- GitHub trending repositories (1000+ stars)
- Official documentation (React, TypeScript, MDN, etc.)
- Curated educational platforms

### Stage 2: Extraction

**Purpose:** Extract code snippets from discovered sources  
**Output:** `extraction-results.json`  
**Duration:** 5-10 minutes  
**Cost:** Free

Extracts 500-1000 code snippets from:

- README files
- Documentation examples
- Example directories

### Stage 3: Processing

**Purpose:** Generate titles and explanations using Gemini AI  
**Output:** `processing-results.json`  
**Duration:** 10-20 minutes  
**Cost:** ~$1-3 (Gemini Flash is very cost-effective)

Uses Gemini 1.5 Flash to create:

- Engaging titles (max 60 chars)
- Clear explanations (2-3 sentences)
- Difficulty classification
- Auto-extracted tags

### Stage 4: Quality Scoring

**Purpose:** Validate syntax and filter low-quality content  
**Output:** `quality-results.json`  
**Duration:** 2-5 minutes  
**Cost:** Free

Validates:

- JavaScript/TypeScript syntax
- CSS syntax
- HTML structure
- Quality scoring (1-100)

### Stage 5: Enrichment

**Purpose:** Add metadata and find related content  
**Output:** `enrichment-results.json`  
**Duration:** 3-5 minutes  
**Cost:** Free

Adds:

- Additional tags (framework-specific patterns)
- Reading time calculation
- Prerequisites identification
- Related post suggestions

### Stage 6: Publishing

**Purpose:** Insert posts into Supabase database  
**Output:** Console summary  
**Duration:** 1-2 minutes  
**Cost:** Free (Supabase free tier)

Publishes 150-250 approved posts to database

---

## 📈 Expected Output

**Per Pipeline Run:**

- Sources Discovered: 100-150
- Snippets Extracted: 500-1000
- Posts Processed: 300-500
- Posts Approved: 150-250
- Posts Published: 150-250

**Quality Metrics:**

- Syntax Valid: 100%
- Average Quality Score: 75-85
- Auto-Approved: 60-70%
- Manual Review: 20-30%
- Auto-Rejected: 10-20%

---

## 💰 Cost Breakdown

| Stage      | Technology       | Cost              |
| ---------- | ---------------- | ----------------- |
| Discovery  | GitHub API       | Free              |
| Extraction | Parsing          | Free              |
| Processing | Gemini Flash     | ~$1-3             |
| Quality    | Validation       | Free              |
| Enrichment | Pattern matching | Free              |
| Publishing | Supabase         | Free              |
| **Total**  |                  | **~$1-3 per run** |

**Cost per post:** ~$0.005-0.015 (much cheaper than GPT-4!)

---

## 🛠️ CLI Commands

```bash
# Run complete pipeline
npm run pipeline

# Run individual stages
npm run discovery      # Stage 1: Find sources
npm run extraction     # Stage 2: Extract code
npm run processing     # Stage 3: Generate content
npm run quality        # Stage 4: Validate & score
npm run enrichment     # Stage 5: Add metadata
npm run publishing     # Stage 6: Publish to DB

# Development
npm run build          # Compile TypeScript
npm run dev            # Run with tsx (no compilation)
```

---

## 🔧 Configuration

All configuration is done via environment variables in `.env`:

```bash
# Discovery Settings
MIN_STARS=1000                    # Minimum GitHub stars
MAX_RESULTS_PER_TOPIC=50          # Max repos per topic
ACTIVITY_MONTHS=6                 # Recent activity window
TOPICS=react,typescript,vue,angular,css,javascript

# Extraction Settings
MIN_CODE_LINES=10                 # Minimum code snippet length
MAX_CODE_LINES=50                 # Maximum code snippet length

# Processing Settings
BATCH_SIZE=10                     # Gemini batch size
MAX_RETRIES=3                     # Retry attempts

# Quality Settings
AUTO_APPROVE_THRESHOLD=85         # Auto-approve score
MANUAL_REVIEW_THRESHOLD=70        # Manual review score

# Publishing Settings
BATCH_INSERT_SIZE=100             # Supabase batch size
```

---

## 📝 Output Files

The pipeline generates JSON files at each stage:

- `discovery-results.json` - Discovered sources
- `extraction-results.json` - Extracted code snippets
- `processing-results.json` - AI-generated content
- `quality-results.json` - Quality-scored posts
- `enrichment-results.json` - Enriched posts with metadata

These files are useful for:

- Debugging individual stages
- Resuming from a specific stage
- Analyzing pipeline performance

---

## 🐛 Troubleshooting

### GitHub API Rate Limits

- **Problem:** "API rate limit exceeded"
- **Solution:** Wait 1 hour or use a GitHub token with higher limits

### Gemini API Errors

- **Problem:** "API key invalid"
- **Solution:** Verify your Gemini API key at https://aistudio.google.com/app/apikey

### Supabase Connection Errors

- **Problem:** "Failed to connect to Supabase"
- **Solution:** Check your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env`

### TypeScript Compilation Errors

- **Problem:** Type errors during build
- **Solution:** Run `npm install` to ensure all type definitions are installed

---

## 🎯 Next Steps

1. **Test with Small Batch:** Modify `MAX_RESULTS_PER_TOPIC=5` in `.env` for a quick test run
2. **Review Output:** Check `enrichment-results.json` to see generated posts
3. **Verify Database:** Query Supabase to confirm posts were inserted
4. **Schedule Automation:** Set up a cron job to run the pipeline weekly

---

## 📚 Documentation

- [PRD](./prd-devdose.md) - Complete product requirements
- [Pipeline Overview](./content-pipeline-overview.md) - Architecture details
- [Stage Guides](./pipeline/) - Detailed implementation for each stage

---

**Last Updated:** January 16, 2026  
**Version:** 1.0.0
