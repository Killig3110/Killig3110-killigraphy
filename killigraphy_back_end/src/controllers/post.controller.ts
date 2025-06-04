import e, { Request, Response } from "express";
import { AuthenticatedRequest } from '../types/index';
import { PostService } from "../services/post.service";
import { PostFactory } from "../factories/PostFactory/PostFactory";
import { FeedService } from "../services/feed.service";
import { PersonalizedFeedStrategy } from "../strategies/FeedStrategy/PersonalizedFeedStrategy";
import { RedisAdapter } from "../utils/adapters/RedisAdapter/RedisAdapter";
import { ImageKitAdapter } from "../utils/adapters/ImageKitAdapter/ImageKitAdapter";
import { PostUpdateStrategy } from "../strategies/UpdateStrategy/PostUpdateStrategy";
import { imageKitAdapterSingleton } from "../utils/singleton/ImageKitAdapterSingleton";

const postUpdateStrategy = new PostUpdateStrategy(imageKitAdapterSingleton);

const postService = new PostService(
    new PostFactory(),
    new FeedService(new PersonalizedFeedStrategy()),
    new ImageKitAdapter(),
    new RedisAdapter(),
    postUpdateStrategy
);

export const createPost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { caption, location, tags } = req.body;
        const file = req.file;
        const userId = req.userId!;

        if (!file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const result = await postService.createPost({ caption, location, tags, file, userId });
        res.status(201).json(result);
    } catch (err) {
        console.error("Create post error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updatePost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { caption, location, tags } = req.body;

        const image = req.file;

        const updated = await postService.updatePost({
            id: req.params.id,
            caption,
            location,
            tags,
            image: image && image.buffer ? image : undefined,
            userId: req.userId!,
        });

        res.json(updated);
    } catch (err: any) {
        console.error("Update post error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getPostsByUserId = async (req: Request, res: Response) => {
    try {
        const posts = await postService.getPostsByUserId(req.params.userId);
        if (!posts.length) return res.status(404).json({ message: "No posts found" });
        res.json(posts);
    } catch (err) {
        console.error("Get user posts error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const handleDeletePost = async (req: Request, res: Response) => {
    try {
        await postService.deletePostWithImage(req.params.id);
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(404).json({ message: err instanceof Error ? err.message : "Post not found" });
    }
};

export const handleGetMetaTrend = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const data = await postService.getMetaTrend(page, limit);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch meta", error: err });
    }
};

export const handleSearchPosts = async (req: Request, res: Response) => {
    try {
        const results = await postService.searchPostsService(req.query);
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Search failed", error: err });
    }
};

export const handleGetPostById = async (req: Request, res: Response) => {
    try {
        const post = await postService.getPostById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.json(post);
    } catch (err) {
        console.error("Get post by ID error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const handleGetPostsByList = async (req: Request, res: Response) => {
    try {
        let { postIds } = req.query;

        if (!postIds) {
            return res.status(400).json({ message: "Missing post IDs" });
        }

        // Nếu postIds là string thì split nó ra array
        if (typeof postIds === "string") {
            postIds = postIds.split(",");
        }

        if (!Array.isArray(postIds) || postIds.length === 0) {
            return res.status(400).json({ message: "Invalid post IDs" });
        }

        const posts = await postService.getPostsByList(postIds as string[]);
        res.json(posts);
    } catch (err) {
        console.error("Get posts by list error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const handleToggleLikePost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const postId = req.params.id;
        const userId = req.userId!;

        if (!postId || !userId) {
            return res.status(400).json({ message: "Post ID and User ID are required" });
        }

        const updatedPost = await postService.toggleLikePost({ postId, userId });
        res.json(updatedPost);
    } catch (err) {
        console.error("Toggle like post error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const handGetPersonalizedFeed = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;

        const result = await postService.getPersonalizedFeed(userId, page, limit);
        res.status(200).json(result);
    } catch (err) {
        console.error("Get personalized feed error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const handleGetPaginatedPosts = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 12, 1);

        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: "Invalid page or limit" });
        }

        const posts = await postService.getPaginatedPosts(page, limit);
        res.status(200).json(posts);
    } catch (err) {
        console.error("Get paginated posts error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
