#!/usr/bin/env tsx

import dotenv from "dotenv";
import { Processing } from "./src/pipeline/processing";
import { QualityScoring } from "./src/pipeline/quality";
import { Enrichment } from "./src/pipeline/enrichment";
import { Publishing } from "./src/pipeline/publishing";

dotenv.config();

/**
 * Test pipeline with sample data
 * Runs stages 3-6 with pre-made test extraction results
 */
async function testPipeline() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 DEVDOSE PIPELINE TEST RUN");
  console.log("=".repeat(70) + "\n");

  const startTime = Date.now();

  try {
    // Stage 3: Processing
    console.log("📍 STAGE 3/6: PROCESSING (with Ollama - Local AI)\n");
    const processing = new Processing();
    const processingResult = await processing.run("test-extraction-results.json");
    await processing.saveResults(processingResult, "test-processing-results.json");

    // Stage 4: Quality Scoring
    console.log("\n📍 STAGE 4/6: QUALITY SCORING\n");
    const qualityScoring = new QualityScoring();
    const qualityResult = await qualityScoring.run("test-processing-results.json");
    await qualityScoring.saveResults(qualityResult, "test-quality-results.json");

    // Stage 5: Enrichment
    console.log("\n📍 STAGE 5/6: ENRICHMENT\n");
    const enrichment = new Enrichment();
    const enrichmentResult = await enrichment.run("test-quality-results.json");
    await enrichment.saveResults(enrichmentResult, "test-enrichment-results.json");

    // Stage 6: Publishing
    console.log("\n📍 STAGE 6/6: PUBLISHING\n");
    const publishing = new Publishing();
    const publishingResult = await publishing.run("test-enrichment-results.json");

    // Final summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);

    console.log("\n" + "=".repeat(70));
    console.log("✅ TEST PIPELINE COMPLETE!");
    console.log("=".repeat(70));
    console.log(`Total Duration: ${duration} minutes`);
    console.log(`\nTest Pipeline Flow:`);
    console.log(`  Test Snippets: 10`);
    console.log(`  Posts Processed: ${processingResult.stats.totalProcessed}`);
    console.log(`  Posts Approved: ${qualityResult.stats.autoApproved + qualityResult.stats.manualReview}`);
    console.log(`  Posts Enriched: ${enrichmentResult.stats.totalEnriched}`);
    console.log(`  Posts Published: ${publishingResult.published}`);
    console.log("=".repeat(70) + "\n");

    console.log("🎉 Success! All pipeline stages are working correctly!");
    console.log("\n📝 Next steps:");
    console.log("1. Check your Supabase database for the published posts");
    console.log("2. Review test-processing-results.json to see AI-generated content");
    console.log("3. Run the full pipeline when ready: npm run pipeline");

    return {
      success: true,
      duration,
      stats: {
        processed: processingResult.stats.totalProcessed,
        approved: qualityResult.stats.autoApproved + qualityResult.stats.manualReview,
        enriched: enrichmentResult.stats.totalEnriched,
        published: publishingResult.published,
      },
    };
  } catch (error) {
    console.error("\n❌ TEST PIPELINE FAILED:", error);
    throw error;
  }
}

testPipeline()
  .then((result) => {
    console.log("\n✅ Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test execution failed");
    process.exit(1);
  });
