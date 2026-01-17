#!/usr/bin/env tsx

import { DocsScraper } from "./src/pipeline/discovery/docs-scraper";
import { writeFile } from "fs/promises";

/**
 * Test the documentation scraper
 */
async function testDocsScraper() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 TESTING DOCUMENTATION SCRAPER");
  console.log("=".repeat(70) + "\n");

  const scraper = new DocsScraper();

  try {
    // Scrape all documentation pages
    const snippets = await scraper.scrapeAll(true); // Use cache

    console.log("\n" + "=".repeat(70));
    console.log("📊 SCRAPING RESULTS");
    console.log("=".repeat(70));
    console.log(`Total Snippets: ${snippets.length}`);

    // Group by language
    const byLanguage: Record<string, number> = {};
    for (const snippet of snippets) {
      byLanguage[snippet.language] = (byLanguage[snippet.language] || 0) + 1;
    }

    console.log("\nBy Language:");
    Object.entries(byLanguage)
      .sort(([, a], [, b]) => b - a)
      .forEach(([lang, count]) => {
        console.log(`  ${lang.padEnd(15)}: ${count}`);
      });

    // Group by source
    const bySource: Record<string, number> = {};
    for (const snippet of snippets) {
      const source = snippet.metadata.sourceName;
      bySource[source] = (bySource[source] || 0) + 1;
    }

    console.log("\nBy Source:");
    Object.entries(bySource)
      .sort(([, a], [, b]) => b - a)
      .forEach(([source, count]) => {
        console.log(`  ${source.padEnd(30)}: ${count}`);
      });

    console.log("=".repeat(70) + "\n");

    // Save results
    const result = {
      snippets,
      stats: {
        totalExtracted: snippets.length,
        byLanguage,
        bySource,
      },
      timestamp: new Date(),
    };

    await writeFile(
      "docs-scraping-results.json",
      JSON.stringify(result, null, 2),
      "utf-8"
    );

    console.log("💾 Results saved to: docs-scraping-results.json\n");

    // Show first 3 snippets as examples
    if (snippets.length > 0) {
      console.log("📝 Sample Snippets:\n");
      snippets.slice(0, 3).forEach((snippet, i) => {
        console.log(`${i + 1}. ${snippet.metadata.sourceName}`);
        console.log(`   Language: ${snippet.language}`);
        console.log(`   Context: ${snippet.metadata.context}`);
        console.log(`   Code (first 100 chars): ${snippet.code.substring(0, 100)}...`);
        console.log();
      });
    }

    console.log("✅ Documentation scraping test completed successfully!\n");
  } catch (error: any) {
    console.error("\n❌ Scraping failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testDocsScraper();
