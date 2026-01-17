import { Router } from "express";
import { postsController } from "../controllers/posts.controller";

const router = Router();

// GET /api/posts/random - Must come before /:id to avoid conflict
router.get("/random", postsController.getRandomPosts.bind(postsController));

// GET /api/posts/search
router.get("/search", postsController.searchPosts.bind(postsController));

// GET /api/posts
router.get("/", postsController.listPosts.bind(postsController));

// GET /api/posts/:id
router.get("/:id", postsController.getPost.bind(postsController));

// POST /api/posts/:id/report
router.post("/:id/report", postsController.reportPost.bind(postsController));

export default router;
