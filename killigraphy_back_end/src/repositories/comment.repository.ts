import Comment from "../models/Comment";

export const createComment = async (data: any) => {
    return await Comment.create(data);
};

export const getCommentsByPostId = async (postId: string) => {
    return await Comment.find({ post: postId })
        .populate("user", "name imageUrl")
        .sort({ createdAt: 1 });
};

export const findCommentById = async (id: string) => {
    return await Comment.findById(id).populate("post", "creator");
};

export const deleteCommentById = async (id: string) => {
    return await Comment.findByIdAndDelete(id);
};
