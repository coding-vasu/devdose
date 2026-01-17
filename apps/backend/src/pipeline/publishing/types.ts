// Type definitions for Publishing stage

export interface DatabasePost {
  title: string;
  code: string;
  language: string;
  explanation: string;
  tags: string[];
  difficulty: string;
  category: string;
  source_url: string;
  source_name: string;
  source_type: string;
  quality_score: number;
  reading_time_seconds: number;
  prerequisites: string[];
  code_hash: string; // MD5 hash for deduplication
  created_at?: Date;
  updated_at?: Date;
}

export interface PublishingConfig {
  batchInsertSize: number;
}

export interface PublishingResult {
  published: number;
  failed: number;
  duplicates: number;
  timestamp: Date;
}
