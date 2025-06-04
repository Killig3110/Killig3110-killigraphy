import express from "express";
import * as postController from "../controllers/post.controller";
import { requireAuth } from "../middleware/requireAuth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.post("/", requireAuth, upload.single("image"), postController.createPost);
router.get("/", requireAuth, postController.handleGetPaginatedPosts);
router.get("/user/:userId", postController.getPostsByUserId);
router.get("/meta/trend", postController.handleGetMetaTrend);
router.get("/search", postController.handleSearchPosts);
router.get("/list", postController.handleGetPostsByList);
router.get("/feed/personalized", requireAuth, postController.handGetPersonalizedFeed);
router.patch("/:id", requireAuth, upload.single("image"), postController.updatePost);
router.delete("/:id", requireAuth, postController.handleDeletePost);
router.get("/:id", postController.handleGetPostById);
router.patch("/:id/like", requireAuth, postController.handleToggleLikePost);

export default router;
