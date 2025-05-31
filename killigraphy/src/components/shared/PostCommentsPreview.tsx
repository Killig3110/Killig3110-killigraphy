import { useState } from "react";
import { useGetCommentsByPostMutation, useGetPostByIdMutation } from "@/lib/react-query/QueriesAndMutations";
import { multiFormatDateString } from "@/lib/utils";
import { Button } from "../ui/button";
import PostComments from "./PostComments";

const PostCommentsPreview = ({ postId }: { postId: string }) => {
    const [showAll, setShowAll] = useState(false);
    const { data: comments = [], isPending } = useGetCommentsByPostMutation(postId);
    const { data: post } = useGetPostByIdMutation(postId)

    const latest = comments
        .filter((c) => !c.parent)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (isPending) return null;

    if (showAll && post) {
        return <PostComments postId={postId} postCreatorId={post.creator._id} />
    }

    return (
        <div className="mt-4">
            {latest ? (
                <div className="flex gap-2 items-start">
                    <img
                        src={
                            latest.user.imageUrl?.startsWith("https://ik.imagekit.io/killigraphy/avatars/avatar")
                                ? "/assets/icons/profile-placeholder.svg"
                                : latest.user.imageUrl || "/assets/icons/profile-placeholder.svg"
                        }
                        alt="avatar"
                        className="w-8 h-8 rounded-full"
                    />
                    <div>
                        <p className="text-sm text-light-1 font-medium">{latest.user.name}</p>
                        <p className="text-light-2 text-sm">{latest.content}</p>
                        <span className="text-xs text-muted-foreground">
                            {multiFormatDateString(latest.createdAt as string)}
                        </span>
                    </div>
                </div>
            ) : (
                <p className="flex flex-center text-muted-foreground text-sm">Chưa có bình luận</p>
            )}

            {comments.length > 1 && (
                <Button
                    variant="link"
                    onClick={() => setShowAll(true)}
                    className="mt-2 p-0 text-primary-500 text-sm"
                >
                    Xem tất cả {comments.length} bình luận
                </Button>
            )}
        </div>
    );
};

export default PostCommentsPreview;