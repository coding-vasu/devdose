#!/usr/bin/env tsx

import dotenv from "dotenv";
import { readFile, writeFile } from "fs/promises";
import { DiscoveryResult, Source, GitHubRepo } from "../pipeline/discovery/types";
import { existsSync } from "fs";

dotenv.config();

/**
 * Bulk import sources from a JSON file
 * Useful for importing curated lists or pre-defined sources
 */
async function bulkImportSources() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("\n❌ Error: Please provide a JSON file path\n");
    console.log("Usage:");
    console.log("  npm run import-sources -- path/to/sources.json\n");
    console.log("JSON format:");
    console.log(`  [
    {
      "type": "github",
      "name": "facebook/react",
      "url": "https://github.com/facebook/react",
      "tags": ["react", "javascript"],
      "priority": 10
    },
    {
      "type": "docs",
      "name": "MDN Web Docs",
      "url": "https://developer.mozilla.org",
      "tags": ["javascript", "web"],
      "priority": 10
    }
  ]\n`);
    process.exit(1);
  }

  const importPath = args[0];

  console.log("\n" + "=".repeat(70));
  console.log("📥 DEVDOSE BULK SOURCE IMPORT");
  console.log("=".repeat(70) + "\n");

  // Load import file
  if (!existsSync(importPath)) {
    console.error(`❌ File not found: ${importPath}\n`);
    process.exit(1);
  }

  console.log(`📂 Loading sources from: ${importPath}\n`);
  const importData = await readFile(importPath, "utf-8");
  let sourcesToImport: Partial<Source>[];

  try {
    sourcesToImport = JSON.parse(importData);
  } catch (error) {
    console.error("❌ Invalid JSON format:", error);
    process.exit(1);
  }

  if (!Array.isArray(sourcesToImport)) {
    console.error("❌ JSON must be an array of sources\n");
    process.exit(1);
  }

  console.log(`✅ Found ${sourcesToImport.length} sources to import\n`);

  // Load existing discovery results or create new
  const discoveryPath = "discovery-results.json";
  let discoveryResult: DiscoveryResult;

  if (existsSync(discoveryPath)) {
    console.log(`📂 Loading existing discovery results...\n`);
    const data = await readFile(discoveryPath, "utf-8");
    discoveryResult = JSON.parse(data);
    console.log(`   Current sources: ${discoveryResult.sources.length}\n`);
  } else {
    console.log("📂 Creating new discovery results file.\n");
    discoveryResult = {
      sources: [],
      stats: {
        totalFound: 0,
        byType: {},
        byTopic: {},
      },
      timestamp: new Date(),
    };
  }

  // Validate and import sources
  let imported = 0;
  let skipped = 0;

  for (const source of sourcesToImport) {
    // Validate required fields
    if (!source.type || !source.name || !source.url) {
      console.log(`⚠️  Skipping invalid source (missing type/name/url): ${JSON.stringify(source)}`);
      skipped++;
      continue;
    }

    // Check for duplicates by URL
    const exists = discoveryResult.sources.some((s) => s.url === source.url);
    if (exists) {
      console.log(`⚠️  Skipping duplicate: ${source.name}`);
      skipped++;
      continue;
    }

    // Create source with defaults
    let newSource: Source;

    if (source.type === "github") {
      // Parse owner and repo from GitHub URL
      const githubUrlMatch = source.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      
      if (!githubUrlMatch) {
        console.log(`⚠️  Skipping invalid GitHub URL: ${source.url}`);
        skipped++;
        continue;
      }

      const owner = githubUrlMatch[1];
      const repo = githubUrlMatch[2].replace(/\.git$/, ""); // Remove .git if present

      newSource = {
        type: "github",
        name: source.name,
        url: source.url,
        owner,
        repo,
        tags: source.tags || [],
        priority: source.priority || 5,
        stars: 0,
        forks: 0,
        language: "JavaScript",
        lastPushed: new Date(),
        hasExamples: false,
        hasGoodDocs: true,
      } as GitHubRepo;
    } else {
      newSource = {
        type: source.type as any,
        name: source.name,
        url: source.url,
        tags: source.tags || [],
        priority: source.priority || 5,
      };
    }

    discoveryResult.sources.push(newSource);
    
    // Update stats
    discoveryResult.stats.byType[newSource.type] =
      (discoveryResult.stats.byType[newSource.type] || 0) + 1;
    
    for (const tag of newSource.tags) {
      discoveryResult.stats.byTopic[tag] =
        (discoveryResult.stats.byTopic[tag] || 0) + 1;
    }

    console.log(`✅ Imported: ${newSource.name}`);
    imported++;
  }

  // Update totals
  discoveryResult.stats.totalFound = discoveryResult.sources.length;
  discoveryResult.timestamp = new Date();

  // Save updated results
  await writeFile(
    discoveryPath,
    JSON.stringify(discoveryResult, null, 2),
    "utf-8"
  );

  console.log("\n" + "=".repeat(70));
  console.log("📊 IMPORT SUMMARY");
  console.log("=".repeat(70));
  console.log(`Imported:       ${imported}`);
  console.log(`Skipped:        ${skipped}`);
  console.log(`Total sources:  ${discoveryResult.sources.length}`);
  console.log("=".repeat(70));
  console.log(`\n💾 Saved to: ${discoveryPath}\n`);

  console.log("💡 Next Steps:");
  console.log("   1. Verify imported sources:");
  console.log("      npm run verify-source");
  console.log("   2. Run full pipeline:");
  console.log("      npm run pipeline\n");
}

bulkImportSources()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Import failed:", error);
    process.exit(1);
  });
