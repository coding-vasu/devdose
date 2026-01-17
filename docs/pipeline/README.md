# DevDose Content Pipeline

Complete documentation for the 6-stage content generation pipeline that powers DevDose, a micro-learning app for frontend developers.

---

## Overview

The DevDose content pipeline automatically discovers, extracts, processes, scores, enriches, and publishes micro-learning posts from high-quality sources across the web.

### Pipeline Stages

1. **[Discovery](./1-discovery.md)** - Find trending repos and curated sources
2. **[Extraction](./2-extraction.md)** - Pull code snippets from READMEs, docs, examples
3. **[Processing](./3-processing.md)** - Use GPT-4 to generate titles and explanations
4. **[Quality Scoring](./4-quality-scoring.md)** - Filter with syntax validation, duplicate detection
5. **[Enrichment](./5-enrichment.md)** - Add tags, assess difficulty
6. **[Publishing](./6-publishing.md)** - Insert into Supabase database

---

## Quick Start

### Prerequisites

```bash
# Required
- Node.js 18+
- GitHub Personal Access Token
- OpenAI API Key
- Supabase Project

# Optional
- TypeScript knowledge
- PostgreSQL familiarity
```

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/devdose.git
cd devdose

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Environment Variables

```bash
# .env

# GitHub API
GITHUB_TOKEN=ghp_your_token_here

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here

# Pipeline Settings
MIN_STARS=1000
MAX_RESULTS_PER_TOPIC=50
ACTIVITY_MONTHS=6
```

### Run Pipeline

```bash
# Run full pipeline
npm run pipeline

# Run individual stages
npm run pipeline:discovery
npm run pipeline:extraction
npm run pipeline:processing
npm run pipeline:scoring
npm run pipeline:enrichment
npm run pipeline:publishing
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT PIPELINE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐   │
│  │   DISCOVERY  │ ───▶ │  EXTRACTION  │ ───▶ │  PROCESSING  │   │
│  └──────────────┘      └──────────────┘      └──────────────┘   │
│         │                      │                      │         │
│         ▼                      ▼                      ▼         │
│  Find trending           Extract code         Generate          │
│  repositories            snippets from        explanations      │
│  & docs                  sources              with LLM          │
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐   │
│  │   QUALITY    │ ───▶ │  ENRICHMENT  │ ───▶ │  PUBLISHING  │   │
│  │   SCORING    │      │              │      │              │   │
│  └──────────────┘      └──────────────┘      └──────────────┘   │
│         │                      │                      │         │
│         ▼                      ▼                      ▼         │
│  Filter low-             Add metadata          Insert into      │
│  quality content         & tags                database         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stage Details

### 1. Discovery

**Input:** Configuration (topics, filters)  
**Output:** List of sources (repos, docs)  
**Duration:** ~2-5 minutes  
**Cost:** Free (GitHub API)

Discovers high-quality sources using:

- GitHub trending repositories (1000+ stars)
- Curated source list (React, TypeScript, MDN, etc.)
- Awesome lists parsing

[Read full documentation →](./1-discovery.md)

### 2. Extraction

**Input:** Sources from Discovery  
**Output:** Raw code snippets  
**Duration:** ~5-10 minutes  
**Cost:** Free (GitHub API)

Extracts code snippets from:

- README files
- Documentation directories
- Example code
- Maintains context (headings, explanations)

[Read full documentation →](./2-extraction.md)

### 3. Processing

**Input:** Code snippets  
**Output:** Posts with titles, explanations  
**Duration:** ~10-20 minutes  
**Cost:** ~$0.027 per post (GPT-4)

Uses GPT-4 to generate:

- Catchy titles (5-8 words)
- Concise explanations (2-3 sentences)
- Relevant tags
- Difficulty assessment
- Quality scores (0-100)

[Read full documentation →](./3-processing.md)

### 4. Quality Scoring

**Input:** Processed posts  
**Output:** Scored posts (approved/review/rejected)  
**Duration:** ~2-5 minutes  
**Cost:** Free

Filters content using:

- Syntax validation (TypeScript, CSS, HTML)
- Duplicate detection (hash-based)
- Source reputation scoring
- Composite quality score (0-100)

**Thresholds:**

- 85+: Auto-approve
- 70-84: Manual review
- <70: Auto-reject

[Read full documentation →](./4-quality-scoring.md)

### 5. Enrichment

**Input:** Approved posts  
**Output:** Fully enriched posts  
**Duration:** ~3-5 minutes  
**Cost:** Free (with GitHub API caching)

Adds metadata:

- Enhanced tags (framework, features, patterns)
- Refined difficulty assessment
- Repository metadata (stars, author)
- SEO keywords and descriptions
- Category classification

[Read full documentation →](./5-enrichment.md)

### 6. Publishing

**Input:** Enriched posts  
**Output:** Published posts in database  
**Duration:** ~1-2 minutes  
**Cost:** Free (Supabase free tier)

Inserts into Supabase:

- Batch insertion (100 posts/batch)
- Duplicate prevention
- Status management (draft/published/archived)
- Full-text search indexing

[Read full documentation →](./6-publishing.md)

---

## Performance

### Expected Output

- **Discovery:** 100-150 sources
- **Extraction:** 500-1000 snippets
- **Processing:** 300-500 posts (after LLM filtering)
- **Quality Scoring:** 150-250 approved posts (50-60% approval rate)
- **Enrichment:** All approved posts
- **Publishing:** 150-250 new posts

### Total Pipeline Time

- **Full run:** ~30-45 minutes
- **Daily incremental:** ~15-20 minutes

### Cost Estimate

- **Per run:** ~$8-15 (mostly OpenAI GPT-4)
- **Per post:** ~$0.027
- **Monthly (daily runs):** ~$240-450

---

## Monitoring

### Metrics to Track

- Posts published per run
- Quality score distribution
- Approval/rejection rates
- LLM costs
- API rate limit usage
- Duplicate detection rate

### Logging

Each stage outputs:

- Progress indicators
- Success/failure counts
- Error details
- Summary statistics

### Alerts

Set up alerts for:

- Pipeline failures
- High rejection rates (>60%)
- API rate limit warnings
- Cost anomalies

---

## Troubleshooting

### Common Issues

**1. GitHub Rate Limit**

```
Error: API rate limit exceeded
```

**Solution:** Use authenticated token, reduce MAX_RESULTS_PER_TOPIC

**2. OpenAI Timeout**

```
Error: Request timeout
```

**Solution:** Reduce batch size, add retries

**3. Duplicate Posts**

```
Warning: X posts skipped as duplicates
```

**Solution:** Normal behavior, indicates healthy deduplication

**4. Low Approval Rate**

```
Warning: Only 30% of posts approved
```

**Solution:** Adjust quality thresholds, improve source selection

---

## Development

### Project Structure

```
devdose/
├── pipeline/
│   ├── discovery/
│   ├── extraction/
│   ├── processing/
│   ├── quality-scoring/
│   ├── enrichment/
│   └── publishing/
├── docs/
│   └── pipeline/          # This documentation
├── tests/
└── package.json
```

### Testing

```bash
# Run all tests
npm test

# Test individual stages
npm test -- discovery
npm test -- extraction
```

### Contributing

See individual stage documentation for implementation details.

---

## Roadmap

### Phase 1: MVP ✅

- [x] All 6 pipeline stages
- [x] Basic quality filtering
- [x] Supabase integration

### Phase 2: Optimization (Current)

- [ ] Semantic duplicate detection
- [ ] Advanced quality ML model
- [ ] Cost optimization (GPT-3.5 pre-filter)
- [ ] Parallel processing

### Phase 3: Enhancement

- [ ] Video snippet extraction
- [ ] Interactive code examples
- [ ] Multi-language support (Python, Rust, Go)
- [ ] Community contributions

---

## License

MIT License - See LICENSE file for details

---

## Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/devdose/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/devdose/discussions)
- **Email:** support@devdose.dev

---

**Last Updated:** January 15, 2026  
**Version:** 1.0
