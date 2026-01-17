#!/usr/bin/env tsx

import dotenv from "dotenv";
import { readFile } from "fs/promises";
import { DiscoveryResult, Source, GitHubRepo } from "../pipeline/discovery/types";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

dotenv.config();

/**
 * Interactive CLI tool to manually verify discovered sources
 */
async function verifySource() {
  console.log("\n" + "=".repeat(70));
  console.log("🔍 DEVDOSE SOURCE VERIFICATION TOOL");
  console.log("=".repeat(70) + "\n");

  // Load discovery results
  const discoveryPath = "discovery-results.json";
  console.log(`📂 Loading discovery results from: ${discoveryPath}\n`);

  let discoveryResult: DiscoveryResult;
  try {
    const data = await readFile(discoveryPath, "utf-8");
    discoveryResult = JSON.parse(data);
  } catch (error) {
    console.error("❌ Failed to load discovery results:", error);
    console.log("\n💡 Tip: Run the discovery stage first:");
    console.log("   npm run discovery\n");
    process.exit(1);
  }

  console.log(`✅ Loaded ${discoveryResult.sources.length} sources\n`);

  // Create readline interface
  const rl = readline.createInterface({ input, output });

  // Display summary
  console.log("📊 Discovery Summary:");
  console.log(`   Total Sources: ${discoveryResult.stats.totalFound}`);
  console.log("\n   By Type:");
  Object.entries(discoveryResult.stats.byType)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`     ${type.padEnd(10)}: ${count}`);
    });

  console.log("\n   Top Topics:");
  Object.entries(discoveryResult.stats.byTopic)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([topic, count]) => {
      console.log(`     ${topic.padEnd(20)}: ${count}`);
    });

  console.log("\n" + "-".repeat(70) + "\n");

  // Interactive verification
  let currentIndex = 0;
  const sources = discoveryResult.sources;

  while (currentIndex < sources.length) {
    const source = sources[currentIndex];

    // Display source details
    console.log(`\n📦 Source ${currentIndex + 1}/${sources.length}`);
    console.log("=".repeat(70));
    console.log(`Name:     ${source.name}`);
    console.log(`Type:     ${source.type}`);
    console.log(`URL:      ${source.url}`);
    console.log(`Priority: ${source.priority}/10`);
    console.log(`Tags:     ${source.tags.join(", ")}`);

    // Show GitHub-specific details
    if (source.type === "github" && "stars" in source) {
      const githubSource = source as GitHubRepo;
      console.log(`Stars:    ${(githubSource.stars ?? 0).toLocaleString()}`);
      console.log(`Forks:    ${(githubSource.forks ?? 0).toLocaleString()}`);
      console.log(`Language: ${githubSource.language || "N/A"}`);
      console.log(`Last Push: ${githubSource.lastPushed ? new Date(githubSource.lastPushed).toLocaleDateString() : "N/A"}`);
      console.log(`Has Examples: ${githubSource.hasExamples ? "✅" : "❌"}`);
      console.log(`Has Good Docs: ${githubSource.hasGoodDocs ? "✅" : "❌"}`);
    }

    console.log("=".repeat(70));

    // Get user input
    const answer = await rl.question(
      "\n[n]ext | [p]revious | [o]pen URL | [q]uit | Enter index to jump: "
    );

    const command = answer.toLowerCase().trim();

    if (command === "q" || command === "quit") {
      console.log("\n👋 Exiting verification tool.\n");
      break;
    } else if (command === "n" || command === "next" || command === "") {
      currentIndex++;
    } else if (command === "p" || command === "previous") {
      currentIndex = Math.max(0, currentIndex - 1);
    } else if (command === "o" || command === "open") {
      console.log(`\n🌐 Opening: ${source.url}`);
      // Open URL in browser (platform-specific)
      const { exec } = await import("child_process");
      const openCommand =
        process.platform === "darwin"
          ? "open"
          : process.platform === "win32"
          ? "start"
          : "xdg-open";
      exec(`${openCommand} "${source.url}"`);
    } else if (!isNaN(parseInt(command))) {
      const index = parseInt(command) - 1;
      if (index >= 0 && index < sources.length) {
        currentIndex = index;
      } else {
        console.log(`\n⚠️  Invalid index. Please enter a number between 1 and ${sources.length}`);
      }
    } else {
      console.log("\n⚠️  Invalid command. Use n/p/o/q or enter an index.");
    }

    // Check if we've reached the end
    if (currentIndex >= sources.length) {
      console.log("\n✅ Reached the end of sources.\n");
      break;
    }
  }

  rl.close();

  console.log("\n" + "=".repeat(70));
  console.log("📝 VERIFICATION COMPLETE");
  console.log("=".repeat(70));
  console.log("\n💡 Next Steps:");
  console.log("   1. Run single-source pipeline on specific sources:");
  console.log("      npm run single-source -- --url \"https://github.com/facebook/react\"");
  console.log("   2. Run full pipeline on all sources:");
  console.log("      npm run pipeline\n");
}

verifySource()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Verification failed:", error);
    process.exit(1);
  });
