import * as commentRepo from "../repositories/comment.repository";

export const addComment = async (content: string, postId: string, userId: string, parentId?: string) => {
    if (!content || !postId) throw new Error("Missing required fields");

    const comment = await commentRepo.createComment({
        content,
        post: postId,
        user: userId,
        parent: parentId || null,
    });

    return await comment.populate("user", "name imageUrl");
};

export const getPostComments = async (postId: string) => {
    return await commentRepo.getCommentsByPostId(postId);
};

export const deleteComment = async (commentId: string, userId: string) => {
    const comment = await commentRepo.findCommentById(commentId);
    if (!comment) throw new Error("Comment not found");

    const postCreatorId = (comment.post as any).creator;
    if (!postCreatorId.equals(userId)) {
        throw new Error("Unauthorized");
    }

    await commentRepo.deleteCommentById(commentId);
};
