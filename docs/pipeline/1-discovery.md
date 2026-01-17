# Stage 1: Discovery

**Pipeline Stage:** Discovery  
**Purpose:** Identify high-quality sources of frontend development content  
**Input:** Configuration (topics, filters)  
**Output:** List of repositories and documentation sources to process

---

## Table of Contents

1. [Overview](#overview)
2. [Discovery Strategies](#discovery-strategies)
3. [Implementation](#implementation)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The Discovery stage is the entry point of the content pipeline. It identifies valuable sources of code snippets and learning content by:

- Searching GitHub for trending repositories
- Maintaining a curated list of high-quality sources
- Parsing "awesome" lists for community-recommended resources
- Monitoring documentation sites for updates

### Success Criteria

- Discover 20-50 active repositories per topic
- Maintain 100+ curated sources across all technologies
- Identify sources with 1000+ stars and recent activity
- Balance between popular and emerging projects

---

## Discovery Strategies

### Strategy 1: GitHub Trending Repositories

Search GitHub for repositories that match our criteria:

**Criteria:**

- **Stars:** 1000+ (indicates quality and popularity)
- **Recent Activity:** Pushed within last 6 months
- **Topics:** Match frontend tech stack (react, typescript, vue, angular, css)
- **Language:** JavaScript, TypeScript
- **Has Documentation:** README.md exists and is substantial

**Why This Works:**

- High star count = community validation
- Recent activity = current best practices
- Good documentation = extractable content

### Strategy 2: Curated Source List

Manually maintain a list of authoritative sources:

**Categories:**

1. **Official Documentation**

   - React.dev, TypeScript docs, MDN, Angular.dev
   - Always up-to-date, canonical information

2. **Top Repositories**

   - facebook/react, microsoft/TypeScript, vuejs/core
   - Source of truth for framework patterns

3. **Educational Platforms**

   - web.dev, CSS-Tricks, JavaScript.info
   - High-quality tutorials and examples

4. **Community Resources**
   - Awesome lists, curated collections
   - Community-vetted content

**Why This Works:**

- Guaranteed quality
- Comprehensive coverage
- Stable, reliable sources

### Strategy 3: Awesome Lists

Parse GitHub "awesome" lists for curated resources:

**Target Lists:**

- awesome-react
- awesome-typescript
- awesome-css
- awesome-javascript
- awesome-vue
- awesome-angular

**Why This Works:**

- Community curation
- Discover hidden gems
- Stay current with ecosystem

---

## Implementation

### Setup

#### 1. Install Dependencies

```bash
npm install @octokit/rest dotenv
npm install --save-dev @types/node
```

#### 2. Environment Configuration

Create `.env` file:

```bash
# GitHub Personal Access Token (for higher rate limits)
GITHUB_TOKEN=ghp_your_token_here

# Discovery settings
MIN_STARS=1000
MAX_RESULTS_PER_TOPIC=50
ACTIVITY_MONTHS=6
```

**Getting a GitHub Token:**

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `public_repo`, `read:org`
4. Copy token to `.env`

### Core Implementation

#### File Structure

```
pipeline/
├── discovery/
│   ├── index.ts              # Main orchestrator
│   ├── github-discovery.ts   # GitHub API integration
│   ├── curated-sources.ts    # Static source list
│   ├── awesome-parser.ts     # Parse awesome lists
│   └── types.ts              # TypeScript interfaces
```

#### Type Definitions

```typescript
// pipeline/discovery/types.ts

export interface Source {
  type: "github" | "docs" | "blog" | "awesome";
  name: string;
  url: string;
  tags: string[];
  priority: number; // 1-10, higher = more important
  lastChecked?: Date;
}

export interface GitHubRepo extends Source {
  type: "github";
  owner: string;
  repo: string;
  stars: number;
  forks: number;
  language: string;
  lastPushed: Date;
  hasExamples: boolean;
  hasGoodDocs: boolean;
}

export interface DiscoveryConfig {
  topics: string[];
  minStars: number;
  maxResultsPerTopic: number;
  activityMonths: number;
  includeAwesomeLists: boolean;
}

export interface DiscoveryResult {
  sources: Source[];
  stats: {
    totalFound: number;
    byType: Record<string, number>;
    byTopic: Record<string, number>;
  };
  timestamp: Date;
}
```

#### GitHub Discovery Implementation

```typescript
// pipeline/discovery/github-discovery.ts

import { Octokit } from "@octokit/rest";
import { GitHubRepo, DiscoveryConfig } from "./types";

export class GitHubDiscovery {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Discover trending repositories for a specific topic
   */
  async discoverByTopic(
    topic: string,
    config: DiscoveryConfig
  ): Promise<GitHubRepo[]> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - config.activityMonths);

    const query = this.buildSearchQuery(topic, config, cutoffDate);

    console.log(`🔍 Searching GitHub: ${query}`);

    try {
      const { data } = await this.octokit.search.repos({
        q: query,
        sort: "stars",
        order: "desc",
        per_page: config.maxResultsPerTopic,
      });

      console.log(
        `✅ Found ${data.items.length} repositories for topic: ${topic}`
      );

      // Transform to our format
      const repos = await Promise.all(
        data.items.map((item) => this.transformRepo(item, topic))
      );

      return repos.filter((repo) => repo !== null) as GitHubRepo[];
    } catch (error) {
      console.error(`❌ Error discovering repos for ${topic}:`, error);
      return [];
    }
  }

  /**
   * Build GitHub search query
   */
  private buildSearchQuery(
    topic: string,
    config: DiscoveryConfig,
    cutoffDate: Date
  ): string {
    const parts = [
      `topic:${topic}`,
      `stars:>${config.minStars}`,
      `pushed:>${cutoffDate.toISOString().split("T")[0]}`,
      "language:TypeScript OR language:JavaScript",
    ];

    return parts.join(" ");
  }

  /**
   * Transform GitHub API response to our format
   */
  private async transformRepo(
    item: any,
    topic: string
  ): Promise<GitHubRepo | null> {
    try {
      // Check if repo has good documentation
      const hasGoodDocs = await this.checkDocumentation(
        item.owner.login,
        item.name
      );

      // Check if repo has examples
      const hasExamples = await this.checkExamples(item.owner.login, item.name);

      return {
        type: "github",
        name: item.full_name,
        url: item.html_url,
        owner: item.owner.login,
        repo: item.name,
        tags: [topic, ...(item.topics || [])],
        stars: item.stargazers_count,
        forks: item.forks_count,
        language: item.language,
        lastPushed: new Date(item.pushed_at),
        hasExamples,
        hasGoodDocs,
        priority: this.calculatePriority(item, hasGoodDocs, hasExamples),
      };
    } catch (error) {
      console.error(`Error transforming repo ${item.full_name}:`, error);
      return null;
    }
  }

  /**
   * Check if repository has good documentation
   */
  private async checkDocumentation(
    owner: string,
    repo: string
  ): Promise<boolean> {
    try {
      const { data } = await this.octokit.repos.getReadme({
        owner,
        repo,
      });

      // Consider "good" if README is > 1000 bytes
      return data.size > 1000;
    } catch {
      return false;
    }
  }

  /**
   * Check if repository has examples directory
   */
  private async checkExamples(owner: string, repo: string): Promise<boolean> {
    try {
      await this.octokit.repos.getContent({
        owner,
        repo,
        path: "examples",
      });
      return true;
    } catch {
      // Try alternative paths
      try {
        await this.octokit.repos.getContent({
          owner,
          repo,
          path: "example",
        });
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Calculate priority score (1-10)
   */
  private calculatePriority(
    item: any,
    hasGoodDocs: boolean,
    hasExamples: boolean
  ): number {
    let score = 5; // Base score

    // Star-based scoring
    if (item.stargazers_count > 50000) score += 3;
    else if (item.stargazers_count > 10000) score += 2;
    else if (item.stargazers_count > 5000) score += 1;

    // Documentation bonus
    if (hasGoodDocs) score += 1;

    // Examples bonus
    if (hasExamples) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Discover across multiple topics
   */
  async discoverAll(config: DiscoveryConfig): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = [];

    for (const topic of config.topics) {
      const repos = await this.discoverByTopic(topic, config);
      allRepos.push(...repos);

      // Rate limiting: wait 1 second between topics
      await this.sleep(1000);
    }

    // Deduplicate by repo name
    const unique = this.deduplicateRepos(allRepos);

    console.log(`\n📊 Discovery Summary:`);
    console.log(`   Total found: ${allRepos.length}`);
    console.log(`   Unique: ${unique.length}`);

    return unique;
  }

  /**
   * Remove duplicate repositories
   */
  private deduplicateRepos(repos: GitHubRepo[]): GitHubRepo[] {
    const seen = new Set<string>();
    return repos.filter((repo) => {
      if (seen.has(repo.name)) return false;
      seen.add(repo.name);
      return true;
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

#### Curated Sources

```typescript
// pipeline/discovery/curated-sources.ts

import { Source } from "./types";

/**
 * Manually curated high-quality sources
 * These are guaranteed to have valuable content
 */
export const CURATED_SOURCES: Source[] = [
  // ===== Official Documentation =====
  {
    type: "docs",
    name: "React Documentation",
    url: "https://react.dev",
    tags: ["react", "hooks", "components"],
    priority: 10,
  },
  {
    type: "docs",
    name: "TypeScript Handbook",
    url: "https://www.typescriptlang.org/docs",
    tags: ["typescript", "types"],
    priority: 10,
  },
  {
    type: "docs",
    name: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/docs/Web",
    tags: ["javascript", "css", "html", "web-apis"],
    priority: 10,
  },
  {
    type: "docs",
    name: "Vue.js Guide",
    url: "https://vuejs.org/guide",
    tags: ["vue", "composition-api"],
    priority: 9,
  },
  {
    type: "docs",
    name: "Angular Documentation",
    url: "https://angular.dev",
    tags: ["angular", "rxjs"],
    priority: 9,
  },

  // ===== Top GitHub Repositories =====
  {
    type: "github",
    name: "facebook/react",
    url: "https://github.com/facebook/react",
    tags: ["react", "hooks"],
    priority: 10,
  },
  {
    type: "github",
    name: "microsoft/TypeScript",
    url: "https://github.com/microsoft/TypeScript",
    tags: ["typescript"],
    priority: 10,
  },
  {
    type: "github",
    name: "vuejs/core",
    url: "https://github.com/vuejs/core",
    tags: ["vue"],
    priority: 9,
  },
  {
    type: "github",
    name: "angular/angular",
    url: "https://github.com/angular/angular",
    tags: ["angular"],
    priority: 9,
  },
  {
    type: "github",
    name: "vercel/next.js",
    url: "https://github.com/vercel/next.js",
    tags: ["react", "nextjs", "ssr"],
    priority: 9,
  },

  // ===== Educational Platforms =====
  {
    type: "blog",
    name: "web.dev",
    url: "https://web.dev",
    tags: ["performance", "web", "best-practices"],
    priority: 9,
  },
  {
    type: "blog",
    name: "CSS-Tricks",
    url: "https://css-tricks.com",
    tags: ["css", "layout", "animations"],
    priority: 8,
  },
  {
    type: "blog",
    name: "JavaScript.info",
    url: "https://javascript.info",
    tags: ["javascript", "fundamentals"],
    priority: 8,
  },

  // ===== Awesome Lists =====
  {
    type: "awesome",
    name: "awesome-react",
    url: "https://github.com/enaqx/awesome-react",
    tags: ["react"],
    priority: 7,
  },
  {
    type: "awesome",
    name: "awesome-typescript",
    url: "https://github.com/dzharii/awesome-typescript",
    tags: ["typescript"],
    priority: 7,
  },
  {
    type: "awesome",
    name: "awesome-css",
    url: "https://github.com/awesome-css-group/awesome-css",
    tags: ["css"],
    priority: 7,
  },
  {
    type: "awesome",
    name: "awesome-javascript",
    url: "https://github.com/sorrycc/awesome-javascript",
    tags: ["javascript"],
    priority: 7,
  },
];

/**
 * Get curated sources by tag
 */
export function getCuratedSourcesByTag(tag: string): Source[] {
  return CURATED_SOURCES.filter((source) =>
    source.tags.includes(tag.toLowerCase())
  );
}

/**
 * Get high-priority curated sources
 */
export function getHighPrioritySources(minPriority: number = 8): Source[] {
  return CURATED_SOURCES.filter((source) => source.priority >= minPriority);
}
```

#### Main Discovery Orchestrator

```typescript
// pipeline/discovery/index.ts

import dotenv from "dotenv";
import { GitHubDiscovery } from "./github-discovery";
import { CURATED_SOURCES } from "./curated-sources";
import { DiscoveryConfig, DiscoveryResult, Source } from "./types";

dotenv.config();

/**
 * Main discovery orchestrator
 */
export class Discovery {
  private githubDiscovery: GitHubDiscovery;
  private config: DiscoveryConfig;

  constructor(config?: Partial<DiscoveryConfig>) {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error("GITHUB_TOKEN not found in environment");
    }

    this.githubDiscovery = new GitHubDiscovery(githubToken);

    // Default configuration
    this.config = {
      topics: ["react", "typescript", "vue", "angular", "css", "javascript"],
      minStars: parseInt(process.env.MIN_STARS || "1000"),
      maxResultsPerTopic: parseInt(process.env.MAX_RESULTS_PER_TOPIC || "50"),
      activityMonths: parseInt(process.env.ACTIVITY_MONTHS || "6"),
      includeAwesomeLists: true,
      ...config,
    };
  }

  /**
   * Run full discovery process
   */
  async run(): Promise<DiscoveryResult> {
    console.log("🚀 Starting Discovery Stage...\n");

    const sources: Source[] = [];

    // 1. Add curated sources
    console.log("📚 Adding curated sources...");
    sources.push(...CURATED_SOURCES);
    console.log(`   Added ${CURATED_SOURCES.length} curated sources\n`);

    // 2. Discover trending GitHub repositories
    console.log("🔍 Discovering trending repositories...");
    const githubRepos = await this.githubDiscovery.discoverAll(this.config);
    sources.push(...githubRepos);
    console.log(`   Discovered ${githubRepos.length} GitHub repositories\n`);

    // 3. Calculate statistics
    const stats = this.calculateStats(sources);

    const result: DiscoveryResult = {
      sources,
      stats,
      timestamp: new Date(),
    };

    this.printSummary(result);

    return result;
  }

  /**
   * Calculate discovery statistics
   */
  private calculateStats(sources: Source[]) {
    const byType: Record<string, number> = {};
    const byTopic: Record<string, number> = {};

    for (const source of sources) {
      // Count by type
      byType[source.type] = (byType[source.type] || 0) + 1;

      // Count by topic
      for (const tag of source.tags) {
        byTopic[tag] = (byTopic[tag] || 0) + 1;
      }
    }

    return {
      totalFound: sources.length,
      byType,
      byTopic,
    };
  }

  /**
   * Print discovery summary
   */
  private printSummary(result: DiscoveryResult) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 DISCOVERY SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Sources: ${result.stats.totalFound}`);
    console.log("\nBy Type:");
    Object.entries(result.stats.byType)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type.padEnd(10)}: ${count}`);
      });

    console.log("\nTop Topics:");
    Object.entries(result.stats.byTopic)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([topic, count]) => {
        console.log(`  ${topic.padEnd(20)}: ${count}`);
      });

    console.log("=".repeat(60) + "\n");
  }

  /**
   * Save results to file
   */
  async saveResults(result: DiscoveryResult, filepath: string): Promise<void> {
    const fs = await import("fs/promises");
    await fs.writeFile(filepath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`💾 Results saved to: ${filepath}`);
  }
}

// CLI usage
if (require.main === module) {
  const discovery = new Discovery();

  discovery
    .run()
    .then((result) => {
      return discovery.saveResults(result, "discovery-results.json");
    })
    .catch((error) => {
      console.error("❌ Discovery failed:", error);
      process.exit(1);
    });
}
```

---

## Configuration

### Environment Variables

```bash
# .env

# GitHub API
GITHUB_TOKEN=ghp_your_token_here

# Discovery Settings
MIN_STARS=1000                    # Minimum stars for repos
MAX_RESULTS_PER_TOPIC=50          # Max repos per topic
ACTIVITY_MONTHS=6                 # Recent activity window

# Topics to search (comma-separated)
TOPICS=react,typescript,vue,angular,css,javascript
```

### Custom Configuration

```typescript
// custom-discovery.ts

import { Discovery } from "./pipeline/discovery";

const discovery = new Discovery({
  topics: ["react", "nextjs"], // Custom topics
  minStars: 5000, // Higher threshold
  maxResultsPerTopic: 20, // Fewer results
  activityMonths: 3, // More recent only
});

discovery.run();
```

---

## Testing

### Unit Tests

```typescript
// pipeline/discovery/__tests__/github-discovery.test.ts

import { GitHubDiscovery } from "../github-discovery";

describe("GitHubDiscovery", () => {
  let discovery: GitHubDiscovery;

  beforeEach(() => {
    discovery = new GitHubDiscovery(process.env.GITHUB_TOKEN!);
  });

  it("should discover React repositories", async () => {
    const repos = await discovery.discoverByTopic("react", {
      topics: ["react"],
      minStars: 1000,
      maxResultsPerTopic: 10,
      activityMonths: 6,
      includeAwesomeLists: false,
    });

    expect(repos.length).toBeGreaterThan(0);
    expect(repos[0].tags).toContain("react");
    expect(repos[0].stars).toBeGreaterThanOrEqual(1000);
  });

  it("should calculate priority correctly", async () => {
    // Test with facebook/react (should be high priority)
    const repos = await discovery.discoverByTopic("react", {
      topics: ["react"],
      minStars: 100000,
      maxResultsPerTopic: 5,
      activityMonths: 12,
      includeAwesomeLists: false,
    });

    const reactRepo = repos.find((r) => r.name === "facebook/react");
    expect(reactRepo?.priority).toBeGreaterThanOrEqual(8);
  });
});
```

### Integration Test

```bash
# Run discovery and verify output
npm run discovery

# Expected output:
# ✅ Found X repositories
# 📊 Total Sources: Y
# 💾 Results saved to: discovery-results.json
```

---

## Troubleshooting

### Common Issues

#### 1. Rate Limit Exceeded

**Error:**

```
Error: API rate limit exceeded
```

**Solution:**

- Use authenticated requests (GITHUB_TOKEN)
- Reduce MAX_RESULTS_PER_TOPIC
- Add delays between requests
- Use multiple GitHub tokens (rotate)

```typescript
// Add rate limit handling
private async handleRateLimit() {
  const { data } = await this.octokit.rateLimit.get();
  if (data.rate.remaining < 10) {
    const resetTime = new Date(data.rate.reset * 1000);
    const waitMs = resetTime.getTime() - Date.now();
    console.log(`⏳ Rate limit low, waiting ${waitMs}ms...`);
    await this.sleep(waitMs);
  }
}
```

#### 2. No Results Found

**Possible Causes:**

- MIN_STARS too high
- ACTIVITY_MONTHS too restrictive
- Topic doesn't exist

**Solution:**

```typescript
// Lower thresholds for testing
const discovery = new Discovery({
  minStars: 500, // Lower threshold
  activityMonths: 12, // Longer window
});
```

#### 3. Duplicate Sources

**Issue:** Same repo appears multiple times

**Solution:**

```typescript
// Already handled in deduplicateRepos()
// But you can add additional deduplication:
const uniqueSources = sources.filter(
  (source, index, self) => index === self.findIndex((s) => s.url === source.url)
);
```

---

## Next Steps

After completing Discovery:

1. **Review Results**: Check `discovery-results.json`
2. **Adjust Filters**: Tune MIN_STARS and topics based on results
3. **Proceed to Extraction**: Use discovered sources in Stage 2

**Continue to:** [Stage 2: Extraction](./2-extraction.md)

---

## Appendix

### Sample Output

```json
{
  "sources": [
    {
      "type": "github",
      "name": "facebook/react",
      "url": "https://github.com/facebook/react",
      "owner": "facebook",
      "repo": "react",
      "tags": ["react", "hooks", "ui"],
      "stars": 220000,
      "priority": 10,
      "hasGoodDocs": true,
      "hasExamples": true
    }
  ],
  "stats": {
    "totalFound": 156,
    "byType": {
      "github": 120,
      "docs": 15,
      "blog": 10,
      "awesome": 11
    },
    "byTopic": {
      "react": 45,
      "typescript": 38,
      "javascript": 32
    }
  },
  "timestamp": "2026-01-15T17:00:00.000Z"
}
```

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2026
