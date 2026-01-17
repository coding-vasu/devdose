# Stage 6: Publishing

**Pipeline Stage:** Publishing  
**Purpose:** Insert approved posts into Supabase database  
**Input:** Enriched posts  
**Output:** Published posts in production database

---

## Overview

The Publishing stage is the final step, inserting enriched posts into the Supabase PostgreSQL database. It handles:

- **Database Schema Creation**: Set up tables and indexes
- **Batch Insertion**: Efficiently insert multiple posts
- **Conflict Resolution**: Handle duplicates gracefully
- **Status Management**: Track draft/published/archived states
- **Rollback Support**: Revert failed batches

---

## Database Schema

### Posts Table

```sql
-- pipeline/publishing/schema.sql

CREATE TABLE IF NOT EXISTS posts (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  code_hash TEXT UNIQUE NOT NULL,
  language TEXT NOT NULL,
  explanation TEXT NOT NULL,

  -- Tags and categorization
  tags TEXT[] NOT NULL,
  primary_tag TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  complexity_score INTEGER CHECK (complexity_score >= 0 AND complexity_score <= 10),

  -- Source metadata
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('github', 'docs', 'blog', 'article')),
  repository_stars INTEGER,
  author_name TEXT,
  source_last_updated TIMESTAMP,

  -- Quality metrics
  quality_score INTEGER NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),

  -- SEO
  search_keywords TEXT[],
  meta_description TEXT,
  estimated_read_time INTEGER, -- seconds

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_posts_primary_tag ON posts(primary_tag);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_difficulty ON posts(difficulty);
CREATE INDEX IF NOT EXISTS idx_posts_language ON posts(language);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_quality_score ON posts(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_search_keywords ON posts USING GIN(search_keywords);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN(
  to_tsvector('english', title || ' ' || explanation)
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Implementation

### File Structure

```
pipeline/
├── publishing/
│   ├── index.ts              # Main orchestrator
│   ├── database.ts           # Supabase client
│   ├── batch-inserter.ts     # Batch insertion logic
│   ├── schema.sql            # Database schema
│   └── types.ts              # TypeScript interfaces
```

### Type Definitions

```typescript
// pipeline/publishing/types.ts

export interface DatabasePost {
  title: string;
  code: string;
  code_hash: string;
  language: string;
  explanation: string;
  tags: string[];
  primary_tag: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  complexity_score: number;
  source_url: string;
  source_name: string;
  source_type: "github" | "docs" | "blog" | "article";
  repository_stars?: number;
  author_name?: string;
  source_last_updated?: string;
  quality_score: number;
  search_keywords: string[];
  meta_description: string;
  estimated_read_time: number;
  status: "draft" | "published" | "archived";
}

export interface PublishingResult {
  published: number;
  failed: number;
  errors: Array<{ post: string; error: string }>;
}
```

### Database Client

```typescript
// pipeline/publishing/database.ts

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export class Database {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY required");
    }

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Initialize database schema
   */
  async initializeSchema(): Promise<void> {
    const fs = await import("fs/promises");
    const path = await import("path");

    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = await fs.readFile(schemaPath, "utf-8");

    // Execute schema SQL
    const { error } = await this.client.rpc("exec_sql", { sql: schema });

    if (error) {
      throw new Error(`Schema initialization failed: ${error.message}`);
    }

    console.log("✅ Database schema initialized");
  }

  /**
   * Insert a single post
   */
  async insertPost(post: DatabasePost): Promise<void> {
    const { error } = await this.client.from("posts").insert(post);

    if (error) {
      throw new Error(`Insert failed: ${error.message}`);
    }
  }

  /**
   * Insert multiple posts in batch
   */
  async insertBatch(posts: DatabasePost[]): Promise<PublishingResult> {
    const result: PublishingResult = {
      published: 0,
      failed: 0,
      errors: [],
    };

    // Supabase supports batch inserts up to 1000 rows
    const BATCH_SIZE = 100;

    for (let i = 0; i < posts.length; i += BATCH_SIZE) {
      const batch = posts.slice(i, i + BATCH_SIZE);

      const { data, error } = await this.client
        .from("posts")
        .insert(batch)
        .select();

      if (error) {
        result.failed += batch.length;
        result.errors.push({
          post: `Batch ${i / BATCH_SIZE + 1}`,
          error: error.message,
        });
      } else {
        result.published += data?.length || 0;
      }
    }

    return result;
  }

  /**
   * Check if post exists by code hash
   */
  async postExists(codeHash: string): Promise<boolean> {
    const { data } = await this.client
      .from("posts")
      .select("id")
      .eq("code_hash", codeHash)
      .single();

    return !!data;
  }

  /**
   * Update post status
   */
  async updateStatus(
    id: string,
    status: "draft" | "published" | "archived"
  ): Promise<void> {
    const { error } = await this.client
      .from("posts")
      .update({ status })
      .eq("id", id);

    if (error) {
      throw new Error(`Status update failed: ${error.message}`);
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byDifficulty: Record<string, number>;
  }> {
    const { data: posts } = await this.client
      .from("posts")
      .select("status, difficulty");

    if (!posts) return { total: 0, byStatus: {}, byDifficulty: {} };

    const byStatus = posts.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byDifficulty = posts.reduce((acc, p) => {
      acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: posts.length,
      byStatus,
      byDifficulty,
    };
  }
}
```

### Batch Inserter

```typescript
// pipeline/publishing/batch-inserter.ts

import crypto from "crypto";
import { Database } from "./database";
import { EnrichedPost } from "../enrichment/types";
import { DatabasePost, PublishingResult } from "./types";

export class BatchInserter {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Transform enriched post to database format
   */
  private transformPost(post: EnrichedPost): DatabasePost {
    return {
      title: post.title,
      code: post.code,
      code_hash: this.hashCode(post.code),
      language: post.language,
      explanation: post.explanation,
      tags: post.enhancedTags,
      primary_tag: post.primaryTag,
      category: post.category,
      difficulty: post.refinedDifficulty,
      complexity_score: post.complexityScore,
      source_url: post.sourceUrl,
      source_name: post.sourceName,
      source_type: "github", // TODO: Get from post
      repository_stars: post.repositoryStars,
      author_name: post.authorName,
      source_last_updated: post.lastUpdated?.toISOString(),
      quality_score: post.qualityMetrics.totalScore,
      search_keywords: post.searchKeywords,
      meta_description: post.metaDescription,
      estimated_read_time: post.estimatedReadTime,
      status: "published",
    };
  }

  /**
   * Hash code for duplicate detection
   */
  private hashCode(code: string): string {
    const normalized = code.replace(/\s+/g, " ").trim();
    return crypto.createHash("md5").update(normalized).digest("hex");
  }

  /**
   * Filter out existing posts
   */
  async filterExisting(posts: EnrichedPost[]): Promise<EnrichedPost[]> {
    const newPosts: EnrichedPost[] = [];

    for (const post of posts) {
      const hash = this.hashCode(post.code);
      const exists = await this.db.postExists(hash);

      if (!exists) {
        newPosts.push(post);
      } else {
        console.log(`⏭️  Skipping duplicate: ${post.title}`);
      }
    }

    return newPosts;
  }

  /**
   * Insert posts in batches
   */
  async insertBatch(posts: EnrichedPost[]): Promise<PublishingResult> {
    // Filter out existing posts
    const newPosts = await this.filterExisting(posts);

    if (newPosts.length === 0) {
      console.log("ℹ️  No new posts to publish");
      return { published: 0, failed: 0, errors: [] };
    }

    // Transform to database format
    const dbPosts = newPosts.map((p) => this.transformPost(p));

    // Insert batch
    console.log(`📝 Publishing ${dbPosts.length} posts...`);
    const result = await this.db.insertBatch(dbPosts);

    return result;
  }
}
```

### Main Publishing Orchestrator

```typescript
// pipeline/publishing/index.ts

import { Database } from "./database";
import { BatchInserter } from "./batch-inserter";
import { EnrichedPost } from "../enrichment/types";
import { PublishingResult } from "./types";

export class Publishing {
  private db: Database;
  private inserter: BatchInserter;

  constructor() {
    this.db = new Database();
    this.inserter = new BatchInserter(this.db);
  }

  /**
   * Initialize database (run once)
   */
  async initialize(): Promise<void> {
    await this.db.initializeSchema();
  }

  /**
   * Publish enriched posts
   */
  async run(posts: EnrichedPost[]): Promise<PublishingResult> {
    console.log("🚀 Starting Publishing Stage...\n");
    console.log(`📊 Total posts to publish: ${posts.length}\n`);

    // Insert posts
    const result = await this.inserter.insertBatch(posts);

    // Get updated stats
    const stats = await this.db.getStats();

    this.printSummary(result, stats);

    return result;
  }

  private printSummary(
    result: PublishingResult,
    stats: {
      total: number;
      byStatus: Record<string, number>;
      byDifficulty: Record<string, number>;
    }
  ) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 PUBLISHING SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Published: ${result.published}`);
    console.log(`❌ Failed: ${result.failed}`);

    if (result.errors.length > 0) {
      console.log("\nErrors:");
      result.errors.forEach((e) => {
        console.log(`  ${e.post}: ${e.error}`);
      });
    }

    console.log("\nDatabase Statistics:");
    console.log(`  Total Posts: ${stats.total}`);
    console.log("\n  By Status:");
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      console.log(`    ${status.padEnd(15)}: ${count}`);
    });

    console.log("\n  By Difficulty:");
    Object.entries(stats.byDifficulty).forEach(([diff, count]) => {
      console.log(`    ${diff.padEnd(15)}: ${count}`);
    });

    console.log("=".repeat(60) + "\n");
  }
}
```

---

## Environment Setup

```bash
# .env

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
```

---

## Usage

### Initialize Database (One-time)

```typescript
import { Publishing } from "./pipeline/publishing";

const publishing = new Publishing();
await publishing.initialize();
```

### Publish Posts

```typescript
import enrichedPosts from "./enriched-posts.json";

const publishing = new Publishing();
const result = await publishing.run(enrichedPosts);

console.log(`Published ${result.published} posts`);
```

---

## Testing

```typescript
// Test publishing
const testPost: EnrichedPost = {
  // ... full enriched post data
};

const publishing = new Publishing();
const result = await publishing.run([testPost]);

expect(result.published).toBe(1);
expect(result.failed).toBe(0);
```

---

## Rollback Strategy

```typescript
// Save batch ID before publishing
const batchId = Date.now();

// Tag posts with batch ID
const postsWithBatch = posts.map((p) => ({
  ...p,
  batch_id: batchId,
}));

// If something goes wrong, rollback
async function rollback(batchId: number) {
  await supabase.from("posts").delete().eq("batch_id", batchId);
}
```

---

## Complete Pipeline

Now all 6 stages are complete! Here's how to run the full pipeline:

```typescript
// main.ts
import { Discovery } from "./pipeline/discovery";
import { Extraction } from "./pipeline/extraction";
import { Processing } from "./pipeline/processing";
import { QualityScoring } from "./pipeline/quality-scoring";
import { Enrichment } from "./pipeline/enrichment";
import { Publishing } from "./pipeline/publishing";

async function runPipeline() {
  // Stage 1: Discovery
  const discovery = new Discovery();
  const { sources } = await discovery.run();

  // Stage 2: Extraction
  const extraction = new Extraction();
  const { snippets } = await extraction.run(sources);

  // Stage 3: Processing
  const processing = new Processing();
  const processedPosts = await processing.run(snippets);

  // Stage 4: Quality Scoring
  const scoring = new QualityScoring();
  const { approved } = await scoring.run(processedPosts);

  // Stage 5: Enrichment
  const enrichment = new Enrichment();
  const enrichedPosts = await enrichment.run(approved);

  // Stage 6: Publishing
  const publishing = new Publishing();
  const result = await publishing.run(enrichedPosts);

  console.log(`\n🎉 Pipeline complete! Published ${result.published} posts`);
}

runPipeline().catch(console.error);
```

---

**End of Pipeline Documentation**
