import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Supabase service for database operations
 */
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment"
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get posts with pagination and filtering
   */
  async getPosts(params: {
    page: number;
    limit: number;
    language?: string;
    difficulty?: string;
    tags?: string[];
    sort?: string;
    order?: string;
  }) {
    const { page, limit, language, difficulty, tags, sort = "created_at", order = "desc" } = params;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from("posts")
      .select("id, title, code, language, explanation, tags, difficulty, quality_score, reading_time_seconds, created_at, source_name, source_url, category", { count: "exact" });

    // Apply filters
    if (language) {
      query = query.eq("language", language);
    }
    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }
    if (tags && tags.length > 0) {
      query = query.contains("tags", tags);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === "asc" });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
    };
  }

  /**
   * Get single post by ID
   */
  async getPostById(id: string) {
    const { data, error } = await this.supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw error;
    }

    // Increment view count
    await this.supabase
      .from("posts")
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq("id", id);

    return data;
  }

  /**
   * Update a post by ID
   */
  async updatePost(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get random posts
   */
  async getRandomPosts(params: {
    count: number;
    language?: string;
    difficulty?: string;
  }) {
    const { count, language, difficulty } = params;

    let query = this.supabase
      .from("posts")
      .select("*");

    // Apply filters
    if (language) {
      query = query.eq("language", language);
    }
    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    // Fetch more posts than needed for better randomness (10x or min 100)
    const fetchCount = Math.max(count * 10, 100);
    const { data, error } = await query.limit(fetchCount);

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    // Shuffle and return requested count
    const shuffled = data.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Search posts by keyword
   */
  async searchPosts(params: {
    query: string;
    page: number;
    limit: number;
  }) {
    const { query: searchQuery, page, limit } = params;
    const offset = (page - 1) * limit;

    // Search in title, explanation, and tags
    const { data, error, count } = await this.supabase
      .from("posts")
      .select("id, title, code, language, explanation, tags, difficulty, quality_score, reading_time_seconds, created_at, source_name, source_url, category", { count: "exact" })
      .or(`title.ilike.%${searchQuery}%,explanation.ilike.%${searchQuery}%`)
      .order("quality_score", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
    };
  }

  /**
   * Get all unique tags with counts
   */
  async getTags() {
    const { data, error } = await this.supabase
      .from("posts")
      .select("tags");

    if (error) throw error;

    // Flatten and count tags
    const tagCounts = new Map<string, number>();
    data?.forEach((post) => {
      post.tags?.forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get all languages with counts
   */
  async getLanguages() {
    const { data, error } = await this.supabase
      .from("posts")
      .select("language");

    if (error) throw error;

    // Count languages
    const langCounts = new Map<string, number>();
    data?.forEach((post) => {
      if (post.language) {
        langCounts.set(post.language, (langCounts.get(post.language) || 0) + 1);
      }
    });

    return Array.from(langCounts.entries())
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get difficulty levels with counts
   */
  async getDifficulties() {
    const { data, error } = await this.supabase
      .from("posts")
      .select("difficulty");

    if (error) throw error;

    // Count difficulties
    const diffCounts = new Map<string, number>();
    data?.forEach((post) => {
      if (post.difficulty) {
        diffCounts.set(post.difficulty, (diffCounts.get(post.difficulty) || 0) + 1);
      }
    });

    return Array.from(diffCounts.entries())
      .map(([difficulty, count]) => ({ difficulty, count }))
      .sort((a, b) => {
        const order = { beginner: 1, intermediate: 2, advanced: 3 };
        return order[a.difficulty as keyof typeof order] - order[b.difficulty as keyof typeof order];
      });
  }

  /**
   * Get platform statistics
   */
  async getStatistics() {
    // Get total posts
    const { count: totalPosts } = await this.supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    // Get total views and bookmarks
    const { data: aggregates } = await this.supabase
      .from("posts")
      .select("view_count, bookmark_count");

    const totalViews = aggregates?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;
    const totalBookmarks = aggregates?.reduce((sum, post) => sum + (post.bookmark_count || 0), 0) || 0;

    // Get language counts
    const languages = await this.getLanguages();
    const languagesMap = Object.fromEntries(
      languages.map((l) => [l.language, l.count])
    );

    // Get difficulty counts
    const difficulties = await this.getDifficulties();
    const difficultiesMap = Object.fromEntries(
      difficulties.map((d) => [d.difficulty, d.count])
    );

    // Get top tags
    const tags = await this.getTags();
    const topTags = tags.slice(0, 10);

    return {
      total_posts: totalPosts || 0,
      total_views: totalViews,
      total_bookmarks: totalBookmarks,
      languages: languagesMap,
      difficulties: difficultiesMap,
      top_tags: topTags,
    };
  }
}

export const supabaseService = new SupabaseService();
