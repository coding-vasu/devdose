import dotenv from "dotenv";
import { SyntaxValidator } from "./syntax-validator";
import { QualityScorer } from "./scorer";
import { QualityConfig, QualityResult, ScoredPost } from "./types";
import { ProcessingResult } from "../processing/types";
import { readFile, writeFile } from "fs/promises";

dotenv.config();

/**
 * Main quality scoring orchestrator
 */
export class QualityScoring {
  private validator: SyntaxValidator;
  private scorer: QualityScorer;
  private config: QualityConfig;

  constructor(config?: Partial<QualityConfig>) {
    this.validator = new SyntaxValidator();
    this.scorer = new QualityScorer();

    // Default configuration
    this.config = {
      autoApproveThreshold: parseInt(
        process.env.AUTO_APPROVE_THRESHOLD || "85"
      ),
      manualReviewThreshold: parseInt(
        process.env.MANUAL_REVIEW_THRESHOLD || "70"
      ),
      ...config,
    };
  }

  /**
   * Run quality scoring on processing results
   */
  async run(processingResultPath: string): Promise<QualityResult> {
    console.log("🚀 Starting Quality Scoring Stage...\n");

    // Load processing results
    const processingData = await readFile(processingResultPath, "utf-8");
    const processingResult: ProcessingResult = JSON.parse(processingData);

    console.log(`📚 Scoring ${processingResult.posts.length} posts...\n`);

    const scoredPosts: ScoredPost[] = [];

    for (const post of processingResult.posts) {
      // Validate syntax
      const validationResult = this.validator.validate(
        post.code,
        post.language
      );

      // Calculate quality score
      const qualityScore = this.scorer.calculateScore(post, validationResult);

      // Determine approval status
      const approved = qualityScore.total >= this.config.manualReviewThreshold;

      scoredPosts.push({
        post,
        qualityScore,
        validationResult,
        approved,
      });
    }

    // Calculate statistics
    const stats = this.calculateStats(scoredPosts);

    const result: QualityResult = {
      scoredPosts,
      stats,
      timestamp: new Date(),
    };

    this.printSummary(result);

    return result;
  }

  /**
   * Calculate quality statistics
   */
  private calculateStats(scoredPosts: ScoredPost[]) {
    let autoApproved = 0;
    let manualReview = 0;
    let autoRejected = 0;
    let totalScore = 0;

    for (const scored of scoredPosts) {
      totalScore += scored.qualityScore.total;

      if (scored.qualityScore.total >= this.config.autoApproveThreshold) {
        autoApproved++;
      } else if (
        scored.qualityScore.total >= this.config.manualReviewThreshold
      ) {
        manualReview++;
      } else {
        autoRejected++;
      }
    }

    return {
      totalScored: scoredPosts.length,
      autoApproved,
      manualReview,
      autoRejected,
      averageScore: scoredPosts.length > 0 ? totalScore / scoredPosts.length : 0,
    };
  }

  /**
   * Print quality summary
   */
  private printSummary(result: QualityResult) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 QUALITY SCORING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Scored: ${result.stats.totalScored}`);
    console.log(
      `Average Score: ${result.stats.averageScore.toFixed(1)}/100`
    );
    console.log(`\nApproval Breakdown:`);
    console.log(`  Auto-Approved (≥${this.config.autoApproveThreshold}): ${result.stats.autoApproved}`);
    console.log(
      `  Manual Review (${this.config.manualReviewThreshold}-${this.config.autoApproveThreshold - 1}): ${result.stats.manualReview}`
    );
    console.log(`  Auto-Rejected (<${this.config.manualReviewThreshold}): ${result.stats.autoRejected}`);
    console.log("=".repeat(60) + "\n");
  }

  /**
   * Save results to file
   */
  async saveResults(result: QualityResult, filepath: string): Promise<void> {
    await writeFile(filepath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`💾 Results saved to: ${filepath}`);
  }
}

// CLI usage
if (require.main === module) {
  const qualityScoring = new QualityScoring();

  qualityScoring
    .run("processing-results.json")
    .then((result) => {
      return qualityScoring.saveResults(result, "quality-results.json");
    })
    .catch((error) => {
      console.error("❌ Quality scoring failed:", error);
      process.exit(1);
    });
}
