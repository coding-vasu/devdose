# Stage 2: Extraction

**Pipeline Stage:** Extraction  
**Purpose:** Pull code snippets from discovered sources  
**Input:** List of sources from Discovery stage  
**Output:** Raw code snippets with context

---

## Overview

The Extraction stage processes sources identified in Discovery and extracts valuable code snippets. It handles multiple source types:

- **GitHub Repositories**: README files, documentation, examples
- **Documentation Sites**: MDN, React.dev, TypeScript docs
- **Blog Posts**: Technical articles with code examples

### Success Criteria

- Extract 500-1000 code snippets per run
- Maintain context (surrounding text, headings)
- Filter by line count (5-25 lines optimal)
- Support multiple languages (JS, TS, CSS, HTML)

---

## Implementation

### File Structure

```
pipeline/
├── extraction/
│   ├── index.ts                 # Main orchestrator
│   ├── github-extractor.ts      # GitHub-specific extraction
│   ├── docs-extractor.ts        # Documentation site extraction
│   ├── code-parser.ts           # Code block parsing utilities
│   └── types.ts                 # TypeScript interfaces
```

### Type Definitions

```typescript
// pipeline/extraction/types.ts

export interface CodeSnippet {
  id: string;
  code: string;
  language: string;
  lineCount: number;

  // Context
  context?: string; // Surrounding text/heading
  filePath?: string; // Original file path

  // Source metadata
  sourceUrl: string;
  sourceName: string;
  sourceType: "github" | "docs" | "blog";

  // Extraction metadata
  extractedAt: Date;
  extractionMethod: "markdown" | "html" | "ast";
}

export interface ExtractionConfig {
  minLines: number;
  maxLines: number;
  languages: string[];
  includeComments: boolean;
  extractFromExamples: boolean;
}

export interface ExtractionResult {
  snippets: CodeSnippet[];
  stats: {
    totalExtracted: number;
    byLanguage: Record<string, number>;
    bySource: Record<string, number>;
  };
}
```

### GitHub Extractor

```typescript
// pipeline/extraction/github-extractor.ts

import { Octokit } from "@octokit/rest";
import { CodeSnippet, ExtractionConfig } from "./types";
import {
  parseMarkdownCodeBlocks,
  extractPrecedingHeading,
} from "./code-parser";

export class GitHubExtractor {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Extract code snippets from a GitHub repository
   */
  async extractFromRepo(
    owner: string,
    repo: string,
    config: ExtractionConfig
  ): Promise<CodeSnippet[]> {
    console.log(`📤 Extracting from ${owner}/${repo}...`);

    const snippets: CodeSnippet[] = [];

    try {
      // 1. Extract from README
      const readmeSnippets = await this.extractFromReadme(owner, repo, config);
      snippets.push(...readmeSnippets);

      // 2. Extract from docs/ directory
      const docsSnippets = await this.extractFromDocs(owner, repo, config);
      snippets.push(...docsSnippets);

      // 3. Extract from examples/ directory (if enabled)
      if (config.extractFromExamples) {
        const exampleSnippets = await this.extractFromExamples(
          owner,
          repo,
          config
        );
        snippets.push(...exampleSnippets);
      }

      console.log(`   ✅ Extracted ${snippets.length} snippets`);
      return snippets;
    } catch (error) {
      console.error(`   ❌ Error extracting from ${owner}/${repo}:`, error);
      return [];
    }
  }

  /**
   * Extract code from README.md
   */
  private async extractFromReadme(
    owner: string,
    repo: string,
    config: ExtractionConfig
  ): Promise<CodeSnippet[]> {
    try {
      const { data } = await this.octokit.repos.getReadme({ owner, repo });
      const content = Buffer.from(data.content, "base64").toString("utf-8");

      return parseMarkdownCodeBlocks(content, {
        sourceUrl: `https://github.com/${owner}/${repo}`,
        sourceName: `${owner}/${repo}`,
        sourceType: "github",
        filePath: "README.md",
        config,
      });
    } catch {
      return [];
    }
  }

  /**
   * Extract code from docs/ directory
   */
  private async extractFromDocs(
    owner: string,
    repo: string,
    config: ExtractionConfig
  ): Promise<CodeSnippet[]> {
    const snippets: CodeSnippet[] = [];

    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: "docs",
      });

      if (!Array.isArray(data)) return [];

      // Process markdown files
      for (const file of data) {
        if (file.type === "file" && file.name.endsWith(".md")) {
          const fileSnippets = await this.extractFromFile(
            owner,
            repo,
            file.path,
            config
          );
          snippets.push(...fileSnippets);
        }
      }
    } catch {
      // docs/ directory doesn't exist
    }

    return snippets;
  }

  /**
   * Extract code from examples/ directory
   */
  private async extractFromExamples(
    owner: string,
    repo: string,
    config: ExtractionConfig
  ): Promise<CodeSnippet[]> {
    const snippets: CodeSnippet[] = [];

    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: "examples",
      });

      if (!Array.isArray(data)) return [];

      // Process TypeScript/JavaScript files
      for (const file of data) {
        if (file.type === "file" && this.isCodeFile(file.name)) {
          const fileSnippets = await this.extractFunctionsFromFile(
            owner,
            repo,
            file.path,
            config
          );
          snippets.push(...fileSnippets);
        }
      }
    } catch {
      // examples/ directory doesn't exist
    }

    return snippets;
  }

  /**
   * Extract code from a specific file
   */
  private async extractFromFile(
    owner: string,
    repo: string,
    path: string,
    config: ExtractionConfig
  ): Promise<CodeSnippet[]> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if ("content" in data) {
        const content = Buffer.from(data.content, "base64").toString("utf-8");

        return parseMarkdownCodeBlocks(content, {
          sourceUrl: `https://github.com/${owner}/${repo}/blob/main/${path}`,
          sourceName: `${owner}/${repo}`,
          sourceType: "github",
          filePath: path,
          config,
        });
      }
    } catch (error) {
      console.error(`Error extracting from ${path}:`, error);
    }

    return [];
  }

  /**
   * Extract functions from code files using AST parsing
   */
  private async extractFunctionsFromFile(
    owner: string,
    repo: string,
    path: string,
    config: ExtractionConfig
  ): Promise<CodeSnippet[]> {
    // TODO: Implement AST parsing for extracting functions
    // This would use TypeScript compiler API or Babel parser
    return [];
  }

  private isCodeFile(filename: string): boolean {
    return /\.(ts|tsx|js|jsx)$/.test(filename);
  }
}
```

### Code Parser Utilities

````typescript
// pipeline/extraction/code-parser.ts

import { v4 as uuidv4 } from "uuid";
import { CodeSnippet, ExtractionConfig } from "./types";

interface ParseContext {
  sourceUrl: string;
  sourceName: string;
  sourceType: "github" | "docs" | "blog";
  filePath?: string;
  config: ExtractionConfig;
}

/**
 * Parse code blocks from markdown content
 */
export function parseMarkdownCodeBlocks(
  markdown: string,
  context: ParseContext
): CodeSnippet[] {
  const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
  const snippets: CodeSnippet[] = [];

  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const [fullMatch, language, code] = match;
    const trimmedCode = code.trim();
    const lines = trimmedCode.split("\n");

    // Filter by language
    if (language && !context.config.languages.includes(language)) {
      continue;
    }

    // Filter by line count
    if (
      lines.length < context.config.minLines ||
      lines.length > context.config.maxLines
    ) {
      continue;
    }

    // Extract context (heading before code block)
    const precedingContext = extractPrecedingHeading(markdown, match.index);

    snippets.push({
      id: uuidv4(),
      code: trimmedCode,
      language: language || "text",
      lineCount: lines.length,
      context: precedingContext,
      filePath: context.filePath,
      sourceUrl: context.sourceUrl,
      sourceName: context.sourceName,
      sourceType: context.sourceType,
      extractedAt: new Date(),
      extractionMethod: "markdown",
    });
  }

  return snippets;
}

/**
 * Extract the heading that precedes a code block
 */
export function extractPrecedingHeading(
  markdown: string,
  position: number
): string | undefined {
  const beforeCode = markdown.substring(0, position);

  // Find the last heading before this position
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  let lastHeading: string | undefined;

  let match;
  while ((match = headingRegex.exec(beforeCode)) !== null) {
    lastHeading = match[1].trim();
  }

  return lastHeading;
}

/**
 * Parse code blocks from HTML content
 */
export function parseHTMLCodeBlocks(
  html: string,
  context: ParseContext
): CodeSnippet[] {
  const cheerio = require("cheerio");
  const $ = cheerio.load(html);
  const snippets: CodeSnippet[] = [];

  $("pre code, pre").each((i: number, elem: any) => {
    const code = $(elem).text().trim();
    const lines = code.split("\n");

    // Filter by line count
    if (
      lines.length < context.config.minLines ||
      lines.length > context.config.maxLines
    ) {
      return;
    }

    // Try to detect language from class
    const className = $(elem).attr("class") || "";
    const languageMatch = className.match(/language-(\w+)/);
    const language = languageMatch ? languageMatch[1] : "text";

    // Filter by language
    if (!context.config.languages.includes(language)) {
      return;
    }

    // Extract context (nearest heading)
    const heading = $(elem)
      .closest("section, article, div")
      .find("h1, h2, h3, h4")
      .first()
      .text()
      .trim();

    snippets.push({
      id: uuidv4(),
      code,
      language,
      lineCount: lines.length,
      context: heading || undefined,
      sourceUrl: context.sourceUrl,
      sourceName: context.sourceName,
      sourceType: context.sourceType,
      extractedAt: new Date(),
      extractionMethod: "html",
    });
  });

  return snippets;
}
````

### Documentation Extractor

```typescript
// pipeline/extraction/docs-extractor.ts

import fetch from "node-fetch";
import { CodeSnippet, ExtractionConfig } from "./types";
import { parseHTMLCodeBlocks } from "./code-parser";

export class DocsExtractor {
  /**
   * Extract code from a documentation URL
   */
  async extractFromURL(
    url: string,
    sourceName: string,
    config: ExtractionConfig
  ): Promise<CodeSnippet[]> {
    console.log(`📄 Extracting from ${url}...`);

    try {
      const response = await fetch(url);
      const html = await response.text();

      const snippets = parseHTMLCodeBlocks(html, {
        sourceUrl: url,
        sourceName,
        sourceType: "docs",
        config,
      });

      console.log(`   ✅ Extracted ${snippets.length} snippets`);
      return snippets;
    } catch (error) {
      console.error(`   ❌ Error extracting from ${url}:`, error);
      return [];
    }
  }

  /**
   * Extract from multiple documentation pages
   */
  async extractFromSitemap(
    sitemapUrl: string,
    sourceName: string,
    config: ExtractionConfig,
    maxPages: number = 50
  ): Promise<CodeSnippet[]> {
    // TODO: Implement sitemap parsing
    // 1. Fetch sitemap.xml
    // 2. Extract URLs
    // 3. Process each URL
    // 4. Aggregate snippets
    return [];
  }
}
```

### Main Extraction Orchestrator

```typescript
// pipeline/extraction/index.ts

import dotenv from "dotenv";
import { GitHubExtractor } from "./github-extractor";
import { DocsExtractor } from "./docs-extractor";
import { CodeSnippet, ExtractionConfig, ExtractionResult } from "./types";
import { Source } from "../discovery/types";

dotenv.config();

export class Extraction {
  private githubExtractor: GitHubExtractor;
  private docsExtractor: DocsExtractor;
  private config: ExtractionConfig;

  constructor(config?: Partial<ExtractionConfig>) {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error("GITHUB_TOKEN not found in environment");
    }

    this.githubExtractor = new GitHubExtractor(githubToken);
    this.docsExtractor = new DocsExtractor();

    this.config = {
      minLines: 5,
      maxLines: 25,
      languages: ["javascript", "typescript", "css", "html", "bash"],
      includeComments: true,
      extractFromExamples: true,
      ...config,
    };
  }

  /**
   * Run extraction on discovered sources
   */
  async run(sources: Source[]): Promise<ExtractionResult> {
    console.log("🚀 Starting Extraction Stage...\n");

    const snippets: CodeSnippet[] = [];

    for (const source of sources) {
      try {
        if (source.type === "github") {
          const [owner, repo] = source.name.split("/");
          const extracted = await this.githubExtractor.extractFromRepo(
            owner,
            repo,
            this.config
          );
          snippets.push(...extracted);
        } else if (source.type === "docs") {
          const extracted = await this.docsExtractor.extractFromURL(
            source.url,
            source.name,
            this.config
          );
          snippets.push(...extracted);
        }

        // Rate limiting
        await this.sleep(500);
      } catch (error) {
        console.error(`Error processing ${source.name}:`, error);
      }
    }

    const stats = this.calculateStats(snippets);

    const result: ExtractionResult = {
      snippets,
      stats,
    };

    this.printSummary(result);

    return result;
  }

  private calculateStats(snippets: CodeSnippet[]) {
    const byLanguage: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const snippet of snippets) {
      byLanguage[snippet.language] = (byLanguage[snippet.language] || 0) + 1;
      bySource[snippet.sourceName] = (bySource[snippet.sourceName] || 0) + 1;
    }

    return {
      totalExtracted: snippets.length,
      byLanguage,
      bySource,
    };
  }

  private printSummary(result: ExtractionResult) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 EXTRACTION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Snippets: ${result.stats.totalExtracted}`);
    console.log("\nBy Language:");
    Object.entries(result.stats.byLanguage)
      .sort(([, a], [, b]) => b - a)
      .forEach(([lang, count]) => {
        console.log(`  ${lang.padEnd(15)}: ${count}`);
      });
    console.log("=".repeat(60) + "\n");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## Testing

```typescript
// Test extraction
import { Extraction } from "./pipeline/extraction";
import discoveryResults from "./discovery-results.json";

const extraction = new Extraction({
  minLines: 5,
  maxLines: 20,
  languages: ["typescript", "javascript"],
});

extraction.run(discoveryResults.sources.slice(0, 5)).then((result) => {
  console.log(`Extracted ${result.snippets.length} snippets`);
});
```

---

**Continue to:** [Stage 3: Processing](./3-processing.md)
