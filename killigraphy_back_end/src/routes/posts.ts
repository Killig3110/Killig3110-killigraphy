import express from "express";
import * as postController from "../controllers/post.controller";
import { requireAuth } from "../middleware/requireAuth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.post("/", requireAuth, upload.single("image"), postController.createPost);
router.patch("/:id", requireAuth, upload.single("image"), postController.updatePost);
router.get("/user/:userId", postController.getPostsByUserId);
router.delete("/:id", requireAuth, postController.handleDeletePost);
router.get("/meta/trend", postController.handleGetMetaTrend);
router.get("/search", postController.handleSearchPosts);
router.get("/:id", postController.handleGetPostById);
router.get("/list", postController.handleGetPostsByList);
router.patch("/:id/like", requireAuth, postController.handleToggleLikePost);
router.get("/feed/personalized", requireAuth, postController.handGetPersonalizedFeed);
router.get("/", requireAuth, postController.handleGetPaginatedPosts);

export default router;
