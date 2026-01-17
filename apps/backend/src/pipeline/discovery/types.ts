// Type definitions for Discovery stage

export interface Source {
  type: "github" | "docs" | "blog" | "awesome";
  name: string;
  url: string;
  tags: string[];
  priority: number; // 1-10, higher = more important
  lastChecked?: Date;
}

export interface GitHubRepo extends Source {
  type: "github";
  owner: string;
  repo: string;
  stars?: number;
  forks?: number;
  language?: string;
  lastPushed?: Date;
  hasExamples?: boolean;
  hasGoodDocs?: boolean;
}

export interface DiscoveryConfig {
  topics: string[];
  minStars: number;
  maxResultsPerTopic: number;
  activityMonths: number;
  includeAwesomeLists: boolean;
}

export interface DiscoveryResult {
  sources: Source[];
  stats: {
    totalFound: number;
    byType: Record<string, number>;
    byTopic: Record<string, number>;
  };
  timestamp: Date;
}
