# DevDose Pipeline Scripts

This directory contains convenience scripts for running the DevDose content pipeline and managing the project.

## 📜 Available Scripts

### Pipeline Scripts

#### `run-pipeline.sh`

Run the complete 6-stage content pipeline.

```bash
./scripts/run-pipeline.sh
```

**What it does:**

1. Discovery - Find quality sources
2. Extraction - Extract code snippets
3. Processing - Generate titles and explanations with AI
4. Quality Scoring - Filter and rank content
5. Enrichment - Add tags and metadata
6. Publishing - Insert into database

---

#### `run-single-source.sh`

Run the pipeline on a single source for quick testing.

```bash
./scripts/run-single-source.sh
```

**Use case:** Testing pipeline changes without processing all sources.

---

#### `verify-source.sh`

Verify that a source URL works with the pipeline.

```bash
./scripts/verify-source.sh <url>
```

**Examples:**

```bash
./scripts/verify-source.sh https://github.com/facebook/react
./scripts/verify-source.sh https://developer.mozilla.org/en-US/docs/Web/JavaScript
```

---

### Setup Scripts

#### `quick-setup.sh`

Complete first-time project setup.

```bash
./scripts/quick-setup.sh
```

**What it does:**

- Checks prerequisites (Node.js, npm)
- Installs all workspace dependencies
- Provides next steps guidance

---

#### `setup-supabase.sh`

Initialize Supabase database with required tables and functions.

```bash
./scripts/setup-supabase.sh
```

**Prerequisites:** Supabase project created and credentials in `.env`

---

## 🚀 NPM Scripts (from root)

You can also run pipeline commands from the root using npm:

```bash
# Full pipeline
npm run pipeline

# Individual stages
npm run pipeline:discovery
npm run pipeline:extraction
npm run pipeline:processing
npm run pipeline:quality
npm run pipeline:enrichment
npm run pipeline:publishing

# Testing
npm run pipeline:single    # Single source test
npm run pipeline:verify    # Verify a source
```

---

## 📂 Script Organization

```
scripts/
├── run-pipeline.sh          # Full pipeline runner
├── run-single-source.sh     # Single source test
├── verify-source.sh         # Source verification
├── quick-setup.sh           # Project setup
├── setup-supabase.sh        # Database initialization
└── README.md               # This file
```

---

## 🛠️ Making Scripts Executable

All scripts are already executable. If you add new scripts, make them executable:

```bash
chmod +x scripts/your-new-script.sh
```

---

## 💡 Tips

### Run from Anywhere

Scripts use relative paths, so they work from any directory:

```bash
# From project root
./scripts/run-pipeline.sh

# From scripts directory
cd scripts
./run-pipeline.sh

# From anywhere
/path/to/DevDose/scripts/run-pipeline.sh
```

### Combine with Watch Mode

Use `nodemon` or similar tools to auto-run on file changes:

```bash
cd apps/backend
nodemon --watch src/pipeline --exec "npm run pipeline"
```

### Pipeline Data

Pipeline results are saved in `data/`:

- `data/discovery/` - Discovery results
- `data/temp/` - Temporary processing files

### Logs

Pipeline stages output detailed logs to console for debugging.

---

## 🔧 Troubleshooting

### "Permission denied"

Make scripts executable:

```bash
chmod +x scripts/*.sh
```

### "Command not found: ts-node"

Install backend dependencies:

```bash
cd apps/backend && npm install
```

### "SUPABASE_URL is not defined"

Configure environment variables in `apps/backend/.env`

### Pipeline fails on a stage

Run individual stages to debug:

```bash
npm run pipeline:discovery   # Test discovery
npm run pipeline:extraction   # Test extraction
# etc.
```

---

## 📚 More Information

- **Pipeline Documentation**: See `docs/pipeline/` for detailed stage documentation
- **API Documentation**: See `docs/api/` for API usage
- **Setup Guides**: See `docs/setup/` for configuration help

---

**Happy pipelining! 🚀**
