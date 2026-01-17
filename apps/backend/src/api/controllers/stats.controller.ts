import { Request, Response, NextFunction } from "express";
import { supabaseService } from "../services/supabase.service";

/**
 * Statistics controller
 */
export class StatsController {
  /**
   * GET /api/stats
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await supabaseService.getStatistics();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/health
   */
  async healthCheck(req: Request, res: Response) {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}

export const statsController = new StatsController();
