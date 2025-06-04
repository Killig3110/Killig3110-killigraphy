// src/services/CommentService.ts
import { ICommentFactory } from '../factories/CommentFactory/ICommentFactory';
import * as commentRepo from '../repositories/comment.repository';

export class CommentService {
    constructor(private commentFactory: ICommentFactory) { }

    async addComment(content: string, postId: string, userId: string, parentId?: string) {
        if (!content || !postId) throw new Error('Missing required fields');

        const commentData = this.commentFactory.create({
            content,
            postId,
            userId,
            parentId,
        });

        const comment = await commentRepo.createComment(commentData);
        if (!comment) throw new Error('Failed to create comment');

        return await comment.populate('user', 'name imageUrl');
    }

    async getPostComments(postId: string) {
        return await commentRepo.getCommentsByPostId(postId);
    }

    async deleteComment(commentId: string, userId: string) {
        const comment = await commentRepo.findCommentById(commentId);
        if (!comment) throw new Error('Comment not found');

        const postCreatorId = (comment.post as any).creator;
        if (!postCreatorId.equals(userId)) {
            throw new Error('Unauthorized');
        }

        await commentRepo.deleteCommentById(commentId);
    }
}
