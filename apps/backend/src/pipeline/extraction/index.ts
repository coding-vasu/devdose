import dotenv from "dotenv";
import { GitHubExtractor } from "./github-extractor";
import { Deduplicator } from "./deduplicator";
import { ExtractionConfig, ExtractionResult, CodeSnippet } from "./types";
import { DiscoveryResult, GitHubRepo } from "../discovery/types";
import { readFile, writeFile } from "fs/promises";
import pLimit from "p-limit";

dotenv.config();

/**
 * Main extraction orchestrator
 */
export class Extraction {
  private githubExtractor: GitHubExtractor;
  private deduplicator: Deduplicator;
  private config: ExtractionConfig;

  constructor(config?: Partial<ExtractionConfig>) {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error("GITHUB_TOKEN not found in environment");
    }

    this.githubExtractor = new GitHubExtractor(githubToken);
    this.deduplicator = new Deduplicator();

    // Default configuration - optimized for bite-sized content
    this.config = {
      minCodeLines: parseInt(process.env.MIN_CODE_LINES || "3"), // Reduced from 10
      maxCodeLines: parseInt(process.env.MAX_CODE_LINES || "20"), // Reduced from 50
      languages: ["javascript", "typescript", "css", "html"],
      ...config,
    };
  }

  /**
   * Run extraction on discovery results
   */
  async run(discoveryResultPath: string): Promise<ExtractionResult> {
    console.log("🚀 Starting Extraction Stage...\n");

    // Load discovery results
    const discoveryData = await readFile(discoveryResultPath, "utf-8");
    const discoveryResult: DiscoveryResult = JSON.parse(discoveryData);

    // Extract from GitHub repos only
    const githubRepos = discoveryResult.sources.filter(
      (s) => s.type === "github"
    ) as GitHubRepo[];

    console.log(`📚 Extracting from ${githubRepos.length} GitHub repositories...\n`);

    // Use p-limit for controlled parallelism (5 concurrent extractions)
    const limit = pLimit(5);

    const snippetPromises = githubRepos.map((repo) =>
      limit(() => {
        console.log(`   📦 Extracting from ${repo.name}...`);
        return this.githubExtractor.extractFromRepo(
          repo.owner,
          repo.repo,
          this.config
        );
      })
    );

    const snippetArrays = await Promise.all(snippetPromises);
    const allSnippets = snippetArrays.flat();

    console.log(`\n✅ Extracted ${allSnippets.length} total snippets`);

    // Deduplicate
    console.log(`\n🔍 Deduplicating snippets...`);
    const uniqueSnippets = this.deduplicator.deduplicate(allSnippets);
    console.log(`   Removed ${allSnippets.length - uniqueSnippets.length} duplicates`);
    console.log(`   Unique snippets: ${uniqueSnippets.length}`);

    // Calculate statistics
    const stats = this.calculateStats(uniqueSnippets);

    const result: ExtractionResult = {
      snippets: uniqueSnippets,
      stats,
      timestamp: new Date(),
    };

    this.printSummary(result);

    return result;
  }

  /**
   * Calculate extraction statistics
   */
  private calculateStats(snippets: CodeSnippet[]) {
    const byLanguage: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const snippet of snippets) {
      // Count by language
      byLanguage[snippet.language] =
        (byLanguage[snippet.language] || 0) + 1;

      // Count by source
      bySource[snippet.metadata.sourceName] =
        (bySource[snippet.metadata.sourceName] || 0) + 1;
    }

    return {
      totalExtracted: snippets.length,
      byLanguage,
      bySource,
    };
  }

  /**
   * Print extraction summary
   */
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

    console.log("\nTop Sources:");
    Object.entries(result.stats.bySource)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([source, count]) => {
        console.log(`  ${source.padEnd(30)}: ${count}`);
      });

    console.log("=".repeat(60) + "\n");
  }

  /**
   * Save results to file
   */
  async saveResults(result: ExtractionResult, filepath: string): Promise<void> {
    await writeFile(filepath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`💾 Results saved to: ${filepath}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI usage
if (require.main === module) {
  const extraction = new Extraction();

  extraction
    .run("discovery-results.json")
    .then((result) => {
      return extraction.saveResults(result, "extraction-results.json");
    })
    .catch((error) => {
      console.error("❌ Extraction failed:", error);
      process.exit(1);
    });
}
