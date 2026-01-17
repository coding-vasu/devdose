// Type definitions for Processing stage

export type ContentCategory =
  | "Quick Tips"
  | "Common Mistakes"
  | "Did You Know"
  | "Quick Wins"
  | "Under the Hood";

export interface ProcessingInput {
  code: string;
  language: string;
  sourceContext: string; // README section, file path
  repositoryName: string;
}

export interface ProcessingOutput {
  title: string; // Engaging title (max 60 chars)
  explanation: string; // 2-3 sentence explanation
  difficulty: "beginner" | "intermediate" | "advanced";
  category: ContentCategory; // Content category
  tags: string[]; // Auto-extracted tags
  qualityScore: number; // 1-100
}

export interface ProcessedPost extends ProcessingOutput {
  code: string;
  language: string;
  sourceUrl: string;
  sourceName: string;
  sourceType: string;
}

export interface ProcessingConfig {
  batchSize: number;
  maxRetries: number;
  model: string;
}

export interface ProcessingResult {
  posts: ProcessedPost[];
  stats: {
    totalProcessed: number;
    byDifficulty: Record<string, number>;
    byLanguage: Record<string, number>;
    averageQualityScore: number;
  };
  timestamp: Date;
}
