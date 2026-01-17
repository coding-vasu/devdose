#!/usr/bin/env tsx

import dotenv from "dotenv";
import { readFile, writeFile } from "fs/promises";
import { DiscoveryResult, Source } from "../pipeline/discovery/types";
import { Extraction } from "../pipeline/extraction";
import { Processing } from "../pipeline/processing";
import { QualityScoring } from "../pipeline/quality";
import { Enrichment } from "../pipeline/enrichment";
import { Publishing } from "../pipeline/publishing";

dotenv.config();

/**
 * Run the entire pipeline on a single source for testing
 */
async function runSingleSource() {
  console.log("\n" + "=".repeat(70));
  console.log("🎯 DEVDOSE SINGLE-SOURCE PIPELINE RUNNER");
  console.log("=".repeat(70) + "\n");

  // Parse command line arguments
  const args = process.argv.slice(2);
  let sourceUrl: string | null = null;
  let sourceIndex: number | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url" && args[i + 1]) {
      sourceUrl = args[i + 1];
    } else if (args[i] === "--index" && args[i + 1]) {
      sourceIndex = parseInt(args[i + 1]) - 1; // Convert to 0-indexed
    }
  }

  if (!sourceUrl && sourceIndex === null) {
    console.error("❌ Error: Please provide either --url or --index");
    console.log("\nUsage:");
    console.log('  npm run single-source -- --url "https://github.com/facebook/react"');
    console.log("  npm run single-source -- --index 5\n");
    process.exit(1);
  }

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

  // Find the source
  let source: Source | undefined;

  if (sourceUrl) {
    source = discoveryResult.sources.find((s) => s.url === sourceUrl);
    if (!source) {
      console.error(`❌ Error: Source not found with URL: ${sourceUrl}`);
      console.log("\n💡 Tip: Use the verify-source tool to browse available sources:");
      console.log("   npm run verify-source\n");
      process.exit(1);
    }
  } else if (sourceIndex !== null) {
    if (sourceIndex < 0 || sourceIndex >= discoveryResult.sources.length) {
      console.error(
        `❌ Error: Invalid index. Please provide a number between 1 and ${discoveryResult.sources.length}`
      );
      process.exit(1);
    }
    source = discoveryResult.sources[sourceIndex];
  }

  if (!source) {
    console.error("❌ Error: Could not find source");
    process.exit(1);
  }

  // Display source info
  console.log("✅ Found source:");
  console.log(`   Name:     ${source.name}`);
  console.log(`   Type:     ${source.type}`);
  console.log(`   URL:      ${source.url}`);
  console.log(`   Priority: ${source.priority}/10`);
  console.log(`   Tags:     ${source.tags.join(", ")}\n`);

  console.log("=".repeat(70));
  console.log("🚀 STARTING PIPELINE");
  console.log("=".repeat(70) + "\n");

  const startTime = Date.now();

  try {
    // Create a minimal discovery result with just this source
    const singleSourceDiscovery: DiscoveryResult = {
      sources: [source],
      stats: {
        totalFound: 1,
        byType: { [source.type]: 1 },
        byTopic: {},
      },
      timestamp: new Date(),
    };

    // Save temporary discovery result
    const tempDiscoveryPath = "temp-single-source-discovery.json";
    await writeFile(
      tempDiscoveryPath,
      JSON.stringify(singleSourceDiscovery, null, 2),
      "utf-8"
    );

    // Stage 2: Extraction
    console.log("📍 STAGE 2/6: EXTRACTION\n");
    const extraction = new Extraction();
    const extractionResult = await extraction.run(tempDiscoveryPath);
    const tempExtractionPath = "temp-single-source-extraction.json";
    await extraction.saveResults(extractionResult, tempExtractionPath);

    if (extractionResult.snippets.length === 0) {
      console.log("\n⚠️  No code snippets extracted from this source.");
      console.log("This source may not contain extractable code examples.\n");
      process.exit(0);
    }

    // Stage 3: Processing
    console.log("\n📍 STAGE 3/6: PROCESSING\n");
    const processing = new Processing();
    const processingResult = await processing.run(tempExtractionPath);
    const tempProcessingPath = "temp-single-source-processing.json";
    await processing.saveResults(processingResult, tempProcessingPath);

    // Stage 4: Quality Scoring
    console.log("\n📍 STAGE 4/6: QUALITY SCORING\n");
    const qualityScoring = new QualityScoring();
    const qualityResult = await qualityScoring.run(tempProcessingPath);
    const tempQualityPath = "temp-single-source-quality.json";
    await qualityScoring.saveResults(qualityResult, tempQualityPath);

    // Stage 5: Enrichment
    console.log("\n📍 STAGE 5/6: ENRICHMENT\n");
    const enrichment = new Enrichment();
    const enrichmentResult = await enrichment.run(tempQualityPath);
    const tempEnrichmentPath = "temp-single-source-enrichment.json";
    await enrichment.saveResults(enrichmentResult, tempEnrichmentPath);

    // Stage 6: Publishing
    console.log("\n📍 STAGE 6/6: PUBLISHING\n");
    const publishing = new Publishing();
    const publishingResult = await publishing.run(tempEnrichmentPath);

    // Final summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);

    console.log("\n" + "=".repeat(70));
    console.log("✅ SINGLE-SOURCE PIPELINE COMPLETE!");
    console.log("=".repeat(70));
    console.log(`Source: ${source.name}`);
    console.log(`Duration: ${duration} minutes`);
    console.log(`\nPipeline Results:`);
    console.log(`  Snippets Extracted: ${extractionResult.snippets.length}`);
    console.log(`  Posts Processed: ${processingResult.stats.totalProcessed}`);
    console.log(
      `  Posts Approved: ${qualityResult.stats.autoApproved + qualityResult.stats.manualReview}`
    );
    console.log(`  Posts Enriched: ${enrichmentResult.stats.totalEnriched}`);
    console.log(`  Posts Published: ${publishingResult.published}`);
    console.log("=".repeat(70) + "\n");

    console.log("📝 Temporary files created:");
    console.log(`   ${tempDiscoveryPath}`);
    console.log(`   ${tempExtractionPath}`);
    console.log(`   ${tempProcessingPath}`);
    console.log(`   ${tempQualityPath}`);
    console.log(`   ${tempEnrichmentPath}\n`);

    console.log("💡 Next Steps:");
    console.log("   1. Review the temporary files to see intermediate results");
    console.log("   2. Check your Supabase database for published posts");
    console.log("   3. Run on another source or run the full pipeline\n");

    return {
      success: true,
      source: source.name,
      duration,
      stats: {
        extracted: extractionResult.snippets.length,
        processed: processingResult.stats.totalProcessed,
        approved:
          qualityResult.stats.autoApproved + qualityResult.stats.manualReview,
        enriched: enrichmentResult.stats.totalEnriched,
        published: publishingResult.published,
      },
    };
  } catch (error) {
    console.error("\n❌ SINGLE-SOURCE PIPELINE FAILED:", error);
    throw error;
  }
}

runSingleSource()
  .then((result) => {
    console.log("✅ Single-source pipeline completed successfully!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Pipeline execution failed\n");
    process.exit(1);
  });
