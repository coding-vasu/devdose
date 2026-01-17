#!/usr/bin/env tsx

import dotenv from "dotenv";
import { readFile, writeFile } from "fs/promises";
import { DiscoveryResult, Source, GitHubRepo } from "../pipeline/discovery/types";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { existsSync } from "fs";

dotenv.config();

/**
 * Interactive CLI tool to manually add sources to discovery results
 */
async function addSource() {
  console.log("\n" + "=".repeat(70));
  console.log("➕ DEVDOSE MANUAL SOURCE ADDITION TOOL");
  console.log("=".repeat(70) + "\n");

  const rl = readline.createInterface({ input, output });

  // Load existing discovery results or create new
  const discoveryPath = "discovery-results.json";
  let discoveryResult: DiscoveryResult;

  if (existsSync(discoveryPath)) {
    console.log(`📂 Loading existing discovery results from: ${discoveryPath}\n`);
    const data = await readFile(discoveryPath, "utf-8");
    discoveryResult = JSON.parse(data);
    console.log(`✅ Found ${discoveryResult.sources.length} existing sources\n`);
  } else {
    console.log("📂 No existing discovery results found. Creating new file.\n");
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

  console.log("Let's add a new source!\n");

  // Get source type
  const sourceType = await rl.question(
    "Source type (github/docs/blog/awesome): "
  );

  if (!["github", "docs", "blog", "awesome"].includes(sourceType)) {
    console.error("\n❌ Invalid source type. Must be: github, docs, blog, or awesome\n");
    rl.close();
    process.exit(1);
  }

  // Get basic info
  const name = await rl.question("Source name: ");
  const url = await rl.question("Source URL: ");
  const tagsInput = await rl.question("Tags (comma-separated): ");
  const tags = tagsInput.split(",").map((t) => t.trim()).filter((t) => t);
  const priorityInput = await rl.question("Priority (1-10, default 5): ");
  const priority = priorityInput ? parseInt(priorityInput) : 5;

  // Create base source
  let newSource: Source | GitHubRepo;

  if (sourceType === "github") {
    // Get GitHub-specific details
    console.log("\n📦 GitHub-specific details (optional, press Enter to skip):\n");
    
    const owner = await rl.question("Repository owner: ");
    const repo = await rl.question("Repository name: ");
    const starsInput = await rl.question("Stars (default 0): ");
    const stars = starsInput ? parseInt(starsInput) : 0;
    const forksInput = await rl.question("Forks (default 0): ");
    const forks = forksInput ? parseInt(forksInput) : 0;
    const language = await rl.question("Primary language (default JavaScript): ");
    const hasExamplesInput = await rl.question("Has examples? (y/n, default n): ");
    const hasExamples = hasExamplesInput.toLowerCase() === "y";
    const hasGoodDocsInput = await rl.question("Has good docs? (y/n, default y): ");
    const hasGoodDocs = hasGoodDocsInput.toLowerCase() !== "n";

    newSource = {
      type: "github",
      name,
      url,
      owner: owner || name.split("/")[0] || "unknown",
      repo: repo || name.split("/")[1] || "unknown",
      tags,
      stars,
      forks,
      language: language || "JavaScript",
      lastPushed: new Date(),
      hasExamples,
      hasGoodDocs,
      priority,
    } as GitHubRepo;
  } else {
    // Non-GitHub source
    newSource = {
      type: sourceType as "docs" | "blog" | "awesome",
      name,
      url,
      tags,
      priority,
    };
  }

  // Add to discovery results
  discoveryResult.sources.push(newSource);

  // Update statistics
  discoveryResult.stats.totalFound = discoveryResult.sources.length;
  discoveryResult.stats.byType[sourceType] =
    (discoveryResult.stats.byType[sourceType] || 0) + 1;
  
  for (const tag of tags) {
    discoveryResult.stats.byTopic[tag] =
      (discoveryResult.stats.byTopic[tag] || 0) + 1;
  }
  
  discoveryResult.timestamp = new Date();

  // Save updated results
  await writeFile(
    discoveryPath,
    JSON.stringify(discoveryResult, null, 2),
    "utf-8"
  );

  console.log("\n" + "=".repeat(70));
  console.log("✅ SOURCE ADDED SUCCESSFULLY!");
  console.log("=".repeat(70));
  console.log(`Name:     ${newSource.name}`);
  console.log(`Type:     ${newSource.type}`);
  console.log(`URL:      ${newSource.url}`);
  console.log(`Priority: ${newSource.priority}/10`);
  console.log(`Tags:     ${newSource.tags.join(", ")}`);
  
  if (sourceType === "github" && "stars" in newSource) {
    const githubSource = newSource as GitHubRepo;
    console.log(`Stars:    ${githubSource.stars?.toLocaleString() || 0}`);
    console.log(`Forks:    ${githubSource.forks?.toLocaleString() || 0}`);
  }
  
  console.log("=".repeat(70));
  console.log(`\n💾 Saved to: ${discoveryPath}`);
  console.log(`📊 Total sources: ${discoveryResult.sources.length}\n`);

  // Ask if user wants to add another
  const addAnother = await rl.question("Add another source? (y/n): ");
  
  rl.close();

  if (addAnother.toLowerCase() === "y") {
    // Recursively call to add another
    await addSource();
  } else {
    console.log("\n💡 Next Steps:");
    console.log("   1. Verify your sources:");
    console.log("      npm run verify-source");
    console.log("   2. Test pipeline on a specific source:");
    console.log(`      npm run single-source -- --url "${newSource.url}"`);
    console.log("   3. Run full pipeline:");
    console.log("      npm run pipeline\n");
  }
}

addSource()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed to add source:", error);
    process.exit(1);
  });
