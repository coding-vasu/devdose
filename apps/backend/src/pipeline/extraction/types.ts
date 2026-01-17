// Type definitions for Extraction stage

export interface CodeSnippet {
  code: string;
  language: string;
  metadata: {
    sourceName: string;
    sourceUrl: string;
    sourceType: "github" | "docs" | "blog";
    filePath?: string;
    lineNumbers?: { start: number; end: number };
    context?: string; // Surrounding text or heading
  };
  hash: string; // For deduplication
}

export interface ExtractionConfig {
  minCodeLines: number;
  maxCodeLines: number;
  languages: string[];
}

export interface ExtractionResult {
  snippets: CodeSnippet[];
  stats: {
    totalExtracted: number;
    byLanguage: Record<string, number>;
    bySource: Record<string, number>;
  };
  timestamp: Date;
}
