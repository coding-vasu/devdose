import { Post, ApiResponse, PaginationMeta } from '@/types/content';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * API Client for DevDose backend
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * Get posts with pagination and filtering
   */
  async getPosts(params: {
    page?: number;
    limit?: number;
    language?: string;
    difficulty?: string;
    tags?: string[];
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<Post[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.language) queryParams.append('language', params.language);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params.tags && params.tags.length > 0) {
      queryParams.append('tags', params.tags.join(','));
    }
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    const endpoint = `/posts${queryString ? `?${queryString}` : ''}`;
    
    return this.fetch<ApiResponse<Post[]>>(endpoint);
  }

  /**
   * Get single post by ID
   */
  async getPost(id: string): Promise<Post> {
    return this.fetch<Post>(`/posts/${id}`);
  }

  /**
   * Get random posts
   */
  async getRandomPosts(params: {
    count?: number;
    language?: string;
    difficulty?: string;
  } = {}): Promise<Post[]> {
    const queryParams = new URLSearchParams();
    
    if (params.count) queryParams.append('count', params.count.toString());
    if (params.language) queryParams.append('language', params.language);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);

    const queryString = queryParams.toString();
    const endpoint = `/posts/random${queryString ? `?${queryString}` : ''}`;
    
    return this.fetch<Post[]>(endpoint);
  }

  /**
   * Search posts by keyword
   */
  async searchPosts(params: {
    query: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Post[]>> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('q', params.query);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    return this.fetch<ApiResponse<Post[]>>(`/posts/search?${queryString}`);
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<{ tag: string; count: number }[]> {
    return this.fetch<{ tag: string; count: number }[]>('/tags');
  }

  /**
   * Get all languages
   */
  async getLanguages(): Promise<{ language: string; count: number }[]> {
    return this.fetch<{ language: string; count: number }[]>('/languages');
  }

  /**
   * Get difficulty levels
   */
  async getDifficulties(): Promise<{ difficulty: string; count: number }[]> {
    return this.fetch<{ difficulty: string; count: number }[]>('/difficulties');
  }

  /**
   * Get platform statistics
   */
  async getStats(): Promise<{
    total_posts: number;
    total_views: number;
    total_bookmarks: number;
    languages: Record<string, number>;
    difficulties: Record<string, number>;
    top_tags: { tag: string; count: number }[];
  }> {
    return this.fetch('/stats');
  }

  /**
   * Report a post as incorrect for AI verification
   */
  async reportPost(id: string): Promise<{ message: string; corrected: boolean; post: Post }> {
    return this.fetch<{ message: string; corrected: boolean; post: Post }>(`/posts/${id}/report`, {
      method: 'POST'
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetch('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
