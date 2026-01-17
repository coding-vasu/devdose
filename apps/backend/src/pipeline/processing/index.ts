import dotenv from "dotenv";
import { OllamaClient } from "./ollama-client";
import {
  ProcessingConfig,
  ProcessingResult,
  ProcessedPost,
  ProcessingInput,
} from "./types";
import { ExtractionResult } from "../extraction/types";
import { readFile, writeFile } from "fs/promises";

dotenv.config();

/**
 * Main processing orchestrator using Ollama (local AI)
 */
export class Processing {
  private ollamaClient: OllamaClient;
  private config: ProcessingConfig;

  constructor(config?: Partial<ProcessingConfig>) {
    // Default configuration
    this.config = {
      batchSize: parseInt(process.env.BATCH_SIZE || "15"), // Increased from 5 for better performance
      maxRetries: parseInt(process.env.MAX_RETRIES || "3"),
      model: "llama3.2:3b", // Ollama model name
      ...config,
    };

    this.ollamaClient = new OllamaClient(this.config);
  }

  /**
   * Run processing on extraction results
   */
  async run(extractionResultPath: string): Promise<ProcessingResult> {
    console.log("🚀 Starting Processing Stage...\n");

    // Load extraction results
    const extractionData = await readFile(extractionResultPath, "utf-8");
    const extractionResult: ExtractionResult = JSON.parse(extractionData);

    console.log(
      `📚 Processing ${extractionResult.snippets.length} code snippets...\n`
    );

    // Convert snippets to processing inputs
    const inputs: ProcessingInput[] = extractionResult.snippets.map(
      (snippet) => ({
        code: snippet.code,
        language: snippet.language,
        sourceContext: snippet.metadata.context || snippet.metadata.filePath || "",
        repositoryName: snippet.metadata.sourceName,
      })
    );

    // Process with Ollama
    const processedPosts = await this.ollamaClient.processBatch(inputs);

    console.log(
      `\n✅ Successfully processed ${processedPosts.length}/${inputs.length} snippets`
    );

    // Combine with original snippet data
    const posts: ProcessedPost[] = [];
    for (let i = 0; i < processedPosts.length && i < extractionResult.snippets.length; i++) {
      const output = processedPosts[i];
      const snippet = extractionResult.snippets[i];

      if (output) {
        posts.push({
          ...output,
          code: snippet.code,
          language: snippet.language,
          sourceUrl: snippet.metadata.sourceUrl,
          sourceName: snippet.metadata.sourceName,
          sourceType: snippet.metadata.sourceType,
        });
      }
    }

    // Calculate statistics
    const stats = this.calculateStats(posts);

    const result: ProcessingResult = {
      posts,
      stats,
      timestamp: new Date(),
    };

    this.printSummary(result);

    return result;
  }

  /**
   * Calculate processing statistics
   */
  private calculateStats(posts: ProcessedPost[]) {
    const byDifficulty: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};
    let totalQualityScore = 0;

    for (const post of posts) {
      // Count by difficulty
      byDifficulty[post.difficulty] = (byDifficulty[post.difficulty] || 0) + 1;

      // Count by language
      byLanguage[post.language] = (byLanguage[post.language] || 0) + 1;

      // Sum quality scores
      totalQualityScore += post.qualityScore;
    }

    return {
      totalProcessed: posts.length,
      byDifficulty,
      byLanguage,
      averageQualityScore:
        posts.length > 0 ? totalQualityScore / posts.length : 0,
    };
  }

  /**
   * Print processing summary
   */
  private printSummary(result: ProcessingResult) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 PROCESSING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Posts: ${result.stats.totalProcessed}`);
    console.log(
      `Average Quality Score: ${result.stats.averageQualityScore.toFixed(1)}`
    );

    console.log("\nBy Difficulty:");
    Object.entries(result.stats.byDifficulty)
      .sort(([, a], [, b]) => b - a)
      .forEach(([difficulty, count]) => {
        console.log(`  ${difficulty.padEnd(15)}: ${count}`);
      });

    console.log("\nBy Language:");
    Object.entries(result.stats.byLanguage)
      .sort(([, a], [, b]) => b - a)
      .forEach(([lang, count]) => {
        console.log(`  ${lang.padEnd(15)}: ${count}`);
      });

    console.log("=".repeat(60) + "\n");
  }

  /**
   * Save results to file
   */
  async saveResults(result: ProcessingResult, filepath: string): Promise<void> {
    await writeFile(filepath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`💾 Results saved to: ${filepath}`);
  }
}

// CLI usage
if (require.main === module) {
  const processing = new Processing();

  processing
    .run("extraction-results.json")
    .then((result) => {
      return processing.saveResults(result, "processing-results.json");
    })
    .catch((error) => {
      console.error("❌ Processing failed:", error);
      process.exit(1);
    });
}
