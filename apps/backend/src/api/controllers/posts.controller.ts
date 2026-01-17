import { Request, Response, NextFunction } from "express";
import { supabaseService } from "../services/supabase.service";

/**
 * Posts controller
 */
export class PostsController {
  /**
   * GET /api/posts
   */
  async listPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const language = req.query.language as string | undefined;
      const difficulty = req.query.difficulty as string | undefined;
      const tags = req.query.tags
        ? Array.isArray(req.query.tags)
          ? req.query.tags as string[]
          : (req.query.tags as string).split(",").map((t) => t.trim())
        : undefined;
      const sort = (req.query.sort as string) || "created_at";
      const order = (req.query.order as string) || "desc";

      const { data, total } = await supabaseService.getPosts({
        page,
        limit,
        language,
        difficulty,
        tags,
        sort,
        order,
      });

      res.json({
        data,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/posts/:id
   */
  async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const post = await supabaseService.getPostById(id);

      if (!post) {
        return res.status(404).json({
          error: "Not Found",
          message: "Post not found",
        });
      }

      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/posts/random
   */
  async getRandomPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const count = Math.min(parseInt(req.query.count as string) || 1, 10);
      const language = req.query.language as string | undefined;
      const difficulty = req.query.difficulty as string | undefined;

      const posts = await supabaseService.getRandomPosts({
        count,
        language,
        difficulty,
      });

      res.json(posts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/posts/search
   */
  async searchPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      if (!query || query.length < 2) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Search query must be at least 2 characters",
        });
      }

      const { data, total } = await supabaseService.searchPosts({
        query,
        page,
        limit,
      });

      res.json({
        data,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/posts/:id/report
   */
  async reportPost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { aiVerificationService } = await import("../services/ai-verification.service");
      
      const result = await aiVerificationService.verifyAndCorrectPost(id);

      if (result.error) {
        return res.status(500).json({
          error: "Internal Server Error",
          message: result.error,
        });
      }

      res.json({
        message: result.corrected 
          ? "Post reported and corrected by AI" 
          : "Post reported and verified by AI (no changes needed)",
        corrected: result.corrected,
        post: result.newPost || result.oldPost,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const postsController = new PostsController();
