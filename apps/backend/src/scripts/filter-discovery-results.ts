import { readFile, writeFile } from "fs/promises";
import { DiscoveryResult, Source } from "../pipeline/discovery/types";

/**
 * Filter discovery results to keep only high-priority sources
 */
async function filterDiscoveryResults(
  minPriority: number = 9
): Promise<void> {
  console.log("🔍 Loading discovery results...\n");

  // Load discovery results
  const data = await readFile("discovery-results.json", "utf-8");
  const discoveryResult: DiscoveryResult = JSON.parse(data);

  const originalCount = discoveryResult.sources.length;
  console.log(`📊 Original sources: ${originalCount}`);

  // Filter sources by priority
  const filteredSources = discoveryResult.sources.filter(
    (source) => source.priority >= minPriority
  );

  console.log(`✅ High-priority sources (>=${minPriority}): ${filteredSources.length}`);
  console.log(`🗑️  Sources to remove: ${originalCount - filteredSources.length}\n`);

  // Show breakdown by type
  const byType: Record<string, number> = {};
  filteredSources.forEach((source) => {
    byType[source.type] = (byType[source.type] || 0) + 1;
  });

  console.log("📋 Filtered sources by type:");
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  // Show top sources
  console.log("\n🌟 Top sources:");
  filteredSources
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 10)
    .forEach((source) => {
      console.log(`   [${source.priority}] ${source.name} (${source.type})`);
    });

  if (filteredSources.length > 10) {
    console.log(`   ... and ${filteredSources.length - 10} more`);
  }

  // Recalculate statistics
  const newStats = {
    totalFound: filteredSources.length,
    byType,
    byTopic: {} as Record<string, number>,
  };

  filteredSources.forEach((source) => {
    source.tags.forEach((tag) => {
      newStats.byTopic[tag] = (newStats.byTopic[tag] || 0) + 1;
    });
  });

  // Create filtered result
  const filteredResult: DiscoveryResult = {
    sources: filteredSources,
    stats: newStats,
    timestamp: new Date(),
  };

  // Save filtered results
  await writeFile(
    "discovery-results-filtered.json",
    JSON.stringify(filteredResult, null, 2),
    "utf-8"
  );

  console.log("\n💾 Saved filtered results to: discovery-results-filtered.json");

  // Ask if user wants to replace original
  console.log("\n" + "=".repeat(60));
  console.log("📊 FILTER SUMMARY");
  console.log("=".repeat(60));
  console.log(`Original sources: ${originalCount}`);
  console.log(`Filtered sources: ${filteredSources.length}`);
  console.log(`Removed: ${originalCount - filteredSources.length}`);
  console.log("=".repeat(60) + "\n");

  // Replace original file
  await writeFile(
    "discovery-results.json",
    JSON.stringify(filteredResult, null, 2),
    "utf-8"
  );

  console.log("✅ Updated discovery-results.json with filtered sources");
}

async function main() {
  const minPriority = parseInt(process.argv[2]) || 9;

  console.log("🚀 Discovery Results Filter\n");
  console.log(`Filtering sources with priority >= ${minPriority}\n`);

  try {
    await filterDiscoveryResults(minPriority);
    console.log("\n✅ Filtering complete!");
  } catch (error) {
    console.error("❌ Filtering failed:", error);
    process.exit(1);
  }
}

main();
