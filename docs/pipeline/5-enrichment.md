# Stage 5: Enrichment

**Pipeline Stage:** Enrichment  
**Purpose:** Add metadata, tags, and contextual information to posts  
**Input:** Quality-scored posts  
**Output:** Fully enriched posts ready for publishing

---

## Overview

Enrichment enhances posts with additional metadata:

- **Tag Enhancement**: Extract framework-specific tags from code
- **Difficulty Refinement**: Adjust difficulty based on code complexity
- **Metadata Addition**: Add repository stars, author info, timestamps
- **Category Assignment**: Classify into content categories
- **SEO Optimization**: Generate search-friendly descriptions

---

## Implementation

### File Structure

```
pipeline/
├── enrichment/
│   ├── index.ts              # Main orchestrator
│   ├── tag-extractor.ts      # Tag generation
│   ├── difficulty-assessor.ts # Difficulty calculation
│   ├── metadata-enricher.ts  # Add source metadata
│   └── types.ts              # TypeScript interfaces
```

### Type Definitions

```typescript
// pipeline/enrichment/types.ts

export interface EnrichedPost extends ScoredPost {
  // Enhanced tags
  enhancedTags: string[];
  primaryTag: string;
  category: ContentCategory;

  // Refined difficulty
  refinedDifficulty: "beginner" | "intermediate" | "advanced";
  complexityScore: number; // 0-10

  // Additional metadata
  repositoryStars?: number;
  authorName?: string;
  lastUpdated?: Date;
  estimatedReadTime: number; // seconds

  // SEO
  searchKeywords: string[];
  metaDescription: string;

  enrichedAt: Date;
}

export type ContentCategory =
  | "patterns"
  | "tips-tricks"
  | "libraries"
  | "performance"
  | "accessibility"
  | "css-techniques"
  | "typescript"
  | "git"
  | "framework-features"
  | "browser-apis";
```

### Tag Extractor

```typescript
// pipeline/enrichment/tag-extractor.ts

export class TagExtractor {
  /**
   * Extract additional tags from code
   */
  extractFromCode(code: string, language: string): string[] {
    const tags: string[] = [];

    // Language tag
    tags.push(language);

    // Framework detection
    tags.push(...this.detectFramework(code));

    // Feature detection
    tags.push(...this.detectFeatures(code));

    // Pattern detection
    tags.push(...this.detectPatterns(code));

    return [...new Set(tags)]; // Deduplicate
  }

  /**
   * Detect framework from code patterns
   */
  private detectFramework(code: string): string[] {
    const frameworks: string[] = [];

    // React
    if (
      code.includes("useState") ||
      code.includes("useEffect") ||
      code.includes("useCallback") ||
      code.includes("useMemo")
    ) {
      frameworks.push("react", "hooks");
    }

    if (code.includes("JSX") || (code.includes("<") && code.includes("/>"))) {
      frameworks.push("jsx");
    }

    // Angular
    if (
      code.includes("@Component") ||
      code.includes("@Injectable") ||
      code.includes("@Input") ||
      code.includes("@Output")
    ) {
      frameworks.push("angular", "decorators");
    }

    // Vue
    if (
      code.includes("ref(") ||
      code.includes("computed(") ||
      code.includes("reactive(")
    ) {
      frameworks.push("vue", "composition-api");
    }

    // Next.js
    if (
      code.includes("getServerSideProps") ||
      code.includes("getStaticProps")
    ) {
      frameworks.push("nextjs", "ssr");
    }

    return frameworks;
  }

  /**
   * Detect language features
   */
  private detectFeatures(code: string): string[] {
    const features: string[] = [];

    // Async/Promises
    if (code.includes("async") || code.includes("await")) {
      features.push("async", "promises");
    }

    // Destructuring
    if (code.match(/const\s*{.*}/) || code.match(/const\s*\[.*\]/)) {
      features.push("destructuring");
    }

    // Arrow functions
    if (code.includes("=>")) {
      features.push("arrow-functions");
    }

    // Template literals
    if (code.includes("`")) {
      features.push("template-literals");
    }

    // Spread operator
    if (code.includes("...")) {
      features.push("spread-operator");
    }

    // Optional chaining
    if (code.includes("?.")) {
      features.push("optional-chaining");
    }

    // Nullish coalescing
    if (code.includes("??")) {
      features.push("nullish-coalescing");
    }

    // CSS features
    if (code.includes("grid") || code.includes("display: grid")) {
      features.push("css-grid", "layout");
    }

    if (code.includes("flex") || code.includes("display: flex")) {
      features.push("flexbox", "layout");
    }

    if (code.includes("@media")) {
      features.push("responsive-design", "media-queries");
    }

    if (code.includes("@container")) {
      features.push("container-queries");
    }

    if (code.includes("animation") || code.includes("@keyframes")) {
      features.push("animations", "css-animations");
    }

    return features;
  }

  /**
   * Detect code patterns
   */
  private detectPatterns(code: string): string[] {
    const patterns: string[] = [];

    // Higher-order functions
    if (
      code.includes(".map(") ||
      code.includes(".filter(") ||
      code.includes(".reduce(")
    ) {
      patterns.push("higher-order-functions", "functional-programming");
    }

    // Error handling
    if (code.includes("try") && code.includes("catch")) {
      patterns.push("error-handling");
    }

    // Type guards
    if (code.includes("typeof") || code.includes("instanceof")) {
      patterns.push("type-guards");
    }

    // Generics
    if (code.match(/<[A-Z][^>]*>/)) {
      patterns.push("generics", "typescript");
    }

    return patterns;
  }

  /**
   * Merge and deduplicate tags
   */
  mergeTags(existingTags: string[], extractedTags: string[]): string[] {
    const allTags = [...existingTags, ...extractedTags];
    const unique = [...new Set(allTags.map((t) => t.toLowerCase()))];

    // Limit to top 8 tags
    return unique.slice(0, 8);
  }

  /**
   * Determine primary tag (most important)
   */
  getPrimaryTag(tags: string[]): string {
    // Priority order
    const priority = [
      "react",
      "vue",
      "angular",
      "typescript",
      "javascript",
      "css",
      "html",
      "nextjs",
      "performance",
      "accessibility",
    ];

    for (const tag of priority) {
      if (tags.includes(tag)) {
        return tag;
      }
    }

    return tags[0] || "general";
  }
}
```

### Difficulty Assessor

```typescript
// pipeline/enrichment/difficulty-assessor.ts

export class DifficultyAssessor {
  /**
   * Assess code complexity and refine difficulty
   */
  assessDifficulty(
    code: string,
    explanation: string,
    initialDifficulty: string
  ): {
    difficulty: "beginner" | "intermediate" | "advanced";
    complexityScore: number;
  } {
    let complexityScore = 0;

    // Code-based complexity
    complexityScore += this.analyzeCodeComplexity(code);

    // Concept-based complexity
    complexityScore += this.analyzeConceptComplexity(explanation);

    // Normalize to 0-10 scale
    const normalizedScore = Math.min(complexityScore, 10);

    // Determine difficulty
    let difficulty: "beginner" | "intermediate" | "advanced";
    if (normalizedScore <= 3) {
      difficulty = "beginner";
    } else if (normalizedScore <= 7) {
      difficulty = "intermediate";
    } else {
      difficulty = "advanced";
    }

    return {
      difficulty,
      complexityScore: normalizedScore,
    };
  }

  /**
   * Analyze code complexity
   */
  private analyzeCodeComplexity(code: string): number {
    let score = 0;

    // Line count
    const lines = code.split("\n").length;
    if (lines > 20) score += 2;
    else if (lines > 10) score += 1;

    // Nesting depth
    const maxNesting = this.calculateNestingDepth(code);
    if (maxNesting > 3) score += 2;
    else if (maxNesting > 2) score += 1;

    // Advanced features
    if (code.includes("async") || code.includes("Promise")) score += 1;
    if (code.includes("reduce")) score += 1;
    if (code.match(/<[A-Z][^>]*>/)) score += 2; // Generics
    if (code.includes("decorator") || code.includes("@")) score += 1;

    // Functional patterns
    if (code.includes("compose") || code.includes("pipe")) score += 2;

    return score;
  }

  /**
   * Calculate maximum nesting depth
   */
  private calculateNestingDepth(code: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of code) {
      if (char === "{" || char === "(") {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === "}" || char === ")") {
        currentDepth--;
      }
    }

    return maxDepth;
  }

  /**
   * Analyze concept complexity from explanation
   */
  private analyzeConceptComplexity(explanation: string): number {
    let score = 0;

    const advancedConcepts = [
      "closure",
      "prototype",
      "inheritance",
      "polymorphism",
      "higher-order",
      "currying",
      "memoization",
      "recursion",
      "decorator",
      "middleware",
      "proxy",
      "reflection",
    ];

    const lowerExplanation = explanation.toLowerCase();

    for (const concept of advancedConcepts) {
      if (lowerExplanation.includes(concept)) {
        score += 1;
      }
    }

    return Math.min(score, 5); // Cap at 5
  }
}
```

### Metadata Enricher

```typescript
// pipeline/enrichment/metadata-enricher.ts

import { Octokit } from "@octokit/rest";

export class MetadataEnricher {
  private octokit: Octokit;
  private cache = new Map<string, any>();

  constructor(githubToken: string) {
    this.octokit = new Octokit({ auth: githubToken });
  }

  /**
   * Enrich with repository metadata
   */
  async enrichWithRepoData(sourceName: string): Promise<{
    stars?: number;
    author?: string;
    lastUpdated?: Date;
  }> {
    // Check cache
    if (this.cache.has(sourceName)) {
      return this.cache.get(sourceName);
    }

    try {
      const [owner, repo] = sourceName.split("/");
      if (!owner || !repo) {
        return {};
      }

      const { data } = await this.octokit.repos.get({ owner, repo });

      const metadata = {
        stars: data.stargazers_count,
        author: data.owner.login,
        lastUpdated: new Date(data.pushed_at),
      };

      // Cache for future use
      this.cache.set(sourceName, metadata);

      return metadata;
    } catch {
      return {};
    }
  }

  /**
   * Calculate estimated read time
   */
  calculateReadTime(code: string, explanation: string): number {
    // Average reading speed: 200 words/minute
    // Code reading is slower: ~100 words/minute

    const codeWords = code.split(/\s+/).length;
    const explanationWords = explanation.split(/\s+/).length;

    const codeTime = (codeWords / 100) * 60; // seconds
    const explanationTime = (explanationWords / 200) * 60; // seconds

    return Math.ceil(codeTime + explanationTime);
  }

  /**
   * Generate SEO keywords
   */
  generateKeywords(tags: string[], title: string): string[] {
    const keywords = [...tags];

    // Extract important words from title
    const titleWords = title
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3);

    keywords.push(...titleWords);

    return [...new Set(keywords)].slice(0, 10);
  }

  /**
   * Generate meta description
   */
  generateMetaDescription(title: string, explanation: string): string {
    // Truncate to 160 characters for SEO
    const combined = `${title}: ${explanation}`;
    return combined.length > 160
      ? combined.substring(0, 157) + "..."
      : combined;
  }
}
```

### Category Classifier

```typescript
// pipeline/enrichment/category-classifier.ts

import { ContentCategory } from "./types";

export class CategoryClassifier {
  /**
   * Classify post into content category
   */
  classify(
    tags: string[],
    title: string,
    explanation: string
  ): ContentCategory {
    const allText = `${tags.join(" ")} ${title} ${explanation}`.toLowerCase();

    // Check each category
    if (this.matchesCategory(allText, "performance")) return "performance";
    if (this.matchesCategory(allText, "accessibility")) return "accessibility";
    if (this.matchesCategory(allText, "css")) return "css-techniques";
    if (this.matchesCategory(allText, "typescript")) return "typescript";
    if (this.matchesCategory(allText, "git")) return "git";
    if (this.matchesCategory(allText, "library")) return "libraries";
    if (this.matchesCategory(allText, "framework")) return "framework-features";
    if (this.matchesCategory(allText, "browser")) return "browser-apis";
    if (this.matchesCategory(allText, "pattern")) return "patterns";

    return "tips-tricks"; // Default
  }

  private matchesCategory(text: string, category: string): boolean {
    const keywords: Record<string, string[]> = {
      performance: [
        "performance",
        "optimize",
        "speed",
        "lazy",
        "memoize",
        "cache",
      ],
      accessibility: [
        "accessibility",
        "a11y",
        "aria",
        "screen reader",
        "semantic",
      ],
      css: ["css", "style", "layout", "grid", "flex", "animation"],
      typescript: ["typescript", "type", "interface", "generic"],
      git: ["git", "commit", "branch", "merge", "rebase"],
      library: ["library", "package", "npm", "install"],
      framework: ["react", "vue", "angular", "hook", "component"],
      browser: ["browser", "api", "dom", "window", "document"],
      pattern: ["pattern", "design", "architecture", "best practice"],
    };

    const categoryKeywords = keywords[category] || [];
    return categoryKeywords.some((keyword) => text.includes(keyword));
  }
}
```

### Main Enrichment Orchestrator

```typescript
// pipeline/enrichment/index.ts

import dotenv from "dotenv";
import { TagExtractor } from "./tag-extractor";
import { DifficultyAssessor } from "./difficulty-assessor";
import { MetadataEnricher } from "./metadata-enricher";
import { CategoryClassifier } from "./category-classifier";
import { ScoredPost } from "../quality-scoring/types";
import { EnrichedPost } from "./types";

dotenv.config();

export class Enrichment {
  private tagExtractor: TagExtractor;
  private difficultyAssessor: DifficultyAssessor;
  private metadataEnricher: MetadataEnricher;
  private categoryClassifier: CategoryClassifier;

  constructor() {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error("GITHUB_TOKEN not found");
    }

    this.tagExtractor = new TagExtractor();
    this.difficultyAssessor = new DifficultyAssessor();
    this.metadataEnricher = new MetadataEnricher(githubToken);
    this.categoryClassifier = new CategoryClassifier();
  }

  /**
   * Enrich a single post
   */
  async enrichPost(post: ScoredPost): Promise<EnrichedPost> {
    // Extract additional tags
    const extractedTags = this.tagExtractor.extractFromCode(
      post.code,
      post.language
    );

    const enhancedTags = this.tagExtractor.mergeTags(post.tags, extractedTags);

    const primaryTag = this.tagExtractor.getPrimaryTag(enhancedTags);

    // Refine difficulty
    const { difficulty, complexityScore } =
      this.difficultyAssessor.assessDifficulty(
        post.code,
        post.explanation,
        post.difficulty
      );

    // Get repository metadata
    const repoMetadata = await this.metadataEnricher.enrichWithRepoData(
      post.sourceName
    );

    // Calculate read time
    const estimatedReadTime = this.metadataEnricher.calculateReadTime(
      post.code,
      post.explanation
    );

    // Generate SEO data
    const searchKeywords = this.metadataEnricher.generateKeywords(
      enhancedTags,
      post.title
    );

    const metaDescription = this.metadataEnricher.generateMetaDescription(
      post.title,
      post.explanation
    );

    // Classify category
    const category = this.categoryClassifier.classify(
      enhancedTags,
      post.title,
      post.explanation
    );

    return {
      ...post,
      enhancedTags,
      primaryTag,
      category,
      refinedDifficulty: difficulty,
      complexityScore,
      repositoryStars: repoMetadata.stars,
      authorName: repoMetadata.author,
      lastUpdated: repoMetadata.lastUpdated,
      estimatedReadTime,
      searchKeywords,
      metaDescription,
      enrichedAt: new Date(),
    };
  }

  /**
   * Enrich multiple posts
   */
  async run(posts: ScoredPost[]): Promise<EnrichedPost[]> {
    console.log("🚀 Starting Enrichment Stage...\n");
    console.log(`📊 Total posts to enrich: ${posts.length}\n`);

    const enriched: EnrichedPost[] = [];

    for (const post of posts) {
      const enrichedPost = await this.enrichPost(post);
      enriched.push(enrichedPost);
    }

    this.printSummary(enriched);

    return enriched;
  }

  private printSummary(posts: EnrichedPost[]) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 ENRICHMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Enriched: ${posts.length}`);

    console.log("\nBy Category:");
    const byCategory = posts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .forEach(([cat, count]) => {
        console.log(`  ${cat.padEnd(20)}: ${count}`);
      });

    console.log("\nBy Difficulty:");
    const byDifficulty = posts.reduce((acc, p) => {
      acc[p.refinedDifficulty] = (acc[p.refinedDifficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(byDifficulty).forEach(([diff, count]) => {
      console.log(`  ${diff.padEnd(15)}: ${count}`);
    });

    console.log("=".repeat(60) + "\n");
  }
}
```

---

**Continue to:** [Stage 6: Publishing](./6-publishing.md)
