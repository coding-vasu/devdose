import { Request, Response, NextFunction } from "express";
import { supabaseService } from "../services/supabase.service";

/**
 * Tags controller
 */
export class TagsController {
  /**
   * GET /api/tags
   */
  async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await supabaseService.getTags();
      res.json(tags);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/languages
   */
  async getLanguages(req: Request, res: Response, next: NextFunction) {
    try {
      const languages = await supabaseService.getLanguages();
      res.json(languages);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/difficulties
   */
  async getDifficulties(req: Request, res: Response, next: NextFunction) {
    try {
      const difficulties = await supabaseService.getDifficulties();
      res.json(difficulties);
    } catch (error) {
      next(error);
    }
  }
}

export const tagsController = new TagsController();
