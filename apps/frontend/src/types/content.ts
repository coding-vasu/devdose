export type CardType =
  | 'quick-tip'
  | 'common-mistake'
  | 'did-you-know'
  | 'quick-win'
  | 'under-the-hood';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ContentCard {
  id: string;
  type: CardType;
  title: string;
  codeSnippet?: string;
  language?: string;
  explanation: string;
  tags: string[];
  difficulty: Difficulty;
  sourceName: string;
  sourceUrl: string;
  viewCount: number;
  saveCount: number;
}

export interface UserStats {
  cardsViewed: number;
  cardsSaved: number;
  deepDives: number;
  streakDays: number;
  topTags: string[];
}

// API Response Types
export interface Post {
  id: string;
  title: string;
  code: string;
  language: string;
  explanation: string;
  tags: string[];
  difficulty: Difficulty;
  quality_score: number;
  reading_time_seconds: number;
  view_count: number;
  bookmark_count: number;
  created_at: string;
  source_url?: string;
  source_name?: string;
  category?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationMeta;
}
