import fs from "fs";
import { Request } from "express";
import { uploadToImageKit } from "../utils/uploadToImageKit";
import * as postRepo from "../repositories/post.repository";
import imagekit from "../config/imagekit";
import redis from "../config/redis";
import mongoose from "mongoose";
import * as userRepo from "../repositories/user.repository";
import * as feedService from "./feed.service";

interface CreatePostInput {
    caption: string;
    location?: string;
    tags?: string;
    file: Express.Multer.File;
    userId: string;
}

interface UpdatePostInput {
    id: string;
    caption?: string;
    location?: string;
    tags?: string;
    image?: Express.Multer.File;
    userId: string;
}

interface LikePostInput {
    postId: string;
    userId: string;
}

export const createPost = async ({ caption, location, tags, file, userId }: CreatePostInput) => {
    if (!file) throw new Error("Image required");

    const result = await uploadToImageKit(file);
    fs.unlinkSync(file.path);

    const parsedTags = tags?.split(',').map(tag => tag.trim());

    const post = await postRepo.createPost({
        creator: userId,
        caption,
        location: location ?? "",
        tags: parsedTags ?? [],
        imageId: result.fileId,
        imageURL: result.url,
    });

    return post;
};

export const updatePost = async ({ id, caption, location, tags, image, userId }: UpdatePostInput) => {
    const post = await postRepo.findPostById(id);
    if (!post) throw new Error("Post not found");

    if (image) {
        if (post.imageId) {
            try {
                await imagekit.deleteFile(post.imageId);
            } catch (err) {
                console.error("Failed to delete old image:", err);
            }
        }

        const result = await uploadToImageKit(image);
        fs.unlinkSync(image.path);

        post.imageId = result.fileId;
        post.imageURL = result.url;
    }

    post.caption = caption ?? post.caption;
    post.location = location ?? post.location;
    post.tags = tags ? tags.split(",").map((tag) => tag.trim()) : post.tags;

    return await postRepo.savePost(post);
};

export const getPostsByUserId = async (userId: string) => {
    return await postRepo.findPostsByUserId(userId);
};

export const deletePostWithImage = async (postId: string) => {
    const post = await postRepo.findPostById(postId);
    if (!post) throw new Error("Post not found");

    if (post.imageId) {
        try {
            await imagekit.deleteFile(post.imageId);
        } catch (err) {
            console.error("Failed to delete image:", err);
        }
    }

    await postRepo.deletePostById(postId);
};

export const getMetaTrend = async (page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const cached = await redis.get("post:meta");
    let tags: string[] = [];
    let locations: string[] = [];

    if (cached) {
        const parsed = JSON.parse(cached);
        tags = parsed.tags;
        locations = parsed.locations;
    } else {
        const result = await postRepo.findAllTagsAndLocations();
        tags = result.tags;
        locations = result.locations;

        await redis.setex("post:meta", 300, JSON.stringify({ tags, locations }));
    }

    return {
        tags: tags.slice(skip, skip + limit),
        locations: locations.slice(skip, skip + limit),
        hasMore: skip + limit < tags.length || skip + limit < locations.length,
    };
};

export const searchPostsService = async (query: any) => {
    const { query: q, tags, location, sort } = query;

    const searchFilter: any = {};
    if (q) searchFilter.caption = { $regex: q, $options: "i" };
    if (tags) {
        const tagsArray = tags.split(",").map((tag: string) => tag.trim());
        searchFilter.tags = { $in: tagsArray };
    }
    if (location) {
        searchFilter.location = { $regex: location, $options: "i" };
    }

    let sortOption: { [key: string]: number } = { createdAt: -1 };
    if (sort === "popular") {
        sortOption = { likes: -1 };
    }

    return await postRepo.searchPosts(searchFilter, sortOption);
};

export const getPostById = async (postId: string) => {
    const post = await postRepo.findPostById(postId);
    if (!post) throw new Error("Post not found");

    // Populate creator details
    await post.populate("creator", "name username imageUrl");
    return post;
}

export const getPostsByList = async (postIds: string[]) => {
    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
        throw new Error("Invalid post IDs");
    }

    const posts = await postRepo.findPostsByIds(postIds);
    if (!posts || posts.length === 0) {
        throw new Error("No posts found for the provided IDs");
    }

    return posts;
}

export const toggleLikePost = async ({ postId, userId }: LikePostInput) => {
    const post = await postRepo.findPostById(postId);
    if (!post) throw new Error("Post not found");

    const user = await userRepo.findUserById(userId);
    if (!user) throw new Error("User not found");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const alreadyLiked = post.likes.some((id) => id.equals(userObjectId));

    if (alreadyLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== userId);
        user.likedPosts = user.likedPosts.filter((id) => id.toString() !== postId);
    } else {
        post.likes.push(userObjectId);
        user.likedPosts.push(post._id);
    }

    await postRepo.savePost(post);
    await userRepo.saveUser(user);

    return post;
};

export const getPersonalizedFeed = async (
    userId: string,
    page: number,
    limit: number
) => {
    const skip = (page - 1) * limit;
    const redisKey = `feed:${userId}`;

    let posts: any[] = [];
    const cached = await redis.get(redisKey);

    if (cached) {
        posts = JSON.parse(cached);
    } else {
        posts = await feedService.generatePersonalizedFeed(userId);
        await redis.set(redisKey, JSON.stringify(posts), "EX", 300); // cache 5 phút
    }

    return posts.slice(skip, skip + limit);
};

export const getPaginatedPosts = async (page: number, limit: number) => {
    if (page < 1 || limit < 1) {
        throw new Error("Page and limit must be greater than 0");
    }
    const skip = (page - 1) * limit;
    const posts = await postRepo.findAllPosts(skip, limit);

    return {
        posts,
        hasMore: posts.length === limit,
    };
};