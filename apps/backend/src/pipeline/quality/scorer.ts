import { QualityScore } from "./types";

export class QualityScorer {
  /**
   * Calculate overall quality score for a post
   */
  calculateScore(post: any, validationResult: any): QualityScore {
    const breakdown = {
      codeQuality: this.scoreCodeQuality(post, validationResult),
      explanationQuality: this.scoreExplanationQuality(post),
      sourceReputation: this.scoreSourceReputation(post),
      uniqueness: 10, // Assume unique (deduplication already done)
    };

    const total =
      breakdown.codeQuality +
      breakdown.explanationQuality +
      breakdown.sourceReputation +
      breakdown.uniqueness;

    return {
      total,
      breakdown,
    };
  }

  /**
   * Score code quality (40 points max)
   */
  private scoreCodeQuality(post: any, validationResult: any): number {
    let score = 40;

    // Deduct for syntax errors
    if (!validationResult.isValid) {
      score -= 20;
    }

    // Deduct for warnings
    score -= Math.min(validationResult.warnings.length * 5, 10);

    // Bonus for optimal code length (10-30 lines)
    const lineCount = post.code.split("\n").length;
    if (lineCount >= 10 && lineCount <= 30) {
      // Optimal length, no change
    } else if (lineCount < 10) {
      score -= 5; // Too short
    } else if (lineCount > 50) {
      score -= 10; // Too long
    }

    return Math.max(0, score);
  }

  /**
   * Score explanation quality (30 points max)
   */
  private scoreExplanationQuality(post: any): number {
    let score = 30;

    const explanation = post.explanation || "";
    const wordCount = explanation.split(/\s+/).length;

    // Check explanation length (ideal: 20-60 words)
    if (wordCount < 10) {
      score -= 15; // Too short
    } else if (wordCount > 100) {
      score -= 10; // Too long
    }

    // Check title quality
    const title = post.title || "";
    if (title.length === 0) {
      score -= 10;
    } else if (title.length > 60) {
      score -= 5;
    }

    // Bonus for engaging title patterns
    if (
      title.match(/vs|Hidden|Pro Tip|Secret|Trick|Pattern|Best Practice/i)
    ) {
      score += 5;
    }

    return Math.max(0, Math.min(30, score));
  }

  /**
   * Score source reputation (20 points max)
   */
  private scoreSourceReputation(post: any): number {
    let score = 10; // Base score

    const sourceName = post.sourceName || "";

    // Official sources get max score
    const officialSources = [
      "facebook/react",
      "microsoft/TypeScript",
      "vuejs/core",
      "angular/angular",
      "MDN",
      "react.dev",
      "typescript",
    ];

    for (const official of officialSources) {
      if (sourceName.toLowerCase().includes(official.toLowerCase())) {
        return 20;
      }
    }

    // High-quality sources
    const highQualitySources = ["vercel", "next.js", "web.dev", "css-tricks"];
    for (const quality of highQualitySources) {
      if (sourceName.toLowerCase().includes(quality.toLowerCase())) {
        score += 5;
      }
    }

    return Math.min(20, score);
  }
}
