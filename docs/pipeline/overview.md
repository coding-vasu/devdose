# Content Pipeline Design Document

**Project:** DevDose  
**Version:** 1.0  
**Last Updated:** January 15, 2026  
**Status:** Design Phase

---

## 1. Overview

The content pipeline is the automated system that discovers, extracts, processes, and publishes micro-learning content for DevDose. It transforms raw code from GitHub repositories and documentation sites into curated, bite-sized learning moments.

### Goals

- **Automation**: Minimize manual curation after initial setup
- **Quality**: Ensure high-quality, accurate, and relevant content
- **Freshness**: Continuously discover new content from active repositories
- **Scalability**: Support growing content library (10,000+ posts)
- **Cost-Efficiency**: Optimize LLM usage and API calls

---

## 2. Pipeline Architecture

### 2.1 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT PIPELINE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   DISCOVERY  │ ───▶ │  EXTRACTION  │ ───▶ │  PROCESSING  │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                      │          │
│         ▼                      ▼                      ▼          │
│  Find trending           Extract code         Generate          │
│  repositories            snippets from        explanations      │
│  & docs                  sources              with LLM          │
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   QUALITY    │ ───▶ │  ENRICHMENT  │ ───▶ │  PUBLISHING  │  │
│  │   SCORING    │      │              │      │              │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                      │          │
│         ▼                      ▼                      ▼          │
│  Filter low-             Add metadata          Insert into      │
│  quality content         & tags                database         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

- **Runtime**: Node.js (TypeScript)
- **GitHub API**: Octokit SDK
- **Web Scraping**: Cheerio (lightweight) or Puppeteer (for JS-heavy sites)
- **LLM**: OpenAI GPT-4 API
- **Database**: Supabase PostgreSQL
- **Scheduling**: Node-cron or GitHub Actions
- **Code Validation**: ESLint, TypeScript Compiler API
- **Caching**: Redis or simple file-based cache

---

## 3. Stage 1: Discovery

### 3.1 Purpose

Identify high-quality sources of frontend development content.

### 3.2 Discovery Strategies

#### Strategy A: Trending GitHub Repositories

```typescript
interface RepositoryDiscovery {
  // Search criteria
  topics: string[]; // ['react', 'typescript', 'vue', etc.]
  minStars: number; // e.g., 1000+
  language: string; // 'JavaScript', 'TypeScript'
  pushedAfter: Date; // Active in last 6 months

  // Ranking factors
  stars: number;
  forks: number;
  recentCommits: number;
  hasGoodDocs: boolean; // Has README, examples/
}
```

**Implementation:**

```typescript
async function discoverTrendingRepos(topic: string): Promise<Repository[]> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const { data } = await octokit.search.repos({
    q: `topic:${topic} language:TypeScript stars:>1000 pushed:>2024-01-01`,
    sort: "stars",
    order: "desc",
    per_page: 50,
  });

  return data.items.map((repo) => ({
    name: repo.full_name,
    stars: repo.stargazers_count,
    url: repo.html_url,
    description: repo.description,
    topics: repo.topics,
  }));
}
```

#### Strategy B: Curated Source List

Maintain a manually curated list of high-quality sources:

```typescript
const CURATED_SOURCES = [
  // Official Docs
  { type: "docs", url: "https://react.dev", tags: ["react"] },
  {
    type: "docs",
    url: "https://www.typescriptlang.org/docs",
    tags: ["typescript"],
  },
  {
    type: "docs",
    url: "https://developer.mozilla.org/en-US/docs/Web",
    tags: ["web", "css", "html"],
  },

  // Top Repositories
  { type: "github", repo: "facebook/react", tags: ["react"] },
  { type: "github", repo: "microsoft/TypeScript", tags: ["typescript"] },
  { type: "github", repo: "vuejs/core", tags: ["vue"] },
  { type: "github", repo: "angular/angular", tags: ["angular"] },

  // Quality Blogs
  { type: "blog", url: "https://web.dev", tags: ["performance", "web"] },
  { type: "blog", url: "https://css-tricks.com", tags: ["css"] },
];
```

#### Strategy C: GitHub Awesome Lists

Parse "awesome" lists for curated resources:

- `awesome-react`
- `awesome-typescript`
- `awesome-css`
- `awesome-javascript`

### 3.3 Discovery Schedule

- **Daily**: Check trending repos for new content
- **Weekly**: Re-scan curated sources for updates
- **Monthly**: Review and update curated source list

---

## 4. Stage 2: Extraction

### 4.1 Purpose

Extract code snippets and context from discovered sources.

### 4.2 Extraction Targets

#### GitHub Repositories

```typescript
interface ExtractionTarget {
  // File types to scan
  files: string[]; // ['README.md', 'docs/**/*.md', 'examples/**/*.ts']

  // Content patterns
  codeBlocks: {
    minLines: number; // 5
    maxLines: number; // 25
    languages: string[]; // ['typescript', 'javascript', 'css']
  };

  // Context extraction
  extractHeadings: boolean; // Get surrounding markdown headings
  extractComments: boolean; // Extract code comments
}
```

**Implementation:**

```typescript
async function extractFromGitHub(repo: string): Promise<CodeSnippet[]> {
  const snippets: CodeSnippet[] = [];

  // 1. Get README content
  const readme = await fetchFile(repo, "README.md");
  const readmeSnippets = extractCodeBlocks(readme);

  // 2. Scan docs/ directory
  const docFiles = await listFiles(repo, "docs/");
  for (const file of docFiles) {
    const content = await fetchFile(repo, file.path);
    const fileSnippets = extractCodeBlocks(content);
    snippets.push(...fileSnippets);
  }

  // 3. Scan examples/ directory
  const exampleFiles = await listFiles(repo, "examples/");
  for (const file of exampleFiles.filter((f) => f.name.endsWith(".ts"))) {
    const code = await fetchFile(repo, file.path);
    const functions = extractFunctions(code); // Parse AST for functions
    snippets.push(...functions);
  }

  return snippets;
}
```

#### Documentation Sites (MDN, React.dev, etc.)

```typescript
async function extractFromDocs(url: string): Promise<CodeSnippet[]> {
  const html = await fetch(url).then((r) => r.text());
  const $ = cheerio.load(html);

  const snippets: CodeSnippet[] = [];

  // Find all code blocks
  $("pre code").each((i, elem) => {
    const code = $(elem).text();
    const language = $(elem)
      .attr("class")
      ?.match(/language-(\w+)/)?.[1];
    const heading = $(elem).closest("section").find("h2, h3").first().text();

    snippets.push({
      code,
      language,
      context: heading,
      sourceUrl: url,
    });
  });

  return snippets;
}
```

### 4.3 Code Block Parsing

````typescript
function extractCodeBlocks(markdown: string): CodeSnippet[] {
  const codeBlockRegex = /```(\w+)\n([\s\S]+?)```/g;
  const snippets: CodeSnippet[] = [];

  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const [, language, code] = match;
    const lines = code.trim().split("\n");

    // Filter by line count
    if (lines.length >= 5 && lines.length <= 25) {
      snippets.push({
        language,
        code: code.trim(),
        lineCount: lines.length,
        // Extract surrounding context (heading before code block)
        context: extractPrecedingHeading(markdown, match.index),
      });
    }
  }

  return snippets;
}

function extractPrecedingHeading(markdown: string, position: number): string {
  const beforeCode = markdown.substring(0, position);
  const headingMatch = beforeCode.match(/#{1,3}\s+(.+)$/m);
  return headingMatch ? headingMatch[1] : "";
}
````

---

## 5. Stage 3: Processing (LLM)

### 5.1 Purpose

Transform raw code snippets into educational micro-learning posts.

### 5.2 LLM Prompt Engineering

```typescript
const SYSTEM_PROMPT = `You are a technical content creator for DevDose, a micro-learning app for frontend developers.

Your task is to transform code snippets into engaging, educational posts that can be consumed in 30 seconds.

Guidelines:
- Create an attention-grabbing title (5-8 words)
- Write a concise explanation (2-3 sentences, max 100 words)
- Focus on practical value and "aha!" moments
- Explain WHAT the code does and WHY it's useful
- Use simple language, avoid jargon when possible
- Highlight modern best practices

Output format: JSON only, no additional text.`;

interface LLMRequest {
  code: string;
  language: string;
  context?: string;
  sourceUrl: string;
  sourceName: string;
}

interface LLMResponse {
  title: string;
  explanation: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  isHighQuality: boolean;
  qualityScore: number; // 0-100
  reasoning: string; // Why this is/isn't high quality
}
```

**Implementation:**

```typescript
async function processWithLLM(snippet: CodeSnippet): Promise<LLMResponse> {
  const userPrompt = `
Code Snippet:
\`\`\`${snippet.language}
${snippet.code}
\`\`\`

Context: ${snippet.context || "N/A"}
Source: ${snippet.sourceName}

Generate a micro-learning post for this code snippet.

Respond with JSON:
{
  "title": "Catchy title here",
  "explanation": "Brief explanation here",
  "tags": ["tag1", "tag2"],
  "difficulty": "beginner|intermediate|advanced",
  "isHighQuality": true|false,
  "qualityScore": 0-100,
  "reasoning": "Why this is/isn't valuable content"
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### 5.3 Batch Processing

To optimize costs and speed:

```typescript
async function processBatch(snippets: CodeSnippet[]): Promise<Post[]> {
  const BATCH_SIZE = 10;
  const posts: Post[] = [];

  for (let i = 0; i < snippets.length; i += BATCH_SIZE) {
    const batch = snippets.slice(i, i + BATCH_SIZE);

    // Process in parallel
    const results = await Promise.all(
      batch.map((snippet) => processWithLLM(snippet))
    );

    // Filter high-quality results
    const highQuality = results.filter(
      (r) => r.isHighQuality && r.qualityScore >= 70
    );
    posts.push(...highQuality);

    // Rate limiting: wait 1 second between batches
    await sleep(1000);
  }

  return posts;
}
```

---

## 6. Stage 4: Quality Scoring

### 6.1 Purpose

Filter out low-quality, duplicate, or irrelevant content.

### 6.2 Quality Criteria

```typescript
interface QualityMetrics {
  // Code quality
  syntaxValid: boolean; // Code parses without errors
  hasComments: boolean; // Includes helpful comments
  followsBestPractices: boolean; // Modern syntax (ES6+, etc.)

  // Content quality
  explanationClarity: number; // 0-100 (LLM-scored)
  titleEngagement: number; // 0-100 (LLM-scored)
  practicalValue: number; // 0-100 (LLM-scored)

  // Source quality
  sourceReputation: number; // Based on stars, authority
  contentFreshness: number; // How recent is the source

  // Uniqueness
  isDuplicate: boolean; // Similar to existing posts
  novelty: number; // 0-100 (how unique)
}
```

**Implementation:**

```typescript
async function scoreQuality(post: Post): Promise<number> {
  let score = 0;

  // 1. Validate syntax (20 points)
  const syntaxValid = await validateSyntax(post.code, post.language);
  if (syntaxValid) score += 20;

  // 2. Check for duplicates (20 points)
  const isDuplicate = await checkDuplicate(post.code);
  if (!isDuplicate) score += 20;

  // 3. Source reputation (20 points)
  const repoStars = post.repositoryStars || 0;
  if (repoStars > 10000) score += 20;
  else if (repoStars > 5000) score += 15;
  else if (repoStars > 1000) score += 10;

  // 4. Content length (20 points)
  const explanationWords = post.explanation.split(" ").length;
  if (explanationWords >= 30 && explanationWords <= 100) score += 20;
  else if (explanationWords >= 20) score += 10;

  // 5. LLM quality score (20 points)
  score += (post.qualityScore / 100) * 20;

  return score;
}

async function validateSyntax(
  code: string,
  language: string
): Promise<boolean> {
  try {
    if (language === "typescript" || language === "javascript") {
      // Use TypeScript compiler API
      const ts = require("typescript");
      const result = ts.transpileModule(code, {
        compilerOptions: { module: ts.ModuleKind.ESNext },
      });
      return !result.diagnostics?.length;
    }
    // Add validators for CSS, HTML, etc.
    return true;
  } catch (error) {
    return false;
  }
}

async function checkDuplicate(code: string): Promise<boolean> {
  // Simple approach: hash the code and check database
  const codeHash = hashCode(code);
  const existing = await db.posts.findOne({ codeHash });
  return !!existing;

  // Advanced: Use embeddings for semantic similarity
  // const embedding = await getEmbedding(code);
  // const similar = await db.posts.findSimilar(embedding, threshold: 0.9);
  // return similar.length > 0;
}
```

### 6.3 Quality Thresholds

```typescript
const QUALITY_THRESHOLDS = {
  AUTO_APPROVE: 85, // Automatically publish
  MANUAL_REVIEW: 70, // Flag for manual review
  AUTO_REJECT: 70, // Discard
};

function categorizeByQuality(posts: Post[]): {
  approved: Post[];
  review: Post[];
  rejected: Post[];
} {
  return {
    approved: posts.filter(
      (p) => p.qualityScore >= QUALITY_THRESHOLDS.AUTO_APPROVE
    ),
    review: posts.filter(
      (p) =>
        p.qualityScore >= QUALITY_THRESHOLDS.MANUAL_REVIEW &&
        p.qualityScore < QUALITY_THRESHOLDS.AUTO_APPROVE
    ),
    rejected: posts.filter(
      (p) => p.qualityScore < QUALITY_THRESHOLDS.AUTO_REJECT
    ),
  };
}
```

---

## 7. Stage 5: Enrichment

### 7.1 Purpose

Add metadata, tags, and additional context to posts.

### 7.2 Tag Generation

```typescript
async function enrichWithTags(post: Post): Promise<Post> {
  // 1. Extract tags from code
  const codeTags = extractTagsFromCode(post.code, post.language);

  // 2. Extract tags from source
  const sourceTags = extractTagsFromSource(post.sourceName);

  // 3. LLM-generated tags (already in post)
  const llmTags = post.tags;

  // 4. Merge and deduplicate
  const allTags = [...new Set([...codeTags, ...sourceTags, ...llmTags])];

  return {
    ...post,
    tags: allTags.slice(0, 5), // Limit to 5 tags
  };
}

function extractTagsFromCode(code: string, language: string): string[] {
  const tags: string[] = [];

  // Language tag
  tags.push(language);

  // Framework detection
  if (code.includes("useState") || code.includes("useEffect"))
    tags.push("react", "hooks");
  if (code.includes("@Component") || code.includes("@Injectable"))
    tags.push("angular");
  if (code.includes("ref(") || code.includes("computed(")) tags.push("vue");

  // Feature detection
  if (code.includes("async") || code.includes("await")) tags.push("async");
  if (code.includes("Promise")) tags.push("promises");
  if (code.includes("grid") || code.includes("flex")) tags.push("css-layout");

  return tags;
}
```

### 7.3 Difficulty Assessment

```typescript
function assessDifficulty(
  post: Post
): "beginner" | "intermediate" | "advanced" {
  let complexityScore = 0;

  // Code complexity indicators
  if (post.code.includes("async") || post.code.includes("Promise"))
    complexityScore += 1;
  if (post.code.includes("generics") || post.code.match(/<[A-Z]/))
    complexityScore += 2;
  if (post.code.includes("reduce") || post.code.includes("flatMap"))
    complexityScore += 1;
  if (post.code.split("\n").length > 15) complexityScore += 1;

  // Concept complexity
  const advancedConcepts = [
    "closure",
    "prototype",
    "decorator",
    "higher-order",
  ];
  if (
    advancedConcepts.some((c) => post.explanation.toLowerCase().includes(c))
  ) {
    complexityScore += 2;
  }

  // Categorize
  if (complexityScore <= 2) return "beginner";
  if (complexityScore <= 4) return "intermediate";
  return "advanced";
}
```

---

## 8. Stage 6: Publishing

### 8.1 Purpose

Insert approved posts into the database.

### 8.2 Database Schema

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  code_hash TEXT UNIQUE NOT NULL,
  language TEXT NOT NULL,
  explanation TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  -- Source metadata
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('github', 'docs', 'blog', 'article')),
  repository_stars INTEGER,
  author_name TEXT,
  source_last_updated TIMESTAMP,

  -- Quality metrics
  quality_score INTEGER NOT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Engagement
  view_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Indexes
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_difficulty ON posts(difficulty);
CREATE INDEX idx_posts_language ON posts(language);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_quality_score ON posts(quality_score DESC);
```

### 8.3 Publishing Logic

```typescript
async function publishPosts(posts: Post[]): Promise<void> {
  const { approved, review, rejected } = categorizeByQuality(posts);

  // 1. Auto-publish high-quality posts
  for (const post of approved) {
    await db.posts.insert({
      ...post,
      status: "published",
      codeHash: hashCode(post.code),
    });
    console.log(`✅ Published: ${post.title}`);
  }

  // 2. Save review queue
  for (const post of review) {
    await db.posts.insert({
      ...post,
      status: "draft",
      codeHash: hashCode(post.code),
    });
    console.log(`⚠️  Review needed: ${post.title}`);
  }

  // 3. Log rejected posts
  console.log(`❌ Rejected ${rejected.length} low-quality posts`);

  // 4. Send summary notification
  await sendSummary({
    published: approved.length,
    review: review.length,
    rejected: rejected.length,
  });
}
```

---

## 9. Orchestration & Scheduling

### 9.1 Main Pipeline Script

```typescript
// pipeline.ts
async function runPipeline() {
  console.log("🚀 Starting content pipeline...");

  try {
    // Stage 1: Discovery
    console.log("📡 Discovering sources...");
    const repos = await discoverTrendingRepos("react");
    const sources = [...CURATED_SOURCES, ...repos];

    // Stage 2: Extraction
    console.log("📤 Extracting code snippets...");
    const snippets: CodeSnippet[] = [];
    for (const source of sources) {
      if (source.type === "github") {
        const extracted = await extractFromGitHub(source.repo);
        snippets.push(...extracted);
      } else if (source.type === "docs") {
        const extracted = await extractFromDocs(source.url);
        snippets.push(...extracted);
      }
    }
    console.log(`Found ${snippets.length} code snippets`);

    // Stage 3: Processing
    console.log("🤖 Processing with LLM...");
    const processed = await processBatch(snippets);
    console.log(`Processed ${processed.length} posts`);

    // Stage 4: Quality Scoring
    console.log("⭐ Scoring quality...");
    for (const post of processed) {
      post.qualityScore = await scoreQuality(post);
    }

    // Stage 5: Enrichment
    console.log("✨ Enriching metadata...");
    const enriched = await Promise.all(
      processed.map((post) => enrichWithTags(post))
    );

    // Stage 6: Publishing
    console.log("📝 Publishing posts...");
    await publishPosts(enriched);

    console.log("✅ Pipeline complete!");
  } catch (error) {
    console.error("❌ Pipeline failed:", error);
    throw error;
  }
}

// Run pipeline
runPipeline();
```

### 9.2 Scheduling

**Option A: Node-cron (for local/server deployment)**

```typescript
import cron from "node-cron";

// Run daily at 2 AM
cron.schedule("0 2 * * *", async () => {
  console.log("Running scheduled pipeline...");
  await runPipeline();
});
```

**Option B: GitHub Actions (for serverless)**

```yaml
# .github/workflows/content-pipeline.yml
name: Content Pipeline

on:
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  generate-content:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: npm run pipeline
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
```

---

## 10. Cost Estimation

### 10.1 LLM Costs (OpenAI GPT-4)

**Pricing (as of 2026):**

- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens

**Per Post Estimate:**

- Input tokens: ~500 (code + prompt)
- Output tokens: ~200 (JSON response)
- Cost per post: ~$0.027

**Monthly Costs:**

- 100 posts/day × 30 days = 3,000 posts
- Total cost: ~$81/month

### 10.2 GitHub API Limits

- **Free tier**: 5,000 requests/hour
- **Authenticated**: 5,000 requests/hour per token
- **Strategy**: Use multiple tokens, implement caching

### 10.3 Cost Optimization

1. **Cache aggressively**: Don't re-process same repos
2. **Use cheaper models for filtering**: GPT-3.5 for initial quality check
3. **Batch processing**: Reduce API overhead
4. **Smart sampling**: Don't extract every code block, sample strategically

---

## 11. Monitoring & Maintenance

### 11.1 Metrics to Track

```typescript
interface PipelineMetrics {
  // Volume
  snippetsExtracted: number;
  postsProcessed: number;
  postsPublished: number;

  // Quality
  averageQualityScore: number;
  approvalRate: number; // % auto-approved
  duplicateRate: number; // % rejected as duplicates

  // Performance
  executionTime: number; // milliseconds
  llmCost: number; // dollars
  apiCallsUsed: number;

  // Errors
  failedExtractions: number;
  llmErrors: number;
  databaseErrors: number;
}
```

### 11.2 Logging

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: "pipeline-error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "pipeline.log" }),
  ],
});

// Usage
logger.info("Pipeline started", { timestamp: new Date() });
logger.error("LLM processing failed", {
  snippet: snippet.code,
  error: error.message,
});
```

### 11.3 Alerts

```typescript
async function sendAlert(message: string) {
  // Option 1: Email (using Nodemailer)
  // Option 2: Slack webhook
  // Option 3: Discord webhook

  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `🚨 Pipeline Alert: ${message}`,
    }),
  });
}
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

````typescript
// tests/extraction.test.ts
describe("Code Extraction", () => {
  it("should extract code blocks from markdown", () => {
    const markdown = `
# Example
\`\`\`typescript
const foo = 'bar';
\`\`\`
    `;
    const snippets = extractCodeBlocks(markdown);
    expect(snippets).toHaveLength(1);
    expect(snippets[0].language).toBe("typescript");
  });

  it("should filter code blocks by line count", () => {
    const shortCode = "```js\nconst x = 1;\n```";
    const snippets = extractCodeBlocks(shortCode);
    expect(snippets).toHaveLength(0); // Too short
  });
});
````

### 12.2 Integration Tests

```typescript
// tests/pipeline.integration.test.ts
describe("Full Pipeline", () => {
  it("should process a real repository", async () => {
    const snippets = await extractFromGitHub("facebook/react");
    expect(snippets.length).toBeGreaterThan(0);

    const processed = await processWithLLM(snippets[0]);
    expect(processed.title).toBeTruthy();
    expect(processed.explanation).toBeTruthy();
  });
});
```

### 12.3 Manual Review Process

For posts in review queue:

1. **Daily Review Session**: Spend 15-30 minutes reviewing flagged posts
2. **Approval Criteria**:
   - Code is correct and useful
   - Explanation is clear
   - No duplicates
3. **Actions**: Approve, Edit & Approve, or Reject

---

## 13. Future Enhancements

### 13.1 Advanced Features

1. **Semantic Deduplication**: Use embeddings to detect similar (not identical) posts
2. **Trend Detection**: Identify emerging topics and prioritize them
3. **Multi-language Support**: Expand beyond frontend (Python, Rust, Go)
4. **Interactive Examples**: Generate CodeSandbox/StackBlitz links
5. **Video Snippets**: Extract code from YouTube tutorials
6. **Community Contributions**: Allow users to submit snippets

### 13.2 ML Improvements

1. **Custom Quality Model**: Train a classifier on approved/rejected posts
2. **Personalized Extraction**: Learn which types of content users engage with most
3. **Auto-tagging**: Fine-tune a model for better tag generation

---

## 14. Implementation Checklist

### Phase 1: MVP Pipeline (Week 1-2)

- [ ] Set up Node.js project with TypeScript
- [ ] Implement GitHub API integration (Octokit)
- [ ] Build markdown code block extractor
- [ ] Create OpenAI GPT-4 integration
- [ ] Implement basic quality scoring
- [ ] Set up Supabase database connection
- [ ] Create publishing logic
- [ ] Test with 1-2 repositories manually

### Phase 2: Automation (Week 3-4)

- [ ] Add repository discovery logic
- [ ] Implement caching layer
- [ ] Add duplicate detection
- [ ] Create scheduling (cron or GitHub Actions)
- [ ] Build monitoring and logging
- [ ] Set up error alerts
- [ ] Test full automated run

### Phase 3: Optimization (Week 5-6)

- [ ] Optimize LLM prompts for better quality
- [ ] Implement batch processing
- [ ] Add syntax validation
- [ ] Create manual review dashboard
- [ ] Fine-tune quality thresholds
- [ ] Add cost tracking

---

## 15. Example Output

Here's what a successfully processed post looks like:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "React's useCallback: Prevent Unnecessary Re-renders",
  "code": "const handleClick = useCallback(() => {\n  console.log('Clicked!');\n  analytics.track('button_click');\n}, []);\n\nreturn <Button onClick={handleClick} />;",
  "language": "typescript",
  "explanation": "useCallback memoizes your function so it doesn't get recreated on every render. This prevents child components from re-rendering unnecessarily when passed as props. Perfect for optimizing performance in large component trees.",
  "tags": ["react", "hooks", "performance", "optimization"],
  "difficulty": "intermediate",
  "sourceUrl": "https://github.com/facebook/react/blob/main/docs/hooks-reference.md",
  "sourceName": "facebook/react",
  "sourceType": "github",
  "repositoryStars": 220000,
  "authorName": "React Team",
  "qualityScore": 92,
  "createdAt": "2026-01-15T10:30:00Z",
  "status": "published"
}
```

---

## Document Control

**Author**: Vasu Vallabh  
**Next Steps**: Begin Phase 1 implementation  
**Review Date**: After initial pipeline run

---

**End of Document**
