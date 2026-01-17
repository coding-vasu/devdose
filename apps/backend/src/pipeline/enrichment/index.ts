import dotenv from "dotenv";
import { EnrichmentResult, EnrichedPost } from "./types";
import { QualityResult } from "../quality/types";
import { readFile, writeFile } from "fs/promises";

dotenv.config();

/**
 * Main enrichment orchestrator
 */
export class Enrichment {
  /**
   * Run enrichment on quality-scored results
   */
  async run(qualityResultPath: string): Promise<EnrichmentResult> {
    console.log("🚀 Starting Enrichment Stage...\n");

    // Load quality results
    const qualityData = await readFile(qualityResultPath, "utf-8");
    const qualityResult: QualityResult = JSON.parse(qualityData);

    // Filter only approved posts
    const approvedPosts = qualityResult.scoredPosts.filter(
      (scored) => scored.approved
    );

    console.log(
      `📚 Enriching ${approvedPosts.length} approved posts...\n`
    );

    const enrichedPosts: EnrichedPost[] = [];

    for (const scored of approvedPosts) {
      const post = scored.post;

      // Extract additional tags
      const extractedTags = this.extractTags(post.code, post.language);

      // Calculate reading time (words per minute)
      const readingTimeSeconds = this.calculateReadingTime(
        post.code,
        post.explanation
      );

      // Identify prerequisites
      const prerequisites = this.identifyPrerequisites(post.tags, post.difficulty);

      const enriched: EnrichedPost = {
        ...post,
        enrichment: {
          extractedTags,
          readingTimeSeconds,
          prerequisites,
          relatedPostIds: [], // Will be populated after all posts are enriched
          updatedAt: new Date(),
        },
      };

      enrichedPosts.push(enriched);
    }

    // Find related posts
    this.findRelatedPosts(enrichedPosts);

    // Calculate statistics
    const stats = this.calculateStats(enrichedPosts);

    const result: EnrichmentResult = {
      enrichedPosts,
      stats,
      timestamp: new Date(),
    };

    this.printSummary(result);

    return result;
  }

  /**
   * Extract additional tags from code
   */
  private extractTags(code: string, language: string): string[] {
    const tags: string[] = [];

    // Framework-specific patterns
    const patterns: Record<string, RegExp[]> = {
      react: [
        /useState/,
        /useEffect/,
        /useCallback/,
        /useMemo/,
        /useRef/,
        /useContext/,
        /useReducer/,
      ],
      vue: [/ref\(/, /computed\(/, /watch\(/, /onMounted/, /reactive\(/],
      angular: [/@Component/, /@Injectable/, /@Input/, /@Output/, /ngOnInit/],
      css: [
        /grid/,
        /flexbox/,
        /animation/,
        /@media/,
        /transform/,
        /transition/,
      ],
    };

    // Check for patterns
    for (const [tag, regexes] of Object.entries(patterns)) {
      for (const regex of regexes) {
        if (regex.test(code)) {
          tags.push(tag);
          break;
        }
      }
    }

    // Concept extraction
    if (code.match(/async|await|Promise/)) tags.push("async");
    if (code.match(/map|filter|reduce/)) tags.push("array-methods");
    if (code.match(/class |extends /)) tags.push("oop");
    if (code.match(/=>|function/)) tags.push("functions");

    return [...new Set(tags)]; // Deduplicate
  }

  /**
   * Calculate reading time in seconds
   */
  private calculateReadingTime(code: string, explanation: string): number {
    // Average reading speed: 200 words per minute
    // Code reading is slower: ~100 words per minute

    const explanationWords = explanation.split(/\s+/).length;
    const codeLines = code.split("\n").length;

    // Explanation: 200 WPM = 3.33 words/second
    const explanationTime = explanationWords / 3.33;

    // Code: ~2 seconds per line (rough estimate)
    const codeTime = codeLines * 2;

    return Math.ceil(explanationTime + codeTime);
  }

  /**
   * Identify prerequisites based on tags and difficulty
   */
  private identifyPrerequisites(tags: string[], difficulty: string): string[] {
    const prerequisites: string[] = [];

    // Basic prerequisites
    if (tags.includes("react")) {
      prerequisites.push("JavaScript", "React basics");
    }
    if (tags.includes("typescript")) {
      prerequisites.push("JavaScript");
    }
    if (tags.includes("vue")) {
      prerequisites.push("JavaScript", "Vue basics");
    }
    if (tags.includes("angular")) {
      prerequisites.push("TypeScript", "Angular basics");
    }

    // Advanced prerequisites
    if (difficulty === "advanced") {
      if (tags.includes("react")) {
        prerequisites.push("React Hooks");
      }
      if (tags.includes("typescript")) {
        prerequisites.push("TypeScript generics");
      }
    }

    return [...new Set(prerequisites)];
  }

  /**
   * Find related posts based on tag overlap
   */
  private findRelatedPosts(posts: EnrichedPost[]): void {
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const postTags = new Set([
        ...post.tags,
        ...post.enrichment.extractedTags,
      ]);

      const related: { index: number; score: number }[] = [];

      for (let j = 0; j < posts.length; j++) {
        if (i === j) continue;

        const otherPost = posts[j];
        const otherTags = new Set([
          ...otherPost.tags,
          ...otherPost.enrichment.extractedTags,
        ]);

        // Calculate tag overlap
        const overlap = [...postTags].filter((tag) => otherTags.has(tag))
          .length;

        if (overlap > 0) {
          related.push({ index: j, score: overlap });
        }
      }

      // Sort by score and take top 3
      related.sort((a, b) => b.score - a.score);
      post.enrichment.relatedPostIds = related
        .slice(0, 3)
        .map((r) => `post-${r.index}`);
    }
  }

  /**
   * Calculate enrichment statistics
   */
  private calculateStats(posts: EnrichedPost[]) {
    let totalReadingTime = 0;
    let totalTags = 0;
    const byCategory: Record<string, number> = {};

    for (const post of posts) {
      totalReadingTime += post.enrichment.readingTimeSeconds;
      totalTags += post.enrichment.extractedTags.length;

      // Count by category
      if (post.category) {
        byCategory[post.category] = (byCategory[post.category] || 0) + 1;
      }
    }

    return {
      totalEnriched: posts.length,
      averageReadingTime: posts.length > 0 ? totalReadingTime / posts.length : 0,
      tagsAdded: totalTags,
      byCategory,
    };
  }

  /**
   * Print enrichment summary
   */
  private printSummary(result: EnrichmentResult) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 ENRICHMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Enriched: ${result.stats.totalEnriched}`);
    console.log(
      `Average Reading Time: ${result.stats.averageReadingTime.toFixed(1)}s`
    );
    console.log(`Tags Added: ${result.stats.tagsAdded}`);

    console.log("\nBy Category:");
    Object.entries(result.stats.byCategory)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category.padEnd(20)}: ${count}`);
      });

    console.log("=".repeat(60) + "\n");
  }

  /**
   * Save results to file
   */
  async saveResults(result: EnrichmentResult, filepath: string): Promise<void> {
    await writeFile(filepath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`💾 Results saved to: ${filepath}`);
  }
}

// CLI usage
if (require.main === module) {
  const enrichment = new Enrichment();

  enrichment
    .run("quality-results.json")
    .then((result) => {
      return enrichment.saveResults(result, "enrichment-results.json");
    })
    .catch((error) => {
      console.error("❌ Enrichment failed:", error);
      process.exit(1);
    });
}
