// src/services/PostService.ts
import * as postRepo from "../repositories/post.repository";
import mongoose from "mongoose";
import * as userRepo from "../repositories/user.repository";
import { CreatePostInput, UpdatePostInput, LikePostInput } from "../types/index";
import { IPostFactory } from "../factories/PostFactory/IPostFactory";
import { FeedService } from "./feed.service";
import { IImageKitAdapter } from "../utils/adapters/ImageKitAdapter/IImageKitAdapter";
import { IRedisAdapter } from "../utils/adapters/RedisAdapter/IRedisAdapter";
import { IUpdateStrategy } from "../strategies/UpdateStrategy/IUpdateStrategy";

export class PostService {
    constructor(
        private postFactory: IPostFactory,
        private feedService: FeedService,
        private imageKitAdapter: IImageKitAdapter,
        private redisClient: IRedisAdapter,
        private postUpdateStrategy: IUpdateStrategy<UpdatePostInput, any>
    ) { }

    async createPost({ caption, location, tags, file, userId }: CreatePostInput) {
        if (!file) throw new Error("Image required");

        const result = await this.imageKitAdapter.upload(file);

        const postData = await this.postFactory.create({
            creator: userId,
            caption,
            location: location ?? "",
            tags: tags?.split(",").map(tag => tag.trim()) ?? [],
            imageId: result.fileId,
            imageURL: result.url,
        });

        return await postRepo.createPost(postData);
    }

    async updatePost(data: UpdatePostInput) {
        return await this.postUpdateStrategy.update(data);
    }

    async getPostsByUserId(userId: string) {
        return await postRepo.findPostsByUserId(userId);
    }

    async deletePostWithImage(postId: string) {
        const post = await postRepo.findPostById(postId);
        if (!post) throw new Error("Post not found");

        if (post.imageId) {
            try {
                await this.imageKitAdapter.delete(post.imageId);
            } catch (err) {
                console.error("Failed to delete image:", err);
            }
        }

        await postRepo.deletePostById(postId);
    }

    async getMetaTrend(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const cached = await this.redisClient.get("post:meta");
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

            await this.redisClient.setEx("post:meta", 300, JSON.stringify({ tags, locations }));
        }

        return {
            tags: tags.slice(skip, skip + limit),
            locations: locations.slice(skip, skip + limit),
            hasMore: skip + limit < tags.length || skip + limit < locations.length,
        };
    }

    async searchPostsService(query: any) {
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
    }

    async getPostById(postId: string) {
        const post = await postRepo.findPostById(postId);
        if (!post) throw new Error("Post not found");

        await post.populate("creator", "name username imageUrl");
        return post;
    }

    async getPostsByList(postIds: string[]) {
        if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
            throw new Error("Invalid post IDs");
        }

        const posts = await postRepo.findPostsByIds(postIds);
        if (!posts || posts.length === 0) {
            throw new Error("No posts found for the provided IDs");
        }

        return posts;
    }

    async toggleLikePost({ postId, userId }: LikePostInput) {
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
    }

    async getPersonalizedFeed(userId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;
        const redisKey = `feed:${userId}`;

        let posts: any[] = [];
        const cached = await this.redisClient.get(redisKey);

        if (cached) {
            posts = JSON.parse(cached);
        } else {
            posts = await this.feedService.getFeed(userId);
            await this.redisClient.setEx(redisKey, 300, JSON.stringify(posts)); // cache 5 phút
        }

        return posts.slice(skip, skip + limit);
    }

    async getPaginatedPosts(page: number, limit: number) {
        if (page < 1 || limit < 1) {
            throw new Error("Page and limit must be greater than 0");
        }
        const skip = (page - 1) * limit;
        const posts = await postRepo.findAllPosts(skip, limit);

        return {
            posts,
            hasMore: posts.length === limit,
        };
    }
}
