// Type definitions for Enrichment stage

export interface EnrichedPost {
  // All fields from previous stages
  [key: string]: any;

  // Enrichment additions
  enrichment: {
    extractedTags: string[]; // Additional tags beyond what Gemini provided
    readingTimeSeconds: number;
    prerequisites: string[];
    relatedPostIds: string[];
    updatedAt: Date;
  };
}

export interface EnrichmentResult {
  enrichedPosts: EnrichedPost[];
  stats: {
    totalEnriched: number;
    averageReadingTime: number;
    tagsAdded: number;
    byCategory: Record<string, number>;
  };
  timestamp: Date;
}
