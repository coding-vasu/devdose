// Type definitions for Quality Scoring stage

export interface QualityScore {
  total: number; // 1-100
  breakdown: {
    codeQuality: number; // 40 points max
    explanationQuality: number; // 30 points max
    sourceReputation: number; // 20 points max
    uniqueness: number; // 10 points max
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface QualityConfig {
  autoApproveThreshold: number; // >= this score: auto-approve
  manualReviewThreshold: number; // >= this score: manual review
  // < manualReviewThreshold: auto-reject
}

export interface ScoredPost {
  post: any; // ProcessedPost from previous stage
  qualityScore: QualityScore;
  validationResult: ValidationResult;
  approved: boolean;
}

export interface QualityResult {
  scoredPosts: ScoredPost[];
  stats: {
    totalScored: number;
    autoApproved: number;
    manualReview: number;
    autoRejected: number;
    averageScore: number;
  };
  timestamp: Date;
}
