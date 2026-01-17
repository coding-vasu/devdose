import { useQuery, useInfiniteQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { adaptPostsToContentCards, adaptPostToContentCard } from '@/lib/adapters';
import { ContentCard, Post } from '@/types/content';

/**
 * Query keys for React Query
 */
export const queryKeys = {
  posts: (filters?: any) => ['posts', filters] as const,
  post: (id: string) => ['post', id] as const,
  randomPosts: (params?: any) => ['posts', 'random', params] as const,
  searchPosts: (query: string, page?: number) => ['posts', 'search', query, page] as const,
  tags: () => ['tags'] as const,
  languages: () => ['languages'] as const,
  difficulties: () => ['difficulties'] as const,
  stats: () => ['stats'] as const,
};

/**
 * Hook to fetch posts with filters and pagination
 */
export function useContent(filters: {
  page?: number;
  limit?: number;
  language?: string;
  difficulty?: string;
  tags?: string[];
  sort?: string;
  order?: 'asc' | 'desc';
} = {}) {
  return useQuery({
    queryKey: queryKeys.posts(filters),
    queryFn: async () => {
      const response = await apiClient.getPosts(filters);
      return {
        cards: adaptPostsToContentCards(response.data),
        pagination: response.pagination,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for infinite scroll posts
 */
export function useInfiniteContent(filters: {
  limit?: number;
  language?: string;
  difficulty?: string;
  tags?: string[];
  sort?: string;
  order?: 'asc' | 'desc';
} = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts({ ...filters, infinite: true }),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.getPosts({ ...filters, page: pageParam });
      return {
        cards: adaptPostsToContentCards(response.data),
        pagination: response.pagination,
      };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single post by ID
 */
export function usePost(id: string, options?: Omit<UseQueryOptions<ContentCard>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.post(id),
    queryFn: async () => {
      const post = await apiClient.getPost(id);
      return adaptPostToContentCard(post);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to fetch random posts
 */
export function useRandomPosts(params: {
  count?: number;
  language?: string;
  difficulty?: string;
} = { count: 10 }) {
  return useQuery({
    queryKey: queryKeys.randomPosts(params),
    queryFn: async () => {
      const posts = await apiClient.getRandomPosts(params);
      return adaptPostsToContentCards(posts);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for random content)
  });
}

/**
 * Hook to search posts
 */
export function useSearchPosts(query: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: queryKeys.searchPosts(query, page),
    queryFn: async () => {
      const response = await apiClient.searchPosts({ query, page, limit });
      return {
        cards: adaptPostsToContentCards(response.data),
        pagination: response.pagination,
      };
    },
    enabled: query.length > 0, // Only run if query is not empty
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch all tags
 */
export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags(),
    queryFn: () => apiClient.getTags(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch all languages
 */
export function useLanguages() {
  return useQuery({
    queryKey: queryKeys.languages(),
    queryFn: () => apiClient.getLanguages(),
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch difficulty levels
 */
export function useDifficulties() {
  return useQuery({
    queryKey: queryKeys.difficulties(),
    queryFn: () => apiClient.getDifficulties(),
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch platform statistics
 */
export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats(),
    queryFn: () => apiClient.getStats(),
    staleTime: 10 * 60 * 1000,
  });
}
