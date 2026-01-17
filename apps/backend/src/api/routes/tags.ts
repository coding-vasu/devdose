import { Router } from "express";
import { tagsController } from "../controllers/tags.controller";

const router = Router();

// GET /api/tags
router.get("/tags", tagsController.getTags.bind(tagsController));

// GET /api/languages
router.get("/languages", tagsController.getLanguages.bind(tagsController));

// GET /api/difficulties
router.get("/difficulties", tagsController.getDifficulties.bind(tagsController));

export default router;
