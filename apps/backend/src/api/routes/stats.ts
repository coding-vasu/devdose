import { Router } from "express";
import { statsController } from "../controllers/stats.controller";

const router = Router();

// GET /api/stats
router.get("/stats", statsController.getStatistics.bind(statsController));

// GET /api/health
router.get("/health", statsController.healthCheck.bind(statsController));

export default router;
