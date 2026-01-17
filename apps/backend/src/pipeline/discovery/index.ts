import dotenv from "dotenv";
import { GitHubDiscovery } from "./github-discovery";
import { DocsScraper } from "./docs-scraper";
import { CURATED_SOURCES } from "./curated-sources";
import { DiscoveryConfig, DiscoveryResult, Source } from "./types";
import { writeFile } from "fs/promises";

dotenv.config();

/**
 * Main discovery orchestrator
 */
export class Discovery {
  private githubDiscovery: GitHubDiscovery;
  private docsScraper: DocsScraper;
  private config: DiscoveryConfig;

  constructor(config?: Partial<DiscoveryConfig>) {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error("GITHUB_TOKEN not found in environment");
    }

    this.githubDiscovery = new GitHubDiscovery(githubToken);
    this.docsScraper = new DocsScraper();

    // Default configuration
    this.config = {
      topics: process.env.TOPICS?.split(",") || [
        "react",
        "typescript",
        "vue",
        "angular",
        "css",
        "javascript",
      ],
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
    await writeFile(filepath, JSON.stringify(result, null, 2), "utf-8");
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
