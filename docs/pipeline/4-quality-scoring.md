# Stage 4: Quality Scoring

**Pipeline Stage:** Quality Scoring  
**Purpose:** Filter low-quality, duplicate, or irrelevant content  
**Input:** Processed posts from LLM  
**Output:** Quality-scored posts with pass/fail status

---

## Overview

Quality Scoring ensures only valuable content reaches users by:

- **Syntax Validation**: Verify code compiles/parses correctly
- **Duplicate Detection**: Prevent redundant content
- **Source Reputation**: Weight by repository stars/authority
- **Content Quality**: Assess explanation clarity and value
- **Composite Scoring**: Combine metrics into 0-100 score

### Quality Thresholds

- **85+**: Auto-approve (publish immediately)
- **70-84**: Manual review (flag for inspection)
- **<70**: Auto-reject (discard)

---

## Implementation

### File Structure

```
pipeline/
├── quality-scoring/
│   ├── index.ts                # Main orchestrator
│   ├── syntax-validator.ts     # Code syntax validation
│   ├── duplicate-detector.ts   # Duplicate checking
│   ├── scoring-engine.ts       # Composite scoring
│   └── types.ts                # TypeScript interfaces
```

### Type Definitions

```typescript
// pipeline/quality-scoring/types.ts

export interface QualityMetrics {
  // Code quality (40 points)
  syntaxValid: boolean; // 20 points
  isDuplicate: boolean; // 20 points (deduct if true)

  // Source quality (20 points)
  sourceReputation: number; // 0-20 based on stars

  // Content quality (20 points)
  explanationQuality: number; // 0-20 based on length/clarity

  // LLM assessment (20 points)
  llmQualityScore: number; // 0-20 from LLM

  // Composite
  totalScore: number; // 0-100
  passed: boolean;
  category: "approved" | "review" | "rejected";
}

export interface ScoredPost extends ProcessedPost {
  qualityMetrics: QualityMetrics;
  scoredAt: Date;
}
```

### Syntax Validator

```typescript
// pipeline/quality-scoring/syntax-validator.ts

import * as ts from "typescript";

export class SyntaxValidator {
  /**
   * Validate code syntax based on language
   */
  async validate(code: string, language: string): Promise<boolean> {
    switch (language.toLowerCase()) {
      case "typescript":
      case "javascript":
        return this.validateTypeScript(code);

      case "css":
        return this.validateCSS(code);

      case "html":
        return this.validateHTML(code);

      default:
        // For other languages, assume valid
        return true;
    }
  }

  /**
   * Validate TypeScript/JavaScript code
   */
  private validateTypeScript(code: string): boolean {
    try {
      // Wrap in function to allow standalone snippets
      const wrappedCode = `function wrapper() {\n${code}\n}`;

      const result = ts.transpileModule(wrappedCode, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ESNext,
          jsx: ts.JsxEmit.React,
          noEmit: true,
          skipLibCheck: true,
        },
      });

      // Check for syntax errors (not type errors)
      const hasSyntaxErrors = result.diagnostics?.some(
        (d) => d.category === ts.DiagnosticCategory.Error
      );

      return !hasSyntaxErrors;
    } catch (error) {
      console.error("TypeScript validation error:", error);
      return false;
    }
  }

  /**
   * Validate CSS code
   */
  private validateCSS(code: string): boolean {
    try {
      // Basic CSS validation - check for balanced braces
      const openBraces = (code.match(/{/g) || []).length;
      const closeBraces = (code.match(/}/g) || []).length;

      if (openBraces !== closeBraces) {
        return false;
      }

      // Check for basic CSS syntax patterns
      const cssPattern = /[\w-]+\s*:\s*[^;]+;/;
      return cssPattern.test(code);
    } catch {
      return false;
    }
  }

  /**
   * Validate HTML code
   */
  private validateHTML(code: string): boolean {
    try {
      // Basic HTML validation - check for balanced tags
      const openTags = code.match(/<(\w+)[^>]*>/g) || [];
      const closeTags = code.match(/<\/(\w+)>/g) || [];

      // Self-closing tags don't need closing tags
      const selfClosing = ["img", "br", "hr", "input", "meta", "link"];

      const openTagNames = openTags
        .map((tag) => tag.match(/<(\w+)/)?.[1])
        .filter((tag): tag is string => !!tag && !selfClosing.includes(tag));

      const closeTagNames = closeTags
        .map((tag) => tag.match(/<\/(\w+)>/)?.[1])
        .filter((tag): tag is string => !!tag);

      // Simple check: same number of open and close tags
      return openTagNames.length === closeTagNames.length;
    } catch {
      return false;
    }
  }
}
```

### Duplicate Detector

```typescript
// pipeline/quality-scoring/duplicate-detector.ts

import crypto from "crypto";

export class DuplicateDetector {
  private seenHashes = new Set<string>();
  private seenTitles = new Set<string>();

  /**
   * Check if code snippet is duplicate
   */
  isDuplicate(code: string, title: string): boolean {
    // Method 1: Exact code match (hash-based)
    const codeHash = this.hashCode(code);
    if (this.seenHashes.has(codeHash)) {
      return true;
    }

    // Method 2: Similar title (case-insensitive)
    const normalizedTitle = title.toLowerCase().trim();
    if (this.seenTitles.has(normalizedTitle)) {
      return true;
    }

    // Mark as seen
    this.seenHashes.add(codeHash);
    this.seenTitles.add(normalizedTitle);

    return false;
  }

  /**
   * Check against database for existing posts
   */
  async checkDatabase(code: string): Promise<boolean> {
    // TODO: Query Supabase for existing posts with same code hash
    // const codeHash = this.hashCode(code);
    // const { data } = await supabase
    //   .from('posts')
    //   .select('id')
    //   .eq('code_hash', codeHash)
    //   .single();
    // return !!data;

    return false;
  }

  /**
   * Calculate similarity score between two code snippets
   */
  calculateSimilarity(code1: string, code2: string): number {
    // Simple Jaccard similarity on tokens
    const tokens1 = new Set(this.tokenize(code1));
    const tokens2 = new Set(this.tokenize(code2));

    const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));

    const union = new Set([...tokens1, ...tokens2]);

    return intersection.size / union.size;
  }

  private hashCode(code: string): string {
    // Normalize code before hashing
    const normalized = code
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    return crypto.createHash("md5").update(normalized).digest("hex");
  }

  private tokenize(code: string): string[] {
    // Split into words/tokens
    return code
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);
  }

  reset() {
    this.seenHashes.clear();
    this.seenTitles.clear();
  }
}
```

### Scoring Engine

```typescript
// pipeline/quality-scoring/scoring-engine.ts

import { ProcessedPost } from "../processing/types";
import { QualityMetrics, ScoredPost } from "./types";
import { SyntaxValidator } from "./syntax-validator";
import { DuplicateDetector } from "./duplicate-detector";

export class ScoringEngine {
  private syntaxValidator: SyntaxValidator;
  private duplicateDetector: DuplicateDetector;

  constructor() {
    this.syntaxValidator = new SyntaxValidator();
    this.duplicateDetector = new DuplicateDetector();
  }

  /**
   * Score a single post
   */
  async scorePost(post: ProcessedPost): Promise<ScoredPost> {
    let score = 0;

    // 1. Syntax validation (20 points)
    const syntaxValid = await this.syntaxValidator.validate(
      post.code,
      post.language
    );
    if (syntaxValid) {
      score += 20;
    }

    // 2. Duplicate check (20 points deduction if duplicate)
    const isDuplicate = this.duplicateDetector.isDuplicate(
      post.code,
      post.title
    );
    if (!isDuplicate) {
      score += 20;
    }

    // 3. Source reputation (20 points)
    const reputationScore = this.calculateReputationScore(post.sourceName);
    score += reputationScore;

    // 4. Explanation quality (20 points)
    const explanationScore = this.scoreExplanation(post.explanation);
    score += explanationScore;

    // 5. LLM quality score (20 points)
    const llmScore = (post.qualityScore / 100) * 20;
    score += llmScore;

    // Determine category
    const category = this.categorize(score);

    const qualityMetrics: QualityMetrics = {
      syntaxValid,
      isDuplicate,
      sourceReputation: reputationScore,
      explanationQuality: explanationScore,
      llmQualityScore: llmScore,
      totalScore: Math.round(score),
      passed: score >= 70,
      category,
    };

    return {
      ...post,
      qualityMetrics,
      scoredAt: new Date(),
    };
  }

  /**
   * Calculate source reputation score
   */
  private calculateReputationScore(sourceName: string): number {
    // TODO: Look up actual repository stars from database
    // For now, use heuristics based on source name

    const topSources = [
      "facebook/react",
      "microsoft/TypeScript",
      "vuejs/core",
      "angular/angular",
      "vercel/next.js",
    ];

    if (topSources.includes(sourceName)) {
      return 20;
    }

    // Check if it's official documentation
    if (
      sourceName.includes("react.dev") ||
      sourceName.includes("typescript") ||
      sourceName.includes("mdn")
    ) {
      return 20;
    }

    // Default moderate score
    return 10;
  }

  /**
   * Score explanation quality
   */
  private scoreExplanation(explanation: string): number {
    const words = explanation.split(/\s+/).length;

    // Ideal length: 30-100 words
    if (words >= 30 && words <= 100) {
      return 20;
    } else if (words >= 20 && words <= 120) {
      return 15;
    } else if (words >= 10) {
      return 10;
    }

    return 5;
  }

  /**
   * Categorize post by score
   */
  private categorize(score: number): "approved" | "review" | "rejected" {
    if (score >= 85) return "approved";
    if (score >= 70) return "review";
    return "rejected";
  }

  /**
   * Score multiple posts
   */
  async scoreBatch(posts: ProcessedPost[]): Promise<ScoredPost[]> {
    const scored: ScoredPost[] = [];

    for (const post of posts) {
      const scoredPost = await this.scorePost(post);
      scored.push(scoredPost);
    }

    return scored;
  }

  /**
   * Reset duplicate detector (for new pipeline runs)
   */
  reset() {
    this.duplicateDetector.reset();
  }
}
```

### Main Quality Scoring Orchestrator

```typescript
// pipeline/quality-scoring/index.ts

import { ScoringEngine } from "./scoring-engine";
import { ProcessedPost } from "../processing/types";
import { ScoredPost } from "./types";

export class QualityScoring {
  private engine: ScoringEngine;

  constructor() {
    this.engine = new ScoringEngine();
  }

  /**
   * Run quality scoring on processed posts
   */
  async run(posts: ProcessedPost[]): Promise<{
    approved: ScoredPost[];
    review: ScoredPost[];
    rejected: ScoredPost[];
  }> {
    console.log("🚀 Starting Quality Scoring Stage...\n");
    console.log(`📊 Total posts to score: ${posts.length}\n`);

    // Score all posts
    const scored = await this.engine.scoreBatch(posts);

    // Categorize by quality
    const approved = scored.filter(
      (p) => p.qualityMetrics.category === "approved"
    );
    const review = scored.filter((p) => p.qualityMetrics.category === "review");
    const rejected = scored.filter(
      (p) => p.qualityMetrics.category === "rejected"
    );

    this.printSummary(scored, approved, review, rejected);

    return { approved, review, rejected };
  }

  private printSummary(
    all: ScoredPost[],
    approved: ScoredPost[],
    review: ScoredPost[],
    rejected: ScoredPost[]
  ) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 QUALITY SCORING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Scored: ${all.length}`);
    console.log(
      `\n✅ Approved: ${approved.length} (${this.pct(approved, all)}%)`
    );
    console.log(`⚠️  Review: ${review.length} (${this.pct(review, all)}%)`);
    console.log(
      `❌ Rejected: ${rejected.length} (${this.pct(rejected, all)}%)`
    );

    const avgScore =
      all.reduce((sum, p) => sum + p.qualityMetrics.totalScore, 0) / all.length;
    console.log(`\nAverage Score: ${avgScore.toFixed(1)}/100`);

    console.log("\nRejection Reasons:");
    const syntaxFails = rejected.filter(
      (p) => !p.qualityMetrics.syntaxValid
    ).length;
    const duplicates = rejected.filter(
      (p) => p.qualityMetrics.isDuplicate
    ).length;
    const lowQuality = rejected.length - syntaxFails - duplicates;

    console.log(`  Syntax errors: ${syntaxFails}`);
    console.log(`  Duplicates: ${duplicates}`);
    console.log(`  Low quality: ${lowQuality}`);

    console.log("=".repeat(60) + "\n");
  }

  private pct(subset: any[], total: any[]): string {
    return ((subset.length / total.length) * 100).toFixed(1);
  }
}
```

---

## Advanced Features

### Semantic Similarity Detection

```typescript
// Use embeddings for semantic duplicate detection
import OpenAI from "openai";

class SemanticDuplicateDetector {
  private openai: OpenAI;
  private embeddings: Map<string, number[]> = new Map();

  async getEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  }

  async isSemanticallyDuplicate(
    code: string,
    threshold: number = 0.9
  ): Promise<boolean> {
    const embedding = await this.getEmbedding(code);

    for (const [id, existingEmbedding] of this.embeddings) {
      const similarity = this.cosineSimilarity(embedding, existingEmbedding);
      if (similarity > threshold) {
        return true;
      }
    }

    this.embeddings.set(code, embedding);
    return false;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
```

---

## Testing

```typescript
// Test quality scoring
import { QualityScoring } from "./pipeline/quality-scoring";

const testPost: ProcessedPost = {
  id: "test-1",
  code: "const [count, setCount] = useState(0);",
  language: "typescript",
  sourceUrl: "https://react.dev",
  sourceName: "React Docs",
  title: "React useState Hook",
  explanation:
    "useState is a Hook that lets you add state to function components.",
  tags: ["react", "hooks"],
  difficulty: "beginner",
  qualityScore: 85,
  isHighQuality: true,
  reasoning: "Clear, practical example",
  processedAt: new Date(),
  llmModel: "gpt-4",
  promptVersion: "1.0",
};

const scoring = new QualityScoring();
const result = await scoring.run([testPost]);

console.log(result.approved); // Should include testPost
```

---

**Continue to:** [Stage 5: Enrichment](./5-enrichment.md)
