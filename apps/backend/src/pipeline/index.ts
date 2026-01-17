import dotenv from "dotenv";
import { Discovery } from "./discovery";
import { Extraction } from "./extraction";
import { Processing } from "./processing";
import { QualityScoring } from "./quality";
import { Enrichment } from "./enrichment";
import { Publishing } from "./publishing";

dotenv.config();

/**
 * Main pipeline orchestrator - runs all 6 stages sequentially
 */
export class Pipeline {
  async run() {
    console.log("\n" + "=".repeat(70));
    console.log("🚀 DEVDOSE CONTENT PIPELINE");
    console.log("=".repeat(70) + "\n");

    const startTime = Date.now();

    try {
      // Stage 1: Discovery
      console.log("📍 STAGE 1/6: DISCOVERY\n");
      const discovery = new Discovery();
      const discoveryResult = await discovery.run();
      await discovery.saveResults(discoveryResult, "discovery-results.json");

      // Stage 2: Extraction
      console.log("\n📍 STAGE 2/6: EXTRACTION\n");
      const extraction = new Extraction();
      const extractionResult = await extraction.run("discovery-results.json");
      await extraction.saveResults(extractionResult, "extraction-results.json");

      // Stage 3: Processing
      console.log("\n📍 STAGE 3/6: PROCESSING\n");
      const processing = new Processing();
      const processingResult = await processing.run("extraction-results.json");
      await processing.saveResults(processingResult, "processing-results.json");

      // Stage 4: Quality Scoring
      console.log("\n📍 STAGE 4/6: QUALITY SCORING\n");
      const qualityScoring = new QualityScoring();
      const qualityResult = await qualityScoring.run("processing-results.json");
      await qualityScoring.saveResults(qualityResult, "quality-results.json");

      // Stage 5: Enrichment
      console.log("\n📍 STAGE 5/6: ENRICHMENT\n");
      const enrichment = new Enrichment();
      const enrichmentResult = await enrichment.run("quality-results.json");
      await enrichment.saveResults(enrichmentResult, "enrichment-results.json");

      // Stage 6: Publishing
      console.log("\n📍 STAGE 6/6: PUBLISHING\n");
      const publishing = new Publishing();
      const publishingResult = await publishing.run("enrichment-results.json");

      // Final summary
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);

      console.log("\n" + "=".repeat(70));
      console.log("✅ PIPELINE COMPLETE!");
      console.log("=".repeat(70));
      console.log(`Total Duration: ${duration} minutes`);
      console.log(`\nPipeline Flow:`);
      console.log(`  Sources Discovered: ${discoveryResult.stats.totalFound}`);
      console.log(`  Snippets Extracted: ${extractionResult.stats.totalExtracted}`);
      console.log(`  Posts Processed: ${processingResult.stats.totalProcessed}`);
      console.log(`  Posts Approved: ${qualityResult.stats.autoApproved + qualityResult.stats.manualReview}`);
      console.log(`  Posts Enriched: ${enrichmentResult.stats.totalEnriched}`);
      console.log(`  Posts Published: ${publishingResult.published}`);
      console.log("=".repeat(70) + "\n");

      return {
        success: true,
        duration,
        stats: {
          discovered: discoveryResult.stats.totalFound,
          extracted: extractionResult.stats.totalExtracted,
          processed: processingResult.stats.totalProcessed,
          approved: qualityResult.stats.autoApproved + qualityResult.stats.manualReview,
          enriched: enrichmentResult.stats.totalEnriched,
          published: publishingResult.published,
        },
      };
    } catch (error) {
      console.error("\n❌ PIPELINE FAILED:", error);
      throw error;
    }
  }
}

// CLI usage
if (require.main === module) {
  const pipeline = new Pipeline();

  pipeline
    .run()
    .then((result) => {
      console.log("✅ All stages completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Pipeline execution failed");
      process.exit(1);
    });
}
