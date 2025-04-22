import { useRef, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import {
    useDeleteCommentMutation,
    useGetCommentsByPostMutation,
} from "@/lib/react-query/QueriesAndMutations";
import { PopulatedComment } from "@/types/shared";
import { multiFormatDateString } from "@/lib/utils";
import Loader from "./Loader";
import { Trash2 } from "lucide-react";
import CommentInput from "./CommentInput";

interface PostCommentsProps {
    postId: string;
    postCreatorId: string;
}

const PostComments = ({ postId, postCreatorId }: PostCommentsProps) => {
    const { user } = useUserContext();
    const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const { data: comments = [], isPending } = useGetCommentsByPostMutation(postId);
    const deleteCommentMutation = useDeleteCommentMutation(postId);

    const handleDelete = (commentId: string) => {
        deleteCommentMutation.mutate(commentId);
    };

    const renderReplies = (parentId: string) =>
        comments
            .filter((c) => c.parent === parentId)
            .map((reply) => (
                <div key={reply._id} className="ml-6 mt-2 border-l border-muted pl-3">
                    <CommentItem comment={reply} />
                </div>
            ));

    const highlightMention = (text: string) => {
        const match = text.match(/^@(\w+)\s/);
        if (!match) return text;
        return (
            <>
                <span className="text-primary font-semibold">@{match[1]}</span>
                {text.replace(`@${match[1]}`, "")}
            </>
        );
    };

    const CommentItem = ({ comment }: { comment: PopulatedComment }) => (
        <div className="flex flex-col gap-1 mt-3">
            <div className="flex items-start gap-2">
                <img
                    src={comment.user.imageUrl}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-light-1 font-semibold">{comment.user.name}</p>
                        <span className="text-xs text-light-3">
                            {multiFormatDateString(comment.createdAt as string)}
                        </span>
                    </div>
                    <p className="text-light-1 text-sm">{highlightMention(comment.content)}</p>
                    <div className="text-sm flex items-center gap-3 mt-1">
                        <button
                            onClick={() => {
                                setReplyTo({ id: comment._id, name: comment.user.name });
                                setTimeout(() => inputRef.current?.focus(), 100);
                            }}
                            className="text-primary-500 hover:underline"
                        >
                            Reply
                        </button>
                        {user?._id === postCreatorId && (
                            <Trash2
                                size={16}
                                onClick={() => handleDelete(comment._id)}
                                className="cursor-pointer text-red-500"
                            />
                        )}
                    </div>
                </div>
            </div>
            {renderReplies(comment._id)}
        </div>
    );

    const rootComments = comments.filter((c) => !c.parent);

    return (
        <div className="mt-6">
            <h4 className="text-light-1 font-semibold mb-2">Comments</h4>
            {isPending ? (
                <Loader />
            ) : (
                <div className="mt-2">
                    {rootComments.length === 0 && (
                        <p className="text-muted-foreground">No comments yet.</p>
                    )}
                    {rootComments.map((comment) => (
                        <CommentItem key={comment._id} comment={comment} />
                    ))}
                </div>
            )}

            <div className="mt-4">
                <CommentInput
                    postId={postId}
                    parentId={replyTo?.id}
                    defaultValue={replyTo ? `@${replyTo.name} ` : ""}
                    inputRef={inputRef as React.RefObject<HTMLInputElement>}
                />
            </div>
        </div>
    );
};

export default PostComments;
