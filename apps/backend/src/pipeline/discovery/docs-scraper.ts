import axios from "axios";
import * as cheerio from "cheerio";
import { CodeSnippet } from "../extraction/types";
import { createHash } from "crypto";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * Documentation page to scrape
 */
export interface DocPage {
  url: string;
  name: string;
  language: string;
  priority: number;
  selectors?: {
    codeBlock?: string;
    heading?: string;
  };
}

/**
 * Prioritized documentation sources
 * Priority: 10 = highest, 1 = lowest
 */
export const DOC_PAGES: DocPage[] = [
  // ===== PRIORITY 10: Official Framework Docs =====
  {
    url: "https://react.dev/learn",
    name: "React - Learn",
    language: "javascript",
    priority: 10,
  },
  {
    url: "https://react.dev/reference/react/hooks",
    name: "React - Hooks Reference",
    language: "javascript",
    priority: 10,
  },
  {
    url: "https://www.typescriptlang.org/docs/handbook/intro.html",
    name: "TypeScript Handbook",
    language: "typescript",
    priority: 10,
  },
  {
    url: "https://vuejs.org/guide/introduction.html",
    name: "Vue.js Guide",
    language: "javascript",
    priority: 10,
  },

  // ===== PRIORITY 9: MDN Web Docs =====
  {
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    name: "MDN - JavaScript Guide",
    language: "javascript",
    priority: 9,
  },
  {
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout",
    name: "MDN - CSS Flexbox",
    language: "css",
    priority: 9,
  },
  {
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout",
    name: "MDN - CSS Grid",
    language: "css",
    priority: 9,
  },

  // ===== PRIORITY 8: Educational Platforms =====
  {
    url: "https://web.dev/learn/css",
    name: "web.dev - Learn CSS",
    language: "css",
    priority: 8,
  },
  {
    url: "https://javascript.info/first-steps",
    name: "JavaScript.info - Fundamentals",
    language: "javascript",
    priority: 8,
  },
];

export class DocsScraper {
  private cacheDir = ".cache/docs";
  private requestDelay = 2000; // 2 seconds between requests
  private lastRequestTime = 0;

  constructor() {
    // Create cache directory if it doesn't exist
    this.ensureCacheDir();
  }

  private async ensureCacheDir() {
    if (!existsSync(this.cacheDir)) {
      await mkdir(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Scrape all documentation pages
   */
  async scrapeAll(useCache = true): Promise<CodeSnippet[]> {
    const allSnippets: CodeSnippet[] = [];

    // Sort by priority (highest first)
    const sortedPages = [...DOC_PAGES].sort((a, b) => b.priority - a.priority);

    console.log(`\n🌐 Scraping ${sortedPages.length} documentation pages...\n`);

    for (const page of sortedPages) {
      try {
        console.log(`📄 Scraping: ${page.name} (Priority: ${page.priority})`);
        
        const snippets = await this.scrapePage(page, useCache);
        allSnippets.push(...snippets);
        
        console.log(`   ✅ Extracted ${snippets.length} snippets\n`);

        // Rate limiting: wait before next request
        await this.rateLimit();
      } catch (error: any) {
        console.error(`   ❌ Failed to scrape ${page.name}:`, error.message);
      }
    }

    console.log(`\n📊 Total snippets extracted: ${allSnippets.length}\n`);
    return allSnippets;
  }

  /**
   * Scrape a single documentation page
   */
  private async scrapePage(
    page: DocPage,
    useCache: boolean
  ): Promise<CodeSnippet[]> {
    // Check cache first
    if (useCache) {
      const cached = await this.getFromCache(page.url);
      if (cached) {
        console.log(`   💾 Using cached content`);
        return this.extractCodeBlocks(cached, page);
      }
    }

    // Fetch HTML
    const html = await this.fetchHTML(page.url);

    // Cache for future use
    await this.saveToCache(page.url, html);

    // Extract code blocks
    return this.extractCodeBlocks(html, page);
  }

  /**
   * Fetch HTML from URL with rate limiting
   */
  private async fetchHTML(url: string): Promise<string> {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    return response.data;
  }

  /**
   * Extract code blocks from HTML
   */
  private extractCodeBlocks(html: string, page: DocPage): CodeSnippet[] {
    const $ = cheerio.load(html);
    const snippets: CodeSnippet[] = [];

    // Find all code blocks
    const codeSelector = page.selectors?.codeBlock || "pre code, pre, code";
    
    $(codeSelector).each((_, element) => {
      const $code = $(element);
      const code = $code.text().trim();

      // Skip if too short or too long
      if (code.length < 50 || code.length > 2000) return;

      // Skip if not enough lines
      const lines = code.split("\n").length;
      if (lines < 3 || lines > 50) return;

      // Detect language
      const language = this.detectLanguage($code, page.language);

      // Get context from nearest heading
      const context = this.getContext($, element);

      // Create snippet
      const snippet: CodeSnippet = {
        code,
        language,
        metadata: {
          sourceName: page.name,
          sourceUrl: page.url,
          sourceType: "docs",
          context,
        },
        hash: this.generateHash(code),
      };

      snippets.push(snippet);
    });

    // Deduplicate by hash
    return this.deduplicateSnippets(snippets);
  }

  /**
   * Detect programming language from code block
   */
  private detectLanguage($code: cheerio.Cheerio<any>, fallback: string): string {
    // Check class names
    const className = $code.attr("class") || "";
    
    if (className.includes("javascript") || className.includes("js")) return "javascript";
    if (className.includes("typescript") || className.includes("ts")) return "typescript";
    if (className.includes("css")) return "css";
    if (className.includes("html")) return "html";
    if (className.includes("jsx") || className.includes("tsx")) return "javascript";

    // Check language attribute
    const lang = $code.attr("data-language") || $code.attr("language");
    if (lang) return lang;

    return fallback;
  }

  /**
   * Get context from nearest heading
   */
  private getContext($: cheerio.CheerioAPI, element: any): string {
    const $element = $(element);
    
    // Find nearest heading (h1, h2, h3, h4)
    const $heading = $element.prevAll("h1, h2, h3, h4").first();
    
    if ($heading.length > 0) {
      return $heading.text().trim();
    }

    // Fallback: get nearest paragraph
    const $p = $element.prevAll("p").first();
    if ($p.length > 0) {
      const text = $p.text().trim();
      return text.substring(0, 100); // First 100 chars
    }

    return "";
  }

  /**
   * Generate hash for deduplication
   */
  private generateHash(code: string): string {
    return createHash("md5").update(code).digest("hex");
  }

  /**
   * Remove duplicate snippets
   */
  private deduplicateSnippets(snippets: CodeSnippet[]): CodeSnippet[] {
    const seen = new Set<string>();
    return snippets.filter((snippet) => {
      if (seen.has(snippet.hash)) return false;
      seen.add(snippet.hash);
      return true;
    });
  }

  /**
   * Rate limiting: ensure minimum delay between requests
   */
  private async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Get cached HTML
   */
  private async getFromCache(url: string): Promise<string | null> {
    const cacheFile = this.getCacheFilePath(url);
    
    if (!existsSync(cacheFile)) return null;

    try {
      const cached = await readFile(cacheFile, "utf-8");
      const data = JSON.parse(cached);
      
      // Cache expires after 7 days
      const age = Date.now() - data.timestamp;
      if (age > 7 * 24 * 60 * 60 * 1000) return null;
      
      return data.html;
    } catch {
      return null;
    }
  }

  /**
   * Save HTML to cache
   */
  private async saveToCache(url: string, html: string) {
    const cacheFile = this.getCacheFilePath(url);
    const data = {
      url,
      html,
      timestamp: Date.now(),
    };
    
    await writeFile(cacheFile, JSON.stringify(data), "utf-8");
  }

  /**
   * Get cache file path for URL
   */
  private getCacheFilePath(url: string): string {
    const hash = createHash("md5").update(url).digest("hex");
    return path.join(this.cacheDir, `${hash}.json`);
  }
}
