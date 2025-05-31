import express from "express";
import { requireAuth } from "../middleware/requireAuth";
import * as CommentController from "../controllers/comment.controller";

const router = express.Router();

router.post("/", requireAuth, CommentController.createComment);
router.get("/:postId", CommentController.getComments);
router.delete("/:id", requireAuth, CommentController.deleteComment);

export default router;
