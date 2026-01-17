# Stage 3: Processing

**Pipeline Stage:** Processing  
**Purpose:** Transform raw code snippets into educational micro-learning posts using LLM  
**Input:** Code snippets from Extraction stage  
**Output:** Posts with titles, explanations, tags, and difficulty levels

---

## Overview

The Processing stage uses GPT-4 to transform raw code snippets into engaging, educational content. It generates:

- **Catchy Titles**: Attention-grabbing headlines
- **Concise Explanations**: 2-3 sentence summaries
- **Relevant Tags**: Technology and concept tags
- **Difficulty Assessment**: Beginner/Intermediate/Advanced
- **Quality Scores**: 0-100 rating for filtering

---

## Implementation

### File Structure

```
pipeline/
├── processing/
│   ├── index.ts              # Main orchestrator
│   ├── llm-processor.ts      # OpenAI integration
│   ├── prompts.ts            # Prompt templates
│   ├── batch-processor.ts    # Batch processing logic
│   └── types.ts              # TypeScript interfaces
```

### Type Definitions

```typescript
// pipeline/processing/types.ts

export interface ProcessedPost {
  // Original snippet data
  id: string;
  code: string;
  language: string;
  sourceUrl: string;
  sourceName: string;

  // LLM-generated content
  title: string;
  explanation: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";

  // Quality assessment
  qualityScore: number; // 0-100
  isHighQuality: boolean;
  reasoning: string; // Why this is/isn't valuable

  // Metadata
  processedAt: Date;
  llmModel: string;
  promptVersion: string;
}

export interface ProcessingConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  batchSize: number;
  qualityThreshold: number;
}
```

### Prompt Engineering

```typescript
// pipeline/processing/prompts.ts

export const SYSTEM_PROMPT = `You are a technical content creator for DevDose, a micro-learning app for frontend developers.

Your task is to transform code snippets into engaging, educational posts that can be consumed in 30 seconds.

## Guidelines:
- Create an attention-grabbing title (5-8 words max)
- Write a concise explanation (2-3 sentences, max 100 words)
- Focus on practical value and "aha!" moments
- Explain WHAT the code does and WHY it's useful
- Use simple language, avoid unnecessary jargon
- Highlight modern best practices
- Be enthusiastic but professional

## Quality Standards:
- Code must be correct and useful
- Explanation must be clear and accurate
- Content should teach something valuable
- Avoid overly basic or overly complex examples

Output format: JSON only, no additional text.`;

export function createUserPrompt(
  code: string,
  language: string,
  context?: string,
  sourceName?: string
): string {
  return `
Code Snippet:
\`\`\`${language}
${code}
\`\`\`

${context ? `Context: ${context}` : ""}
${sourceName ? `Source: ${sourceName}` : ""}

Generate a micro-learning post for this code snippet.

Respond with JSON in this exact format:
{
  "title": "Catchy title here (5-8 words)",
  "explanation": "Brief explanation here (2-3 sentences, max 100 words)",
  "tags": ["tag1", "tag2", "tag3"],
  "difficulty": "beginner|intermediate|advanced",
  "isHighQuality": true|false,
  "qualityScore": 0-100,
  "reasoning": "Why this is/isn't valuable content"
}

Important:
- Title should be engaging and make developers curious
- Explanation should be practical and actionable
- Tags should include framework, concept, and feature tags
- Quality score should reflect how useful this is for learning
- Mark isHighQuality=false if code is trivial, outdated, or confusing
`.trim();
}

// Alternative prompts for different content types
export const PROMPTS = {
  react: `Focus on React-specific patterns, hooks, and component design.`,
  typescript: `Emphasize type safety, advanced types, and TypeScript best practices.`,
  css: `Highlight modern CSS features, layout techniques, and responsive design.`,
  performance: `Focus on optimization techniques and performance implications.`,
};
```

### LLM Processor

```typescript
// pipeline/processing/llm-processor.ts

import OpenAI from "openai";
import { ProcessedPost, ProcessingConfig } from "./types";
import { CodeSnippet } from "../extraction/types";
import { SYSTEM_PROMPT, createUserPrompt } from "./prompts";

export class LLMProcessor {
  private openai: OpenAI;
  private config: ProcessingConfig;

  constructor(apiKey: string, config?: Partial<ProcessingConfig>) {
    this.openai = new OpenAI({ apiKey });

    this.config = {
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 500,
      batchSize: 10,
      qualityThreshold: 70,
      ...config,
    };
  }

  /**
   * Process a single code snippet
   */
  async processSnippet(snippet: CodeSnippet): Promise<ProcessedPost | null> {
    try {
      const userPrompt = createUserPrompt(
        snippet.code,
        snippet.language,
        snippet.context,
        snippet.sourceName
      );

      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from LLM");
      }

      const llmResult = JSON.parse(content);

      // Validate response
      if (!this.validateLLMResponse(llmResult)) {
        console.warn(`Invalid LLM response for snippet ${snippet.id}`);
        return null;
      }

      return {
        id: snippet.id,
        code: snippet.code,
        language: snippet.language,
        sourceUrl: snippet.sourceUrl,
        sourceName: snippet.sourceName,
        title: llmResult.title,
        explanation: llmResult.explanation,
        tags: llmResult.tags,
        difficulty: llmResult.difficulty,
        qualityScore: llmResult.qualityScore,
        isHighQuality: llmResult.isHighQuality,
        reasoning: llmResult.reasoning,
        processedAt: new Date(),
        llmModel: this.config.model,
        promptVersion: "1.0",
      };
    } catch (error) {
      console.error(`Error processing snippet ${snippet.id}:`, error);
      return null;
    }
  }

  /**
   * Validate LLM response structure
   */
  private validateLLMResponse(response: any): boolean {
    return (
      typeof response.title === "string" &&
      typeof response.explanation === "string" &&
      Array.isArray(response.tags) &&
      ["beginner", "intermediate", "advanced"].includes(response.difficulty) &&
      typeof response.qualityScore === "number" &&
      typeof response.isHighQuality === "boolean" &&
      response.qualityScore >= 0 &&
      response.qualityScore <= 100
    );
  }

  /**
   * Process snippets in batches
   */
  async processBatch(snippets: CodeSnippet[]): Promise<ProcessedPost[]> {
    const posts: ProcessedPost[] = [];

    for (let i = 0; i < snippets.length; i += this.config.batchSize) {
      const batch = snippets.slice(i, i + this.config.batchSize);

      console.log(
        `🤖 Processing batch ${Math.floor(i / this.config.batchSize) + 1}...`
      );

      // Process in parallel
      const results = await Promise.all(
        batch.map((snippet) => this.processSnippet(snippet))
      );

      // Filter out nulls and add to posts
      const validPosts = results.filter((p): p is ProcessedPost => p !== null);
      posts.push(...validPosts);

      console.log(
        `   ✅ Processed ${validPosts.length}/${batch.length} snippets`
      );

      // Rate limiting: wait 1 second between batches
      if (i + this.config.batchSize < snippets.length) {
        await this.sleep(1000);
      }
    }

    return posts;
  }

  /**
   * Calculate cost estimate
   */
  estimateCost(snippetCount: number): number {
    // GPT-4 pricing (approximate)
    const inputCostPer1k = 0.03;
    const outputCostPer1k = 0.06;

    const avgInputTokens = 500; // code + prompt
    const avgOutputTokens = 200; // JSON response

    const inputCost = ((snippetCount * avgInputTokens) / 1000) * inputCostPer1k;
    const outputCost =
      ((snippetCount * avgOutputTokens) / 1000) * outputCostPer1k;

    return inputCost + outputCost;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### Main Processing Orchestrator

```typescript
// pipeline/processing/index.ts

import dotenv from "dotenv";
import { LLMProcessor } from "./llm-processor";
import { ProcessedPost, ProcessingConfig } from "./types";
import { CodeSnippet } from "../extraction/types";

dotenv.config();

export class Processing {
  private processor: LLMProcessor;

  constructor(config?: Partial<ProcessingConfig>) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not found in environment");
    }

    this.processor = new LLMProcessor(apiKey, config);
  }

  /**
   * Run processing on extracted snippets
   */
  async run(snippets: CodeSnippet[]): Promise<ProcessedPost[]> {
    console.log("🚀 Starting Processing Stage...\n");
    console.log(`📊 Total snippets to process: ${snippets.length}`);

    // Estimate cost
    const estimatedCost = this.processor.estimateCost(snippets.length);
    console.log(`💰 Estimated cost: $${estimatedCost.toFixed(2)}\n`);

    // Process all snippets
    const posts = await this.processor.processBatch(snippets);

    // Filter by quality
    const highQuality = posts.filter((p) => p.isHighQuality);

    this.printSummary(posts, highQuality);

    return highQuality;
  }

  private printSummary(
    allPosts: ProcessedPost[],
    highQuality: ProcessedPost[]
  ) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 PROCESSING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Processed: ${allPosts.length}`);
    console.log(
      `High Quality: ${highQuality.length} (${(
        (highQuality.length / allPosts.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log(`Rejected: ${allPosts.length - highQuality.length}`);

    console.log("\nQuality Distribution:");
    const avgScore =
      allPosts.reduce((sum, p) => sum + p.qualityScore, 0) / allPosts.length;
    console.log(`  Average Score: ${avgScore.toFixed(1)}`);

    console.log("\nBy Difficulty:");
    const byDifficulty = highQuality.reduce((acc, p) => {
      acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
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

## Optimization Strategies

### 1. Cost Reduction

```typescript
// Use GPT-3.5 for initial filtering
const cheapProcessor = new LLMProcessor(apiKey, {
  model: "gpt-3.5-turbo", // Cheaper model
  qualityThreshold: 80, // Higher threshold
});

// Then use GPT-4 for high-potential snippets
const premiumProcessor = new LLMProcessor(apiKey, {
  model: "gpt-4",
  qualityThreshold: 70,
});
```

### 2. Caching

```typescript
// Cache LLM responses to avoid reprocessing
import crypto from "crypto";

class CachedLLMProcessor extends LLMProcessor {
  private cache = new Map<string, ProcessedPost>();

  async processSnippet(snippet: CodeSnippet): Promise<ProcessedPost | null> {
    const cacheKey = this.getCacheKey(snippet);

    if (this.cache.has(cacheKey)) {
      console.log(`💾 Cache hit for ${snippet.id}`);
      return this.cache.get(cacheKey)!;
    }

    const result = await super.processSnippet(snippet);
    if (result) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  private getCacheKey(snippet: CodeSnippet): string {
    return crypto.createHash("md5").update(snippet.code).digest("hex");
  }
}
```

### 3. Parallel Processing

```typescript
// Process multiple batches in parallel (with rate limiting)
async function processInParallel(
  snippets: CodeSnippet[],
  concurrency: number = 3
): Promise<ProcessedPost[]> {
  const chunks = chunkArray(snippets, Math.ceil(snippets.length / concurrency));

  const results = await Promise.all(
    chunks.map((chunk) => processor.processBatch(chunk))
  );

  return results.flat();
}
```

---

## Testing

```typescript
// Test with a single snippet
const testSnippet: CodeSnippet = {
  id: "test-1",
  code: `const [count, setCount] = useState(0);`,
  language: "typescript",
  lineCount: 1,
  sourceUrl: "https://react.dev",
  sourceName: "React Docs",
  sourceType: "docs",
  extractedAt: new Date(),
  extractionMethod: "markdown",
};

const processor = new LLMProcessor(process.env.OPENAI_API_KEY!);
const result = await processor.processSnippet(testSnippet);

console.log(result);
// Expected output:
// {
//   title: "React's useState Hook Basics",
//   explanation: "useState is React's fundamental hook for...",
//   tags: ["react", "hooks", "state"],
//   difficulty: "beginner",
//   qualityScore: 75,
//   isHighQuality: true
// }
```

---

**Continue to:** [Stage 4: Quality Scoring](./4-quality-scoring.md)
