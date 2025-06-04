import Posts from "../models/Posts";
import { CreatePostResponse, PostDocument } from "../types";

export const createPost = async (postData: Partial<PostDocument>) => {
    return await Posts.create(postData);
}

export const findPostById = async (postId: string) => {
    return await Posts.findById(postId).populate("creator");
};

export const savePost = async (post: any) => {
    return await post.save();
};

export const findPostsByUserId = async (userId: string) => {
    return await Posts.find({ creator: userId })
        .populate("creator")
        .sort({ createdAt: -1 });
};

export const deletePostById = (id: string) => Posts.findByIdAndDelete(id);

export const findAllTagsAndLocations = async () => {
    const posts = await Posts.find({}, "tags location -_id");

    const tagSet = new Set<string>();
    const locationSet = new Set<string>();

    posts.forEach((post) => {
        if (post.tags) {
            post.tags.forEach((tag) => tagSet.add(tag));
        }
        if (post.location) locationSet.add(post.location);
    });

    return {
        tags: Array.from(tagSet),
        locations: Array.from(locationSet),
    };
};

export const searchPosts = (filter: any, sort: any) =>
    Posts.find(filter).sort(sort).populate("creator");

export const findPostsByIds = async (postIds: string[]) => {
    return await Posts.find({ _id: { $in: postIds } })
        .populate("creator")
        .sort({ createdAt: -1 });
}

export const findAllPosts = async (skip: number, limit: number) => {
    return await Posts.find({})
        .populate("creator")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
}